import { Dispatch, SetStateAction } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export default function ProcessInfo(
  { processInfo, setProcessInfo }: 
  {
    processInfo: string;
    setProcessInfo: Dispatch<SetStateAction<string>>;
  }
) {
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
      autoHideDuration={6000}
    >
      <Alert severity='info' className='text-sky-500 font-bold bg-white max-w-[35dvw] max-h-[4.5rem]'>
        {processInfo}
      </Alert>
    </Snackbar>
  )
}