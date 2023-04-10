import { FileServerFile } from '@/lib/types';
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react'

interface AppContextType {
	selectedFile: FileServerFile[]
	setSelectedFile: Dispatch<SetStateAction<FileServerFile[]>>
	contextMenu:"file" | "directory" | null
	setContextMenu: Dispatch<SetStateAction<"file" | "directory" | null>>
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
}

const AppContext = createContext<AppContextType | null>(null)

export function AppContextProvider({ children }: React.PropsWithChildren) {
	const [selectedFile, setSelectedFile] = useState<FileServerFile[]>([])
  const [contextMenu, setContextMenu] = useState<'file' | 'directory' | null>(null)
	const [loggedOutWarning, setLoggedOutWarning] = useState(false)
  const [processInfo, setProcessInfo] = useState('')
  const [processError, setProcessError] = useState('')
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<FileServerFile[] | null>(null)
  const [openRenameDialog, setOpenRenameDialog] = useState<FileServerFile | null>(null)
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState<string | null>(null)
  const [openMoveFileDialog, setOpenMoveFileDialog] = useState<FileServerFile[] | null>(null)

	const value = {
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
		setOpenMoveFileDialog
	}

	return <AppContext.Provider value={value}>
    {children}
  </AppContext.Provider>
}

export function useAppContext() {
	const context = useContext(AppContext)
	if (!context) {
		throw new Error('useAppContext must be used within AppContextProvider')
	}
	return context
}