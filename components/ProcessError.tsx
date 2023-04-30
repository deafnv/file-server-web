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
      autoHideDuration={3000}
      disableWindowBlurListener
    >
      <Alert severity='error'>
        {processError}
      </Alert>
    </Snackbar>
  )
}