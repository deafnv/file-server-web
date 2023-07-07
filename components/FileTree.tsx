import path from 'path'
import Link from 'next/link'
import { useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useAppContext } from '@/components/contexts/AppContext'
import { FileTreeProps } from '@/lib/types'

export default function FileTree() {
  const [expandedDirs, setExpandedDirs] = useState<string[]>([])

  const { fileTree } = useAppContext()

  return (
    <div className='flex flex-col h-full'>
      <h6 className='ml-3 text-lg'>File Tree</h6>
      <div
        data-isdirpath
        data-path='/'
        className='relative flex flex-col p-1 h-full bg-foreground rounded-md overflow-auto overflow-x-hidden'
      >
        {fileTree ? (
          <FileTreeComponent
            fileTree={fileTree}
            expandedDirs={expandedDirs}
            setExpandedDirs={setExpandedDirs}
          />
        ) : fileTree == undefined ? (
          <CircularProgress
            size={35}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        ) : (
          <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg'>
            Failed to load tree
          </span>
        )}
      </div>
    </div>
  )
}

function FileTreeComponent({
  fileTree,
  level = 0,
  onFileClick,
  prevDir = '/',
  expandedDirs,
  setExpandedDirs,
}: FileTreeProps) {
  function handleClick(filePath: string) {
    if (expandedDirs.includes(filePath)) {
      setExpandedDirs((val) => val.filter((item) => item !== filePath))
    } else {
      setExpandedDirs((val) => val.concat([filePath]))
    }
  }

  if (typeof fileTree == 'string') {
    return <span className='my-auto self-center'>{fileTree}</span>
  }

  return (
    <ul
      style={{ display: expandedDirs.includes(prevDir) || level === 0 ? 'block' : 'none' }}
      className='flex flex-col w-full'
    >
      {Object.keys(fileTree)
        .sort((a, b) => a.localeCompare(b))
        .map((fileName) => {
          const subtree = fileTree[fileName]
          const subtreeHasFolders = !!Object.keys(subtree).length
          const filePath = path.join(prevDir, fileName)
          return (
            <li
              style={{
                paddingLeft: level == 0 ? '0' : '6px',
              }}
              key={fileName}
              className='ml-auto mr-0'
            >
              <div className='flex items-center'>
                <span
                  className={`rounded-md ${
                    subtreeHasFolders ? 'cursor-pointer hover:bg-secondary/70' : ''
                  }`}
                >
                  <ExpandMoreIcon
                    style={{
                      transform: expandedDirs.includes(filePath) ? 'initial' : 'rotate(-90deg)',
                      visibility: subtreeHasFolders ? 'visible' : 'hidden',
                    }}
                    onClick={() => handleClick(filePath)}
                    className='transition-transform'
                  />
                </span>
                <Link
                  data-isdirpath
                  data-path={filePath}
                  href={`/files${filePath}`}
                  title={fileName}
                  onClick={() => handleClick(filePath)}
                  className='h-full w-full p-1 line-clamp-1 cursor-pointer rounded-md hover:bg-secondary/70'
                >
                  {fileName}
                </Link>
              </div>
              <FileTreeComponent
                fileTree={subtree}
                level={level + 1}
                onFileClick={onFileClick}
                prevDir={filePath}
                expandedDirs={expandedDirs}
                setExpandedDirs={setExpandedDirs}
              />
            </li>
          )
        })}
    </ul>
  )
}
