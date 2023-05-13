import { useRouter } from 'next/router'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { FormEvent, useRef } from 'react'
import { useLoading } from '@/components/contexts/LoadingContext'
import { useAppContext } from '@/components/contexts/AppContext'
import axios, { AxiosError } from 'axios'
import { deleteCookie } from 'cookies-next'

export default function NewFolder() {
  const textValue = useRef('')
  const { setLoading } = useLoading()
  const {
    openNewFolderDialog,
    setOpenNewFolderDialog,
    setContextMenu,
    setProcessError
  } = useAppContext()

  const router = useRouter()

  async function handleRename(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try { 
      await axios({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/makedir`,
        data: {
          currentPath: openNewFolderDialog,
          newDirName: textValue.current
        },
        withCredentials: true
      })
      setOpenNewFolderDialog(null)
      setContextMenu(null)
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

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={!!openNewFolderDialog}
      onClose={() => setOpenNewFolderDialog(null)}
    >
      <form onSubmit={handleRename}>
        <DialogTitle>
          New folder
        </DialogTitle>
        <DialogContent>
          <TextField
            data-cy="new-folder-input"
            autoFocus
            margin="dense"
            type="text"
            fullWidth
            variant="outlined"
            className='w-96'
            onChange={(e) => textValue.current = e.target.value}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewFolderDialog(null)}>
            Cancel
          </Button>
          <Button 
            type='submit'
            data-cy="new-folder-submit"
          >
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}