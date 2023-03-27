import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import axios from 'axios'
import prettyBytes from 'pretty-bytes'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/router'

export default function Files() {
  const paramsRef = useRef<string[]>([])

  const [fileArr, setFileArr] = useState<any[] | string>()

  const router = useRouter()
  
  useEffect(() => {
    const getData = async () => {
      const { path } = router.query
      paramsRef.current = path as string[]
      const fileArrData = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/list/${(path as string[])?.join('/') ?? ''}`)
      setFileArr(fileArrData.data)
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
          {fileArr && <FileList fileArr={fileArr} />}
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

function FileList({ fileArr }: { fileArr: any[] | string }) {
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
        <span className='p-3 flex-grow'>Name</span>
        <span className='p-3 min-w-[10rem]'>Size</span>
        <span className='p-3 min-w-[10rem]'>Created At</span>
      </div>
      {fileArr.map((item, index) => {
        return (
          <Link 
            key={index}
            href={item.isDirectory ? `/files${item.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${item.path}`}
            className='flex text-lg rounded-md cursor-pointer hover:bg-gray-500'
          >
            <span className='p-3 flex-grow'>{item.name}</span>
            <span className='p-3 min-w-[10rem]'>{prettyBytes(item.size)}</span>
            <span className='p-3 min-w-[10rem]'>
              {new Date(item.created).toLocaleDateString('en-US', {
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
}