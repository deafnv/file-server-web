import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { Dispatch, SetStateAction } from 'react'
import { FileServerFile } from '@/lib/types'
import { useLoading } from '../LoadingContext'
import axios from 'axios'

export default function ConfirmDelete(
  { openDeleteConfirm, setOpenDeleteConfirm, getData }: {
    openDeleteConfirm: FileServerFile[] | null;
    setOpenDeleteConfirm: Dispatch<SetStateAction<FileServerFile[] | null>>;
    getData: () => Promise<void>;
  }
) {
  const { setLoading } = useLoading()

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
      setLoading(false)
      setOpenDeleteConfirm(null)
      getData() //TODO: Remove once server websocket for live updates is set up
    } catch (error) {
      alert(error)
      console.log(error)
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
        <Button onClick={() => setOpenDeleteConfirm(null)} autoFocus>
          No
        </Button>
        <Button onClick={handleDelete}>Yes</Button>
      </DialogActions>
    </Dialog>
  )
}