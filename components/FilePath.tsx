import Link from 'next/link'
import { useRouter } from 'next/router'
import { MutableRefObject, useState } from 'react'
import { getCookie } from 'cookies-next'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useAppContext } from '@/components/contexts/AppContext'

export default function FilePath({ paramsRef }: { paramsRef: MutableRefObject<string[]>; }) {
  const [folderDetailsAnchor, setFolderDetailsAnchor] = useState<HTMLElement | null>(null)
  const [fileHistoryMoreAnchor, setFileHistoryMoreAnchor] = useState<HTMLElement | null>(null)

  const router = useRouter()

  const { setLoggedOutWarning, setOpenNewFolderDialog } = useAppContext()
  
  const concatIndex = paramsRef.current?.length - 3
  const minimizedSlice = paramsRef.current?.slice(0, concatIndex)

  return (
    <span className='flex items-center text-xl'>
      {paramsRef.current ?
      <Link 
        data-isdirpath
        data-path='/'
        href={''}
        className='p-2 rounded-md transition-colors duration-75 hover:bg-gray-500'
      >
        Files
      </Link> :
      <div 
        onClick={(e) => setFolderDetailsAnchor(e.currentTarget)}
        className='flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-500 '
      >
        <span className='line-clamp-1 break-all'>Files</span>
        <ArrowDropDownIcon />
      </div>}
      {paramsRef.current?.map((param, index) => {
        if (concatIndex > 0 && index < concatIndex) {
          if (index == 0) {
            return (
              <>
                /
                <div 
                  key={index}
                  onClick={(e) => setFileHistoryMoreAnchor(e.currentTarget)}
                  className='flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-gray-500'
                >
                  <MoreHorizIcon />
                </div>
              </>
            )
          }
          return null
        } else if (index == paramsRef.current.length - 1) {
          return (
            <>
              /
              <div 
                key={index}
                title={param}
                onClick={(e) => setFolderDetailsAnchor(e.currentTarget)}
                className='flex items-center px-2 rounded-md cursor-pointer hover:bg-gray-500'
              >
                <span className='line-clamp-1 my-2 break-all'>{param}</span>
                <ArrowDropDownIcon />
              </div>
            </>
          )
        } else {
          return (
            <>
              /
              <Link 
                data-isdirpath
                data-path={`/${paramsRef.current?.slice(0, index + 1).join('/')}`}
                key={index}
                title={param}
                href={paramsRef.current?.slice(0, index + 1).join('/')}
                className='px-2 py-1 rounded-md hover:bg-gray-500 line-clamp-1 break-words'
              >
                {param}
              </Link>
            </>
          )
        }
      })}
      <FolderDetails />
      <FilePathMore />
    </span>
  )

  function FilePathMore() {
    return (
      <Menu
        anchorEl={fileHistoryMoreAnchor}
        open={!!fileHistoryMoreAnchor}
        onClose={() => setFileHistoryMoreAnchor(null)}
      >
        {minimizedSlice?.map((param, index) => {
          return (
            <MenuItem
              key={index}
              onClick={() => {}}
            >
              {param}
            </MenuItem>
          )
        })}
      </Menu>
    )
  }

  function FolderDetails() {
    return (
      <Menu 
        anchorEl={folderDetailsAnchor}
        open={!!folderDetailsAnchor}
        onClose={() => setFolderDetailsAnchor(null)}
      >
        <MenuItem 
          onClick={() => {
            if (!getCookie('userdata')) return setLoggedOutWarning(true)
            setOpenNewFolderDialog((router.query.path as string[])?.join('/') ?? '/')
            setFolderDetailsAnchor(null)
          }}
        >
          New folder
        </MenuItem>
      </Menu>
    )
  }
}