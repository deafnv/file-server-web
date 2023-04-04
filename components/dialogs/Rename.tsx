import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Dispatch, SetStateAction, useRef } from 'react'
import { FileServerFile } from '@/lib/types'
import { useLoading } from '../LoadingContext'
import axios from 'axios'

export default function Rename(
  { openRenameDialog, setOpenRenameDialog, getData }: {
    openRenameDialog: FileServerFile | null;
    setOpenRenameDialog: Dispatch<SetStateAction<FileServerFile | null>>;
    getData: () => Promise<void>;
  }
) {
  const textValue = useRef('')
  const { setLoading } = useLoading()

  async function handleRename() {
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
      getData() //TODO: Remove once server websocket for live updates is set up
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
        <Button onClick={handleRename}>OK</Button>
      </DialogActions>
    </Dialog>
  )
}