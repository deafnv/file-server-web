import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
import { useLoading } from '../LoadingContext'
import axios from 'axios'
import { FileServerFile } from '@/lib/types'
import MoveFileTree from './MoveFileTree'

export default function MoveFile(
  { openMoveFileDialog, setOpenMoveFileDialog, getData }: {
    openMoveFileDialog: FileServerFile[] | null;
    setOpenMoveFileDialog: Dispatch<SetStateAction<FileServerFile[] | null>>;
    getData: () => Promise<void>;
  }
) {
  const [selectFolder, setSelectFolder] = useState('')

  const { setLoading } = useLoading()

  async function handleRename() {
    setLoading(true)
    try { 
      await axios({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/move`,
        data: {
          pathToFiles: openMoveFileDialog?.map(file => file.path),
          newPath: selectFolder
        },
        withCredentials: true
      })
      setLoading(false)
      setOpenMoveFileDialog(null)
      getData() //TODO: Remove once server websocket for live updates is set up
    } catch (error) {
      alert(error)
      console.log(error)
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={!!openMoveFileDialog}
      onClose={() => setOpenMoveFileDialog(null)}
      fullWidth
    >
      <DialogTitle>
        {openMoveFileDialog?.length! > 1 ? 'Move files' : 'Move file'}
      </DialogTitle>
      <DialogContent className='h-[45rem]'>
        <MoveFileTree 
          selectFolder={selectFolder} 
          setSelectFolder={setSelectFolder} 
        />
        <span>Selected folder: {selectFolder}</span>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenMoveFileDialog(null)}>
          Cancel
        </Button>
        <Button onClick={handleRename}>Move</Button>
      </DialogActions>
    </Dialog>
  )
}