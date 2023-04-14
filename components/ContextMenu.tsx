import { getCookie } from 'cookies-next'
import { NextRouter } from 'next/router'
import { forwardRef, ForwardedRef } from 'react'
import { useAppContext } from '@/components/contexts/AppContext'

function ContextMenu({ router }: { router: NextRouter; }, ref: ForwardedRef<HTMLMenuElement>) {
  const {
    contextMenu,
    setContextMenu,
    selectedFile,
    setSelectedFile,
    setLoggedOutWarning,
    setOpenNewFolderDialog,
    setProcessInfo,
    setOpenDeleteConfirm,
    setOpenRenameDialog,
    setOpenMoveFileDialog
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
        ref={ref}
        className={`${!contextMenu ? 'hidden' : ''} absolute min-w-[12rem] z-10 py-3 shadow-lg shadow-gray-900 bg-zinc-700 text-lg text-gray-200 rounded-[0.25rem] border-black border-solid border-[1px] context-menu-directory`}
      >
        <li className="flex justify-center h-8 rounded-sm hover:bg-zinc-500">
          <button onClick={handleNewFolder} className="w-full text-left pl-6">
            New Folder
          </button>
        </li>
      </menu>
    )
  }

  async function handleCopy() {
    if (!contextMenu || contextMenu == 'directory') return
    await navigator.clipboard.writeText(selectedFile?.[0].isDirectory ? `/files${selectedFile[0].path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`)
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
      className="absolute text-left min-w-[12rem] w-[4rem] z-10 py-3 shadow-lg shadow-gray-900 bg-zinc-700 text-lg text-gray-200 rounded-[0.25rem] border-black border-solid border-[1px] context-menu"
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
      <li className="flex  justify-center h-8 rounded-sm hover:bg-zinc-500">
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
    </menu>
  )
}

export default forwardRef(ContextMenu)