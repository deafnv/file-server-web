import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { deleteCookie, getCookie } from 'cookies-next'
import { useAppContext } from '@/components/contexts/AppContext'
import FileTree from '@/components/left/FileTree'

export default function Drawer() {
  const drawerRef = useRef<HTMLDivElement>(null)
  const drawerBlurRef = useRef<HTMLDivElement>(null)
  const drawerParentRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState('')

  const router = useRouter()

  const { drawerOpen, setDrawerOpen, socketConnectionState } = useAppContext()

  useEffect(() => {
    if (drawerParentRef.current && drawerBlurRef.current) {
      if (drawerOpen) {
        drawerParentRef.current!.style.display = 'block'
        setTimeout(() => {
          drawerParentRef.current!.style.left = '0'
          drawerBlurRef.current!.style.opacity = '1'
        }, 10)
      } else {
        drawerParentRef.current.style.left = `-${
          drawerRef.current?.offsetWidth
            ? drawerRef.current.offsetWidth
            : (window.innerWidth * 3) / 4
        }px`
        drawerBlurRef.current!.style.opacity = '0'
        setTimeout(() => {
          if (!drawerOpen) drawerParentRef.current!.style.display = 'none'
        }, 200)
      }
    }
  }, [drawerOpen])

  useEffect(() => {
    const cookie = getCookie('userdata')
    if (typeof cookie == 'string') {
      setUser(JSON.parse(cookie).user)
    }
  }, [router.asPath])

  useEffect(() => {
    const routeHandler = () => setDrawerOpen(false)
    router.events.on('routeChangeStart', routeHandler)

    return () => router.events.off('routeChangeStart', routeHandler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/logout`, {
      withCredentials: true,
    })
    deleteCookie('userdata')
    router.reload()
  }

  return (
    <div
      ref={drawerParentRef}
      className='hidden fixed top-0 left-0 z-[60] h-full w-full transition-all pointer-events-none'
    >
      <div
        ref={drawerBlurRef}
        onClick={() => setDrawerOpen(false)}
        style={{
          pointerEvents: drawerOpen ? 'all' : 'none',
        }}
        className='fixed top-0 left-0 z-[60] h-full w-full glass transition-opacity'
      />
      <div
        ref={drawerRef}
        className='fixed flex flex-col top-0 h-full w-3/4 z-[61] bg-background pointer-events-auto'
      >
        <div className='flex flex-col gap-4 p-5'>
          <div className='flex flex-col gap-1'>
            <span className='text-2xl font-semibold'>File Server</span>
            <span
              className={`flex items-center text-sm ${
                socketConnectionState ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {socketConnectionState ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {user ? (
            <span className='flex flex-col text-sm sm:text-base font-semibold'>
              {user}
              <span onClick={handleLogout} className='cursor-pointer link'>
                Logout
              </span>
            </span>
          ) : (
            <Link
              href={'/login'}
              className='text-sm sm:text-base font-semibold cursor-pointer link'
            >
              Login
            </Link>
          )}
          <hr />
        </div>
        <div className='p-2 overflow-auto'>
          <FileTree />
        </div>
      </div>
    </div>
  )
}
