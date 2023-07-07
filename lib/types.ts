import { CookieValueTypes } from 'cookies-next'
import { RefObject, MutableRefObject, Dispatch, SetStateAction } from 'react'
import { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone'

export interface FileServerFile {
  name: string
  path: string
  size: number
  created: string
  modified: string
  isDirectory: boolean
  isShortcut?: {
    shortcutName: string
    shortcutPath: string
  }
  metadata?: FileMetadata
}

interface FileMetadata {
  color: string
}

export type SortField = 'type' | 'name' | 'size' | 'created'
export type SortDirection = 'asc' | 'desc'

export type SortMethod = `${SortField}_${SortDirection}` | ''

export interface UploadProgress {
  name: string
  progress: number
}

export interface StorageSpaceRes {
  free: number
  size: number
}

export interface FileTreeRes {
  [key: string]: FileTreeRes
}

export interface Point {
  x: number
  y: number
}

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

export interface FileListProps {
  isSearching?: boolean
  fileListRef: RefObject<HTMLDivElement>
  fileRefs: MutableRefObject<Array<{ file: FileServerFile; ref: HTMLDivElement }>>
  sortMethodRef: MutableRefObject<SortMethod>
  getRootProps?: <T extends DropzoneRootProps>(props?: T | undefined) => T
  getInputProps?: <T extends DropzoneInputProps>(props?: T | undefined) => T
}

export interface ContextMenuTemplateProps {
  customClass: string
  userDataRef: MutableRefObject<CookieValueTypes>
}

export interface UploadQueueItem {
  file: File
  uploadTo: string
}

export interface UploadsListProps {
  setFilesToUpload: (val: UploadQueueItem[]) => void
  currentUploadProgress: UploadProgress | null
  uploadQueue: UploadQueueItem[]
  handleOpenFileDialog: () => void
  uploadController: MutableRefObject<AbortController | undefined>
}

export interface FileTreeProps {
  fileTree: FileTreeRes | string
  level?: number
  prevDir?: string
  onFileClick?: (filePath: string) => void
  expandedDirs: string[]
  setExpandedDirs: Dispatch<SetStateAction<string[]>>
}

export interface DragSelectionAreaProps {
  fileListRef: RefObject<HTMLDivElement>
  allowDragSelect: MutableRefObject<boolean>
  fileArr: string | FileServerFile[] | null
}

export interface UserData {
  username: string
  rank: number
  permissions: {
    makedir: boolean
    upload: boolean
    rename: boolean
    copy: boolean
    move: boolean
    delete: boolean
  }
  created_at: string
}
