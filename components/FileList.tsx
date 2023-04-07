import { FileListProps, FileServerFile, Point } from '@/lib/types'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import prettyBytes from 'pretty-bytes'
import CircularProgress from '@mui/material/CircularProgress'
import FolderIcon from '@mui/icons-material/Folder'
import MovieIcon from '@mui/icons-material/Movie'
import ImageIcon from '@mui/icons-material/Image'
import CodeIcon from '@mui/icons-material/Code'
import DataObjectIcon from '@mui/icons-material/DataObject'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AudioFileIcon from '@mui/icons-material/AudioFile'
import ArticleIcon from '@mui/icons-material/Article'
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import DragSelectionArea from '@/components/DragSelection'
import isEqual from 'lodash/isEqual'

export default function FileList(
  { fileArr, fileListRef, contextMenu, setContextMenu, selectedFile, setSelectedFile, setProcessInfo, getRootProps, getInputProps }: FileListProps
) {
  const startingFileSelect = useRef<number | null>(null)
  const dragOverlayRef = useRef<HTMLDivElement>(null)
  const fileRefs = useRef<Array<{
    file: FileServerFile,
    ref: HTMLDivElement
  }>>([])
  const isDraggingFile = useRef(false)
  const mousePos = useRef<Point>({ x: 0, y: 0 })
  const startPos = useRef<Point>({ x: 0, y: 0 })

  const router = useRouter()

  useEffect(() => {
    const moveDraggedFile = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY
      }
      
      if (isDraggingFile.current) {
        const closestFileHovered = fileRefs.current.filter(item => (e.target as HTMLElement).closest("[data-isfile]") == item.ref)
        if (closestFileHovered.length) {
          console.log(closestFileHovered[0].file.name)
        }
      }
    }

    const dropFile = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const targetParent = target.parentElement as HTMLElement

      if (isDraggingFile.current) {
        const closestFileDropped = fileRefs.current.filter(item => (e.target as HTMLElement).closest("[data-isfile]") == item.ref)
        if (closestFileDropped.length ) {
          console.log('Dropped on file ' + closestFileDropped[0].file.name)
        }
        isDraggingFile.current = false
      }
    }

    const preventShiftSelect = (e: any) => {
      document.onselectstart = function() {
        return !(e.key == "Shift" && e.shiftKey);
      }
    }

    ["keyup","keydown"].forEach((event) => {
      window.addEventListener(event, preventShiftSelect)
    })
    document.addEventListener("mousemove", moveDraggedFile)
    document.addEventListener("mouseup", dropFile)

    return () => {
      ["keyup","keydown"].forEach((event) => {
        window.removeEventListener(event, preventShiftSelect)
      })
      document.removeEventListener("mousemove", moveDraggedFile)
      document.removeEventListener("mouseup", dropFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    
    if (e.button === 0 && (e.target as HTMLElement).getAttribute('data-isfilename') == 'true') {
      const fileMouseDowned = fileRefs.current.filter(item => item.ref == e.currentTarget)[0]
      if (selectedFile.includes(fileMouseDowned.file)) {
        isDraggingFile.current = true
      } else {
        selectItem()
        isDraggingFile.current = true
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
            className={`flex text-lg rounded-md cursor-default ${selectedFile?.includes(file) ? 'bg-gray-500' : ''} outline outline-0 outline-gray-500 hover:outline-1`}
          >
            <span className='m-3 mr-0 min-w-[2.5rem] max-w-[2.5rem]'>{getIcon(file)}</span>
            <div 
              data-filehierarchy
              title={file.name}
              className='flex-grow line-clamp-1  overflow-hidden'
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

  function getIcon(file: FileServerFile) {
    if (file.isDirectory) return <FolderIcon />
    const splitName = file.name.split('.')
    const extension = splitName[splitName.length - 1]
    if (splitName.length == 1) return null
    if (['doc', 'docx', 'txt', 'pdf'].includes(extension)) return <ArticleIcon />
    if (['mkv', 'mp4', 'webm', 'ogg'].includes(extension)) return <MovieIcon />
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) return <ImageIcon />
    if (['wav', 'mp3', 'aac', 'flac', 'm4a'].includes(extension)) return <AudioFileIcon />
    if (['json', 'jsonl'].includes(extension)) return <DataObjectIcon />
    if (['js', 'jsx', 'css', 'ts', 'tsx'].includes(extension)) return <CodeIcon />
    if (['xlsx', 'xls', 'csv'].includes(extension)) return <ListAltIcon />
    if (['ass', 'srt', 'vtt'].includes(extension)) return <ClosedCaptionIcon />
    return null
  }
}