import { Box, DragSelectionAreaProps, FileServerFile, Point } from '@/lib/types'
import { useRef, useEffect } from 'react'

export default function DragSelectionArea({ fileListRef, fileArr, selectedFile, setSelectedFile, startingFileSelect }: DragSelectionAreaProps) {
  const mousePos = useRef<Point>({ x: 0, y: 0 })
  const startPos = useRef<Point>({ x: 0, y: 0 })
  const boxPos = useRef<Box>({ left: 0, height: 0, top: 0, width: 0 })
  const startDragScrollTop = useRef(0)
  const fileArrPos = useRef<Box[]>([])
  const isDragging = useRef(false)
  const initialFileListScrollHeight = useRef(0)
  const ctrlKeyPressed = useRef(false)
  const currentDragSelectedFile = useRef<FileServerFile[]>([])
  const dragAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { offsetTop, offsetLeft } = fileListRef.current!

    const recordMousePos = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY
      }

      if (dragAreaRef.current!.style.display == 'block') {
        requestAnimationFrame(() => {
          //* Disable summoning previous drag selection if ctrl is not pressed when starting a new drag
          if (isDragging && !ctrlKeyPressed.current) 
            currentDragSelectedFile.current = []

          //? Calculate two boxes, one for visible hightlight, offset because of file list, and another for intersect calculation
          const visibleBox = calculateSelectionBox({ 
            startPoint: {
              x: startPos.current.x - offsetLeft,
              y: startPos.current.y - offsetTop
            }, 
            endPoint: {
              x: mousePos.current.x - offsetLeft,
              y: mousePos.current.y + fileListRef.current!.scrollTop - offsetTop
            } 
          })
          
          boxPos.current = calculateSelectionBox({ 
            startPoint: startPos.current, 
            endPoint: {
              x: mousePos.current.x,
              y: mousePos.current.y + fileListRef.current!.scrollTop
            } 
          })
          
          dragAreaRef.current!.style.left = `${visibleBox.left}px`
          dragAreaRef.current!.style.top = `${visibleBox.top}px`
          dragAreaRef.current!.style.width = `${visibleBox.width}px`
          dragAreaRef.current!.style.height = `${visibleBox.height}px`

          if ((fileListRef.current!.offsetTop + fileListRef.current!.clientHeight) < mousePos.current.y && fileListRef.current!.scrollHeight == initialFileListScrollHeight.current) {
            fileListRef.current?.scrollBy({ top: 10, behavior: 'auto' })
          } else if (fileListRef.current!.offsetTop > mousePos.current.y && fileListRef.current!.scrollHeight == initialFileListScrollHeight.current){
            fileListRef.current?.scrollBy({ top: -10, behavior: 'auto' })
          }

          //* Minimum drag selection size to start selecting
          if (parseInt(dragAreaRef.current!.style.height) > 8 || parseInt(dragAreaRef.current!.style.width) > 8) {
            const indexesToSelect: number[] = [];
            fileArrPos.current.forEach((file, index) => {
              if (boxesIntersect(boxPos.current, file) && isDragging) {
                indexesToSelect.push(index)
              }
            })
    
            if (fileArr instanceof Array) {
              //* Ctrl key drag select like file explorer
              if (ctrlKeyPressed.current) {
                const selectedFilesCurrent = fileArr.filter((item, index) => indexesToSelect.includes(index))
                const inverse = currentDragSelectedFile.current.filter((item) => selectedFilesCurrent.includes(item))
                setSelectedFile(currentDragSelectedFile.current.concat(selectedFilesCurrent).filter((item) => !inverse.includes(item)))
              } else {
                setSelectedFile(fileArr.filter((item, index) => indexesToSelect.includes(index)))
              }
            }
          }
        })
      }
    }

    const dragStart = (e: MouseEvent) => {
      if (!fileListRef.current?.contains(e.target as HTMLElement) || e.button != 0) return
      isDragging.current = true
      window.getSelection()?.empty()
      currentDragSelectedFile.current = selectedFile
      document.body.style.userSelect = 'none'
      dragAreaRef.current!.style.left = `0px`
      dragAreaRef.current!.style.top = `0px`
      dragAreaRef.current!.style.width = `0px`
      dragAreaRef.current!.style.height = `0px`
      
      startPos.current = {
        x: mousePos.current.x,
        y: mousePos.current.y + fileListRef.current!.scrollTop
      }
      startDragScrollTop.current = fileListRef.current!.scrollTop
      dragAreaRef.current!.style.display = 'block'
    }

    const dragEnd = (e: MouseEvent) => {
      if (!fileListRef.current?.contains(e.target as HTMLElement) && dragAreaRef.current!.style.display != 'block') return
      isDragging.current = false
      dragAreaRef.current!.style.left = `0px`
      dragAreaRef.current!.style.top = `0px`
      dragAreaRef.current!.style.width = `0px`
      dragAreaRef.current!.style.height = `0px`
      dragAreaRef.current!.style.display = 'none'
      document.body.style.userSelect = 'initial'
    }

    const ctrlKeyDown = (e: KeyboardEvent) => e.ctrlKey ? ctrlKeyPressed.current = true : null

    const ctrlKeyUp = (e: KeyboardEvent) => e.ctrlKey ? null : ctrlKeyPressed.current = false

    document.addEventListener("mousemove", recordMousePos)
    document.addEventListener("mousedown", dragStart)
    document.addEventListener("mouseup", dragEnd)
    document.addEventListener("keydown", ctrlKeyDown)
    document.addEventListener("keyup", ctrlKeyUp)

    return () => {
      document.removeEventListener("mousemove", recordMousePos)
      document.removeEventListener("mousedown", dragStart)
      document.removeEventListener("mouseup", dragEnd)
      document.removeEventListener("keydown", ctrlKeyDown)
      document.removeEventListener("keyup", ctrlKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileListRef.current, fileArr, selectedFile])
  
  useEffect(() => {
    if (fileListRef.current) {
      fileArrPos.current = []
      document.querySelectorAll('div[data-isfile="true"]').forEach((item, index) => {
        const { left, top, width, height } = item.getBoundingClientRect()
        fileArrPos.current.push({
          left,
          top,
          width,
          height
        })
      })

      initialFileListScrollHeight.current = fileListRef.current.scrollHeight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileListRef.current, fileArr])
  
  return (
    <div 
      ref={dragAreaRef}
      className='absolute bg-blue-500 opacity-40 pointer-events-none'
    >

    </div>
  )
}

const calculateSelectionBox = ({ startPoint, endPoint }: { startPoint: Point; endPoint: Point }) => ({
  left: (startPoint.x < endPoint.x) ? startPoint.x : endPoint.x,
  top: (startPoint.y < endPoint.y) ? startPoint.y : endPoint.y,
  width: Math.abs(startPoint.x - endPoint.x),
  height: Math.abs(startPoint.y - endPoint.y),
})

const boxesIntersect = (boxA: Box, boxB: Box) =>
  boxA.left <= boxB.left + boxB.width &&
  boxA.left + boxA.width >= boxB.left &&
  boxA.top <= boxB.top + boxB.height &&
  boxA.top + boxA.height >= boxB.top