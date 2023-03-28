import Head from 'next/head'
import axios from 'axios'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/router'
import { FileServerFile } from '@/lib/types'
import ContextMenu from '@/components/ContextMenu'
import FileList from '@/components/FileList'
import ModalTemplate from '@/components/ModalTemplate'

export default function Files() {
  const paramsRef = useRef<string[]>([])
  const fileListRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLMenuElement>(null)

  const [selectedFile, setSelectedFile] = useState<FileServerFile | null>(null)
  const [contextMenu, setContextMenu] = useState<FileServerFile | 'directory' | null>(null)
  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)
  const [modal, setModal] = useState(false)

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

    const routeChangeStart = () => setContextMenu(null)

    document.addEventListener("mousedown", preventSelect)
    document.addEventListener("contextmenu", customContextMenu)
    document.addEventListener("click", exitContextMenu)

    router.events.on('routeChangeStart', routeChangeStart)
    
    return () => {
      document.removeEventListener("mousedown", preventSelect)
      document.removeEventListener("contextmenu", customContextMenu)
      document.removeEventListener("click", exitContextMenu)

      router.events.off('routeChangeStart', routeChangeStart)
    }
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
        {contextMenu && <ContextMenu contextMenuRef={contextMenuRef} contextMenu={contextMenu} setContextMenu={setContextMenu} />}
        {modal && <Modal />}
      </main>
    </>
  )

  function Modal() {
    return (
      <ModalTemplate>
        <h3 className='text-2xl'>New folder</h3>
				<div className='flex gap-4'>
					<button onClick={() => {}} className='px-3 py-1 input-submit'>Cancel</button>
          <button onClick={() => {}} className='px-3 py-1 input-submit'>Create</button>
				</div>
      </ModalTemplate>
    )
  }
}