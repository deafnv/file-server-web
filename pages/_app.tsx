import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import HeadCommon from '@/components/HeadCommon'
import { LoadingProvider } from '@/components/LoadingContext'
import Navbar from '@/components/Navbar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <HeadCommon />
      <LoadingProvider>
				<Navbar />
				<Component {...pageProps} />
			</LoadingProvider>
    </>
  )
}
