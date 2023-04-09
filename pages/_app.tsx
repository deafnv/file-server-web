import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import HeadCommon from '@/components/HeadCommon'
import { LoadingProvider } from '@/components/contexts/LoadingContext'
import { AppContextProvider } from '@/components/contexts/AppContext'
import Navbar from '@/components/Navbar'

import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      light: '#e3f2fd',
      main: '#90caf9',
      dark: '#42a5f5',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#60a5fa',
      dark: '#90c1fc',
      contrastText: '#000',
    },
    mode: 'dark'
  },
  typography: {
    fontFamily: `-apple-system, BlinkMacSystemFont, Quicksand, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif`
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <LoadingProvider>
        <ThemeProvider theme={theme}>
          <AppContextProvider>
            <HeadCommon />
            <Navbar />
            <Component {...pageProps} />
          </AppContextProvider>
        </ThemeProvider>
      </LoadingProvider>
    </>
  )
}
