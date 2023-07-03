import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useState,
  Fragment,
  useRef,
  useEffect,
} from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { getCookie } from 'cookies-next'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useAppContext } from '@/components/contexts/AppContext'

interface DetailsPos {
  top: number
  left: number
}

export default function FilePath({ paramsRef }: { paramsRef: MutableRefObject<string[]> }) {
  const folderDetailsButtonRef = useRef<HTMLButtonElement>(null)
  const folderDetailsMenuRef = useRef<HTMLMenuElement>(null)
  const ancestorMoreButtonRef = useRef<HTMLButtonElement>(null)
  const ancestorMoreMenuRef = useRef<HTMLMenuElement>(null)

  const [folderDetailsPos, setFolderDetailsPos] = useState<DetailsPos | null>(null)
  const [ancestorMoreMenuPos, setAncestorMoreMenuPos] = useState<DetailsPos | null>(null)

  useEffect(() => {
    const userExitMenus = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        !folderDetailsButtonRef.current?.contains(target) &&
        !folderDetailsMenuRef.current?.contains(target)
      ) {
        setFolderDetailsPos(null)
      }

      if (
        !ancestorMoreButtonRef.current?.contains(target) &&
        !ancestorMoreMenuRef.current?.contains(target)
      ) {
        setAncestorMoreMenuPos(null)
      }
    }

    document.addEventListener('mousedown', userExitMenus)

    return () => {
      document.removeEventListener('mousedown', userExitMenus)
    }
  }, [])

  const concatIndex = paramsRef.current?.length - 3

  return (
    <span className='flex items-center mt-0 md:mt-2 px-3 md:px-0 text-xl'>
      {paramsRef.current ? (
        <Link
          data-isdirpath
          data-path='/'
          href={''}
          tabIndex={0}
          className='p-2 rounded-md transition-colors duration-75 hover:bg-secondary'
        >
          Files
        </Link>
      ) : (
        <button
          tabIndex={0}
          onClick={(e) => {}}
          className='flex items-center p-2 rounded-md cursor-pointer hover:bg-secondary'
        >
          <span className='line-clamp-1 break-all'>Files</span>
          <ArrowDropDownIcon />
        </button>
      )}
      {paramsRef.current?.map((param, index) => {
        if (concatIndex > 0 && index < concatIndex) {
          if (index == 0) {
            return (
              <Fragment key={param}>
                /
                <button
                  ref={ancestorMoreButtonRef}
                  tabIndex={0}
                  onClick={() => {
                    if (ancestorMoreButtonRef.current)
                      setAncestorMoreMenuPos({
                        top:
                          ancestorMoreButtonRef.current.getBoundingClientRect().top +
                          ancestorMoreButtonRef.current.clientHeight,
                        left: ancestorMoreButtonRef.current.getBoundingClientRect().left,
                      })
                  }}
                  className='flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-secondary'
                >
                  <MoreHorizIcon />
                </button>
              </Fragment>
            )
          }
          return null
        } else if (index == paramsRef.current.length - 1) {
          return (
            <Fragment key={param}>
              /
              <button
                ref={folderDetailsButtonRef}
                tabIndex={0}
                onClick={() => {
                  if (folderDetailsButtonRef.current)
                    setFolderDetailsPos({
                      top:
                        folderDetailsButtonRef.current.getBoundingClientRect().top +
                        folderDetailsButtonRef.current.clientHeight,
                      left: folderDetailsButtonRef.current.getBoundingClientRect().left,
                    })
                }}
                className='flex items-center px-2 rounded-md cursor-pointer hover:bg-secondary'
              >
                <span className='line-clamp-1 my-2 break-all'>{param}</span>
                <ArrowDropDownIcon />
              </button>
            </Fragment>
          )
        } else {
          return (
            <Fragment key={param}>
              /
              <Link
                data-isdirpath
                data-path={`/${paramsRef.current?.slice(0, index + 1).join('/')}`}
                title={param}
                tabIndex={0}
                href={paramsRef.current?.slice(0, index + 1).join('/')}
                className='px-2 py-1 rounded-md hover:bg-secondary line-clamp-1 break-words'
              >
                {param}
              </Link>
            </Fragment>
          )
        }
      })}
      <FileAncestorMenu
        ancestorMoreMenuRef={ancestorMoreMenuRef}
        paramsRef={paramsRef}
        ancestorMoreMenuPos={ancestorMoreMenuPos}
        setAncestorMoreMenuPos={setAncestorMoreMenuPos}
      />
      <FolderDetails
        folderDetailsMenuRef={folderDetailsMenuRef}
        folderDetailsPos={folderDetailsPos}
        setFolderDetailsPos={setFolderDetailsPos}
      />
    </span>
  )
}

function FileAncestorMenu({
  ancestorMoreMenuRef,
  paramsRef,
  ancestorMoreMenuPos,
  setAncestorMoreMenuPos,
}: {
  ancestorMoreMenuRef: RefObject<HTMLMenuElement>
  paramsRef: MutableRefObject<string[]>
  ancestorMoreMenuPos: DetailsPos | null
  setAncestorMoreMenuPos: Dispatch<SetStateAction<DetailsPos | null>>
}) {
  const concatIndex = paramsRef.current?.length - 3
  const minimizedSlice = paramsRef.current?.slice(0, concatIndex)

  return (
    <AnimatePresence>
      {ancestorMoreMenuPos && (
        <m.menu
          ref={ancestorMoreMenuRef}
          exit={{ opacity: 0, height: 0 }}
          transition={{ ease: 'easeInOut', duration: 0.15 }}
          style={{
            top: ancestorMoreMenuPos.top,
            left: ancestorMoreMenuPos.left,
          }}
          className='animate-menu-14 absolute text-left min-w-[12rem] w-[13rem] z-20 py-3 shadow-lg shadow-gray-900 bg-foreground text-lg text-gray-200 rounded-[0.25rem] border-black border overflow-hidden select-none'
        >
          {minimizedSlice.map((param, index) => (
            <li
              key={param}
              className='flex items-center justify-center h-8 rounded-sm hover:bg-zinc-500'
            >
              <Link
                href={`/files/${minimizedSlice.slice(0, index + 1).join('/')}`}
                onClick={() => setAncestorMoreMenuPos(null)}
                className='h-full w-full leading-8 text-left pl-6'
              >
                {param}
              </Link>
            </li>
          ))}
        </m.menu>
      )}
    </AnimatePresence>
  )
}

function FolderDetails({
  folderDetailsMenuRef,
  folderDetailsPos,
  setFolderDetailsPos,
}: {
  folderDetailsMenuRef: RefObject<HTMLMenuElement>
  folderDetailsPos: DetailsPos | null
  setFolderDetailsPos: Dispatch<SetStateAction<DetailsPos | null>>
}) {
  const router = useRouter()

  const { setLoggedOutWarning, setOpenNewFolderDialog } = useAppContext()

  return (
    <AnimatePresence>
      {folderDetailsPos && (
        <m.menu
          ref={folderDetailsMenuRef}
          exit={{ opacity: 0, height: 0 }}
          transition={{ ease: 'easeInOut', duration: 0.15 }}
          style={{
            top: folderDetailsPos.top,
            left: folderDetailsPos.left,
          }}
          className='animate-menu-14 absolute text-left min-w-[12rem] w-[13rem] z-20 py-3 shadow-lg shadow-gray-900 bg-foreground text-lg text-gray-200 rounded-[0.25rem] border-black border overflow-hidden select-none'
        >
          <li className='flex items-center justify-center h-8 rounded-sm hover:bg-zinc-500'>
            <button
              onClick={() => {
                if (!getCookie('userdata')) return setLoggedOutWarning(true)
                setOpenNewFolderDialog((router.query.path as string[])?.join('/') ?? '/')
                setFolderDetailsPos(null)
              }}
              className='w-full text-left pl-6'
            >
              New folder
            </button>
          </li>
        </m.menu>
      )}
    </AnimatePresence>
  )
}
