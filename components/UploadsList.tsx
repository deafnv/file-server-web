import LinearProgressWithLabel from '@/components/LinearProgressWithLabel'
import Button from '@mui/material/Button'
import { UploadsListProps } from "@/lib/types"

export default function UploadsList({ currentUploadProgress, uploadQueue, handleOpenFileDialog }: UploadsListProps) {
  return (
    <div className='flex flex-col h-full w-full'>
      <h6 className='ml-3 text-lg'>Uploads {currentUploadProgress && `(${uploadQueue?.length! + 1})`}</h6>
      <div className='flex flex-col gap-1 p-1 min-h-[90%] w-full bg-black rounded-md overflow-auto'>
        {currentUploadProgress &&
        <div className='p-2 h-fit w-full text-black font-semibold bg-gray-300 rounded-md'>
          {currentUploadProgress.name}
          <LinearProgressWithLabel variant='determinate' value={currentUploadProgress.progress} />
        </div>}
        {uploadQueue?.map((file, index) => (
          <div 
            key={index}
            className='flex flex-col p-2 h-fit w-full text-black font-semibold bg-gray-300 rounded-md'
          >
            {file.name}
            <span className='text-gray-600 text-sm font-normal'>Queued</span>
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