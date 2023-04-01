import Head from "next/head"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import IconButton from '@mui/material/IconButton'
import { useRef, useState, BaseSyntheticEvent } from "react"
import axios, { AxiosError } from "axios"
import { setCookie } from "cookies-next"
import { useRouter } from "next/router"

export default function Login() {
  const loginDataRef = useRef({
    username: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const router = useRouter()

  async function handleLogin(e: BaseSyntheticEvent) {
    e.preventDefault()

    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/get`, { user: loginDataRef.current.username },
        {
          headers: {
            'X-API-Key': loginDataRef.current.password
          },
          withCredentials: true
        }
      )

      setCookie('token', data, { httpOnly: true })
      setCookie('userdata', JSON.stringify({ user: loginDataRef.current.username }))
      router.push('/')
    } catch (error) {
      if ((error as AxiosError).response?.status === 401) return alert('Entered wrong password')
      console.log(error)
    }
  }

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="flex items-center justify-center mx-auto h-[calc(100dvh-60px)] w-[30rem]">
        <div className="flex flex-col items-center px-24 py-12 h-[40%] w-full bg-zinc-600 drop-shadow-md shadow-md shadow-black rounded-lg">
          <h3 className="text-3xl font-bold mb-6">Login</h3>
          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center gap-4 w-full"
          >
            <TextField 
              label="Username" 
              variant="filled" 
              onChange={(e) => loginDataRef.current.username = e.target.value} 
              fullWidth
              type="text"
              className="bg-gray-200 rounded-md"
            />
            <TextField 
              label="Password" 
              variant="filled" 
              onChange={(e) => loginDataRef.current.password = e.target.value}
              fullWidth
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              className="bg-gray-200 rounded-md"
              InputProps={{
                endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>)
              }}
            />
            <Button 
              variant="contained"
              type="submit"
              className="w-1/2 text-lg bg-slate-400"
            >
              Login
            </Button>
          </form> 
        </div>
      </main>
    </>
  )
}