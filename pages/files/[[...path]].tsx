import Head from 'next/head'
import axios from 'axios'
import prettyBytes from 'pretty-bytes'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
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

  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)

  const router = useRouter()
  
  useEffect(() => {
    const getData = async () => {
      try {
        const { path } = router.query
        paramsRef.current = path as string[]
        const fileArrData = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/list/${(path as string[])?.join('/') ?? ''}`)
        setFileArr(fileArrData.data.sort((a: any, b: any) => a.name.localeCompare(b.name)))
      } catch (error) {
        console.log(error)
        setFileArr('Error loading data from server')
      }
    }
    getData()
  }, [router.asPath])

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
        <section className='h-[calc(100dvh-60px)] w-[20%] bg-gray-500'>
          
        </section>
        <section className='p-12 h-[calc(100dvh-60px)] w-[80%] bg-slate-600'>
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
          <FileList fileArr={fileArr} />
          {/* <div {...getRootProps()}>
            <input {...getInputProps()} />
            {
              isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag 'n' drop some files here, or click to select files</p>
            }
          </div> */}
        </section>
      </main>
    </>
  )
}

function FileList({ fileArr }: { fileArr: FileServerFile[] | string | null }) {
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
    <div className='flex flex-col m-4 p-2 pt-0 h-full w-full bg-black rounded-lg overflow-auto'>
      <div className='sticky top-0 flex text-lg border-b-[1px] bg-black'>
        <span className='p-3 min-w-[2.5rem] max-w-[2.5rem]'></span>
        <span className='p-3 flex-grow'>Name</span>
        <span className='p-3 min-w-[10rem]'>Size</span>
        <span className='p-3 min-w-[10rem]'>Created At</span>
      </div>
      {fileArr.map((file, index) => {
        return (
          <Link 
            key={index}
            href={file.isDirectory ? `/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`}
            className='flex text-lg rounded-md cursor-pointer hover:bg-gray-500'
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
          </Link>
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