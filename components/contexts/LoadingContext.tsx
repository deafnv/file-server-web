import { createContext, useContext, useState, Dispatch, SetStateAction } from 'react'

interface Loading {
	loading: boolean
	setLoading: (state: boolean, timeout?: number) => void
}

const loadingContext = createContext<Loading | null>(null)

let loadingTimer: NodeJS.Timeout

export function LoadingProvider({ children }: React.PropsWithChildren) {
	const [loading, setLoadingState] = useState(false)

	//* Staggered loading if loading takes less than 100ms
	const setLoading = (state: boolean, timeout = 100) => {
		if (state) {
			loadingTimer = setTimeout(() => {
				setLoadingState(true)
			}, timeout)
		} else {
			clearTimeout(loadingTimer)
			setLoadingState(false)
		}
	}
	
	const value = { loading, setLoading }
	return <loadingContext.Provider value={value}>{children}</loadingContext.Provider>
}

export function useLoading() {
	const context = useContext(loadingContext)
	if (!context) {
		throw new Error('useLoading must be used within LoadingProvider')
	}
	return context
}
