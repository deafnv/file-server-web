import { FileServerFile } from '@/lib/types'
import { NextRouter } from 'next/router'
import { Dispatch, RefObject, SetStateAction } from 'react'

export default function ContextMenu(
  { contextMenuRef, contextMenu, setContextMenu, router }: 
  { 
    contextMenuRef: RefObject<HTMLMenuElement>; 
    contextMenu:  FileServerFile | 'directory' | null; 
    setContextMenu: Dispatch<SetStateAction<FileServerFile | 'directory' | null>>;
    router: NextRouter;
  }
) {
  if (contextMenu == 'directory' || !contextMenu) {
    return (
      <menu
        ref={contextMenuRef}
        className={`${!contextMenu ? 'hidden' : ''} absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu-directory`}
      >
        <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
          <button onClick={() => console.log(router.asPath.replace('/files', ''))} className="w-full">
            New Folder
          </button>
        </li>
      </menu>
    )
  }

  function handleCopy() {
    if (!contextMenu || contextMenu == 'directory') return
    navigator.clipboard.writeText(contextMenu.isDirectory ? `/files${contextMenu.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${contextMenu.path}`)
    setContextMenu(null)
  }

  return (
    <menu
      ref={contextMenuRef}
      className="absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu"
    >
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => contextMenu.isDirectory ? router.push(`/files${contextMenu.path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${contextMenu.path}`)} className="w-full">
          Open
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => window.open(contextMenu.isDirectory ? `/files${contextMenu.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${contextMenu.path}`, '_blank')} className="w-full">
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
        <button onClick={() => {}} className="w-full">
          Delete
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
          Rename
        </button>
      </li>
    </menu>
  )
}