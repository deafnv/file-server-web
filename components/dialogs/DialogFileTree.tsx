import { FileTreeProps, FileTreeRes } from '@/lib/types'
import CircularProgress from '@mui/material/CircularProgress'
import { useState, useRef, Dispatch, SetStateAction } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import path from 'path'

export default function MoveFileTree({
  fileTree,
  selectFolder,
  setSelectFolder,
}: {
  fileTree: FileTreeRes | null | undefined
  selectFolder: string
  setSelectFolder: Dispatch<SetStateAction<string>>
}) {
  const moveFileTreeParentRef = useRef<HTMLDivElement>(null)

  const [expandedDirs, setExpandedDirs] = useState<string[]>([])

  return (
    <div className='flex flex-col pb-6 h-[40rem]'>
      <div
        ref={moveFileTreeParentRef}
        onClick={(e) => {
          if (e.target == moveFileTreeParentRef.current) setSelectFolder('/')
        }}
        className={`relative flex flex-col p-2 h-full bg-black border-2 ${
          selectFolder == '/' ? 'border-primary' : 'border-black'
        } rounded-md overflow-auto overflow-x-hidden`}
      >
        {fileTree ? (
          <FileTreeComponent
            fileTree={fileTree}
            selectFolder={selectFolder}
            setSelectFolder={setSelectFolder}
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
  selectFolder,
  setSelectFolder,
  expandedDirs,
  setExpandedDirs,
}: FileTreeProps & { selectFolder: string; setSelectFolder: Dispatch<SetStateAction<string>> }) {
  function handleClick(filePath: string) {
    if (expandedDirs.includes(filePath)) {
      setExpandedDirs((val) => val.filter((item) => item !== filePath))
    } else {
      setExpandedDirs((val) => val.concat([filePath]))
    }
    setSelectFolder(filePath)
  }

  if (typeof fileTree == 'string') return null

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
                <span
                  title={fileName}
                  onClick={() => handleClick(filePath)}
                  className={`h-full w-full p-1 line-clamp-1 cursor-pointer rounded-sm ${
                    filePath == selectFolder ? 'bg-primary' : 'hover:bg-secondary/70'
                  }`}
                >
                  {fileName}
                </span>
              </div>
              <FileTreeComponent
                fileTree={subtree}
                level={level + 1}
                onFileClick={onFileClick}
                prevDir={filePath}
                selectFolder={selectFolder}
                setSelectFolder={setSelectFolder}
                expandedDirs={expandedDirs}
                setExpandedDirs={setExpandedDirs}
              />
            </li>
          )
        })}
    </ul>
  )
}
