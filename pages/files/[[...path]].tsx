import Head from 'next/head'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { FileServerFile, UploadProgress } from '@/lib/types'
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

export default function Files() {
  const paramsRef = useRef<string[]>([])
  const fileListRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLMenuElement>(null)
  const folderDetailsRef = useRef<HTMLDivElement>(null)
  const filesToUpload = useRef<File[]>([])

  const [selectedFile, setSelectedFile] = useState<FileServerFile[]>([])
  const [contextMenu, setContextMenu] = useState<'file' | 'directory' | null>(null)
  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)
  const [currentUploadProgress, setCurrentUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadQueue, setUploadQueue] = useState<File[] | null>(null)
  const [loggedOutWarning, setLoggedOutWarning] = useState(false)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<FileServerFile[] | null>(null)
  const [openRenameDialog, setOpenRenameDialog] = useState<FileServerFile | null>(null)
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState<string | null>(null)
  const [openMoveFileDialog, setOpenMoveFileDialog] = useState<FileServerFile[] | null>(null)
  const [folderDetailsAnchor, setFolderDetailsAnchor] = useState<HTMLElement | null>(null)

  const folderDetailsOpen = Boolean(folderDetailsAnchor)

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
        setSelectedFile([])
        setContextMenu('directory')
      }
      if (!contextMenuRef.current) return
      
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
  }, [])

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

          await getData() //TODO: Remove once server websocket for live updates is set up
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

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="grid sm:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] xl:grid-cols-[20%_80%] p-3 pt-[60px] h-screen">
        <section className='hidden sm:grid grid-flow-row grid-rows-[45%_10%_45%] items-center px-2 py-4 pt-6 h-[calc(100dvh-60px)]'>
          <FileTree />
          <StorageSpace />
          <UploadsList 
            currentUploadProgress={currentUploadProgress}
            uploadQueue={uploadQueue}
            handleOpenFileDialog={handleOpenFileDialog}
          />
        </section>
        <section className='px-6 sm:px-6 py-8 h-[calc(100dvh-60px)]'>
          <span className='flex items-center text-xl'>
            <Link 
              href={''}
              className='p-2 rounded-md transition-colors duration-75 hover:bg-gray-500'
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
                      onClick={handleFolderDetailsOpen}
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
            getRootProps={getRootProps}
            getInputProps={getInputProps}
          />
        </section>
        <Menu 
          anchorEl={folderDetailsAnchor}
          open={folderDetailsOpen}
          onClose={handleFolderDetailsClose}
        >
          <MenuItem onClick={() => {}}>New folder</MenuItem>
          <hr className='my-1'></hr>
          <MenuItem onClick={() => {}}>Encode MKV</MenuItem>
          <MenuItem onClick={() => {}}>Extract captions</MenuItem>
          <MenuItem onClick={() => {}}>Convert Captions</MenuItem>
          <MenuItem onClick={() => {}}>Generate manifests</MenuItem>
        </Menu>
        <ContextMenu 
          contextMenuRef={contextMenuRef} 
          contextMenu={contextMenu} 
          setContextMenu={setContextMenu} 
          selectedFile={selectedFile}
          router={router} 
          setLoggedOutWarning={setLoggedOutWarning}
          setOpenDeleteConfirm={setOpenDeleteConfirm}
          setOpenRenameDialog={setOpenRenameDialog}
          setOpenNewFolderDialog={setOpenNewFolderDialog}
          setOpenMoveFileDialog={setOpenMoveFileDialog}
        />
        <ConfirmDelete 
          openDeleteConfirm={openDeleteConfirm} 
          setOpenDeleteConfirm={setOpenDeleteConfirm} 
          getData={getData}
        />
        <Rename 
          openRenameDialog={openRenameDialog}
          setOpenRenameDialog={setOpenRenameDialog}
          getData={getData}
        />
        <NewFolder
          openNewFolderDialog={openNewFolderDialog}
          setOpenNewFolderDialog={setOpenNewFolderDialog}
          getData={getData}
        />
        <MoveFile
          openMoveFileDialog={openMoveFileDialog}
          setOpenMoveFileDialog={setOpenMoveFileDialog}
          getData={getData}
        />
        <LoggedOutWarning 
          loggedOutWarning={loggedOutWarning}
          setLoggedOutWarning={setLoggedOutWarning}
        />
      </main>
    </>
  )
}