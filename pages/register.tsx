import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useRef, useState, BaseSyntheticEvent } from "react"
import axios, { AxiosError } from "axios"
import { setCookie } from "cookies-next"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import IconButton from '@mui/material/IconButton'
import { useAppContext } from "@/components/contexts/AppContext"
import ProcessError from "@/components/ProcessError"

export default function Register() {
  const registerDataRef = useRef({
    username: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  const {
    setProcessError
  } = useAppContext()

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  async function handleRegister(e: BaseSyntheticEvent) {
    e.preventDefault()
    if (!registerDataRef.current.username || !registerDataRef.current.password || !registerDataRef.current.confirmPassword)
      setProcessError('Missing fields')
    else if (registerDataRef.current.username.length < 4 || registerDataRef.current.username.length > 16)
      setProcessError('Username must be between 4-10 characters long')
    else if (registerDataRef.current.password.length < 6 || registerDataRef.current.password.length > 24)
      setProcessError('Password must be between 6-24 characters long')
    else if (registerDataRef.current.password !== registerDataRef.current.confirmPassword)
      setProcessError('Password do not match')
    else {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/register`, 
          { 
            username: registerDataRef.current.username,
            password: registerDataRef.current.password
          }
        )

        setCookie('userdata', JSON.stringify({ user: registerDataRef.current.username }))
        router.push('/')
      } catch (error) {
        alert(error)
        console.error(error)
      }
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
          <h3 className="text-3xl font-bold mb-6">Register</h3>
          <form
            onSubmit={handleRegister}
            className="flex flex-col items-center gap-4 w-[75%] sm:w-[70%] md:w-[60%]"
          >
            <TextField
              data-cy="username"
              label="Username" 
              variant="filled" 
              onChange={(e) => registerDataRef.current.username = e.target.value} 
              fullWidth
              type="text"
              className="rounded-md"
            />
            <TextField 
              data-cy="password"
              label="Password" 
              variant="filled" 
              onChange={(e) => registerDataRef.current.password = e.target.value}
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
            <TextField 
              data-cy="confirm-password"
              label="Confirm Password" 
              variant="filled" 
              onChange={(e) => registerDataRef.current.confirmPassword = e.target.value}
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
              Register
            </Button>
          </form>
          <Link
            href={'/login'}
            className="mt-6 text-center text-sm sm:text-base font-semibold cursor-pointer link"
          >
            Login
          </Link>
        </div>
        <ProcessError />
      </main>
    </>
  )
}