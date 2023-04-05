import { Box, DragSelectionAreaProps, Point } from '@/lib/types'
import { useRef, useEffect } from 'react'

export default function DragSelectionArea({ fileListRef, fileArr, setSelectedFile }: DragSelectionAreaProps) {
  const mousePos = useRef<Point>({ x: 0, y: 0 })
  const startPos = useRef<Point>({ x: 0, y: 0 })
  const boxPos = useRef<Box>({ left: 0, height: 0, top: 0, width: 0 })
  const startDragScrollTop = useRef(0)
  const fileArrPos = useRef<Box[]>([])
  const isDragging = useRef(false)
  const dragAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { offsetTop, offsetLeft } = fileListRef.current!

    const recordMousePos = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY
      }
      console.log(mousePos.current)

      if (dragAreaRef.current!.style.display == 'block') {
        requestAnimationFrame(() => {
          //? Calculate two boxes, one for visible hightlight, offset because of file list, and another for intersect calculation
          const visibleBox = calculateSelectionBox({ 
            startPoint: startPos.current, 
            endPoint: {
              x: mousePos.current.x,
              y: mousePos.current.y + fileListRef.current!.scrollTop
            } 
          })
          
          boxPos.current = calculateSelectionBox({ 
            startPoint: startPos.current, 
            endPoint: {
              x: mousePos.current.x,
              y: mousePos.current.y + fileListRef.current!.scrollTop
            } 
          })
          
          dragAreaRef.current!.style.left = `${boxPos.current.left}px`
          dragAreaRef.current!.style.top = `${boxPos.current.top}px`
          dragAreaRef.current!.style.width = `${boxPos.current.width}px`
          dragAreaRef.current!.style.height = `${boxPos.current.height}px`
        })
        
        console.log(boxPos.current)

        const indexesToSelect: number[] = [];
        fileArrPos.current.forEach((file, index) => {
          if (boxesIntersect(boxPos.current, file) && isDragging) {
            indexesToSelect.push(index)
          }
        })

        if (fileArr instanceof Array)
          setSelectedFile(fileArr.slice().filter((item, index) => indexesToSelect.includes(index)))
      }
    }

    const dragStart = (e: MouseEvent) => {
      if (!fileListRef.current?.contains(e.target as HTMLElement)) return
      setSelectedFile([])
      isDragging.current = true
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

    document.addEventListener("mousemove", recordMousePos)
    document.addEventListener("mousedown", dragStart)
    document.addEventListener("mouseup", dragEnd)

    return () => {
      document.removeEventListener("mousemove", recordMousePos)
      document.removeEventListener("mousedown", dragStart)
      document.removeEventListener("mouseup", dragEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileListRef.current, fileArr])
  
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