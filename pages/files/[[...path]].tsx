import Head from 'next/head'
import axios, { AxiosError } from 'axios'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { FileServerFile, FileTreeRes, UploadProgress } from '@/lib/types'
import { useDropzone } from 'react-dropzone'
import isEqual from 'lodash/isEqual'
import { getCookie } from 'cookies-next'
import ContextMenu from '@/components/ContextMenu'
import FileList from '@/components/FileList'
import LoggedOutWarning from '@/components/LoggedOutWarn'
import UploadsList from '@/components/UploadsList'
import StorageSpace from '@/components/StorageSpace'
import FileTree from '@/components/FileTree'
import ConfirmDelete from '@/components/dialogs/ConfirmDelete'
import Rename from '@/components/dialogs/Rename'
import NewFolder from '@/components/dialogs/NewFolder'
import MoveFile from '@/components/dialogs/MoveFile'
import ProcessInfo from '@/components/ProcessInfo'
import ProcessError from '@/components/ProcessError'
import path from 'path'
import FilePath from '@/components/FilePath'
import { getData } from '@/lib/methods'

export default function Files() {
  const paramsRef = useRef<string[]>([])
  const fileListRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLMenuElement>(null)
  const filesToUpload = useRef<File[]>([])

  const [selectedFile, setSelectedFile] = useState<FileServerFile[]>([])
  const [contextMenu, setContextMenu] = useState<'file' | 'directory' | null>(null)
  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)
  const [fileTree, setFileTree] = useState<FileTreeRes | null>()
  const [currentUploadProgress, setCurrentUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadQueue, setUploadQueue] = useState<File[] | null>(null)
  const [loggedOutWarning, setLoggedOutWarning] = useState(false)
  const [processInfo, setProcessInfo] = useState('')
  const [processError, setProcessError] = useState('')
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<FileServerFile[] | null>(null)
  const [openRenameDialog, setOpenRenameDialog] = useState<FileServerFile | null>(null)
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState<string | null>(null)
  const [openMoveFileDialog, setOpenMoveFileDialog] = useState<FileServerFile[] | null>(null)
  const [folderDetailsAnchor, setFolderDetailsAnchor] = useState<HTMLElement | null>(null)

  const folderDetailsOpen = Boolean(folderDetailsAnchor)

  const router = useRouter()

  useEffect(() => {
    if(router.isReady) getData(setFileArr, setFileTree, router, paramsRef)
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
        contextMenuRef.current.style.top = `${(isFarBottom ? e.pageY - contextMenuRef.current.scrollHeight : e.pageY) - (isFarRight ? 0 : 10)}px`
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

    const routeChangeStart = () => setContextMenu(null)

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
      filesToUpload.current = filesToUpload.current.concat(acceptedFiles)
      setUploadQueue(filesToUpload.current)
      
      while (filesToUpload.current.length !== 0) {
        const fileToUpload = filesToUpload.current[0]
        filesToUpload.current = filesToUpload.current.filter(file => !isEqual(file, fileToUpload))!
        setUploadQueue(filesToUpload.current)
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

          await getData(setFileArr, setFileTree, router, paramsRef) //TODO: Remove once server websocket for live updates is set up
        } catch (err) {
          setCurrentUploadProgress(null)
          if ((err as any as AxiosError).response?.status == 401) {
            alert(`Error uploading, unauthorized. Try logging back in again.`)
          } else {
            alert(`Error for file ${fileToUpload.name}. The server is probably down somehow.`)
          }
          console.log(err)
        }
        setCurrentUploadProgress(null)
      } 
    } else {
      filesToUpload.current = filesToUpload.current.concat(acceptedFiles)
      setUploadQueue(filesToUpload.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])
  
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({onDrop, noClick: true})
  
  function handleOpenFileDialog() {
    if (getCookie('userdata')) {
      open()
    } else {
      setLoggedOutWarning(true)
    }
  }

  function handleFolderDetailsOpen(e: React.MouseEvent<HTMLDivElement>) {
    setFolderDetailsAnchor(e.currentTarget)
  }

  function handleFolderDetailsClose() {
    setFolderDetailsAnchor(null)
  }

  function FolderDetails() {
    async function handleEncode() {
      if (!(fileArr instanceof Array)) return
      if (!getCookie('userdata')) {
        setLoggedOutWarning(true)
        return
      }
      if (fileArr.filter(file => (path.parse(file.name).ext == '.mkv' && !file.isDirectory)).length == 0) {
        setProcessError('No mkv files in folder')
        return
      }
      try {
        const encodeResponse = await axios({
          method: 'POST',
          url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/encodequeue/add/${(router.query.path as string[])?.join('/') ?? ''}`,
          data: {},
          withCredentials: true
        })
        if (encodeResponse.data.data) {
          setProcessInfo(`Added files to queue, ${encodeResponse.data.data.length} file(s) failed to add`)
        } else {
          setProcessInfo('All files successfully added to queue')
        }
      } catch (error) {
        console.log(error)
        setProcessError('Something went wrong, failed to add to queue')
      }
    }

    async function handleExtract() {
      if (!(fileArr instanceof Array)) return
      if (!getCookie('userdata')) {
        setLoggedOutWarning(true)
        return
      }
      if (fileArr.filter(file => (path.parse(file.name).ext == '.mkv' && !file.isDirectory)).length == 0) {
        setProcessError('No mkv files in folder')
        return
      }
      try {
        const extractResponse = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/caption/${(router.query.path as string[])?.join('/') ?? ''}`, { withCredentials: true })
        setProcessInfo('Successfully extracted captions') //TODO: Deal with SSE here
      } catch (error) {
        console.log(error)
        setProcessError('Something went wrong, failed to extract captions')
      }
    }

    async function handleConvert() {
      //! Ask for subtitle id
      /* if (!(fileArr instanceof Array)) return
      if (!getCookie('userdata')) {
        setLoggedOutWarning(true)
        return
      }
      if (fileArr.filter(file => (path.parse(file.name).ext == '.mkv' && !file.isDirectory)).length == 0) {
        setProcessError('No mkv files in folder')
        return
      } else if (fileArr.filter(file => file.name == 'captions').length == 0) {
        setProcessError('No captions folder found')
        return
      }
      try {
        const convertResponse =  await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/convertcc/${(router.query.path as string[])?.join('/') ?? ''}`, { withCredentials: true })
        setProcessInfo('Successfully converted captions')
      } catch (error) {
        console.log(error)
        setProcessError('Something went wrong, failed to convert captions')
      } */
    }

    async function handleManifest() {
      if (!(fileArr instanceof Array)) return
      if (!getCookie('userdata')) {
        setLoggedOutWarning(true)
        return
      }
      if (fileArr.filter(file => file.name == 'captions').length == 0) {
        setProcessError('No captions folder found')
        return
      } else if (fileArr.filter(file => file.name == 'converted').length == 0) {
        setProcessError('No converted folder found')
        return
      }
      try {
        const manifestResponse = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/manifest/${(router.query.path as string[])?.join('/') ?? ''}`, { withCredentials: true })
        setProcessInfo('Successfully generated manifests') //TODO: Deal with SSE here
      } catch (error) {
        console.log(error)
        setProcessError('Something went wrong, failed to generate manifests')
      }
    }
      
    return (
      <Menu 
        anchorEl={folderDetailsAnchor}
        open={folderDetailsOpen}
        onClose={handleFolderDetailsClose}
      >
        <MenuItem 
          onClick={() => {
            setOpenNewFolderDialog((router.query.path as string[])?.join('/') ?? '/')
            setFolderDetailsAnchor(null)
          }}>
          New folder
        </MenuItem>
        <hr className='my-1'></hr>
        <MenuItem onClick={handleEncode}>Encode MKV</MenuItem>
        <MenuItem onClick={handleExtract}>Extract captions</MenuItem>
        <MenuItem onClick={handleConvert}>Convert Captions</MenuItem>
        <MenuItem onClick={handleManifest}>Generate manifests</MenuItem>
      </Menu>
    )
  }

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="grid sm:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] xl:grid-cols-[20%_80%] p-3 pt-[60px] h-screen">
        <section className='hidden sm:grid grid-flow-row grid-rows-[45%_10%_45%] items-center px-2 py-4 pt-6 h-[calc(100dvh-60px)]'>
          <FileTree fileTree={fileTree} />
          <StorageSpace />
          <UploadsList 
            currentUploadProgress={currentUploadProgress}
            uploadQueue={uploadQueue}
            handleOpenFileDialog={handleOpenFileDialog}
          />
        </section>
        <section className='px-6 sm:px-6 py-8 h-[calc(100dvh-60px)]'>
          <FilePath 
            paramsRef={paramsRef} 
            handleFolderDetailsOpen={handleFolderDetailsOpen}
          />
          <FileList
            fileArr={fileArr} 
            fileListRef={fileListRef} 
            contextMenu={contextMenu} 
            setContextMenu={setContextMenu}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setProcessInfo={setProcessInfo}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            getData={() => getData(setFileArr, setFileTree, router, paramsRef)}
          />
        </section>
        <FolderDetails />
        <ContextMenu 
          contextMenuRef={contextMenuRef} 
          contextMenu={contextMenu} 
          setContextMenu={setContextMenu} 
          selectedFile={selectedFile}
          router={router} 
          setProcessInfo={setProcessInfo}
          setLoggedOutWarning={setLoggedOutWarning}
          setOpenDeleteConfirm={setOpenDeleteConfirm}
          setOpenRenameDialog={setOpenRenameDialog}
          setOpenNewFolderDialog={setOpenNewFolderDialog}
          setOpenMoveFileDialog={setOpenMoveFileDialog}
        />
        <ConfirmDelete 
          openDeleteConfirm={openDeleteConfirm} 
          setOpenDeleteConfirm={setOpenDeleteConfirm} 
          getData={() => getData(setFileArr, setFileTree, router, paramsRef)}
        />
        <Rename 
          openRenameDialog={openRenameDialog}
          setOpenRenameDialog={setOpenRenameDialog}
          getData={() => getData(setFileArr, setFileTree, router, paramsRef)}
        />
        <NewFolder
          openNewFolderDialog={openNewFolderDialog}
          setOpenNewFolderDialog={setOpenNewFolderDialog}
          getData={() => getData(setFileArr, setFileTree, router, paramsRef)}
        />
        <MoveFile
          openMoveFileDialog={openMoveFileDialog}
          setOpenMoveFileDialog={setOpenMoveFileDialog}
          getData={() => getData(setFileArr, setFileTree, router, paramsRef)}
        />
        <LoggedOutWarning 
          loggedOutWarning={loggedOutWarning}
          setLoggedOutWarning={setLoggedOutWarning}
        />
        <ProcessInfo
          processInfo={processInfo}
          setProcessInfo={setProcessInfo}
        />
        <ProcessError
          processError={processError}
          setProcessError={setProcessError}
        />
      </main>
    </>
  )
}