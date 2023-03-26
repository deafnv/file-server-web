import HeadCommon from '@/components/HeadCommon'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <HeadCommon />
      <Component {...pageProps} />
    </>
  )
}
