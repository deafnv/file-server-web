import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useLoading } from '@/components/contexts/LoadingContext'
import { useRouter } from 'next/router'
import axios, { AxiosError } from 'axios'
import { deleteCookie } from 'cookies-next'
import MoveFileTree from '@/components/dialogs/DialogFileTree'
import { useAppContext } from '@/components/contexts/AppContext'

export default function ShortcutCreate() {
  const [selectFolder, setSelectFolder] = useState('/')

  const { setLoading } = useLoading()
  const {
    fileTree,
    openShortcutDialog,
    setOpenShortcutDialog,
    setProcessError
  } = useAppContext()

  const router = useRouter()

  async function handleCreateShortcut() {
    setLoading(true)
    try { 
      await axios({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/shortcut`,
        data: {
          target: openShortcutDialog?.path,
          currentPath: selectFolder
        },
        withCredentials: true
      })
      setOpenShortcutDialog(null)
    } catch (err) {
      if ((err as any as AxiosError).response?.status == 403) {
        setProcessError('Error: Forbidden')
      } else if ((err as any as AxiosError).response?.status == 401) {
        alert('Error: Unauthorized, try logging in again.')
        deleteCookie('userdata')
		    router.reload()
      } else {
        alert(`Error. The server is probably down. ${err}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (typeof fileTree == 'string') return null

  return (
    <Dialog
      open={!!openShortcutDialog}
      onClose={() => setOpenShortcutDialog(null)}
      fullWidth
    >
      <DialogTitle>Create shortcut</DialogTitle>
      <DialogContent className='h-[45rem]'>
        <MoveFileTree 
          fileTree={fileTree}
          selectFolder={selectFolder} 
          setSelectFolder={setSelectFolder} 
        />
        <span>Selected folder: {selectFolder}</span>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenShortcutDialog(null)}>
          Cancel
        </Button>
        <Button onClick={handleCreateShortcut}>Create</Button>
      </DialogActions>
    </Dialog>
  )
}