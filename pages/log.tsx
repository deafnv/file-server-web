import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { deleteCookie } from "cookies-next"
import Button from "@mui/material/Button"
import { useLoading } from "@/components/contexts/LoadingContext"

export default function LogsPage() {
  const [logData, setLogData] = useState('')

  const router = useRouter()

  const { setLoading } = useLoading()

  async function handleGetLog() {
    setLoading(true)

    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/retrieve/events-log.log`, {
        withCredentials: true
      })
      setLogData(data.split('\n').reverse().slice(1).join('\n'))
    } catch (err) {
      if ((err as any as AxiosError).response?.status == 403) {
        alert(`Error: Forbidden.`)
      } else if ((err as any as AxiosError).response?.status == 401) {
        alert('Error: Unauthorized, try logging in again.')
        deleteCookie('userdata')
		    router.push('/')
      } else {
        alert(`Error. The server is probably down. ${err}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="flex justify-center mx-auto h-[calc(100dvh-60px)] mt-[60px]">
        <div className="flex flex-col items-center gap-4 mt-8 w-3/4">
          <h2 className="text-3xl font-bold text-center">Events Log</h2>
          <Button
            data-cy="submit"
            size="medium"
            variant="contained"
            onClick={handleGetLog}
            type="submit"
            className="w-1/12 bg-slate-400"
          >
            Load Logs
          </Button>
          <div className="p-2 h-[40rem] w-full text-black text-sm whitespace-pre-wrap rounded-md bg-white overflow-auto">
            <p>{logData}</p>
          </div>
        </div>
      </main>
    </>
  )
}