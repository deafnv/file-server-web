import Link from 'next/link'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { MutableRefObject } from 'react'

export default function FilePath({ paramsRef, handleFolderDetailsOpen }: { 
  paramsRef: MutableRefObject<string[]>; 
  handleFolderDetailsOpen: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  return (
    <span className='flex items-center text-xl'>
      <Link 
        href={''}
        className='p-2 rounded-md transition-colors duration-75 hover:bg-gray-500'
      >
        Files
      </Link>
      {paramsRef.current?.map((param, index) => {
        //TODO: Limit to only show 4 previous paths, excluding Files
        if (index == paramsRef.current.length - 1)
          return (
            <>
              /
              <div 
                key={index}
                onClick={handleFolderDetailsOpen}
                className='flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-gray-500 '
              >
                <span className='line-clamp-1 break-all'>{param}</span>
                <ArrowDropDownIcon />
              </div>
            </>
          )
        return (
          <>
            /
            <Link 
              key={index}
              href={paramsRef.current?.slice(0, index + 1).join('/')}
              className='px-2 py-1 rounded-md hover:bg-gray-500 line-clamp-1 break-words'
            >
              {param}
            </Link>
          </>
        )
      })}
    </span>
  )
}