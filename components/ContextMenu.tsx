import { useRouter } from 'next/router'
import { forwardRef, ForwardedRef, useRef, useState, PropsWithChildren, useEffect } from 'react'
import { getCookie, CookieValueTypes, deleteCookie } from 'cookies-next'
import axios, { AxiosError } from 'axios'
import { ColorResult, TwitterPicker } from 'react-color'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useAppContext } from '@/components/contexts/AppContext'
import { ContextMenuTemplateProps } from '@/lib/types'
import { sleep } from '@/lib/methods'

function ContextMenu(_: any, ref: ForwardedRef<HTMLMenuElement>) {
  const localRef = useRef<HTMLMenuElement | null>(null)
  const userDataRef = useRef<CookieValueTypes>('')

  const [width, setWidth] = useState<number>(0)
  const [colorPick, setColorPick] = useState(false)

  const router = useRouter()

  const {
    contextMenu,
    setContextMenu,
    selectedFile,
    setSelectedFile,
    setLoggedOutWarning,
    setOpenNewFolderDialog,
    setOpenShortcutDialog,
    setProcessError,
  } = useAppContext()

  useEffect(() => {
    userDataRef.current = getCookie('userdata')
    setWidth(window.innerWidth)
    const handleWindowResize = () => setWidth(window.innerWidth)

    window.addEventListener('resize', handleWindowResize)

    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  function handleNewFolder() {
    if (getCookie('userdata')) {
      setOpenNewFolderDialog((router.query.path as string[])?.join('/') ?? '/')
      setContextMenu(null)
    } else {
      setLoggedOutWarning(true)
    }
  }

  if (contextMenu == 'directory' || !contextMenu || !selectedFile?.length) {
    return (
      <menu
        data-cy='context-menu'
        ref={(node) => {
          localRef.current = node as HTMLMenuElement
          if (typeof ref === 'function') {
            ref(node as HTMLMenuElement)
          } else if (ref) {
            ref.current = node as HTMLMenuElement
          }
        }}
        className={`${
          !contextMenu ? 'hidden' : ''
        } absolute text-left min-w-[12rem] w-[13rem] z-10 py-3 shadow-lg shadow-gray-900 bg-[#313131] text-lg text-gray-200 rounded-[0.25rem] border-black border-solid border-[1px] overflow-hidden select-none animate-menu-[3.5rem]`}
      >
        <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
          <button onClick={handleNewFolder} className='w-full text-left pl-6'>
            New Folder
          </button>
        </li>
      </menu>
    )
  }

  function handleDownload() {
    if (!selectedFile.length) return
    window.open(
      `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/retrieve/${(
        (router.query.path as string[]) ?? []
      ).join('/')}?${selectedFile
        .map((file) => (file.isShortcut ? null : `file[]=${file.name}`))
        .filter((i) => i)
        .join('&')}`
    )
  }

  async function handleDownloadMulti() {
    for (const file of selectedFile) {
      var link = document.createElement('a')
      link.href = `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/retrieve${file.path}?download=true`
      link.download = file.name
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      await sleep(1)
    }
  }

  function handleColorFocus() {
    if (!localRef.current || !userDataRef.current || width < 768) return
    localRef.current.style.overflow = 'visible'
    setColorPick(true)
  }

  function handleColorBlur() {
    if (!localRef.current || !userDataRef.current || width < 768) return
    localRef.current.style.overflow = ''
    setColorPick(false)
  }

  async function handleColorPick(color: ColorResult) {
    await axios
      .post(
        `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/metadata`,
        {
          pathToFiles: selectedFile.map((file) =>
            file.isShortcut ? file.isShortcut.shortcutPath : file.path
          ),
          newMetadata: {
            color: color.hex,
          },
        },
        { withCredentials: true }
      )
      .catch((err) => {
        if ((err as AxiosError).response?.status == 403) {
          setProcessError('Error: Forbidden')
        } else if ((err as AxiosError).response?.status == 401) {
          alert('Error: Unauthorized, try logging in again.')
          deleteCookie('userdata')
          router.reload()
        } else {
          alert(`Error. The server is probably down. ${err}`)
        }
      })
  }

  function handleShortcut() {
    if (selectedFile.length != 1) return
    if (getCookie('userdata')) {
      setSelectedFile([])
      setOpenShortcutDialog(selectedFile[0])
      setContextMenu(null)
    } else {
      setLoggedOutWarning(true)
    }
  }

  //* Download only as zip if files selected includes a directory
  if (selectedFile.every((file) => file.isDirectory)) {
    return (
      <ContextMenuTemplate
        ref={(node) => {
          localRef.current = node as HTMLMenuElement
          if (typeof ref === 'function') {
            ref(node as HTMLMenuElement)
          } else if (ref) {
            ref.current = node as HTMLMenuElement
          }
        }}
        customClass={
          selectedFile.length == 1 && !selectedFile[0].isShortcut
            ? 'animate-menu-[20.7rem]'
            : 'animate-menu-[18.7rem]'
        }
        userDataRef={userDataRef}
      >
        {selectedFile.length == 1 && !selectedFile[0].isShortcut && (
          <li
            className={`flex justify-center h-8 rounded-sm ${
              !userDataRef.current ? 'opacity-40 pointer-events-none' : 'hover:bg-zinc-500'
            }`}
          >
            <button onClick={handleShortcut} className='w-full text-left pl-6'>
              Create shortcut
            </button>
          </li>
        )}
        <li
          onMouseOver={handleColorFocus}
          onMouseOut={handleColorBlur}
          className={`relative flex justify-center h-8 rounded-sm ${
            !userDataRef.current || width < 768
              ? 'opacity-40 pointer-events-none'
              : 'hover:bg-zinc-500'
          }`}
        >
          <button className='w-full text-left pl-6'>
            Change color
            <ChevronRightIcon className='absolute top-1/2 right-2 -translate-y-1/2' />
          </button>
          {colorPick && (
            <div
              className={`absolute top-0 ${
                localRef.current!.offsetLeft + 476 > window.innerWidth ? 'right-full' : 'left-full'
              } animate-color-picker shadow-lg shadow-gray-900 border-black border`}
            >
              <TwitterPicker
                triangle='hide'
                colors={[
                  '#FFFFFF',
                  '#EB144C',
                  '#FF6900',
                  '#FCB900',
                  '#7BDCB5',
                  '#00D084',
                  '#8ED1FC',
                  '#0693E3',
                  '#F78DA7',
                  '#9900EF',
                ]}
                onChange={handleColorPick}
                styles={{ default: { card: { backgroundColor: '#3b3b3b' } } }}
              />
            </div>
          )}
        </li>
        <hr className='my-1 border-gray-200 border-t-[1px]' />
        <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
          <button onClick={handleDownload} className='w-full text-left pl-6'>
            Download as zip
          </button>
        </li>
      </ContextMenuTemplate>
    )
  } else if (selectedFile.every((file) => !file.isDirectory)) {
    return (
      <ContextMenuTemplate
        ref={(node) => {
          localRef.current = node as HTMLMenuElement
          if (typeof ref === 'function') {
            ref(node as HTMLMenuElement)
          } else if (ref) {
            ref.current = node as HTMLMenuElement
          }
        }}
        customClass={
          selectedFile.length == 1 && !selectedFile[0].isShortcut
            ? 'animate-menu-[20.7rem]'
            : 'animate-menu-[18.7rem]'
        }
        userDataRef={userDataRef}
      >
        {selectedFile.length == 1 && !selectedFile[0].isShortcut && (
          <li
            className={`flex justify-center h-8 rounded-sm ${
              !userDataRef.current ? 'opacity-40 pointer-events-none' : 'hover:bg-zinc-500'
            }`}
          >
            <button onClick={handleShortcut} className='w-full text-left pl-6'>
              Create shortcut
            </button>
          </li>
        )}
        <hr className='my-1 border-gray-200 border-t-[1px]' />
        <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
          <button onClick={handleDownload} className='w-full text-left pl-6'>
            Download as zip
          </button>
        </li>
        <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
          <button onClick={handleDownloadMulti} className='w-full text-left pl-6'>
            Download selected
          </button>
        </li>
      </ContextMenuTemplate>
    )
  } else {
    return (
      <ContextMenuTemplate
        ref={(node) => {
          localRef.current = node as HTMLMenuElement
          if (typeof ref === 'function') {
            ref(node as HTMLMenuElement)
          } else if (ref) {
            ref.current = node as HTMLMenuElement
          }
        }}
        customClass='animate-menu-[16.7rem]'
        userDataRef={userDataRef}
      >
        <hr className='my-1 border-gray-200 border-t-[1px]' />
        <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
          <button onClick={handleDownload} className='w-full text-left pl-6'>
            Download as zip
          </button>
        </li>
      </ContextMenuTemplate>
    )
  }
}

const ContextMenuTemplate = forwardRef(function ContextMenuTemplate(
  { children, customClass, userDataRef }: PropsWithChildren<ContextMenuTemplateProps>,
  ref: ForwardedRef<HTMLMenuElement>
) {
  const router = useRouter()

  const {
    contextMenu,
    setContextMenu,
    selectedFile,
    setSelectedFile,
    setLoggedOutWarning,
    setProcessInfo,
    setOpenDeleteConfirm,
    setOpenRenameDialog,
    setOpenMoveFileDialog,
  } = useAppContext()

  async function handleCopy() {
    if (!contextMenu || contextMenu == 'directory') return
    const links = selectedFile.map((file) =>
      file.isDirectory
        ? `${location.origin}/files${file.path}`
        : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`
    )
    await navigator.clipboard.writeText(links.join(','))
    setProcessInfo('Link copied to clipboard')
    setSelectedFile([])
    setContextMenu(null)
  }

  function handleDelete() {
    if (getCookie('userdata')) {
      setSelectedFile([])
      setOpenDeleteConfirm(selectedFile)
      setContextMenu(null)
    } else {
      setLoggedOutWarning(true)
    }
  }

  function handleRename() {
    if (!selectedFile.length) return
    if (getCookie('userdata')) {
      setSelectedFile([])
      setOpenRenameDialog(selectedFile[0])
      setContextMenu(null)
    } else {
      setLoggedOutWarning(true)
    }
  }

  function handleMove() {
    if (!selectedFile.length) return
    if (getCookie('userdata')) {
      setSelectedFile([])
      setOpenMoveFileDialog(selectedFile)
      setContextMenu(null)
    } else {
      setLoggedOutWarning(true)
    }
  }

  return (
    <menu
      data-cy='context-menu'
      ref={ref}
      className={`absolute text-left min-w-[12rem] w-[13rem] z-10 py-3 shadow-lg shadow-gray-900 bg-foreground text-lg text-gray-200 rounded-[0.25rem] border-black border overflow-hidden select-none ${customClass}`}
    >
      <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
        <button
          onClick={() =>
            selectedFile?.[0].isDirectory
              ? router.push(`/files${selectedFile?.[0].path}`)
              : router.push(
                  `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`
                )
          }
          className='w-full text-left pl-6'
        >
          Open
        </button>
      </li>
      <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
        <button
          onClick={() =>
            window.open(
              selectedFile?.[0].isDirectory
                ? `/files${selectedFile?.[0].path}`
                : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`,
              '_blank'
            )
          }
          className='w-full text-left pl-6'
        >
          Open in New Tab
        </button>
      </li>
      <li className='flex justify-center h-8 rounded-sm hover:bg-zinc-500'>
        <button onClick={handleCopy} className='w-full text-left pl-6'>
          Copy Link
        </button>
      </li>
      <hr className='my-1 border-gray-200 border-t-[1px]' />
      <li
        className={`flex justify-center h-8 rounded-sm ${
          !userDataRef.current ? 'opacity-40 pointer-events-none' : 'hover:bg-zinc-500'
        }`}
      >
        <button onClick={handleDelete} className='w-full text-left pl-6'>
          Delete
        </button>
      </li>
      <li
        className={`flex justify-center h-8 rounded-sm ${
          !userDataRef.current ? 'opacity-40 pointer-events-none' : 'hover:bg-zinc-500'
        }`}
      >
        <button onClick={handleRename} className='w-full text-left pl-6'>
          Rename
        </button>
      </li>
      <li
        className={`flex justify-center h-8 rounded-sm ${
          !userDataRef.current ? 'opacity-40 pointer-events-none' : 'hover:bg-zinc-500'
        }`}
      >
        <button onClick={handleMove} className='w-full text-left pl-6'>
          Move
        </button>
      </li>
      {children}
    </menu>
  )
})

export default forwardRef(ContextMenu)
