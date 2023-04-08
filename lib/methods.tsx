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
import { FileServerFile, FileTreeRes } from './types'
import { Dispatch, SetStateAction, MutableRefObject } from 'react'
import axios from 'axios'
import { NextRouter } from 'next/router'

export function getIcon(file: FileServerFile) {
  if (file.isDirectory) return (<FolderIcon />)
  const splitName = file.name.split('.')
  const extension = splitName[splitName.length - 1]
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
  router: NextRouter,
  paramsRef: MutableRefObject<string[]>
) => {
  try {
    const { path } = router.query
    paramsRef.current = path as string[]
    const fileArrData = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/list/${(path as string[])?.join('/') ?? ''}`)
    setFileArr(fileArrData.data.sort((a: FileServerFile, b: FileServerFile) => {
      if (a.isDirectory && b.isDirectory) return a.name.localeCompare(b.name)
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    }))
  } catch (error) {
    console.log(error)
    setFileArr('Error loading data from server')
  }
}

export const getFileTree = async (setFileTree: Dispatch<SetStateAction<FileTreeRes | null | undefined>>) => {
  try {
    const fileTreeResponse = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/filetree`)
    setFileTree(fileTreeResponse.data)
  } catch (error) {
    console.log(error)
    setFileTree(null)
  }
}

export const sleep = (s = 1) => new Promise((r) => setTimeout(r, s * 1000))