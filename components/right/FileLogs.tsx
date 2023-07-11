import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import axios, { AxiosError } from 'axios'
import { deleteCookie } from 'cookies-next'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useAppContext } from '@/components/contexts/AppContext'
import { FileServerFile, FileLog } from '@/lib/types'

interface LogState {
  filteredUser?: string
  selectedFile: FileServerFile
  selectedFileLogs: FileLog[]
  error?: string
}

let loadingTimer: NodeJS.Timeout

export default function FileLogs({ detailsOpen }: { detailsOpen: boolean }) {
  const isMouseDownRef = useRef(false)
  const fileLogDates = useRef<string[]>([])

  const [fileLogs, setFileLogs] = useState<LogState | null>(null)
  const [isLoadingLogs, setIsLoadingLogsState] = useState(false)
  const [fileLogDialogIndex, setFileLogDialogIndex] = useState<number | null>(null)

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

  const getLogs = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/logs`, {
        params: {
          path: selectedFile[0].path,
        },
        withCredentials: true,
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
      .catch((err) => {
        if ((err as AxiosError).response?.status == 403) {
          setFileLogs({
            selectedFile: selectedFile[0],
            selectedFileLogs: [],
            error: '403 Forbidden.',
          })
        } else if ((err as AxiosError).response?.status == 401) {
          setFileLogs({
            selectedFile: selectedFile[0],
            selectedFileLogs: [],
            error: '401 Unauthorized. Login to view logs.',
          })
        } else {
          setFileLogs({
            selectedFile: selectedFile[0],
            selectedFileLogs: [],
            error: 'Failed to load logs',
          })
        }
      })
      .finally(() => setIsLoadingLogs(false))
  }

  useEffect(() => {
    if (detailsOpen) {
      //TODO: paginate logs
      if (selectedFile.length == 1 && !isMouseDownRef.current) {
        setIsLoadingLogs(true)
        getLogs()
      } else {
        setFileLogs(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, detailsOpen])

  async function handleFilterLogsByUser(userDetail: string) {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/logs`, {
        params: {
          path: selectedFile[0].path,
          user: userDetail,
        },
        withCredentials: true,
      })
      setFileLogs({
        filteredUser: userDetail,
        selectedFile: selectedFile[0],
        selectedFileLogs: data,
      })
    } catch (error) {
      console.error(error)
      alert('Something went wrong while loading logs')
    }
  }

  return (
    <div className='flex flex-col h-full'>
      <h6 className='ml-3 text-lg whitespace-nowrap'>Logs</h6>
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
        {!isLoadingLogs && fileLogs && !fileLogs.selectedFileLogs.length && !fileLogs.error && (
          <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-center whitespace-nowrap'>
            <p>No logs found</p>
          </div>
        )}
        {!isLoadingLogs && !fileLogs && (
          <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-center whitespace-nowrap'>
            <p>Select a file to see history</p>
          </div>
        )}
        {!isLoadingLogs && fileLogs && fileLogs.error && (
          <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-center whitespace-nowrap'>
            <p>{fileLogs.error}</p>
          </div>
        )}
        {!isLoadingLogs && fileLogs && fileLogs.selectedFileLogs.length != 0 && (
          <div className='h-full w-full flex flex-col gap-2 items-center text-center'>
            {fileLogs?.filteredUser && (
              <div className='flex items-center justify-center w-full line-clamp-1 overflow-hidden'>
                {`(filter: ${fileLogs.filteredUser})`}
                <IconButton onClick={getLogs} title='Reset filter' size='small'>
                  <FilterAltOffIcon fontSize='small' />
                </IconButton>
              </div>
            )}
            {fileLogs.selectedFileLogs?.map((fileLog, index) => (
              <div
                key={fileLog.log_id}
                className='flex items-center justify-center p-1 w-full bg-secondary rounded-md'
              >
                <IconButton onClick={() => setFileLogDialogIndex(index)} size='small'>
                  <MoreVertIcon fontSize='small' />
                </IconButton>
                <div className='grow flex flex-col items-center justify-center'>
                  <p className='text-[0.9rem]'>
                    <span
                      title={`Filter logs by ${fileLog.display_name || fileLog.ip_address}`}
                      onClick={() =>
                        handleFilterLogsByUser(fileLog.display_name || fileLog.ip_address)
                      }
                      className='cursor-pointer hover:underline'
                    >
                      {fileLog.display_name || fileLog.ip_address}
                    </span>
                    {` ${fileLog.log_events.event_display_text} ${
                      selectedFile[0]?.isDirectory ? 'this folder' : 'this file'
                    }`}
                  </p>
                  <span className='text-xs text-text/80'>{fileLogDates.current[index]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FileLogDialog
        fileLogs={fileLogs}
        fileLogDialogIndex={fileLogDialogIndex}
        setFileLogDialogIndex={setFileLogDialogIndex}
      />
    </div>
  )
}

function FileLogDialog({
  fileLogs,
  fileLogDialogIndex,
  setFileLogDialogIndex,
}: {
  fileLogs: LogState | null
  fileLogDialogIndex: number | null
  setFileLogDialogIndex: Dispatch<SetStateAction<number | null>>
}) {
  const cachedIndex = useRef(0) //? Prevent resetting index on exit

  const finalIndex = fileLogDialogIndex ?? cachedIndex.current

  if (!fileLogs || fileLogs.selectedFileLogs.length == 0 || !fileLogs.selectedFileLogs[finalIndex])
    return null

  return (
    <Dialog
      open={fileLogDialogIndex != null}
      onClose={() => {
        cachedIndex.current = fileLogDialogIndex ?? 0
        setFileLogDialogIndex(null)
      }}
      fullWidth
    >
      <DialogTitle>Log details</DialogTitle>
      <DialogContent className=' break-words'>
        <div className='flex flex-col [&>*]:p-1'>
          <div className='p-2 bg-background rounded-md'>
            <table>
              <colgroup>
                <col className='w-[30%]' />
                <col className='w-[70%]' />
              </colgroup>
              <thead className='border-b [&>tr>*]:w-screen'>
                <tr>
                  <th className='p-2 pt-1 pl-3 text-left'>
                    <span>Key</span>
                  </th>
                  <th className='p-2 pt-1 pl-3 text-left'>
                    <span>Value</span>
                  </th>
                </tr>
              </thead>
              <tbody className='[&>tr>*]:w-screen [&>tr>td]:p-1 [&>tr>td]:pl-3'>
                <tr>
                  <td>Log ID</td>
                  <td>{fileLogs.selectedFileLogs[finalIndex].log_id}</td>
                </tr>
                <tr>
                  <td>Username</td>
                  <td>
                    {fileLogs.selectedFileLogs[finalIndex].username ||
                      fileLogs.selectedFileLogs[finalIndex].display_name}
                  </td>
                </tr>
                <tr>
                  <td>IP address</td>
                  <td>{fileLogs.selectedFileLogs[finalIndex].ip_address}</td>
                </tr>
                <tr>
                  <td>Event type</td>
                  <td>{fileLogs.selectedFileLogs[finalIndex].event_type}</td>
                </tr>
                <tr>
                  <td>Old path</td>
                  <td>{fileLogs.selectedFileLogs[finalIndex].event_old}</td>
                </tr>
                <tr>
                  <td>New path</td>
                  <td>{fileLogs.selectedFileLogs[finalIndex].event_new}</td>
                </tr>
                <tr>
                  <td>Event data</td>
                  <td>{fileLogs.selectedFileLogs[finalIndex].event_data}</td>
                </tr>
                <tr>
                  <td>Timestamp</td>
                  <td>{fileLogs.selectedFileLogs[finalIndex].created_at}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        {/* <Button onClick={() => setOpenMoveFileDialog(null)}>Cancel</Button>
        <Button onClick={handleMove}>Move</Button> */}
      </DialogActions>
    </Dialog>
  )
}
