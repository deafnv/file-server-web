import { FileServerFile } from '@/lib/types'
import { useRouter } from 'next/router'
import { Dispatch, RefObject, SetStateAction } from 'react'
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

export default function FileList(
  { fileArr, fileListRef, contextMenu, setContextMenu, selectedFile, setSelectedFile }: 
  { 
    fileArr: FileServerFile[] | string | null; fileListRef: RefObject<HTMLDivElement>; 
    contextMenu:  FileServerFile | 'directory' | null; 
    setContextMenu: Dispatch<SetStateAction<FileServerFile | 'directory' | null>>; 
    selectedFile:  FileServerFile | null; 
    setSelectedFile: Dispatch<SetStateAction<FileServerFile | null>>; 
  }
) {
  const router = useRouter()
  if (fileArr == null || fileArr == 'Error loading data from server') {
    return (
      <div className='flex flex-col m-4 p-2 pt-0 h-full w-full bg-black rounded-lg overflow-auto'>
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
      <div className='flex flex-col m-4 p-2 pt-0 h-full w-full bg-black rounded-lg overflow-auto'>
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
      ref={fileListRef}
      className='flex flex-col m-4 p-2 pt-0 h-full w-full bg-black rounded-lg overflow-auto'
    >
      <div className='sticky top-0 mb-1 flex text-lg border-b-[1px] bg-black'>
        <span className='p-3 min-w-[2.5rem] max-w-[2.5rem]'></span>
        <span className='p-3 flex-grow'>Name</span>
        <span className='p-3 min-w-[10rem]'>Size</span>
        <span className='p-3 min-w-[10rem]'>Created At</span>
      </div>
      {fileArr.map((file, index) => {
        return (
          <div
            key={index}
            onClick={() => setSelectedFile(file)}
            onDoubleClick={() => file.isDirectory ? router.push(`/files${file.path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`)}
            onContextMenu={() => setContextMenu(file)}
            className={`flex text-lg rounded-md cursor-default ${(contextMenu == file || selectedFile == file) ? 'bg-gray-500' : ''} outline outline-0 outline-gray-500 hover:outline-1`}
          >
            <span className='p-3 min-w-[2.5rem] max-w-[2.5rem]'>{getIcon(file)}</span>
            <span className='p-3 flex-grow'>{file.name}</span>
            <span className='p-3 min-w-[10rem]'>{prettyBytes(file.size)}</span>
            <span className='p-3 min-w-[10rem]'>
              {new Date(file.created).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        )
      })}
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