import { useEffect } from 'react'
import { useAppContext } from '@/components/contexts/AppContext'

export default function FileDetails() {
  const { selectedFile } = useAppContext()

  useEffect(() => {}, [selectedFile])

  return (
    <div className='flex flex-col h-full'>
      <h6 className='ml-3 text-lg whitespace-nowrap'>Details</h6>
      <div
        data-isdirpath
        data-path='/'
        className='relative flex flex-col p-1 h-full text-[0.95rem] bg-foreground rounded-md overflow-auto overflow-x-hidden'
      ></div>
    </div>
  )
}
