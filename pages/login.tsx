import Head from "next/head"
import Link from "next/link"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import IconButton from '@mui/material/IconButton'
import { useRef, useState, useEffect, BaseSyntheticEvent } from "react"
import axios, { AxiosError } from "axios"
import { setCookie } from "cookies-next"
import { useRouter } from "next/router"

export default function Login() {
  const loginDataRef = useRef({
    username: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const router = useRouter()

  useEffect(() => {
    const getIsDBEnabled = async () => {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/isdb`)
      setShowRegister(data)
    }

    if (router.isReady) {
      getIsDBEnabled()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])

  async function handleLogin(e: BaseSyntheticEvent) {
    e.preventDefault()

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/${showRegister ? 'login' : 'get'}`, 
        { 
          username: loginDataRef.current.username,
          password: loginDataRef.current.password
        },
        { 
          headers: showRegister ? undefined : {
            "X-API-Key": loginDataRef.current.password
          },
          withCredentials: true 
        }
      )

      setCookie('userdata', JSON.stringify({ user: loginDataRef.current.username }))
      router.push('/')
    } catch (error) {
      if ((error as AxiosError).response?.status === 401) return alert('Entered wrong password')
      console.error(error)
    }
  }

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="flex items-center justify-center mx-auto h-[calc(100dvh-60px)] w-[30rem]">
        <div className="flex flex-col items-center py-12 min-h-[40%] w-full bg-gray-900 drop-shadow-md shadow-md shadow-black rounded-lg">
          <h3 className="text-3xl font-bold mb-6">Login</h3>
          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center gap-4 w-[75%] sm:w-[70%] md:w-[60%]"
          >
            <TextField 
              data-cy="username"
              label="Username" 
              variant="filled" 
              onChange={(e) => loginDataRef.current.username = e.target.value} 
              fullWidth
              type="text"
              className="rounded-md"
            />
            <TextField 
              data-cy="password"
              label="Password" 
              variant="filled" 
              onChange={(e) => loginDataRef.current.password = e.target.value}
              fullWidth
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              className="rounded-md"
              InputProps={{
                endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>)
              }}
            />
            <Button 
              data-cy="submit"
              variant="contained"
              type="submit"
              className="w-1/2 text-lg bg-slate-400"
            >
              Login
            </Button>
          </form>
          {showRegister &&
          <Link
            href={'/register'}
            className="mt-6 text-center text-sm sm:text-base font-semibold cursor-pointer link"
          >
            Register
          </Link>}
        </div>
      </main>
    </>
  )
}