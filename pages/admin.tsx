import Head from "next/head"
import Link from "next/link"
import { BaseSyntheticEvent, useRef, useState } from "react"
import axios, { AxiosError } from "axios"
import { getCookie } from "cookies-next"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import { useLoading } from "@/components/contexts/LoadingContext"
import { UserData } from "@/lib/types"

export default function AdminControls() {
  const searchStringRef = useRef('')

  const [users, setUsers] = useState<UserData[]>([])

  const { setLoading } = useLoading()

  async function handleSearchUsers(e: BaseSyntheticEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/user`, {
        params: {
          user: searchStringRef.current
        },
        withCredentials: true
      })
      setUsers(data)
    } catch (err) {
      if ((err as any as AxiosError).response?.status == 401) {
        alert(`Error: Unauthorized.`)
      } else {
        alert(`Error: The server is probably down.`)
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
        <div className="flex flex-col items-center mt-8 w-[60%]">
          <h2 className="text-3xl font-bold mb-6 text-center">Admin Controls</h2>
          <form 
            onSubmit={handleSearchUsers}
            className="flex gap-3 mb-6 w-[20rem]"
          >
            <TextField
              data-cy="search-user"
              label="Search Users" 
              variant="filled" 
              onChange={(e) => searchStringRef.current = e.target.value}
              fullWidth
              type='text'
              autoComplete="off"
              className="rounded-md"
            />
            <Button
              data-cy="submit"
              variant="contained"
              type="submit"
              className="w-1/2 text-lg bg-slate-400"
            >
              Search
            </Button>
          </form>
          <table className="border-[1px] border-solid border-white">
            <thead className="border-[1px] border-solid border-white">
              <tr>
                <th className="p-2 w-[30rem]">Username</th>
                <th className="p-2 w-[5rem]">Rank</th>
                <th className="p-2 w-[15rem]">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                return (
                  <tr 
                    key={index}
                    className="text-center"
                  >
                    <td className="p-2">
                      <Link 
                        href={`/user/${user.username}`}
                        className="font-bold link"
                      >
                        {user.username}
                      </Link>
                    </td>
                    <td className="p-2">{user.rank}</td>
                    <td className="p-2">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}