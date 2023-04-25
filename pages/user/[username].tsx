import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState, useRef, BaseSyntheticEvent } from "react"
import axios from "axios"
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import omit from "lodash/omit"
import { useLoading } from "@/components/contexts/LoadingContext"
import { UserData } from "@/lib/types"

enum PermissionTypes { 'makedir', 'upload', 'rename', 'copy', 'move', 'delete' }

export default function UserPage() {
  const modifiedUserDataRef = useRef<UserData | undefined>()

  const [userData, setUserData] = useState<UserData>() 
  
  const router = useRouter()
  
  const { setLoading } = useLoading()

  useEffect(() => {
    const getUserData = async (username: string) => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/user`, {
          params: { user: username },
          withCredentials: true
        })
        modifiedUserDataRef.current = data[0]
        setUserData(data[0])
      } catch (error) {
        console.error(error)
        alert(error)
      }
    }

    if (router.isReady) {
      const { username } = router.query
      getUserData(username as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])

  async function handleUserDataSubmit(e: BaseSyntheticEvent) {
    e.preventDefault()
    const modifiedData = omit(modifiedUserDataRef.current, 'username', 'createdAt')
    if (!modifiedUserDataRef.current) return

    try {
      setLoading(true)
      await axios.patch(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/authorize/user/${modifiedUserDataRef.current.username}/modify`, modifiedData, { withCredentials: true })
      router.reload()
    } catch (error) {
      console.error(error)
      alert(error)
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
          <span className="text-2xl mb-4">{userData?.username}</span>
          {(userData && modifiedUserDataRef.current) &&
          <form 
            onSubmit={handleUserDataSubmit}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex gap-2 justify-center">
              <label>Rank: </label>
              <input 
                defaultValue={userData?.rank}
                type="number"
                onChange={(e) => modifiedUserDataRef.current!.rank = parseInt(e.target.value)}
                className="text-center input-text w-1/2"
              />
            </div>
            <span className="text-lg mt-4">Permissions</span>
            <div className="flex flex-col">
              {(Object.keys(PermissionTypes) as Array<keyof typeof PermissionTypes>).map((permissionType, index) => index < 6 ? null : (
                <FormControlLabel 
                  key={index}
                  control={
                    <Checkbox defaultChecked={modifiedUserDataRef.current?.permissions[permissionType]} />
                  } 
                  defaultChecked={modifiedUserDataRef.current?.permissions[permissionType]}
                  label={permissionType}
                  onChange={(e) => modifiedUserDataRef.current!.permissions[permissionType] = (e.target as HTMLInputElement).checked}
                />
              ))}
            </div>
            <Button 
              data-cy="submit"
              variant="contained"
              type="submit"
              className="w-2/3 bg-slate-400"
            >
              Save changes
            </Button>
          </form>}
        </div>
      </main>
    </>
  )
}