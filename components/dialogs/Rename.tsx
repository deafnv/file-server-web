import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useLoading } from '@/components/contexts/LoadingContext'
import { useAppContext } from '@/components/contexts/AppContext'
import { FormEvent, useRef } from 'react'
import axios from 'axios'

export default function Rename() {
  const textValue = useRef('')
  const { setLoading } = useLoading()
  const {
    openRenameDialog,
    setOpenRenameDialog,
    setContextMenu
  } = useAppContext()

  async function handleRename(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try { 
      await axios({
        method: 'PATCH',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/rename`,
        data: {
          pathToFile: openRenameDialog?.path,
          newName: textValue.current
        },
        withCredentials: true
      })
      setLoading(false)
      setOpenRenameDialog(null)
      setContextMenu(null)
    } catch (error) {
      alert(error)
      console.log(error)
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={!!openRenameDialog}
      onClose={() => setOpenRenameDialog(null)}
    >
      <form onSubmit={handleRename}>
        <DialogTitle>
          Rename
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            type="text"
            fullWidth
            variant="outlined"
            className='w-96'
            defaultValue={openRenameDialog?.name}
            onChange={(e) => textValue.current = e.target.value}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRenameDialog(null)}>
            Cancel
          </Button>
          <Button type='submit'>OK</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}