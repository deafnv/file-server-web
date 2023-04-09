import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useAppContext } from '@/components/contexts/AppContext'

export default function LoggedOutWarning() {
  const {
    loggedOutWarning,
    setLoggedOutWarning
  } = useAppContext()

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') {
      return
    }

    setLoggedOutWarning(false)
  }
  
  return (
    <Snackbar
      open={loggedOutWarning}
      onClose={handleClose}
      autoHideDuration={6000}
    >
      <Alert severity='error' className='text-red-400 font-bold bg-white'>
        You must be logged in to do that
      </Alert>
    </Snackbar>
  )
}