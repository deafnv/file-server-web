import { FileListProps, FileServerFile } from '@/lib/types'
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
import DragSelectionArea from '@/components/DragSelection'

export default function FileList(
  { fileArr, fileListRef, contextMenu, setContextMenu, selectedFile, setSelectedFile, getRootProps, getInputProps  }: FileListProps
) {
  const startingFileSelect = useRef<number | null>(null)

  const router = useRouter()

  useEffect(() => {
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
    const copySelected = (e: KeyboardEvent) => {
      if (e.key == 'c' && e.ctrlKey && selectedFile) { //TODO: Change to copy files or links to files
        navigator.clipboard.writeText(selectedFile[0].isDirectory ? `${location.origin}/files${selectedFile[0].path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile[0].path}`)
      }
    }

    document.addEventListener("keydown", copySelected)

    return () => document.removeEventListener("keydown", copySelected)
  }, [selectedFile])

  function handleSelect(e: React.MouseEvent, file: FileServerFile, index: number) {
    if (!(fileArr instanceof Array)) return
    if (e.shiftKey && selectedFile?.[0]) {
      let selectedFiles
      if (index > startingFileSelect.current!) {
        selectedFiles = fileArr.slice(startingFileSelect.current!, index + 1)
      } else selectedFiles = fileArr.slice(index, startingFileSelect.current! + 1)
      setSelectedFile(selectedFiles)
    } else if (e.ctrlKey) {
      setSelectedFile(selectedFile.concat([file]))
    } else {
      startingFileSelect.current = index
      setSelectedFile([file])
    }
  }

  function handleOnContextMenu(file: FileServerFile) {
    if (selectedFile.length <= 1) {
      setSelectedFile([file])
    }
    setContextMenu('file')
  }

  function handleAuxClick(e: React.MouseEvent, file: FileServerFile) {
    if (e.button === 1) {
      e.preventDefault()
      window.open(file.isDirectory ? `/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`, '_blank')
    }
  }

  function handleBlur() {
    if (!contextMenu) setSelectedFile([])
  }

  if (fileArr == null || fileArr == 'Error loading data from server') {
    return (
      <div className='flex flex-col m-4 p-2 pt-0 h-[95%] w-full bg-black rounded-lg overflow-auto'>
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
      <div className='flex flex-col m-4 p-2 pt-0 h-[95%] w-full bg-black rounded-lg overflow-auto'>
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

  return (
    <div
      {...getRootProps()}
      data-disableselect={false}
      ref={fileListRef}
    
      className={`relative flex flex-col m-4 p-2 pt-0 h-[95%] w-full bg-black rounded-lg overflow-x-hidden overflow-y-auto outline-none`}
    >
      <div className='sticky top-0 mb-1 flex text-lg border-b-[1px] bg-black'>
        <span className='m-3 mr-0 min-w-[2.5rem] max-w-[2.5rem]'></span>
        <span className='m-3 flex-grow'>Name</span>
        <span className='m-3 min-w-[8rem]'>Size</span>
        <span className='hidden lg:block m-3 min-w-[10rem]'>Created At</span>
      </div>
      {fileArr.map((file, index) => {
        return (
          <div
            key={index}
            data-isfile
            onClick={(e) => handleSelect(e, file, index)}
            onDoubleClick={() => file.isDirectory ? router.push(`/files${file.path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`)}
            onContextMenu={() => handleOnContextMenu(file)}
            onMouseDown={(e) => handleAuxClick(e, file)}
            className={`flex text-lg rounded-md cursor-default ${selectedFile?.includes(file) ? 'bg-gray-500' : ''} outline outline-0 outline-gray-500 hover:outline-1`}
          >
            <span className='m-3 mr-0 min-w-[2.5rem] max-w-[2.5rem]'>{getIcon(file)}</span>
            <div 
              title={file.name}
              className='flex-grow line-clamp-1  overflow-hidden'
            >
              <span 
                onClick={() => console.log(file.name)}
                className='flex p-3 w-fit'
              >
                {file.name}
              </span>
            </div>
            <span className='m-3 min-w-[8rem]'>{prettyBytes(file.size)}</span>
            <span className='hidden lg:block m-3 min-w-[10rem]'>
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
        setSelectedFile={setSelectedFile}
      />
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