import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react'
import { FileServerFile, FileTreeRes } from '@/lib/types'

interface AppContextType {
  drawerOpen: boolean
  setDrawerOpen: Dispatch<SetStateAction<boolean>>
  socketConnectionState: boolean
  setSocketConnectionState: Dispatch<SetStateAction<boolean>>
  fileArr: string | FileServerFile[] | null
  setFileArr: Dispatch<SetStateAction<string | FileServerFile[] | null>>
  fileTree: string | FileTreeRes | null | undefined
  setFileTree: Dispatch<SetStateAction<string | FileTreeRes | null | undefined>>
  selectedFile: FileServerFile[]
  setSelectedFile: Dispatch<SetStateAction<FileServerFile[]>>
  contextMenu: 'file' | 'directory' | null
  setContextMenu: Dispatch<SetStateAction<'file' | 'directory' | null>>
  loggedOutWarning: boolean
  setLoggedOutWarning: Dispatch<SetStateAction<boolean>>
  processInfo: string
  setProcessInfo: Dispatch<SetStateAction<string>>
  processError: string
  setProcessError: Dispatch<SetStateAction<string>>
  openDeleteConfirm: FileServerFile[] | null
  setOpenDeleteConfirm: Dispatch<SetStateAction<FileServerFile[] | null>>
  openRenameDialog: FileServerFile | null
  setOpenRenameDialog: Dispatch<SetStateAction<FileServerFile | null>>
  openNewFolderDialog: string | null
  setOpenNewFolderDialog: Dispatch<SetStateAction<string | null>>
  openMoveFileDialog: FileServerFile[] | null
  setOpenMoveFileDialog: Dispatch<SetStateAction<FileServerFile[] | null>>
  openShortcutDialog: FileServerFile | null
  setOpenShortcutDialog: Dispatch<SetStateAction<FileServerFile | null>>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppContextProvider({ children }: React.PropsWithChildren) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [socketConnectionState, setSocketConnectionState] = useState(false)
  const [fileTree, setFileTree] = useState<FileTreeRes | string | null>()
  const [fileArr, setFileArr] = useState<FileServerFile[] | string | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileServerFile[]>([])
  const [contextMenu, setContextMenu] = useState<'file' | 'directory' | null>(null)
  const [loggedOutWarning, setLoggedOutWarning] = useState(false)
  const [processInfo, setProcessInfo] = useState('')
  const [processError, setProcessError] = useState('')
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<FileServerFile[] | null>(null)
  const [openRenameDialog, setOpenRenameDialog] = useState<FileServerFile | null>(null)
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState<string | null>(null)
  const [openMoveFileDialog, setOpenMoveFileDialog] = useState<FileServerFile[] | null>(null)
  const [openShortcutDialog, setOpenShortcutDialog] = useState<FileServerFile | null>(null)

  const value = {
    drawerOpen,
    setDrawerOpen,
    socketConnectionState,
    setSocketConnectionState,
    fileArr,
    setFileArr,
    fileTree,
    setFileTree,
    selectedFile,
    setSelectedFile,
    contextMenu,
    setContextMenu,
    loggedOutWarning,
    setLoggedOutWarning,
    processInfo,
    setProcessInfo,
    processError,
    setProcessError,
    openDeleteConfirm,
    setOpenDeleteConfirm,
    openRenameDialog,
    setOpenRenameDialog,
    openNewFolderDialog,
    setOpenNewFolderDialog,
    openMoveFileDialog,
    setOpenMoveFileDialog,
    openShortcutDialog,
    setOpenShortcutDialog,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider')
  }
  return context
}
