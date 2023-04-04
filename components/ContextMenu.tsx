import { FileServerFile } from '@/lib/types'
import { getCookie } from 'cookies-next';
import { NextRouter } from 'next/router'
import { Dispatch, RefObject, SetStateAction } from 'react'

export default function ContextMenu(
  { contextMenuRef, contextMenu, setContextMenu, selectedFile, router, setLoggedOutWarning, setOpenDeleteConfirm, setOpenRenameDialog, setOpenNewFolderDialog, setOpenMoveFileDialog }: 
  { 
    contextMenuRef: RefObject<HTMLMenuElement>; 
    contextMenu: 'file' | 'directory' | null; 
    setContextMenu: Dispatch<SetStateAction<'file' | 'directory' | null>>;
    selectedFile: FileServerFile[] | null;
    router: NextRouter;
    setLoggedOutWarning: Dispatch<SetStateAction<boolean>>;
    setOpenDeleteConfirm: Dispatch<SetStateAction<FileServerFile[] | null>>;
    setOpenRenameDialog: Dispatch<SetStateAction<FileServerFile | null>>;
    setOpenNewFolderDialog: Dispatch<SetStateAction<string | null>>;
    setOpenMoveFileDialog: Dispatch<SetStateAction<FileServerFile[] | null>>;
  }
) {
  function handleNewFolder() {
    if (getCookie('userdata')) {
      setOpenNewFolderDialog((router.query.path as string[]).join('/'))
    } else {
      setLoggedOutWarning(true)
    }
  }
  
  if (contextMenu == 'directory' || !contextMenu || !selectedFile?.length) {
    return (
      <menu
        ref={contextMenuRef}
        className={`${!contextMenu ? 'hidden' : ''} absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu-directory`}
      >
        <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
          <button onClick={handleNewFolder} className="w-full">
            New Folder
          </button>
        </li>
      </menu>
    )
  }

  function handleCopy() {
    if (!contextMenu || contextMenu == 'directory') return
    navigator.clipboard.writeText(selectedFile?.[0].isDirectory ? `/files${selectedFile[0].path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`)
    setContextMenu(null)
  }

  function handleDelete() {
    if (getCookie('userdata')) {
      setOpenDeleteConfirm(selectedFile)
    } else {
      setLoggedOutWarning(true)
    }
  }

  function handleRename() {
    if (!selectedFile) return
    if (getCookie('userdata')) {
      setOpenRenameDialog(selectedFile[0])
    } else {
      setLoggedOutWarning(true)
    }
  }
  
  function handleMove() {
    if (!selectedFile) return
    if (getCookie('userdata')) {
      setOpenMoveFileDialog(selectedFile)
    } else {
      setLoggedOutWarning(true)
    }
  }

  return (
    <menu
      ref={contextMenuRef}
      className="absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu"
    >
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => selectedFile?.[0].isDirectory ? router.push(`/files${selectedFile?.[0].path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`)} className="w-full">
          Open
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => window.open(selectedFile?.[0].isDirectory ? `/files${selectedFile?.[0].path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile?.[0].path}`, '_blank')} className="w-full">
          Open in New Tab
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={handleCopy} className="w-full">
          Copy Link
        </button>
      </li>
      <hr className="my-2 border-gray-500 border-t-[1px]" />
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={handleDelete} className="w-full">
          Delete
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={handleRename} className="w-full">
          Rename
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={handleMove} className="w-full">
          Move
        </button>
      </li>
    </menu>
  )
}