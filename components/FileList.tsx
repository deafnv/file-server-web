import { FileListProps, FileServerFile, Point } from '@/lib/types'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import prettyBytes from 'pretty-bytes'
import CircularProgress from '@mui/material/CircularProgress'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DragSelectionArea from '@/components/DragSelection'
import isEqual from 'lodash/isEqual'
import { getIcon } from '@/lib/methods'
import { useLoading } from './LoadingContext'
import axios from 'axios'

export default function FileList(
  { fileArr, fileListRef, contextMenu, setContextMenu, selectedFile, setSelectedFile, setProcessInfo, getRootProps, getInputProps, getData }: FileListProps
) {
  const startingFileSelect = useRef<number | null>(null)
  const dragOverlayRef = useRef<HTMLDivElement>(null)
  const fileRefs = useRef<Array<{
    file: FileServerFile,
    ref: HTMLDivElement
  }>>([])
  const draggedFileRef = useRef<HTMLDivElement>(null)
  const isDraggingFile = useRef(0)

  const router = useRouter()
  const { setLoading } = useLoading()

  useEffect(() => {
    console.log(fileRefs.current)
    const preventShiftSelect = (e: any) => {
      document.onselectstart = function() {
        return !(e.key == "Shift" && e.shiftKey);
      }
    }

    ["keyup","keydown"].forEach((event) => {
      window.addEventListener(event, preventShiftSelect)
    })

    return () => {
      ["keyup","keydown"].forEach((event) => {
        window.removeEventListener(event, preventShiftSelect)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function moveFile(files: FileServerFile[], directory: FileServerFile | string) {
    setLoading(true)
    try { 
      await axios({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/move`,
        data: {
          pathToFiles: files?.map(file => file.path),
          newPath: typeof directory == 'string' ? directory : directory.path
        },
        withCredentials: true
      })
      setLoading(false)
      setProcessInfo('')
      getData() //TODO: Remove once server websocket for live updates is set up
    } catch (error) {
      alert(error)
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const moveDraggedFile = (e: MouseEvent) => {
      if (isDraggingFile.current) {
        const closestFileHovered = fileRefs.current.filter(item => (e.target as HTMLElement).closest("[data-isfile]") == item.ref)
        if (closestFileHovered.length && (performance.now() - 150 > isDraggingFile.current)) {
          //! File moving animation here (file under mouse, outline hovered files)
          
        }

        if (draggedFileRef.current && (performance.now() - 150 > isDraggingFile.current)) {
          //* Make selected files greyed out while dragging them
          const selectedFileRefs = fileRefs.current.filter(item => selectedFile.includes(item.file))
          selectedFileRefs.forEach(item => {
            console.log(item.file.name)
            item.ref.style.opacity = '0.3'
            item.ref.style.backgroundColor = 'gray'
          })

          draggedFileRef.current.style.visibility = 'visible'
          draggedFileRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
        }
      }
    }

    const dropFile = (e: MouseEvent) => {
      //* Remove greyed out effect on stop drag
      const stopDrag = () => {
        const selectedFileRefs = fileRefs.current.filter(item => selectedFile.includes(item.file))
        selectedFileRefs.forEach(item => {
          item.ref.style.opacity = '1'
          item.ref.style.backgroundColor = 'rgb(107 114 128)'
        })
      }

      if (isDraggingFile.current) {
        const closestPathDropped = (e.target as HTMLElement).closest("[data-isdirpath]")
        const closestFileDropped = fileRefs.current.filter(item => (e.target as HTMLElement).closest("[data-isfile]") == item.ref)
        //* If dropped on file, and has been dragged for at least 150ms
        if (closestFileDropped.length && (performance.now() - 150 > isDraggingFile.current)) {
          //* Disappear dragged file
          if (draggedFileRef.current) {
            if (closestFileDropped[0].file.isDirectory){
              draggedFileRef.current.style.visibility = 'hidden'
              if (!selectedFile.includes(closestFileDropped[0].file))
                moveFile(selectedFile, closestFileDropped[0].file)
            } else {
              //* Do nothing and move back dragged file to its spot (didnt drag into folder)
              draggedFileRef.current.style.visibility = 'hidden'
            }
            stopDrag()
          }
        } else if (closestPathDropped && (performance.now() - 150 > isDraggingFile.current)) {
          //* If dropped on file path at the top
          const pathAttribute = closestPathDropped.getAttribute('data-path')
          if (draggedFileRef.current) {
            if (pathAttribute) {
              draggedFileRef.current.style.visibility = 'hidden'
              moveFile(selectedFile, pathAttribute)
            } else draggedFileRef.current.style.visibility = 'hidden'
            stopDrag()
          }
        } else {
          draggedFileRef.current!.style.visibility = 'hidden'
          stopDrag()
        }
        isDraggingFile.current = 0
      }
    }

    document.addEventListener("mousemove", moveDraggedFile)
    document.addEventListener("mouseup", dropFile)

    return () => {
      document.removeEventListener("mousemove", moveDraggedFile)
      document.removeEventListener("mouseup", dropFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  useEffect(() => {
    //* Set upload overlay height, hacky way of getting file list's scrollHeight
    if (dragOverlayRef.current) {
      dragOverlayRef.current.style.position = 'fixed'
      dragOverlayRef.current.style.height = `${fileListRef.current?.scrollHeight}px`
      dragOverlayRef.current.style.position = 'absolute'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragOverlayRef.current, fileArr])

  useEffect(() => {
    //* Select all files Ctrl + A
    const keyDownListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key == 'a') e.preventDefault()
      if (e.ctrlKey && e.key == 'a' && fileArr && typeof fileArr !== 'string' && document.activeElement == fileListRef.current) {
        e.preventDefault()
        setSelectedFile(fileArr)
      }
    }

    document.addEventListener("keydown", keyDownListener)

    return () => {
      document.removeEventListener("keydown", keyDownListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileListRef.current, fileArr])

  useEffect(() => {
    const copySelected = async (e: KeyboardEvent) => {
      if (e.key == 'c' && e.ctrlKey && selectedFile.length) { //TODO: Change to copy files or links to files
        await navigator.clipboard.writeText(selectedFile[0].isDirectory ? `${location.origin}/files${selectedFile[0].path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile[0].path}`)
        setProcessInfo('Link copied to clipboard')
      }
    }

    document.addEventListener("keydown", copySelected)

    return () => document.removeEventListener("keydown", copySelected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  function handleOnContextMenu(file: FileServerFile) {
    if (selectedFile.length <= 1 || !selectedFile.includes(file)) {
      setSelectedFile([file])
    }
    setContextMenu('file')
  }

  function handleSelect(e: React.MouseEvent, file: FileServerFile, index: number) {
    const selectItem = () => {
      if (fileArr instanceof Array) {
        if (e.shiftKey && selectedFile?.[0]) {
          let selectedFiles
          if (index > startingFileSelect.current!) {
            selectedFiles = fileArr.slice(startingFileSelect.current!, index + 1)
          } else selectedFiles = fileArr.slice(index, startingFileSelect.current! + 1)
          setSelectedFile(selectedFiles)
        } else if (e.ctrlKey) {
          //* Ctrl select functionality
          if (selectedFile.includes(file))
            setSelectedFile(selectedFile.filter(item => !isEqual(item, file)))
          else 
            setSelectedFile(selectedFile.concat([file]))
        } else {
          startingFileSelect.current = index
          setSelectedFile([file])
        }
      }
    }

    if (e.button === 1) {
      e.preventDefault()
      window.open(file.isDirectory ? `/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`, '_blank')
    }
    
    //* Determine if pressed element is file
    if (e.button === 0 && (e.target as HTMLElement).getAttribute('data-isfilename') == 'true') {
      const fileMouseDowned = fileRefs.current.filter(item => item.ref == e.currentTarget)[0]
      //* Select item if 
      if (selectedFile.includes(fileMouseDowned.file)) {
        isDraggingFile.current = performance.now()
      } else {
        selectItem()
        isDraggingFile.current = performance.now()
      }
    } else if (e.button === 0 && (e.currentTarget as HTMLElement).getAttribute('data-isfile') == 'true') {
      selectItem()
    }
  }

  function handleBlur() {
    if (!contextMenu) setSelectedFile([])
  }

  if (fileArr == null || fileArr == 'Error loading data from server') {
    return (
      <div className='flex flex-col m-2 p-2 pt-0 h-[95%] w-full bg-black rounded-lg overflow-auto'>
        <div className='sticky top-0 flex text-lg border-b-[1px] bg-black'>
          <span className='p-3 flex-grow'>Name</span>
          <span className='p-3 min-w-[10rem]'>Size</span>
          <span className='p-3 min-w-[10rem]'>Created At</span>
        </div>
        <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-2xl'>
          {fileArr == null ? <CircularProgress size={50} /> : <span>{fileArr}</span>}
          {fileArr != null && <span className='text-base'>Refresh the page to try again</span>}
        </div>
      </div>
    )
  }

  if (!(fileArr instanceof Array)) {
    return (
      <div className='flex flex-col m-2 p-2 pt-0 h-[95%] w-full bg-black rounded-lg overflow-auto'>
        <div className='sticky top-0 flex text-lg border-b-[1px] bg-black'>
          <span className='p-3 flex-grow'>Name</span>
          <span className='p-3 min-w-[10rem]'>Size</span>
          <span className='p-3 min-w-[10rem]'>Created At</span>
        </div>
        <div className='h-full w-full flex items-center justify-center text-2xl'>
          Directory not found
        </div>
      </div>
    )
  }

  function handleDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('Files') && dragOverlayRef.current) {
      dragOverlayRef.current.style.opacity = '1'
    }
  }
  
  function handleDragLeave(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('Files') && dragOverlayRef.current) {
      dragOverlayRef.current.style.opacity = '0'
    }
  }

  return (
    <div
      {...getRootProps({
        onDrop: (e) => {if (e.dataTransfer.types.includes('Files') && dragOverlayRef.current) dragOverlayRef.current.style.opacity = '0'}
      })}
      data-cy='file-list'
      data-disableselect={false}
      ref={fileListRef}
      onBlur={handleBlur}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onContextMenu={(e) => {if (e.target == fileListRef.current) setContextMenu('directory')}}
      className={`relative flex flex-col m-2 p-2 pt-0 h-[95%] w-full bg-black rounded-lg overflow-x-hidden overflow-y-auto outline-none select-none`}
    >
      <div className='sticky z-10 top-0 mb-1 flex text-lg border-b-[1px] bg-black'>
        <span className='m-3 mr-0 min-w-[2.5rem] max-w-[2.5rem]'></span>
        <span className='m-3 flex-grow'>Name</span>
        <span className='m-3 min-w-[8rem]'>Size</span>
        <span className='hidden lg:block m-3 min-w-[10rem]'>Created At</span>
      </div>
      {fileArr.map((file, index) => {
        return (
          <div
            key={index}
            ref={ref => {if (ref) fileRefs.current[index] = { file, ref }}}
            data-isfile
            data-filehierarchy
            onDoubleClick={() => file.isDirectory ? router.push(`/files${file.path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`)}
            onContextMenu={() => handleOnContextMenu(file)}
            onMouseDown={(e) => handleSelect(e, file, index)}
            style={{
              backgroundColor: selectedFile?.includes(file) ? 'rgb(107 114 128)' : 'unset'
            }}
            className={`flex text-lg rounded-md cursor-default outline outline-0 outline-gray-500 hover:outline-1`}
          >
            <span className='m-3 mr-0 min-w-[2.5rem] max-w-[2.5rem]'>{getIcon(file)}</span>
            <div 
              data-filehierarchy
              title={file.name}
              className='flex-grow line-clamp-1 overflow-hidden'
            >
              <span 
                data-isfilename
                className='flex p-3 w-fit'
              >
                {file.name}
              </span>
            </div>
            <span className='p-3 min-w-[8rem]'>{prettyBytes(file.size)}</span>
            <span className='hidden lg:block p-3 min-w-[10rem]'>
              {new Date(file.created).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        )
      })}
      <DragSelectionArea 
        fileListRef={fileListRef} 
        fileArr={fileArr}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        startingFileSelect={startingFileSelect}
      />
      <div
        ref={draggedFileRef}
        className='invisible fixed top-0 left-0 z-50 p-3 flex gap-2 h-[3.3rem] w-[12rem] bg-black border-[1px] border-gray-500 rounded-md shadow-lg shadow-gray-900 pointer-events-none'
      >
        <span className='w-[1.5rem]'>
          {selectedFile.length ? getIcon(selectedFile[0]) : null}
        </span>
        <div 
          className='flex items-center overflow-hidden'
        >
          <span 
            data-isfilename
            className='line-clamp-1 w-fit'
          >
            {selectedFile.length ? selectedFile[0].name : ''}
          </span>
        </div>
      </div>
      <div 
        data-cy='dragged-file'
        ref={dragOverlayRef}
        className='absolute top-0 left-0 z-20 h-full w-full pointer-events-none opacity-0 transition-all duration-100'
      >
        <div className='z-20 h-full w-full bg-blue-300 border-2 border-solid border-blue-500 opacity-30 pointer-events-none' />
        <span className='flex flex-col items-center gap-2 fixed top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 text-2xl bg-sky-600 rounded-md'>
          Drop files to upload
          <FileUploadIcon fontSize='large' />
        </span>
      </div>
      <input {...getInputProps()} />
    </div>
  )
}