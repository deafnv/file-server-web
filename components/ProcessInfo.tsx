import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useAppContext } from '@/components/contexts/AppContext'

export default function ProcessInfo() {
  const {
    processInfo,
    setProcessInfo
  } = useAppContext()

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') {
      return
    }

    setProcessInfo('')
  }
  
  return (
    <Snackbar
      open={!!processInfo}
      onClose={handleClose}
      autoHideDuration={3000}
      disableWindowBlurListener
    >
      <Alert severity='info' className='max-w-[35dvw] max-h-[4.5rem]'>
        {processInfo}
      </Alert>
    </Snackbar>
  )
}