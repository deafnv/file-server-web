import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import HeadCommon from '@/components/HeadCommon'
import { LoadingProvider } from '@/components/LoadingContext'
import Navbar from '@/components/Navbar'

import { createTheme, ThemeProvider } from '@mui/material/styles';

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
      main: '#b3d4ff',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <HeadCommon />
        <LoadingProvider>
          <Navbar />
          <Component {...pageProps} />
        </LoadingProvider>
      </ThemeProvider>
    </>
  )
}
