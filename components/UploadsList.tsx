import LinearProgressWithLabel from '@/components/LinearProgressWithLabel'
import Button from '@mui/material/Button'
import { UploadsListProps } from "@/lib/types"
import CloseIcon from '@mui/icons-material/Close'
import isEqual from 'lodash/isEqual'

export default function UploadsList({ setFilesToUpload, currentUploadProgress, uploadQueue, handleOpenFileDialog }: UploadsListProps) {
  function handleCancelUpload(fileToRemove: File) {
    setFilesToUpload(uploadQueue.filter(file => !isEqual(file.file, fileToRemove)))
  }

  return (
    <div className='flex flex-col h-full w-full'>
      <h6 className='ml-3 text-lg'>Uploads {currentUploadProgress && `(${uploadQueue?.length! + 1})`}</h6>
      <div className='relative flex flex-col gap-1 p-1 h-full w-full text-sm bg-black rounded-md overflow-auto'>
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
            <span className='w-11/12'>{file.file.name}</span>
            <span className='text-gray-600 font-normal'>Queued</span>
            <CloseIcon 
              onClick={() => handleCancelUpload(file.file)}
              titleAccess='Remove from queue'
              fontSize='small' 
              className='absolute top-2 right-3 cursor-pointer hover:text-red-500 transition-colors' 
            />
          </div>
        ))}
        {(!currentUploadProgress && !uploadQueue?.length) &&
        <div className='flex flex-col items-center gap-2 self-center my-auto'>
          No active uploads
          <Button variant='outlined' color='secondary' onClick={handleOpenFileDialog}>Upload Files</Button>
        </div>}
      </div>
    </div>
  )
}