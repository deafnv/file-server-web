import Head from 'next/head'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { FileServerFile } from '@/lib/types'
import ContextMenu from '@/components/ContextMenu'
import FileList from '@/components/FileList'
import ModalTemplate from '@/components/ModalTemplate'

export default function Files() {
  const paramsRef = useRef<string[]>([])
  const fileListRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLMenuElement>(null)
  const folderDetailsRef = useRef<HTMLDivElement>(null)
  const folderDetailsDropdownRef = useRef<HTMLMenuElement>(null)

  const [selectedFile, setSelectedFile] = useState<FileServerFile[] | null>(null)
  const [contextMenu, setContextMenu] = useState<FileServerFile | 'directory' | null>(null)
  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)
  const [modal, setModal] = useState(false)

  const router = useRouter()

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

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    const exitMenus = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (contextMenuRef.current) {
        if (!contextMenuRef.current?.contains(target)) {
          setContextMenu(null)
        }
      }

      if (folderDetailsDropdownRef.current){
        if (!folderDetailsRef.current?.contains(target) && !folderDetailsDropdownRef.current.contains(target)) {
          folderDetailsDropdownRef.current.style.display = 'none'
        }
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
    document.addEventListener("click", exitMenus)

    router.events.on('routeChangeStart', routeChangeStart)
    
    return () => {
      document.removeEventListener("mousedown", preventSelect)
      document.removeEventListener("contextmenu", customContextMenu)
      document.removeEventListener("click", exitMenus)

      router.events.off('routeChangeStart', routeChangeStart)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFolderDetails() {
    if (!folderDetailsRef.current || !folderDetailsDropdownRef.current) return
    const { top, left } = folderDetailsRef.current.getBoundingClientRect()
    const height = folderDetailsRef.current.offsetHeight
    
    folderDetailsDropdownRef.current.style.display = 'block'
    folderDetailsDropdownRef.current.style.top = `${top + height}px`
    folderDetailsDropdownRef.current.style.left = `${left}px`
  }

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="grid sm:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] xl:grid-cols-[20%_80%] pt-[60px] h-screen">
        <section className='hidden sm:grid grid-flow-row grid-rows-2 items-center px-2 py-4 h-[calc(100dvh-60px)] bg-gray-700'>
          <div className=''>
            <span className='p-2 text-lg hover:bg-black cursor-pointer'>Storage Space</span>
          </div>
          <div className='flex flex-col h-full w-full'>
            <h6 className='ml-3 text-lg'>Notifications</h6>
            <div className='h-full w-full bg-black rounded-md'>
              
            </div>
          </div>
        </section>
        <section className='px-6 sm:px-12 py-8 h-[calc(100dvh-60px)] bg-slate-600'>
          <span className='flex items-center text-xl'>
            <Link 
              href={''}
              className='p-2 rounded-md hover:bg-gray-500'
            >
              Files
            </Link>
            {paramsRef.current?.map((param, index) => {
              if (index == paramsRef.current.length - 1)
                return (
                  <>
                    /
                    <div 
                      key={index}
                      ref={folderDetailsRef}
                      onClick={handleFolderDetails}
                      className='flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-500'
                    >
                      <span>{param}</span>
                      <ArrowDropDownIcon />
                    </div>
                  </>
                )
              return (
                <>
                  /
                  <Link 
                    key={index}
                    href={paramsRef.current?.slice(0, index + 1).join('/')}
                    className='p-2 rounded-md hover:bg-gray-500'
                  >
                    {param}
                  </Link>
                </>
              )
            })}
          </span>
          <FileList
            fileArr={fileArr} 
            fileListRef={fileListRef} 
            contextMenu={contextMenu} 
            setContextMenu={setContextMenu}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            getData={getData}
          />
        </section>
        <ContextMenu contextMenuRef={contextMenuRef} contextMenu={contextMenu} setContextMenu={setContextMenu} router={router} />
        <FolderDetails />
        {modal && <Modal />}
      </main>
    </>
  )

  function FolderDetails() {
    return (
      <menu
        ref={folderDetailsDropdownRef}
        style={{ display: 'none' }}
        className="absolute min-w-[12rem] z-10 py-2 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md folder-details"
      >
        <li className="flex justify-center h-8 rounded-sm hover:bg-gray-400">
          <button onClick={() => console.log(router.asPath.replace('/files', ''))} className="w-full">
            New folder
          </button>
        </li>
        <hr className="my-2 border-gray-500 border-t-[1px]" />
        <li className="flex justify-center h-8 rounded-sm hover:bg-gray-400">
          <button onClick={() => {}} className="w-full">
            Encode MKV
          </button>
        </li>
        <li className="flex justify-center h-8 rounded-sm hover:bg-gray-400">
          <button onClick={() => {}} className="w-full">
            Extract captions
          </button>
        </li>
        <li className="flex justify-center h-8 rounded-sm hover:bg-gray-400">
          <button onClick={() => {}} className="w-full">
            Convert captions
          </button>
        </li>
        <li className="flex justify-center h-8 rounded-sm hover:bg-gray-400">
          <button onClick={() => {}} className="w-full">
            Generate manifests
          </button>
        </li>
      </menu>
    )
  }

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