import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'
import { useAppContext } from '@/components/contexts/AppContext'
import { FileServerFile, FileLog } from '@/lib/types'

interface LogState {
  selectedFile: FileServerFile
  selectedFileLogs: FileLog[]
}

let loadingTimer: NodeJS.Timeout

export default function FileLogs() {
  const isMouseDownRef = useRef(false)
  const fileLogDates = useRef<string[]>([])

  const [fileLogs, setFileLogs] = useState<LogState | null>(null)
  const [isLoadingLogs, setIsLoadingLogsState] = useState(false)

  const { selectedFile } = useAppContext()

  const setIsLoadingLogs = (state: boolean, timeout = 100) => {
    if (state) {
      loadingTimer = setTimeout(() => {
        setIsLoadingLogsState(true)
      }, timeout)
    } else {
      clearTimeout(loadingTimer)
      setIsLoadingLogsState(false)
    }
  }

  useEffect(() => {
    const mouseDownHandler = () => (isMouseDownRef.current = true)
    const mouseUpHandler = () => (isMouseDownRef.current = false)

    document.addEventListener('mousedown', mouseDownHandler)
    document.addEventListener('mouseup', mouseUpHandler)

    return () => {
      document.removeEventListener('mousedown', mouseDownHandler)
      document.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [])

  useEffect(() => {
    if (selectedFile.length == 1 && !isMouseDownRef.current) {
      console.count('Getting logs')
      setIsLoadingLogs(true)
      axios
        .get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/logs`, {
          params: {
            path: selectedFile[0].path,
            //type: 'RETRIEVE',
          },
        })
        .then(({ data }: { data: FileLog[] }) => {
          fileLogDates.current = data.map(
            ({ created_at }) =>
              `${new Date(created_at).toLocaleTimeString('en-US', {
                hour12: false,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              })} ${new Date(created_at).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              })}`
          )
          setFileLogs({
            selectedFile: selectedFile[0],
            selectedFileLogs: data,
          })
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingLogs(false))
    } else {
      setFileLogs(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  return (
    <div className='flex flex-col h-full'>
      <h6 className='ml-3 text-lg whitespace-nowrap'>History</h6>
      <div
        data-isdirpath
        data-path='/'
        className='relative flex flex-col p-1 h-full text-[0.95rem] bg-foreground rounded-md overflow-auto overflow-x-hidden'
      >
        {isLoadingLogs && (
          <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-2xl whitespace-nowrap'>
            <CircularProgress />
          </div>
        )}
        {!isLoadingLogs && fileLogs && !fileLogs.selectedFileLogs.length && (
          <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-center whitespace-nowrap'>
            <p>No logs found</p>
          </div>
        )}
        {!isLoadingLogs && !fileLogs && (
          <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-center whitespace-nowrap'>
            <p>Select a file to see history</p>
          </div>
        )}
        {!isLoadingLogs && fileLogs && fileLogs.selectedFileLogs.length != 0 && (
          <div className='h-full w-full flex flex-col gap-2 items-center text-center'>
            {fileLogs.selectedFileLogs?.map((fileLog, index) => (
              <div
                key={fileLog.log_id}
                className='flex justify-between w-full bg-secondary rounded-md'
              >
                <p>{`${fileLog.display_name || fileLog.ip_address} ${
                  fileLog.log_events.event_display_text
                } ${selectedFile[0]?.isDirectory ? 'this folder' : 'this file'} at ${
                  fileLogDates.current[index]
                }`}</p>
                <span>{}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
