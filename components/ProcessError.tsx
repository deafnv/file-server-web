import { Dispatch, SetStateAction } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export default function ProcessError(
  { processError, setProcessError }: 
  {
    processError: string;
    setProcessError: Dispatch<SetStateAction<string>>;
  }
) {
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