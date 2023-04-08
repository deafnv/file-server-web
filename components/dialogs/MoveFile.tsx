import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import { Dispatch, SetStateAction, useState } from 'react'
import { useLoading } from '../LoadingContext'
import axios from 'axios'
import { FileServerFile, FileTreeRes } from '@/lib/types'
import MoveFileTree from './MoveFileTree'

export default function MoveFile(
  { fileTree, openMoveFileDialog, setOpenMoveFileDialog }: {
    fileTree: FileTreeRes | null | undefined;
    openMoveFileDialog: FileServerFile[] | null;
    setOpenMoveFileDialog: Dispatch<SetStateAction<FileServerFile[] | null>>;
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
          fileTree={fileTree}
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