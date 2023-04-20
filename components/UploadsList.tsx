import LinearProgressWithLabel from '@/components/LinearProgressWithLabel'
import Button from '@mui/material/Button'
import { UploadsListProps } from "@/lib/types"
import CloseIcon from '@mui/icons-material/Close'
import isEqual from 'lodash/isEqual'

export default function UploadsList({ setFilesToUpload, currentUploadProgress, uploadQueue, handleOpenFileDialog }: UploadsListProps) {
  function handleCancelUpload(fileToRemove: File) {
    setFilesToUpload(uploadQueue.filter(file => !isEqual(file, fileToRemove)))
  }

  return (
    <div className='flex flex-col h-full w-full'>
      <h6 className='ml-3 text-lg'>Uploads {currentUploadProgress && `(${uploadQueue?.length! + 1})`}</h6>
      <div className='relative flex flex-col gap-1 p-1 min-h-[90%] w-full text-sm bg-black rounded-md overflow-auto'>
        {currentUploadProgress &&
        <div className='p-3 h-fit w-full text-black font-semibold bg-gray-300 rounded-md'>
          {currentUploadProgress.name}
          <LinearProgressWithLabel variant='determinate' value={currentUploadProgress.progress} />
        </div>}
        {uploadQueue?.map((file, index) => (
          <div 
            key={index}
            className='relative flex flex-col p-3 h-fit w-full text-black font-semibold bg-gray-300 rounded-md'
          >
            {file.name}
            <span className='text-gray-600 font-normal'>Queued</span>
            <CloseIcon 
              onClick={() => handleCancelUpload(file)}
              titleAccess='Remove from queue'
              fontSize='small' 
              className='absolute top-2 right-3 cursor-pointer hover:text-red-500' 
            />
          </div>
        ))}
        {(!currentUploadProgress && !uploadQueue?.length) &&
        <div className='flex flex-col gap-2 self-center my-auto'>
          No active uploads.
          <Button variant='outlined' color='secondary' onClick={handleOpenFileDialog}>Upload Files</Button>
        </div>}
      </div>
    </div>
  )
}