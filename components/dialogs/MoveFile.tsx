import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import { Dispatch, SetStateAction, useState } from 'react'
import { useLoading } from '@/components/contexts/LoadingContext'
import axios, { AxiosError } from 'axios'
import { FileServerFile, FileTreeRes } from '@/lib/types'
import MoveFileTree from './MoveFileTree'
import { useAppContext } from '@/components/contexts/AppContext'
import { deleteCookie } from 'cookies-next'
import { useRouter } from 'next/router'

export default function MoveFile({ fileTree }: { fileTree: FileTreeRes | string | null | undefined; }) {
  const [selectFolder, setSelectFolder] = useState('/')

  const { setLoading } = useLoading()
  const {
    openMoveFileDialog,
    setOpenMoveFileDialog
  } = useAppContext()

  const router = useRouter()

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
      setOpenMoveFileDialog(null)
    } catch (err) {
      if ((err as any as AxiosError).response?.status == 403) {
        alert(`Error: Forbidden.`)
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