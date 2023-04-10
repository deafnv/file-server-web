import { ForwardedRef, forwardRef } from "react"
import { useAppContext } from "@/components/contexts/AppContext"
import { getIcon } from "@/lib/methods"

//* Shown when dragging file
function DraggedFile(props: {}, ref: ForwardedRef<HTMLDivElement>) {
  const { selectedFile } = useAppContext()

  return (
    <div
      ref={ref}
      className='invisible fixed top-0 left-0 z-50 p-3 flex gap-2 h-[3.3rem] w-[12rem] pointer-events-none'
    >
      {selectedFile.map((item, index) => {
        if (index > 2) return null
        return (
          <div 
            key={index}
            style={{
              top: 2 * index,
              left: 2 * index
            }} 
            className='fixed flex gap-2 p-3 h-full w-full bg-black border-[1px] border-gray-500 rounded-md shadow-lg shadow-gray-900 pointer-events-none'
          >
            <span className='w-[1.5rem]'>
              {selectedFile.length ? getIcon(selectedFile[0]) : null}
            </span>
            <div 
              className='flex items-center overflow-hidden'
            >
              <span 
                data-isfilename
                className='line-clamp-1 w-fit'
              >
                {selectedFile.length ? selectedFile[0].name : ''}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default forwardRef(DraggedFile)