import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import axios from 'axios'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { NavLinks } from '@/lib/types'
import Loading from '@/components/contexts/LoadingComponent'
import { useLoading } from '@/components/contexts/LoadingContext'
import { useAppContext } from '@/components/contexts/AppContext'

export default function Navbar() {
	const [width, setWidth] = useState<number>(0)
	const [user, setUser] = useState('')

	const router = useRouter()

	const { loading } = useLoading()

	const navLinks: NavLinks[] = [
		{
			name: 'Files',
			route: '/files'
		}
	]

	const { setDrawerOpen, socketConnectionState } = useAppContext()

	useEffect(() => {
		setWidth(window.innerWidth)
		const handleWindowResize = () => setWidth(window.innerWidth)

		window.addEventListener('resize', handleWindowResize)

		return () => window.removeEventListener('resize', handleWindowResize)
	}, [])

	useEffect(() => {
		const cookie = getCookie('userdata')
		if (typeof cookie == 'string') {
			setUser(JSON.parse(cookie).user)
		}
	}, [router.asPath])

	async function handleLogout() {
		await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/logout`, {
			withCredentials: true
		})
		deleteCookie('userdata')
		router.reload()
	}

	return (
		<>
			{loading && <Loading />}
			<nav
				className="fixed top-0 z-50 min-h-[60px] max-h-[60px] min-w-full flex items-center justify-center gap-[20%] bg-black border-b"
				style={{
					borderImage: 'linear-gradient(to right, rgb(64, 169, 255), rgb(130, 5, 255))',
					borderImageSlice: 1,
					transition: 'background-color 800ms'
				}}
			>
				{width < 768 ?
				<div className="flex items-center">
					<div className='absolute flex items-center gap-3 left-4 md:left-24'>
						<IconButton onClick={() => setDrawerOpen(true)}>
							<MenuIcon />
						</IconButton>
						<Link 
							href={'/files'}
							className="text-center text-lg sm:text-2xl font-semibold"
						>
							File Server
						</Link>
					</div>
				</div> :
				<div className="flex items-center">
					<div className='absolute flex items-end gap-3 left-6 md:left-24'>
						<span className="text-center text-lg sm:text-2xl font-semibold">
							File Server
						</span>
						<span className={`hidden md:flex items-center text-sm ${socketConnectionState ? 'text-green-400' : 'text-red-400'}`}>
							{socketConnectionState ? 'Connected' : 'Disconnected'}
						</span>
					</div>
					<ul className='flex items-center'>
						{navLinks.map((link, index) => {
							if (link.dropdown)
								return (
									<li
										key={index}
										tabIndex={0}
										className="relative inline px-2 sm:px-4 py-4 mx-0 sm:mx-2 max-h-[60px] text-[0.75rem] sm:text-base rounded-lg hover:bg-primary focus:bg-primary transition-colors cursor-default group"
									>
										<div
											style={{ left: link.posLeft }}
											className="absolute top-[3.4rem] translate-x-2 sm:translate-x-0 z-50 h-max sm:w-36 bg-black border-primary border rounded-md hidden group-hover:block group-focus-within:block"
										>
											<ul className="flex flex-col gap-1 py-1">
												{link.dropdown.map((item, index) => {
													return (
														<li key={index} className="flex py-0">
															<Link
																href={item.route}
																style={{
																	pointerEvents: item.route == router.pathname ? 'none' : 'auto'
																}}
																className="h-full w-full px-3 py-3 rounded-md text-center hover:bg-primary focus:bg-primary transition-colors duration-150"
															>
																{item.name}
															</Link>
														</li>
													)
												})}
											</ul>
										</div>
										{link.name}
									</li>
								)
							else
								return (
									<li key={index} className="inline mx-2">
										<Link
											href={link.route}
											style={{
												pointerEvents: link.route == router.pathname ? 'none' : 'auto'
											}}
											className="px-2 sm:px-4 py-4 text-[0.75rem] sm:text-base rounded-lg hover:bg-primary focus:bg-primary transition-colors duration-150"
										>
											{link.name}
										</Link>
									</li>
								)
						})}
					</ul>
					{user ? 
					<span className="flex gap-2 absolute right-6 md:right-24 text-center text-sm sm:text-base font-semibold">
						{user}
						<button
							tabIndex={0}
							onClick={handleLogout}
							className='cursor-pointer link'
						>
							Logout
						</button>
					</span> :
					<Link
						href={'/login'}
						tabIndex={0}
						className="absolute right-6 md:right-24 text-center text-sm sm:text-base font-semibold cursor-pointer link"
					>
						Login
					</Link>}
				</div>}
			</nav>
		</>
	)
}