import path from 'path'
import { NextRouter } from 'next/router'
import { Dispatch, SetStateAction, MutableRefObject, useState, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import FolderIcon from '@mui/icons-material/Folder'
import FolderZipIcon from '@mui/icons-material/FolderZip'
import MovieIcon from '@mui/icons-material/Movie'
import ImageIcon from '@mui/icons-material/Image'
import CodeIcon from '@mui/icons-material/Code'
import DataObjectIcon from '@mui/icons-material/DataObject'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AudioFileIcon from '@mui/icons-material/AudioFile'
import ArticleIcon from '@mui/icons-material/Article'
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption'
import TerminalIcon from '@mui/icons-material/Terminal'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { FileServerFile, FileTreeRes, SortDirection, SortField, SortMethod } from '@/lib/types'

export function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = useState(fallbackValue)
  useEffect(() => {
    const stored = localStorage.getItem(key)
    setValue(stored ? JSON.parse(stored) : fallbackValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

export function getIcon(file: FileServerFile) {
  if (file.isDirectory)
    return (
      <FolderIcon
        style={{
          color: file.metadata?.color ?? '',
        }}
      />
    )
  const splitName = file.name.split('.')
  const extension = splitName[splitName.length - 1].toLowerCase()
  if (splitName.length == 1) return null
  if (['zip', '7z', 'rar'].includes(extension)) return <FolderZipIcon />
  if (['doc', 'docx', 'txt', 'pdf'].includes(extension)) return <ArticleIcon />
  if (['mkv', 'mp4', 'webm', 'ogg'].includes(extension)) return <MovieIcon />
  if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) return <ImageIcon />
  if (['wav', 'mp3', 'aac', 'flac', 'm4a'].includes(extension)) return <AudioFileIcon />
  if (['json', 'jsonl'].includes(extension)) return <DataObjectIcon />
  if (['js', 'jsx', 'css', 'ts', 'tsx'].includes(extension)) return <CodeIcon />
  if (['xlsx', 'xls', 'csv'].includes(extension)) return <ListAltIcon />
  if (['ass', 'srt', 'vtt'].includes(extension)) return <ClosedCaptionIcon />
  if (['exe'].includes(extension)) return <TerminalIcon />
  return <InsertDriveFileIcon />
}

export const getData = async (
  setFileArr: Dispatch<SetStateAction<string | FileServerFile[] | null>>,
  sortMethodRef: MutableRefObject<SortMethod>,
  router: NextRouter,
  paramsRef: MutableRefObject<string[]>,
  loadingTimerRef?: MutableRefObject<NodeJS.Timeout | undefined>
) => {
  try {
    const { path } = router.query
    paramsRef.current = path as string[]
    const fileArrData = await axios.get(
      `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/list/${(path as string[])?.join('/') ?? ''}`,
      { withCredentials: true }
    )
    //* Preserve sort state on updates/directory change
    const sortMethod = sortMethodRef.current.split('_')[0] as SortField
    const sortDirection = sortMethodRef.current.split('_')[1] as SortDirection
    sortMethodRef.current = `${sortMethod}_${sortDirection == 'asc' ? 'desc' : 'asc'}`
    sortFileArr(sortMethod, fileArrData.data, setFileArr, sortMethodRef)
  } catch (error) {
    if ((error as any as AxiosError).response?.status == 401) {
      setFileArr('401 Unauthorized. Login to access.')
    } else if ((error as any as AxiosError).response?.status == 403) {
      setFileArr(`403 Forbidden.`)
    } else if ((error as any as AxiosError).response?.status == 404) {
      setFileArr('404 Not Found. Directory does not exist.')
    } else {
      alert(`Error. The server is probably down. ${error}`)
      setFileArr('Error loading data from server')
    }
  }
  if (loadingTimerRef) clearTimeout(loadingTimerRef.current)
}

export const sortFileArr = (
  sortMethod: SortField,
  fileArr: string | FileServerFile[] | null,
  setFileArr: Dispatch<SetStateAction<string | FileServerFile[] | null>>,
  sortMethodRef: MutableRefObject<SortMethod>
) => {
  if (!(fileArr instanceof Array)) return
  setFileArr(
    fileArr.slice().sort((a, b) => {
      const direction = sortMethodRef.current != `${sortMethod}_asc`
      let sortItems: number
      switch (sortMethod) {
        case 'type':
          sortItems = direction
            ? path.extname(a.name).slice(1).localeCompare(path.extname(b.name).slice(1))
            : path.extname(b.name).slice(1).localeCompare(path.extname(a.name).slice(1))
          break
        case 'name':
          sortItems = direction ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
          break
        case 'created':
          sortItems = direction
            ? new Date(a.created).getTime() - new Date(b.created).getTime()
            : new Date(b.created).getTime() - new Date(a.created).getTime()
          break
        case 'size':
          sortItems = direction ? a.size - b.size : b.size - a.size
          break
      }
      //* Sort shortcut directories
      if (a.isShortcut && a.isDirectory && !b.isShortcut && b.isDirectory) return -1
      if (!a.isShortcut && a.isDirectory && b.isShortcut && b.isDirectory) return 1

      //* Sort directories
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1

      //* Sort shortcut files
      if (a.isShortcut && !a.isDirectory && !b.isShortcut && !b.isDirectory) return -1
      if (!a.isShortcut && !a.isDirectory && b.isShortcut && !b.isDirectory) return 1
      return sortItems
    })
  )
  sortMethodRef.current =
    sortMethodRef.current == `${sortMethod}_asc` ? `${sortMethod}_desc` : `${sortMethod}_asc`
}

export const getFileTree = async (
  setFileTree: Dispatch<SetStateAction<FileTreeRes | string | null | undefined>>
) => {
  try {
    const fileTreeResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/filetree`,
      { withCredentials: true }
    )
    setFileTree(fileTreeResponse.data)
  } catch (error) {
    if ((error as any as AxiosError).response?.status == 401) {
      setFileTree('401 Unauthorized. Login to access.')
    } else if ((error as any as AxiosError).response?.status == 403) {
      setFileTree(`403 Forbidden.`)
    } else {
      alert(`Error. The server is probably down. ${error}`)
      setFileTree('Error loading data from server')
    }
  }
}

export const sleep = (s = 1) => new Promise((r) => setTimeout(r, s * 1000))
