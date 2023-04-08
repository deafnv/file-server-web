import { FileTreeProps, FileTreeRes } from "@/lib/types"
import CircularProgress from "@mui/material/CircularProgress"
import { useState, useEffect, Dispatch, SetStateAction } from "react"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import path from "path"

export default function MoveFileTree({ fileTree, selectFolder, setSelectFolder }: 
{ 
  fileTree: FileTreeRes | null | undefined;
  selectFolder: string; 
  setSelectFolder: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className='flex flex-col pb-6 h-[40rem]'>
      <div className="relative flex flex-col p-2 h-full bg-black rounded-md overflow-auto overflow-x-hidden">
        {fileTree ?
        <FileTreeComponent 
          fileTree={fileTree} 
          selectFolder={selectFolder}
          setSelectFolder={setSelectFolder}
        /> :
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

function FileTreeComponent(
  { fileTree, level = 0, onFileClick, prevDir = '/', expand1, selectFolder, setSelectFolder }: 
  FileTreeProps & { selectFolder: string; setSelectFolder: Dispatch<SetStateAction<string>> }
) {
  const [expand, setExpand] = useState<string[]>([])

  function handleClick(filePath: string) {
    if (expand.includes(filePath)) {
      setExpand(expand.filter(item => item !== filePath))
    } else {
      setExpand(expand.concat(filePath))
    }
    setSelectFolder(filePath)
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
              //? This seems really weird, spacing aren't consistent
              width: `calc(100% - ${level * 6}px)`
            }} 
            key={fileName}
            className="ml-auto mr-0"
          >
            <div className="flex items-center">
              <span className={`rounded-sm transition-transform ${subtreeHasFolders ? 'cursor-pointer hover:bg-slate-400' : ''}`}>
                <ExpandMoreIcon 
                  style={{
                    transform: expand.includes(filePath) ? 'initial' : 'rotate(-90deg)',
                    visibility: subtreeHasFolders ? 'visible' : 'hidden'
                  }}
                  onClick={() => handleClick(filePath)}
                  className="transition-transform"
                />
              </span>
              <span
                title={fileName}
                onClick={() => handleClick(filePath)}
                
                className={`h-full w-full p-1 line-clamp-1 cursor-pointer rounded-sm hover:bg-slate-400 ${filePath == selectFolder ? 'bg-sky-600' : ''}`}
              >
                {fileName}
              </span>
            </div>
            <FileTreeComponent 
              fileTree={subtree} 
              level={level + 1} 
              onFileClick={onFileClick} 
              prevDir={filePath} 
              expand1={expand}
              selectFolder={selectFolder}
              setSelectFolder={setSelectFolder}
            />
          </li>
        )
      })}
    </ul>
  )
}