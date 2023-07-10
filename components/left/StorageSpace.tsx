import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import prettyBytes from 'pretty-bytes'
import LinearProgressWithLabel from '@/components/LinearProgressWithLabel'
import { useState } from 'react'
import axios from 'axios'
import { StorageSpaceRes } from '@/lib/types'
import { useAppContext } from '@/components/contexts/AppContext'

export default function StorageSpace() {
  const [storageSpace, setStorageSpace] = useState<StorageSpaceRes | null>(null)
  const [loadingSS, setLoadingSS] = useState(false)

  const { setProcessError } = useAppContext()

  async function handleLoadSS() {
    setLoadingSS(true)
    try {
      const storageSpaceResponse = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/diskspace`, { withCredentials: true })
      setStorageSpace(storageSpaceResponse.data)
    } catch (error) {
      setProcessError('Something went wrong')
    } finally {
      setLoadingSS(false)
    }
  }

  return (
    <div className='h-full w-full'>
      <h6 className='ml-3 text-lg'>Storage Space</h6>
      {storageSpace ? 
      <div className='flex flex-col justify-center px-4'>
        <span className='self-center'>{`${prettyBytes(storageSpace.size - storageSpace.free)}/${prettyBytes(storageSpace.size)}`}</span>
        <LinearProgressWithLabel 
          value={(storageSpace.size - storageSpace.free) / storageSpace.size * 100} 
          textColor='white'
          color='secondary'
          className='h-2 rounded-lg'
        />
      </div> :
      <div className='relative flex justify-center'>
        <Button
          color='secondary'
          variant='contained'
          disabled={loadingSS}
          onClick={handleLoadSS}
          className='bg-blue-400'
        >
          Check Storage Space
        </Button>
        {loadingSS && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </div>
      }
    </div>
  )
}