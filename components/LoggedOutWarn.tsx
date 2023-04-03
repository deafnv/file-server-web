import { Dispatch, SetStateAction } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export default function LoggedOutWarning(
  { loggedOutWarning, setLoggedOutWarning }: 
  {
    loggedOutWarning: boolean;
    setLoggedOutWarning: Dispatch<SetStateAction<boolean>>;
  }
) {
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
      <Alert severity='error'>
        You must be logged in to do that
      </Alert>
    </Snackbar>
  )
}