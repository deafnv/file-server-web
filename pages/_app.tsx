import type { AppProps } from 'next/app'
import { Quicksand } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { LazyMotion, domAnimation } from 'framer-motion'
import '@/styles/globals.css'
import HeadCommon from '@/components/HeadCommon'
import { LoadingProvider } from '@/components/contexts/LoadingContext'
import { AppContextProvider } from '@/components/contexts/AppContext'
import Navbar from '@/components/Navbar'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import Drawer from '@/components/Drawer'

const quicksand = Quicksand({ subsets: ['latin'] })

const theme = createTheme({
  components: {
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            backgroundColor: 'white',
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardError: {
          color: 'rgb(248 113 113)',
        },
        standardInfo: {
          color: 'rgb(14 165 233)',
        },
      },
    },
  },
  palette: {
    primary: {
      light: '#e3f2fd',
      main: '#40a9ff',
      dark: '#42a5f5',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#60a5fa',
      dark: '#90c1fc',
      contrastText: '#000',
    },
    mode: 'dark',
  },
  typography: {
    fontFamily: `-apple-system, BlinkMacSystemFont, ${quicksand.style.fontFamily}, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif`,
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LazyMotion features={domAnimation}>
      <LoadingProvider>
        <ThemeProvider theme={theme}>
          <AppContextProvider>
            <HeadCommon />
            <style jsx global>{`
              html {
                font-family: ${quicksand.style.fontFamily};
              }
            `}</style>
            <Navbar />
            <Drawer />
            <Component {...pageProps} />
            <Analytics />
          </AppContextProvider>
        </ThemeProvider>
      </LoadingProvider>
    </LazyMotion>
  )
}
