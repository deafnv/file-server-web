import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { useLoading } from '@/components/contexts/LoadingContext'
import axios, { AxiosError } from 'axios'
import { useAppContext } from '@/components/contexts/AppContext'

export default function ConfirmDelete() {
  const { setLoading } = useLoading()
  const {
    openDeleteConfirm,
    setOpenDeleteConfirm
  } = useAppContext()

  async function handleDelete() {
    setLoading(true)
    try { 
      await axios({
        method: 'DELETE',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/delete`,
        data: {
          pathToFiles: openDeleteConfirm?.map(file => file.path)
        },
        withCredentials: true
      })
      setOpenDeleteConfirm(null)
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
    <Dialog
      data-cy="dialog-delete"
      open={!!openDeleteConfirm}
      onClose={() => setOpenDeleteConfirm(null)}
    >
      <DialogTitle>
        Confirm delete? 
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => setOpenDeleteConfirm(null)}>
          No
        </Button>
        <Button onClick={handleDelete} autoFocus>Yes</Button>
      </DialogActions>
    </Dialog>
  )
}