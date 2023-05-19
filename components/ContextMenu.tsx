import { useRouter } from 'next/router'
import { forwardRef, ForwardedRef, useRef, useState, PropsWithChildren } from 'react'
import { getCookie } from 'cookies-next'
import axios from 'axios'
import { ColorResult, TwitterPicker } from 'react-color'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useAppContext } from '@/components/contexts/AppContext'
import { sleep } from '@/lib/types'

function ContextMenu(_: any, ref: ForwardedRef<HTMLMenuElement>) {
  const localRef = useRef<HTMLMenuElement | null>(null)

  const [colorPick, setColorPick] = useState(false)
  
  const router = useRouter()

  const {
    contextMenu,
    setContextMenu,
    selectedFile,
    setLoggedOutWarning,
    setOpenNewFolderDialog
  } = useAppContext()

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
        className={`${!contextMenu ? 'hidden' : ''} absolute min-w-[12rem] z-10 py-3 shadow-lg shadow-gray-900 bg-zinc-700 text-lg text-gray-200 rounded-[0.25rem] border-black border-solid border-[1px] overflow-hidden context-menu-directory`}
      >
        <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
          <button onClick={handleNewFolder} className="w-full text-left pl-6">
            New Folder
          </button>
        </li>
      </menu>
    )
  }

  function handleDownload() {
    if (!selectedFile.length) return
    if (selectedFile.length == 1) {
      window.open(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/retrieve${selectedFile[0].path}?download=true`)
    } else {
      window.open(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/retrieve/${(router.query.path as string[]).join('/')}?${selectedFile.map(file => `file[]=${file.name}`).join('&')}`)
    }
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
    if (!localRef.current || !getCookie('userdata')) return
    localRef.current.style.overflow = 'visible'
    setColorPick(true)
  }

  function handleColorBlur() {
    if (!localRef.current || !getCookie('userdata')) return
    localRef.current.style.overflow = ''
    setColorPick(false)
  }

  async function handleColorPick(color: ColorResult) {
    await axios.post(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/metadata`, {
      directories: selectedFile.map(file => file.path),
      newMetadata: {
        color: color.hex
      }
    }, { withCredentials: true })
  }

  //* Download only as zip if files selected includes a directory
  if (selectedFile.every(file => file.metadata)) {
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
        customClass='context-menu-multifile'
      >
        <li 
          onMouseOver={handleColorFocus}
          onMouseOut={handleColorBlur}
          className="relative flex justify-center h-8 rounded-sm hover:bg-zinc-500"
        >
          <button className="w-full text-left pl-6">
            Change color
            <ChevronRightIcon className='absolute top-1/2 right-2 -translate-y-1/2' />
          </button>
          {colorPick &&
          <div className={`absolute top-0 ${localRef.current!.offsetLeft + 476 > window.innerWidth ? 'right-full' : 'left-full'} color-picker`}>
            <TwitterPicker 
              triangle='hide' 
              colors={['#FFFFFF', '#EB144C', '#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#F78DA7', '#9900EF']}

              onChange={handleColorPick} 
            />  
          </div>}
        </li>
        <hr className="my-1 border-gray-200 border-t-[1px]" />
        <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
          <button onClick={handleDownload} className="w-full text-left pl-6">
            Download as zip
          </button>
        </li>
      </ContextMenuTemplate>
    )
  } else if (selectedFile.every(file => !file.isDirectory)) {
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
        customClass='context-menu-multifile'
      >
        <hr className="my-1 border-gray-200 border-t-[1px]" />
        <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
          <button onClick={handleDownload} className="w-full text-left pl-6">
            Download as zip
          </button>
        </li>
        <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
          <button onClick={handleDownloadMulti} className="w-full text-left pl-6">
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
        customClass='context-menu'
      >
        <hr className="my-1 border-gray-200 border-t-[1px]" />
        <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
          <button onClick={handleDownload} className="w-full text-left pl-6">
            Download as zip
          </button>
        </li>
      </ContextMenuTemplate>
    )
  }
}

const ContextMenuTemplate = forwardRef(function ContextMenuTemplate({ children, customClass }: PropsWithChildren<{ customClass: string; }>, ref: ForwardedRef<HTMLMenuElement>) {
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
    setOpenMoveFileDialog
  } = useAppContext()
  
  async function handleCopy() {
    if (!contextMenu || contextMenu == 'directory') return
    const links = selectedFile.map(file => file.isDirectory ? `${location.origin}/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`)
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
    if (!selectedFile) return
    if (getCookie('userdata')) {
      setSelectedFile([])
      setOpenRenameDialog(selectedFile[0])
      setContextMenu(null)
    } else {
      setLoggedOutWarning(true)
    }
  }
  
  function handleMove() {
    if (!selectedFile) return
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
      className={`absolute text-left min-w-[12rem] w-[13rem] z-10 py-3 shadow-lg shadow-gray-900 bg-zinc-700 text-lg text-gray-200 rounded-[0.25rem] border-black border-solid border-[1px] overflow-hidden ${customClass}`}
    >
      <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
        <button onClick={() => selectedFile?.[0].isDirectory ? router.push(`/files${selectedFile?.[0].path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`)} className="w-full text-left pl-6">
          Open
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
        <button onClick={() => window.open(selectedFile?.[0].isDirectory ? `/files${selectedFile?.[0].path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`, '_blank')} className="w-full text-left pl-6">
          Open in New Tab
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
        <button onClick={handleCopy} className="w-full text-left pl-6">
          Copy Link
        </button>
      </li>
      <hr className="my-1 border-gray-200 border-t-[1px]" />
      <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
        <button onClick={handleDelete} className="w-full text-left pl-6">
          Delete
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
        <button onClick={handleRename} className="w-full text-left pl-6">
          Rename
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
        <button onClick={handleMove} className="w-full text-left pl-6">
          Move
        </button>
      </li>
      {children}
    </menu>
  )
})

export default forwardRef(ContextMenu)