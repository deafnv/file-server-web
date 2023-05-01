import Head from 'next/head'
import axios, { AxiosError } from 'axios'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { FileServerFile, FileTreeRes, UploadProgress } from '@/lib/types'
import { useDropzone } from 'react-dropzone'
import isEqual from 'lodash/isEqual'
import { deleteCookie, getCookie } from 'cookies-next'
import { useAppContext } from '@/components/contexts/AppContext'
import ContextMenu from '@/components/ContextMenu'
import FileList from '@/components/FileList'
import LoggedOutWarning from '@/components/LoggedOutWarn'
import UploadsList from '@/components/UploadsList'
import StorageSpace from '@/components/StorageSpace'
import FileTree from '@/components/FileTree'
import ProcessInfo from '@/components/ProcessInfo'
import ProcessError from '@/components/ProcessError'
import FilePath from '@/components/FilePath'
import { getData, getFileTree } from '@/lib/methods'
import { io, Socket } from 'socket.io-client'
import { useLoading } from '@/components/contexts/LoadingContext'
import ConfirmDelete from '@/components/dialogs/ConfirmDelete'
import Rename from '@/components/dialogs/Rename'
import NewFolder from '@/components/dialogs/NewFolder'
import MoveFile from '@/components/dialogs/MoveFile'

let socket: Socket

export default function Files() {
  const paramsRef = useRef<string[]>([])
  const fileListRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLMenuElement>(null)
  const filesToUpload = useRef<File[]>([])

  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)
  const [fileTree, setFileTree] = useState<FileTreeRes | string | null>()
  const [currentUploadProgress, setCurrentUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadQueue, setUploadQueue] = useState<File[]>([])

  const setFilesToUpload = (val: File[]) => {
    filesToUpload.current = val
    setUploadQueue(filesToUpload.current)
  }

  const router = useRouter()
  const {
    setSocketConnectionState,
    setSelectedFile,
    contextMenu,
    setContextMenu,
    setLoggedOutWarning
  } = useAppContext()
  const { setLoading } = useLoading()

  useEffect(() => {
    const socketListHandler = (payload: any) => {
      getData(setFileArr, router, paramsRef, setLoading)
    }

    const socketTreeHandler = () => {
      getFileTree(setFileTree)
    }

    if(router.isReady) {
      socket = io(process.env.NEXT_PUBLIC_FILE_SERVER_URL!)
      getData(setFileArr, router, paramsRef, setLoading)
      getFileTree(setFileTree)
      
      socket.on('connect', () => setSocketConnectionState(true))
      socket.on('disconnect', () => setSocketConnectionState(false))
      
      socket.on(`/${(router.query.path as string[])?.join('/') ?? ''}`, socketListHandler)
      socket.on('filetree', socketTreeHandler)
    }

    return () => {
      if (socket) {
        socket.off(`/${(router.query.path as string[])?.join('/') ?? ''}`, socketListHandler)
        socket.off('filetree', socketTreeHandler)
      }
    }
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

      if (contextMenu == 'directory') setSelectedFile([])

      if (!contextMenuRef.current) return

      const isFarRight = e.pageX + contextMenuRef.current.offsetWidth > window.innerWidth
      const isFarBottom = e.pageY + contextMenuRef.current.scrollHeight > window.innerHeight
      
      if (isFarRight || isFarBottom) {
        contextMenuRef.current.style.top = `${(isFarBottom ? e.pageY - contextMenuRef.current.scrollHeight - (isFarRight ? 10 : 2) : e.pageY) - (isFarRight ? 0 : 10)}px`
        contextMenuRef.current.style.left = `${isFarRight ? e.pageX - contextMenuRef.current.offsetWidth : e.pageX}px`
      } else {
        contextMenuRef.current.style.top = `${e.pageY}px`
        contextMenuRef.current.style.left = `${e.pageX}px`
      }
    }
    
    const exitMenus = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (contextMenuRef.current) {
        if (!contextMenuRef.current?.contains(target)) {
          setContextMenu(null)
        }
      }
    }

    const preventSelect = (e: MouseEvent) => {
      //? I literally have no idea what this does
      if (e.detail > 1 && fileListRef.current?.contains(e.target as HTMLElement)) {
        e.preventDefault()
      }
    }

    const routeChangeStart = (e: string) => {
      setContextMenu(null)
      if (e.split('/')[1] == 'files')
        setLoading(true, 800)
    }

    document.addEventListener("mousedown", preventSelect)
    document.addEventListener("contextmenu", customContextMenu)
    document.addEventListener("mousedown", exitMenus)

    router.events.on('routeChangeStart', routeChangeStart)
    
    return () => {
      document.removeEventListener("mousedown", preventSelect)
      document.removeEventListener("contextmenu", customContextMenu)
      document.removeEventListener("mousedown", exitMenus)

      router.events.off('routeChangeStart', routeChangeStart)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMenuRef.current])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!getCookie('userdata')) {
      setLoggedOutWarning(true)
      return
    }
    if (!filesToUpload.current.length) {
      setFilesToUpload(filesToUpload.current.concat(acceptedFiles))
      
      while (filesToUpload.current.length !== 0 && !currentUploadProgress) {
        const fileToUpload = filesToUpload.current[0]
        setFilesToUpload(filesToUpload.current.filter(file => !isEqual(file, fileToUpload))!)
        const formData = new FormData()
        formData.append('upload-file', fileToUpload)

        try {
          const uploadres = await axios.post(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/upload${router.asPath.replace('/files', '')}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
              if (!progressEvent.total) return
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setCurrentUploadProgress({
                name: fileToUpload.name,
                progress: percentCompleted
              })
            }
          })
        } catch (err) {
          setCurrentUploadProgress(null)
          if ((err as any as AxiosError).response?.status == 403) {
            alert(`Error: Forbidden.`)
          } else if ((err as any as AxiosError).response?.status == 401) {
            alert('Error: Unauthorized, try logging in again.')
            deleteCookie('userdata')
            router.reload()
          } else {
            alert(`Error. The server is probably down. ${err}`)
          }
          console.log(err)
        }
        setCurrentUploadProgress(null)
      } 
    } else {
      setFilesToUpload(filesToUpload.current.concat(acceptedFiles))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath, currentUploadProgress])
  
  const { getRootProps, getInputProps, open } = useDropzone({onDrop, noClick: true})
  
  function handleOpenFileDialog() {
    if (getCookie('userdata')) {
      open()
    } else {
      setLoggedOutWarning(true)
    }
  }

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="grid gap sm:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] xl:grid-cols-[20%_80%] mt-[60px] p-0 md:pt-0 md:p-3 h-[calc(100dvh-60px)]">
        <section className='hidden sm:grid gap-3 grid-flow-row grid-rows-[minmax(0,_0.45fr)_minmax(0,_0.1fr)_minmax(0,_0.45fr)] items-center px-2 py-4 pt-6 h-[calc(100dvh-60px)]'>
          <FileTree fileTree={fileTree} />
          <StorageSpace />
          <UploadsList 
            setFilesToUpload={setFilesToUpload}
            currentUploadProgress={currentUploadProgress}
            uploadQueue={uploadQueue}
            handleOpenFileDialog={handleOpenFileDialog}
          />
        </section>
        <section className='px-4 sm:px-6 pt-0 pb-4 md:py-8 h-[calc(100dvh-60px)]'>
          <FilePath paramsRef={paramsRef} />
          <FileList
            fileArr={fileArr} 
            fileListRef={fileListRef} 
            getRootProps={getRootProps}
            getInputProps={getInputProps}
          />
        </section>
        <ContextMenu 
          ref={contextMenuRef} 
          router={router}
        />
        <ConfirmDelete />
        <Rename />
        <NewFolder />
        <MoveFile fileTree={fileTree} />
        <LoggedOutWarning />
        <ProcessInfo />
        <ProcessError />
      </main>
    </>
  )
}