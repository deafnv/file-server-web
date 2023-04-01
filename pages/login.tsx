import Head from "next/head"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import { useRef, BaseSyntheticEvent } from "react"

export default function Login() {
  const loginDataRef = useRef({
    username: '',
    password: ''
  })

  function handleLogin(e: BaseSyntheticEvent) {
    e.preventDefault()
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
              className="bg-gray-200 rounded-md"
            />
            <TextField 
              label="Password" 
              variant="filled" 
              onChange={(e) => loginDataRef.current.password = e.target.value}
              fullWidth
              className="bg-gray-200 rounded-md" 
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