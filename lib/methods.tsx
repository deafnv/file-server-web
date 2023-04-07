import FolderIcon from '@mui/icons-material/Folder'
import MovieIcon from '@mui/icons-material/Movie'
import ImageIcon from '@mui/icons-material/Image'
import CodeIcon from '@mui/icons-material/Code'
import DataObjectIcon from '@mui/icons-material/DataObject'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AudioFileIcon from '@mui/icons-material/AudioFile'
import ArticleIcon from '@mui/icons-material/Article'
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption'
import { FileServerFile } from './types'

export function getIcon(file: FileServerFile) {
  if (file.isDirectory) return (<FolderIcon />)
  const splitName = file.name.split('.')
  const extension = splitName[splitName.length - 1]
  if (splitName.length == 1) return null
  if (['doc', 'docx', 'txt', 'pdf'].includes(extension)) return <ArticleIcon />
  if (['mkv', 'mp4', 'webm', 'ogg'].includes(extension)) return <MovieIcon />
  if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) return <ImageIcon />
  if (['wav', 'mp3', 'aac', 'flac', 'm4a'].includes(extension)) return <AudioFileIcon />
  if (['json', 'jsonl'].includes(extension)) return <DataObjectIcon />
  if (['js', 'jsx', 'css', 'ts', 'tsx'].includes(extension)) return <CodeIcon />
  if (['xlsx', 'xls', 'csv'].includes(extension)) return <ListAltIcon />
  if (['ass', 'srt', 'vtt'].includes(extension)) return <ClosedCaptionIcon />
  return null
}

export const sleep = (s = 1) => new Promise((r) => setTimeout(r, s * 1000))