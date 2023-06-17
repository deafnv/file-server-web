import { useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { useAppContext } from '@/components/contexts/AppContext'
import FileTree from '@/components/FileTree'
import StorageSpace from '@/components/StorageSpace'
import FileList from '@/components/FileList'
import LoggedOutWarning from '@/components/LoggedOutWarn'
import ProcessInfo from '@/components/ProcessInfo'
import ProcessError from '@/components/ProcessError'
import ConfirmDelete from '@/components/dialogs/ConfirmDelete'
import Rename from '@/components/dialogs/Rename'
import NewFolder from '@/components/dialogs/NewFolder'
import MoveFile from '@/components/dialogs/MoveFile'
import ContextMenu from '@/components/ContextMenu'
import ShortcutCreate from '@/components/dialogs/ShortcutCreate'
import { FileServerFile, SortMethod } from '@/lib/types'
import { getFileTree } from '@/lib/methods'

let socket: Socket

export default function SearchFiles() {
  const fileListRef = useRef<HTMLDivElement>(null)
  const fileRefs = useRef<
    Array<{
      file: FileServerFile
      ref: HTMLDivElement
    }>
  >([])
  const sortMethodRef = useRef<SortMethod>('')
  const contextMenuRef = useRef<HTMLMenuElement>(null)

  const router = useRouter()

  const { setContextMenu, setFileArr, setFileTree, setSocketConnectionState } = useAppContext()

  useEffect(() => {
    let { q } = router.query
    if (q instanceof Array) q = q[0]

    const getSearchResults = async () => {
      setFileArr(null)
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/search?q=${q}`)
      setFileArr(data.map((file: any) => file.item))
    }
    getSearchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query])

  useEffect(() => {
    const socketTreeHandler = () => {
      getFileTree(setFileTree)
    }

    if (router.isReady) {
      socket = io(process.env.NEXT_PUBLIC_FILE_SERVER_URL!)
      getFileTree(setFileTree)

      socket.on('connect', () => setSocketConnectionState(true))
      socket.on('disconnect', () => setSocketConnectionState(false))

      socket.on('filetree', socketTreeHandler)
    }

    return () => {
      if (socket) {
        socket.off('filetree', socketTreeHandler)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    const customContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (contextMenuRef.current?.contains(target)) {
        e.preventDefault()
        return
      }
      if (!fileListRef.current || !fileListRef.current.contains(target)) return

      e.preventDefault()

      if (!contextMenuRef.current) return

      const isFarRight = e.pageX + contextMenuRef.current.offsetWidth > window.innerWidth
      const isFarBottom = e.pageY + contextMenuRef.current.scrollHeight > window.innerHeight

      if (isFarRight || isFarBottom) {
        contextMenuRef.current.style.top = `${
          isFarBottom ? e.pageY - contextMenuRef.current.scrollHeight : e.pageY
        }px`
        contextMenuRef.current.style.left = `${
          isFarRight ? e.pageX - contextMenuRef.current.offsetWidth : e.pageX
        }px`
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

    document.addEventListener('mousedown', preventSelect)
    document.addEventListener('contextmenu', customContextMenu)
    document.addEventListener('mousedown', exitMenus)

    return () => {
      document.removeEventListener('mousedown', preventSelect)
      document.removeEventListener('contextmenu', customContextMenu)
      document.removeEventListener('mousedown', exitMenus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMenuRef.current])

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name='description' content='File Server' />
      </Head>
      <main className='grid gap md:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] xl:grid-cols-[20%_80%] mt-[60px] px-0 md:px-4 py-0 md:py-4 md:pt-0 h-[calc(100dvh-60px)]'>
        <section className='hidden md:grid gap-3 grid-flow-row grid-rows-[minmax(0,_0.45fr)_minmax(0,_0.1fr)_minmax(0,_0.45fr)] items-center mr-0 md:mr-2 py-4 pt-6 h-[calc(100dvh-60px)]'>
          <FileTree />
          <StorageSpace />
          <div />
        </section>
        <section className='flex flex-col pt-0 pb-0 md:pb-4 h-[calc(100dvh-60px)]'>
          <span className='flex items-center mt-0 md:mt-2 p-2 md:px-0 text-xl'>Search results</span>
          <FileList
            isSearching
            fileRefs={fileRefs}
            fileListRef={fileListRef}
            sortMethodRef={sortMethodRef}
          />
        </section>
        <ContextMenu ref={contextMenuRef} />
        <ConfirmDelete />
        <Rename />
        <NewFolder />
        <MoveFile />
        <ShortcutCreate />
        <LoggedOutWarning />
        <ProcessInfo />
        <ProcessError />
      </main>
    </>
  )
}
