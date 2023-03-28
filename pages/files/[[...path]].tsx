import Head from 'next/head'
import axios from 'axios'
import prettyBytes from 'pretty-bytes'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, RefObject, Dispatch, SetStateAction } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/router'
import { FileServerFile } from '@/lib/types'
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

export default function Files() {
  const paramsRef = useRef<string[]>([])
  const fileListRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLMenuElement>(null)

  const [selectedFile, setSelectedFile] = useState<FileServerFile | null>(null)
  const [contextMenu, setContextMenu] = useState<FileServerFile | 'directory' | null>(null)
  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)

  const router = useRouter()
  
  useEffect(() => {
    const getData = async () => {
      try {
        const { path } = router.query
        paramsRef.current = path as string[]
        const fileArrData = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/list/${(path as string[])?.join('/') ?? ''}`)
        setFileArr(fileArrData.data.sort((a: FileServerFile, b: FileServerFile) => {
          if (a.isDirectory && b.isDirectory) return a.name.localeCompare(b.name)
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        }))
      } catch (error) {
        console.log(error)
        setFileArr('Error loading data from server')
      }
    }
    getData()
  }, [router.asPath])

  useEffect(() => {
    const customContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (contextMenuRef.current?.contains(target)) {
        e.preventDefault()
        return
      }
      if (!fileListRef.current || !fileListRef.current.contains(target)) return

      e.preventDefault()
      if (target == fileListRef.current) {
        setContextMenu('directory')
      }
      if (!contextMenuRef.current) return
      setSelectedFile(null)
      contextMenuRef.current.style.top = `${e.pageY}px`
      contextMenuRef.current.style.left = `${e.pageX}px`
    }
    
    const exitContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!contextMenuRef.current) return
      if (!contextMenuRef.current?.contains(target)) {
        setContextMenu(null)
      }
    }

    const preventSelect = (e: MouseEvent) => {
      if (e.detail > 1 && fileListRef.current?.contains(e.target as HTMLElement)) {
        e.preventDefault();
      }
    }

    document.addEventListener("mousedown", preventSelect)
    document.addEventListener("contextmenu", customContextMenu)
    document.addEventListener("click", exitContextMenu)
    
    return () => document.removeEventListener("contextmenu", customContextMenu)
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const formData = new FormData()
    acceptedFiles.forEach((file) => {
      formData.append('files', file)
    })
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({onDrop})

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="flex items-center justify-center">
        <section className='flex flex-col items-center h-[calc(100dvh-60px)] w-[15%] bg-gray-700'>
          <div className='mt-24 p-2 cursor-pointer rounded-lg hover:bg-black'>
            <span className='text-lg'>Storage Space</span>
          </div>
        </section>
        <section className='p-12 h-[calc(100dvh-60px)] w-[85%] bg-slate-600'>
          <span className='text-xl'>
            <Link 
              href={''}
              className='p-2 rounded-md hover:bg-gray-500'
            >
              Files
            </Link>
            {paramsRef.current?.map((item, index) => (
              <>
                /
                <Link 
                  key={index}
                  href={paramsRef.current?.slice(0, index + 1).join('/')}
                  className='p-2 rounded-md hover:bg-gray-500'
                >
                  {item}
                </Link>
              </>
            ))}
          </span>
          <FileList 
            fileArr={fileArr} 
            fileListRef={fileListRef} 
            contextMenu={contextMenu} 
            setContextMenu={setContextMenu}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
          {/* <div {...getRootProps()}>
            <input {...getInputProps()} />
            {
              isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag 'n' drop some files here, or click to select files</p>
            }
          </div> */}
        </section>
        {contextMenu && <ContextMenu contextMenuRef={contextMenuRef} contextMenu={contextMenu} />}
      </main>
    </>
  )
}

function ContextMenu({ contextMenuRef, contextMenu }: { contextMenuRef: RefObject<HTMLMenuElement>; contextMenu:  FileServerFile | 'directory' | null; }) {
  if (!contextMenu) return null //? Return context menu for clicking on empty space here

  if (contextMenu == 'directory') {
    return (
      <menu
        ref={contextMenuRef}
        className="absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu"
      >
        Show New Folder and stuff
      </menu>
    )
  }

  return (
    <menu
      ref={contextMenuRef}
      className="absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu"
    >
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
          Open
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
          Copy Link
        </button>
      </li>
      <hr className="my-2 border-gray-500 border-t-[1px]" />
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
          Delete
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
          Rename
        </button>
      </li>
    </menu>
  )
}

function FileList(
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
            onDoubleClick={() => file.isDirectory ? router.replace(`/files${file.path}`) : router.replace(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`)}
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
//file.isDirectory ? `/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`