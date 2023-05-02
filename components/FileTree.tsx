import path from "path"
import Link from "next/link"
import { useState } from "react"
import CircularProgress from "@mui/material/CircularProgress"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useAppContext } from "@/components/contexts/AppContext"
import { FileTreeProps } from "@/lib/types"

export default function FileTree() {
  const { fileTree } = useAppContext()
  return (
    <div className='flex flex-col h-full'>
      <h6 className='ml-3 text-lg'>File Tree</h6>
      <div 
        data-isdirpath
        data-path="/"
        className="relative flex flex-col p-2 h-full bg-black rounded-md overflow-auto overflow-x-hidden"
      >
        {fileTree ?
        <FileTreeComponent fileTree={fileTree} /> :
        fileTree == undefined ? 
        <CircularProgress
          size={35}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        /> :
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">
          Failed to load tree
        </span>}
      </div>
    </div>
  )
}

function FileTreeComponent({ fileTree, level = 0, onFileClick, prevDir = '/', expand1 }: FileTreeProps) {
  const [expand, setExpand] = useState<string[]>([])

  function handleClick(filePath: string) {
    if (expand.includes(filePath)) {
      setExpand(expand.filter(item => item !== filePath))
    } else {
      setExpand(expand.concat(filePath))
    }
  }

  if (typeof fileTree == 'string') {
    return (
      <span className="my-auto self-center">{fileTree}</span>
    )
  }

  return (
    <ul 
      style={{ display: (expand1?.includes(prevDir) || level == 0) ? 'block' : 'none' }}
      className="flex flex-col w-full"
    >
      {Object.keys(fileTree).sort((a, b) => a.localeCompare(b)).map((fileName) => {
        const subtree = fileTree[fileName]
        const subtreeHasFolders = !!Object.keys(subtree).length
        const filePath = path.join(prevDir, fileName)
        return (
          <li 
            style={{
              paddingLeft: level == 0 ? '0' : '6px'
            }} 
            key={fileName}
            className="ml-auto mr-0"
          >
            <div className="flex items-center">
              <span className={`rounded-sm transition-colors duration-75 ${subtreeHasFolders ? 'cursor-pointer hover:bg-slate-400' : ''}`}>
                <ExpandMoreIcon 
                  style={{
                    transform: expand.includes(filePath) ? 'initial' : 'rotate(-90deg)',
                    visibility: subtreeHasFolders ? 'visible' : 'hidden'
                  }}
                  onClick={() => handleClick(filePath)}
                  className="transition-transform"
                />
              </span>
              <Link 
                data-isdirpath
                data-path={filePath}
                href={`/files${filePath}`}
                title={fileName}
                onClick={() => handleClick(filePath)}
                className="h-full w-full p-1 line-clamp-1 cursor-pointer rounded-sm transition-colors duration-75 hover:bg-slate-400"
              >
                {fileName}
              </Link>
            </div>
            <FileTreeComponent 
              fileTree={subtree} 
              level={level + 1} 
              onFileClick={onFileClick} 
              prevDir={filePath} 
              expand1={expand}
            />
          </li>
        )
      })}
    </ul>
  )
}