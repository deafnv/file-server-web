import { NavLinks } from '@/lib/types'
import throttle from 'lodash/throttle'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Loading from '@/components/contexts/LoadingComponent'
import { useLoading } from '@/components/contexts/LoadingContext'
import { getCookie, deleteCookie } from 'cookies-next'
import axios from 'axios'

export default function Navbar() {
	const router = useRouter()
	const { loading } = useLoading()
	const [navbar, setNavbar] = useState(true)
	const navLinks: NavLinks[] = [
		{
			name: 'Files',
			route: '/files'
		}
	]
	const [user, setUser] = useState('')

	useEffect(() => {
		const navbarAnimate = () => {
			if (window.scrollY == 0) {
				setNavbar(true)
			} else setNavbar(false)
		}

		window.addEventListener('scroll', throttle(navbarAnimate, 100))
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
				className="fixed top-0 z-50 min-h-[60px] max-h-[60px] min-w-full flex items-center justify-center gap-[20%] bg-black bg-opacity-60 border-b-[1px] backdrop-blur-md backdrop-filter"
				style={{
					borderImage: 'linear-gradient(to right, rgb(218, 51, 190), rgb(191, 94, 255))',
					borderImageSlice: 1,
					background: navbar ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)',
					transition: 'background-color 800ms'
				}}
			>
				<div className="flex items-center">
					<span className="absolute left-6 md:left-24 text-center text-lg sm:text-2xl font-semibold xs:visible invisible">
						File Server
					</span>
					<ul className='flex items-center'>
						{navLinks.map((link, index) => {
							if (link.dropdown)
								return (
									<li
										key={index}
										tabIndex={0}
										className="relative inline px-2 sm:px-4 py-4 mx-0 sm:mx-2 max-h-[60px] text-[0.75rem] sm:text-base rounded-lg hover:bg-pink-400 focus:bg-pink-400 transition-colors duration-150 cursor-default group"
									>
										<div
											style={{ left: link.posLeft }}
											className="absolute top-[3.4rem] translate-x-2 sm:translate-x-0 z-50 h-max sm:w-36 bg-black border-pink-400 border-[1px] rounded-md hidden group-hover:block group-focus-within:block"
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
																className="h-full w-full px-3 py-3 rounded-md text-center hover:bg-pink-400 focus:bg-pink-400 transition-colors duration-150"
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
											className="px-2 sm:px-4 py-4 text-[0.75rem] sm:text-base rounded-lg hover:bg-pink-400 focus:bg-pink-400 transition-colors duration-150"
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
						<span
							onClick={handleLogout}
							className='cursor-pointer link'
						>
							Logout
						</span>
					</span> :
					<Link
						href={'/login'}
						className="absolute right-6 md:right-24 text-center text-sm sm:text-base font-semibold cursor-pointer link"
					>
						Login
					</Link>
					}
				</div>
			</nav>
		</>
	)
}

{
	/* <li className="inline mx-2" key={index}>
			<Link
				href={link.route}
				style={{
					background:
						link.route == router.pathname ? 'rgb(244 114 182)' : ''
				}}
				className="p-4 rounded-lg hover:bg-pink-400 focus:bg-pink-400 transition-colors duration-150"
			>
				{link.name}
			</Link>
		</li> */
}
