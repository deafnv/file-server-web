import { DragSelectionAreaProps, FileServerFile } from '@/lib/types'
import { useRef, useEffect } from 'react'
import { useSelectionContainer, boxesIntersect, Box } from '@deafnv/react-drag-to-select'
import { useAppContext } from './contexts/AppContext'

export default function DragSelectionArea({ fileListRef, fileArr }: DragSelectionAreaProps) {
  const fileArrPos = useRef<Box[]>([])
  const ctrlKeyPressed = useRef(false)
  const currentDragSelectedFile = useRef<FileServerFile[]>([])

  const { selectedFile, setSelectedFile } = useAppContext()
  
  const { DragSelection } = useSelectionContainer({
    eventsElement: fileListRef.current,
    onSelectionChange: (box) => {
      const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      }

      if (!ctrlKeyPressed.current) 
          currentDragSelectedFile.current = []

      if (box.height > 8 || box.width > 8) {
        const indexesToSelect: number[] = []
        fileArrPos.current.forEach((file, index) => {
          if (boxesIntersect(scrollAwareBox, file)) {
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
    },
    onSelectionStart: () => {
      currentDragSelectedFile.current = selectedFile
    },
    shouldStartSelecting: (target) => {
      if (target instanceof HTMLElement && !target.getAttribute("data-isfilename")) 
        return true
      return false
    },
    selectionProps: {
      style: {
        background: 'rgb(59 130 246)',
        border: '2px solid rgb(29 78 216)',
        opacity: 0.4,
        pointerEvents: 'none'
      }
    },
    isEnabled: true
  })

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

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      e.ctrlKey ? ctrlKeyPressed.current = true : null
    }

    const keyUp = (e: KeyboardEvent) => {
      e.ctrlKey ? null : ctrlKeyPressed.current = false
    }

    document.addEventListener("keydown", keyDown)
    document.addEventListener("keyup", keyUp)

    return () => {
      document.removeEventListener("keydown", keyDown)
      document.removeEventListener("keyup", keyUp)
    }
  }, [fileListRef.current, fileArr, selectedFile])

  return (
    <DragSelection />
  )
}