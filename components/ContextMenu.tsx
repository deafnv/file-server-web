import { FileServerFile } from '@/lib/types'
import { RefObject } from 'react'

export default function ContextMenu({ contextMenuRef, contextMenu }: { contextMenuRef: RefObject<HTMLMenuElement>; contextMenu:  FileServerFile | 'directory' | null; }) {
  if (!contextMenu) return null

  if (contextMenu == 'directory') {
    return (
      <menu
        ref={contextMenuRef}
        className="absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu"
      >
        Show New Folder and stuff
      </menu>
    )
  }

  return (
    <menu
      ref={contextMenuRef}
      className="absolute min-w-[12rem] z-10 p-3 shadow-lg shadow-gray-700 bg-slate-200 text-black text-lg rounded-md border-black border-solid border-2 context-menu"
    >
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
          Open
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
          Open in New Tab
        </button>
      </li>
      <li className="flex justify-center h-8 rounded-sm hover:bg-slate-500">
        <button onClick={() => {}} className="w-full">
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