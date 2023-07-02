import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import axios from 'axios'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Loading from '@/components/contexts/LoadingComponent'
import { useLoading } from '@/components/contexts/LoadingContext'
import { useAppContext } from '@/components/contexts/AppContext'
import SearchBar from './SearchBar'

export default function Navbar() {
  const [width, setWidth] = useState<number>(0)
  const [user, setUser] = useState('')
  const [searchEnabled, setSearchEnabled] = useState(false)

  const searchBarRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const { loading } = useLoading()

  const { setDrawerOpen, socketConnectionState } = useAppContext()

  useEffect(() => {
    setWidth(window.innerWidth)
    const handleWindowResize = () => setWidth(window.innerWidth)

    window.addEventListener('resize', handleWindowResize)

    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  useEffect(() => {
    let { q } = router.query
    if (q instanceof Array) q = q[0]
    if (searchBarRef.current) searchBarRef.current.value = q ?? ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, searchBarRef.current])

  useEffect(() => {
    const cookie = getCookie('userdata')
    if (typeof cookie == 'string') {
      setUser(JSON.parse(cookie).user)
    }
  }, [router.asPath])

  useEffect(() => {
    const getIsSearchEnabled = async () => {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/issearch`)
      setSearchEnabled(data)
    }

    if (router.isReady) {
      getIsSearchEnabled()
    }
  }, [router.isReady])

  async function handleLogout() {
    await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/logout`, {
      withCredentials: true,
    })
    deleteCookie('userdata')
    router.reload()
  }

  return (
    <>
      {loading && <Loading />}
      <nav
        className='fixed top-0 z-50 min-h-[60px] max-h-[60px] min-w-full flex items-center justify-center gap-[20%] bg-black border-b'
        style={{
          borderImage: 'linear-gradient(to right, rgb(64, 169, 255), rgb(130, 5, 255))',
          borderImageSlice: 1,
          transition: 'background-color 800ms',
        }}
      >
        {width < 768 ? (
          <div className='flex items-center'>
            <div className='absolute flex items-center gap-3 left-4 md:left-24'>
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Link href={'/files'} className='text-center text-lg sm:text-2xl font-semibold'>
                File Server
              </Link>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-between px-6 lg:px-24 h-[60px] w-full'>
            <div className='flex items-end gap-3'>
              <Link href={'/files'} className='text-center text-lg sm:text-2xl font-semibold'>
                File Server
              </Link>
              <span
                className={`hidden md:flex items-center text-sm ${
                  socketConnectionState ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {socketConnectionState ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {searchEnabled && <SearchBar ref={searchBarRef} />}
            {user ? (
              <span className='flex gap-2 text-center text-sm sm:text-base font-semibold'>
                {user}
                <button tabIndex={0} onClick={handleLogout} className='cursor-pointer link'>
                  Logout
                </button>
              </span>
            ) : (
              <Link
                href={'/login'}
                tabIndex={0}
                className='text-center text-sm sm:text-base font-semibold cursor-pointer link'
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
