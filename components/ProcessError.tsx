import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useAppContext } from '@/components/contexts/AppContext'

export default function ProcessError() {
  const {
    processError,
    setProcessError
  } = useAppContext()

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') {
      return
    }

    setProcessError('')
  }
  
  return (
    <Snackbar
      open={!!processError}
      onClose={handleClose}
      autoHideDuration={6000}
    >
      <Alert severity='error' className='text-red-400 font-bold bg-white'>
        {processError}
      </Alert>
    </Snackbar>
  )
}