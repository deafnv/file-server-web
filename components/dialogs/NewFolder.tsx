import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Dispatch, SetStateAction, useRef } from 'react'
import { useLoading } from '../LoadingContext'
import axios from 'axios'

export default function NewFolder(
  { openNewFolderDialog, setOpenNewFolderDialog }: {
    openNewFolderDialog: string | null;
    setOpenNewFolderDialog: Dispatch<SetStateAction<string | null>>;
  }
) {
  const textValue = useRef('')
  const { setLoading } = useLoading()

  async function handleRename() {
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
      setLoading(false)
      setOpenNewFolderDialog(null)
    } catch (error) {
      alert(error)
      console.log(error)
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={!!openNewFolderDialog}
      onClose={() => setOpenNewFolderDialog(null)}
    >
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
          data-cy="new-folder-submit"
          onClick={handleRename}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}