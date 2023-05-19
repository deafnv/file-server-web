import path from 'path'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import axios, { AxiosError } from 'axios'
import { deleteCookie, getCookie } from 'cookies-next'
import prettyBytes from 'pretty-bytes'
import isEqual from 'lodash/isEqual'
import CircularProgress from '@mui/material/CircularProgress'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import DragSelectionArea from '@/components/DragSelection'
import { getIcon, sortFileArr } from '@/lib/methods'
import { FileListProps, FileServerFile } from '@/lib/types'
import { useLoading } from '@/components/contexts/LoadingContext'
import { useAppContext } from '@/components/contexts/AppContext'
import DraggedFile from '@/components/DraggedFile'

export default function FileList(
  { fileRefs, fileListRef, sortMethodRef, getRootProps, getInputProps }: FileListProps
) {
  const startingFileSelect = useRef<number | null>(null)
  const dragOverlayRef = useRef<HTMLDivElement>(null)
  const dragOverlayTextRef = useRef<HTMLSpanElement>(null)
  const draggedFileRef = useRef<HTMLDivElement>(null)
  const isDraggingFile = useRef(0)

  const router = useRouter()
  const { setLoading } = useLoading()
  const {
    contextMenu,
    setContextMenu,
    fileArr,
    setFileArr,
    selectedFile,
    setSelectedFile,
    setLoggedOutWarning,
    setProcessInfo,
    setProcessError,
    setOpenDeleteConfirm
  } = useAppContext()

  useEffect(() => {
    const preventShiftSelect = (e: any) => {
      document.onselectstart = function() {
        return !(e.key == "Shift" && e.shiftKey);
      }
    }

    ["keyup","keydown"].forEach(function (event) {
      window.addEventListener(event, preventShiftSelect)
    })

    return () => {
      ["keyup","keydown"].forEach((event) => {
        window.removeEventListener(event, preventShiftSelect)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    //* Allows navigation of file list with arrow keys and enter
    //FIXME: Weird interactions with ctrl + a select all
    const keyboardNavigate = (e: KeyboardEvent) => {
      const navigationKeys = ['ArrowDown', 'ArrowUp', 'Enter']
      //* Allow navigation only if selected file, or body is active element
      if (!(fileArr instanceof Array) || !navigationKeys.includes(e.key) || (!selectedFile.length && document.activeElement?.tagName !== 'BODY'))
        return
      const lastSelectedFile = selectedFile[selectedFile.length - 1]
      const lastSelectedFileIndex = fileArr.lastIndexOf(lastSelectedFile)
      let toSelect: FileServerFile[] = []
      let shouldSet: boolean = true //* Set to false if at top or bottom of list
      switch (e.key) {
        case 'ArrowDown':
          if (selectedFile.includes(fileArr[fileArr.length - 1]) && selectedFile.length !== fileArr.length) {
            shouldSet = false
            break
          }
          toSelect = !selectedFile.length ? [fileArr[0]] : [fileArr[lastSelectedFileIndex + 1]]
          if (!e.shiftKey) startingFileSelect.current = !selectedFile.length ? 0 : lastSelectedFileIndex + 1
          break
        case 'ArrowUp':
          if (selectedFile.includes(fileArr[0])  && selectedFile.length !== fileArr.length) {
            shouldSet = false
            break
          }
          toSelect = !selectedFile.length ? [fileArr[0]] : [fileArr[lastSelectedFileIndex - 1]]
          if (!e.shiftKey) startingFileSelect.current = !selectedFile.length ? 0 : lastSelectedFileIndex - 1
          break
        case 'Enter':
          shouldSet = false
          if (selectedFile.length !== 1) break
          selectedFile[0].isDirectory ? router.push(`/files${selectedFile[0].path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile[0].path}`)
        default: break
      }
      //* If shift key pressed behave combine selections, or remove them
      if (e.shiftKey) {
        if (selectedFile.includes(toSelect[0])) toSelect = selectedFile.slice(0, -1)
        else toSelect = selectedFile.concat(toSelect)
      }
      //? I have no clue why there is undefined in the array, but this fixes it. Something with ctrl + a
      if (shouldSet) {
        setSelectedFile(toSelect.filter(item => item))
        fileListRef.current?.focus()
      }
      console.log(selectedFile)
    }
    
    document.addEventListener("keydown", keyboardNavigate)

    return () => document.removeEventListener("keydown", keyboardNavigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileArr, selectedFile])

  async function moveFile(files: FileServerFile[], directory: FileServerFile | string) {
    if (!getCookie('userdata')) return setLoggedOutWarning(true)
    setLoading(true)
    try { 
      await axios({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/move`,
        data: {
          pathToFiles: files?.map(file => file.path),
          newPath: typeof directory == 'string' ? directory : directory.path
        },
        withCredentials: true
      })
      setLoading(false)
      const directoryParse = typeof directory == 'string' ? path.parse(directory).name : path.parse(directory.path).name
      setProcessInfo(
        files.length > 1 ? 
        `Moved ${files.length} files into ${directoryParse}` :
        `Moved ${files[0].name} into ${directoryParse}`
      )
    } catch (err) {
      if ((err as any as AxiosError).response?.status == 403) {
        setProcessError('Error: Forbidden')
      } else if ((err as any as AxiosError).response?.status == 401) {
        alert('Error: Unauthorized, try logging in again.')
        deleteCookie('userdata')
		    router.reload()
      } else {
        alert(`Error. The server is probably down. ${err}`)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    const moveDraggedFile = (e: MouseEvent) => {
      if (isDraggingFile.current) {
        const closestFileHovered = fileRefs.current.filter(item => (e.target as HTMLElement).closest("[data-isfile]") == item.ref)
        if (closestFileHovered.length && (performance.now() - 150 > isDraggingFile.current)) {
          //! File moving animation here (file under mouse, outline hovered files)
          
        }

        if (draggedFileRef.current && (performance.now() - 150 > isDraggingFile.current)) {
          //* Make selected files greyed out while dragging them
          const selectedFileRefs = fileRefs.current.filter(item => selectedFile.includes(item.file))
          selectedFileRefs.forEach(item => {
            item.ref.style.opacity = '0.3'
            item.ref.style.backgroundColor = 'gray'
          })

          draggedFileRef.current.style.visibility = 'visible'
          draggedFileRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
        }
      }
    }

    const dropFile = (e: MouseEvent) => {
      //* Remove greyed out effect on stop drag
      const stopDrag = () => {
        const selectedFileRefs = fileRefs.current.filter(item => selectedFile.includes(item.file))
        selectedFileRefs.forEach(item => {
          item.ref.style.opacity = '1'
          item.ref.style.backgroundColor = 'rgb(107 114 128)'
        })
      }

      if (isDraggingFile.current) {
        const closestPathDropped = (e.target as HTMLElement).closest("[data-isdirpath]")
        const closestFileDropped = fileRefs.current.filter(item => (e.target as HTMLElement).closest("[data-isfile]") == item.ref)
        //* If dropped on file, and has been dragged for at least 150ms
        if (closestFileDropped.length && (performance.now() - 150 > isDraggingFile.current)) {
          //* Disappear dragged file
          if (draggedFileRef.current) {
            if (closestFileDropped[0].file.isDirectory){
              draggedFileRef.current.style.visibility = 'hidden'
              if (!selectedFile.includes(closestFileDropped[0].file))
                moveFile(selectedFile, closestFileDropped[0].file)
            } else {
              //* Do nothing and move back dragged file to its spot (didnt drag into folder)
              draggedFileRef.current.style.visibility = 'hidden'
            }
            stopDrag()
          }
        } else if (closestPathDropped && (performance.now() - 150 > isDraggingFile.current)) {
          //* If dropped on file path at the top
          const pathAttribute = closestPathDropped.getAttribute('data-path')
          if (draggedFileRef.current) {
            if (pathAttribute) {
              draggedFileRef.current.style.visibility = 'hidden'
              moveFile(selectedFile, pathAttribute)
            } else draggedFileRef.current.style.visibility = 'hidden'
            stopDrag()
          }
        } else {
          draggedFileRef.current!.style.visibility = 'hidden'
          stopDrag()
        }
        isDraggingFile.current = 0
      }
    }

    document.addEventListener("mousemove", moveDraggedFile)
    document.addEventListener("mouseup", dropFile)

    return () => {
      document.removeEventListener("mousemove", moveDraggedFile)
      document.removeEventListener("mouseup", dropFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  useEffect(() => {
    //* Set upload overlay height, hacky way of getting file list's scrollHeight
    if (dragOverlayRef.current) {
      dragOverlayRef.current.style.position = 'fixed'
      dragOverlayRef.current.style.height = `${fileListRef.current?.scrollHeight}px`
      dragOverlayRef.current.style.position = 'absolute'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragOverlayRef.current, fileArr])

  useEffect(() => {
    const keyDownListener = async (e: KeyboardEvent) => {
      //* Select all files Ctrl + A
      if (e.ctrlKey && e.key == 'a' && document.activeElement == fileListRef.current) e.preventDefault()
      if (e.ctrlKey && e.key == 'a' && fileArr && typeof fileArr !== 'string' && document.activeElement == fileListRef.current) {
        e.preventDefault()
        setSelectedFile(fileArr)
      }

      //* Copy files into directory Ctrl + V
      if (e.ctrlKey && e.key == 'v') {
        const clipboardData = await navigator.clipboard.read()
        //* If clipboard has text/html and file list has focus
        if (clipboardData.some(item => item.types.some(type => type.includes('text/html'))) && document.activeElement == fileListRef.current) {
          clipboardData.forEach(item => 
            item.getType('text/html')
            .then(async clipboardItem => {
              const text = await clipboardItem.text()
              const parsedText: { action: 'COPY' | 'CUT', files: string[] } = JSON.parse(text)
              
              //* Copy or cut/move file into current folder
              axios({
                method: 'POST',
                url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/${parsedText.action == 'COPY' ? 'copy' : 'move'}`,
                data: {
                  pathToFiles: parsedText.files,
                  newPath: (router.query.path as string[])?.join('/') ?? '/'
                },
                withCredentials: true
              })
              .then(() => setProcessInfo(`Copied files(s) sucessfully`))
              .catch(err => setProcessInfo('Something went wrong while copying files'))

              //* Clear clipboard if files were cut
              if (parsedText.action == 'CUT') 
                navigator.clipboard.writeText('').catch(err => {})
            })
            .catch(err => {})
          )
        }
      }
    }

    document.addEventListener("keydown", keyDownListener)

    return () => document.removeEventListener("keydown", keyDownListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileListRef.current, fileArr])

  useEffect(() => {
    const keyDownActions = async (e: KeyboardEvent) => {
      //* Copy link and list of paths to clipboard
      if (e.key == 'c' && e.ctrlKey && selectedFile.length) {
        const links = selectedFile.map(file => file.isDirectory ? `${location.origin}/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`).join(',')
        const htmlItem = {
          action: 'COPY',
          files: selectedFile.map(file => file.path)
        }
        const textItem = new ClipboardItem({
           'text/plain': new Blob([links], { type: 'text/plain' }),
           'text/html': new Blob([JSON.stringify(htmlItem)], { type: 'text/html' })
        })
        await navigator.clipboard.write([textItem])
        setProcessInfo('Item copied to clipboard')
      }

      //* Cut files into clipboard
      if (e.key == 'x' && e.ctrlKey && selectedFile.length) {
        const links = selectedFile.map(file => file.isDirectory ? `${location.origin}/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`).join(',')
        const htmlItem = {
          action: 'CUT',
          files: selectedFile.map(file => file.path)
        }
        const textItem = new ClipboardItem({
           'text/plain': new Blob([links], { type: 'text/plain' }),
           'text/html': new Blob([JSON.stringify(htmlItem)], { type: 'text/html' })
        })
        await navigator.clipboard.write([textItem])
        setProcessInfo('Item cut into clipboard')
      }

      //* Delete file with key Del
      if (e.key == 'Delete' && selectedFile.length) {
        setOpenDeleteConfirm(selectedFile)
      }
    }

    document.addEventListener("keydown", keyDownActions)

    return () => document.removeEventListener("keydown", keyDownActions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  function handleOnContextMenu(file: FileServerFile) {
    if (selectedFile.length <= 1 || !selectedFile.includes(file)) {
      setSelectedFile([file])
    }
    setContextMenu('file')
  }

  function handleSelect(e: React.MouseEvent, file: FileServerFile, index: number) {
    const selectItem = () => {
      if (fileArr instanceof Array) {
        if (e.shiftKey && selectedFile?.[0]) {
          let selectedFiles
          if (index > startingFileSelect.current!) {
            selectedFiles = fileArr.slice(startingFileSelect.current!, index + 1)
          } else selectedFiles = fileArr.slice(index, startingFileSelect.current! + 1)
          setSelectedFile(selectedFiles)
        } else if (e.ctrlKey) {
          //* Ctrl select functionality
          if (selectedFile.includes(file))
            setSelectedFile(selectedFile.filter(item => !isEqual(item, file)))
          else 
            setSelectedFile(selectedFile.concat([file]))
        } else {
          startingFileSelect.current = index
          setSelectedFile([file])
        }
      }
    }

    if (e.button === 1) {
      e.preventDefault()
      window.open(file.isDirectory ? `/files${file.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`, '_blank')
    }
    
    //* Determine if pressed element is file, start drag if mousedown on file name
    if (e.button === 0 && (e.target as HTMLElement).getAttribute('data-isfilename') == 'true') {
      const fileMouseDowned = fileRefs.current.filter(item => item.ref == e.currentTarget)[0]
      //* Fix for unable to unselect on pressing title with ctrl and shift
      if (!(selectedFile.includes(fileMouseDowned.file) && !e.ctrlKey && !e.shiftKey)) {
        selectItem()
      }
      isDraggingFile.current = performance.now()
    } else if (e.button === 0 && (e.currentTarget as HTMLElement).getAttribute('data-isfile') == 'true') {
      selectItem()
    }
  }

  if (fileArr == null) {
    //TODO: Better loading, don't use useLoading
    return (
      <div className='relative flex flex-col ml-0 md:ml-2 p-2 pt-0 h-full bg-black rounded-lg overflow-x-hidden overflow-y-auto outline-none select-none'>
        <div className='sticky z-10 top-0 mb-1 flex text-base md:text-lg border-b-[1px] bg-black'>
          <span className='relative hidden lg:flex items-center justify-center p-3 mr-0 min-w-[3rem] max-w-[3rem]'>#</span>
          <span className='p-3 flex-grow'>Name</span>
          <span className='p-3 min-w-[5rem] md:min-w-[8rem]'>Size</span>
          <span className='hidden lg:block p-3 min-w-[10rem]'>Created At</span>
        </div>
        <div className='h-full w-full flex flex-col gap-4 items-center justify-center text-2xl'>
          <CircularProgress size={50} />
        </div>
      </div>
    )
  }

  if (!(fileArr instanceof Array)) {
    return (
      <div className='relative flex flex-col ml-0 md:ml-2 p-2 pt-0 h-full bg-black rounded-lg overflow-x-hidden overflow-y-auto outline-none select-none'>
        <div className='sticky z-10 top-0 mb-1 flex text-base md:text-lg border-b-[1px] bg-black'>
          <span className='relative hidden lg:flex items-center justify-center p-3 mr-0 min-w-[3rem] max-w-[3rem]'>#</span>
          <span className='p-3 flex-grow'>Name</span>
          <span className='p-3 min-w-[5rem] md:min-w-[8rem]'>Size</span>
          <span className='hidden lg:block p-3 min-w-[10rem]'>Created At</span>
        </div>
        <div className='h-full w-full flex items-center justify-center text-2xl'>
          {fileArr}
        </div>
      </div>
    )
  }

  function handleDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('Files') && dragOverlayRef.current && dragOverlayTextRef.current) {
      const closestFileDropped = fileRefs.current.filter(item => (e.target as HTMLElement).closest("[data-isfile]") == item.ref)
      if (closestFileDropped[0] && closestFileDropped[0].file.isDirectory) {
          closestFileDropped[0].ref.style.outlineWidth = '1px'
          dragOverlayTextRef.current.innerText = closestFileDropped[0].file.name
      } else {
        dragOverlayTextRef.current.innerText = 'Current directory'
      }
      dragOverlayRef.current.style.opacity = '1'
    }
  }
  
  function handleDragLeave(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('Files') && dragOverlayRef.current) {
      fileRefs.current.forEach(element => element.ref.style.outlineWidth = '')
      dragOverlayRef.current.style.opacity = '0'
    }
  }

  return (
    <div
      {...getRootProps({
        onDrop: (e) => {if (e.dataTransfer.types.includes('Files') && dragOverlayRef.current) dragOverlayRef.current.style.opacity = '0'}
      })}
      data-cy='file-list'
      data-disableselect={false}
      ref={fileListRef}
      onBlur={() => {if (!contextMenu) setSelectedFile([])}}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onContextMenu={(e) => {if (e.target == fileListRef.current) setContextMenu('directory')}}
      className={`relative flex flex-col ml-0 md:ml-2 p-2 pt-0 h-full bg-black rounded-lg overflow-x-hidden overflow-y-auto outline-none select-none`}
    >
      <div className='sticky z-10 top-0 mb-1 flex text-base md:text-lg border-b-[1px] bg-black'>
        <span
          title='Sort by type'
          onClick={() => sortFileArr('type', fileArr, setFileArr, sortMethodRef)}
          className='relative hidden lg:flex items-center justify-center p-3 mr-0 min-w-[3rem] max-w-[3rem] cursor-pointer'>
          #
          {sortMethodRef.current.includes('type') &&
          <ArrowDropDownIcon style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }} className='absolute -right-1' />}
        </span>
        <span
          title='Sort by name'
          onClick={() => sortFileArr('name', fileArr, setFileArr, sortMethodRef)}
          className='p-3 flex-grow cursor-pointer'
        >
          Name
          {sortMethodRef.current.includes('name') &&
          <ArrowDropDownIcon style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }} />}
        </span>
        <span
          title='Sort by size'
          onClick={() => sortFileArr('size', fileArr, setFileArr, sortMethodRef)}
          className='p-3 min-w-[5rem] md:min-w-[8rem] cursor-pointer'
        >
          Size
          {sortMethodRef.current.includes('size') &&
          <ArrowDropDownIcon style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }} />}
        </span>
        <span
          title='Sort by date created'
          onClick={() => sortFileArr('created', fileArr, setFileArr, sortMethodRef)}
          className='hidden lg:block p-3 min-w-[10rem] cursor-pointer'
        >
          Created At
          {sortMethodRef.current.includes('created') &&
          <ArrowDropDownIcon style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }} />}
        </span>
      </div>
      {fileArr.map((file, index) => {
        const dateObj = new Date(file.created)
        return (
          <div
            key={index}
            ref={ref => {if (ref) fileRefs.current[index] = { file, ref }}}
            data-isfile
            data-filehierarchy
            onDoubleClick={() => file.isDirectory ? router.push(`/files${file.path}`) : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`)}
            onContextMenu={() => handleOnContextMenu(file)}
            onMouseDown={(e) => handleSelect(e, file, index)}
            style={{
              backgroundColor: selectedFile?.includes(file) ? 'rgb(107 114 128)' : 'unset'
            }}
            className={`flex text-base md:text-lg rounded-md cursor-default outline outline-0 outline-gray-500 hover:outline-1`}
          >
            <span className='hidden lg:block m-3 mr-0 min-w-[2.5rem] max-w-[2.5rem]'>{getIcon(file)}</span>
            <div 
              data-filehierarchy
              title={file.name}
              className='flex-grow line-clamp-1 overflow-hidden'
            >
              <span 
                data-isfilename
                className='flex p-3 w-fit'
              >
                {file.name}
              </span>
            </div>
            <span
              title={`${file.size} bytes`}
              className='p-3 min-w-[5rem] md:min-w-[8rem]'
            >
              {file.isDirectory ? '—' : prettyBytes(file.size, { space: true })}
            </span>
            <span
              title={dateObj.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',  
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
              className='hidden lg:block p-3 min-w-[10rem]'
            >
              {dateObj.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        )
      })}
      <DragSelectionArea 
        fileListRef={fileListRef} 
        fileArr={fileArr}
      />
      <DraggedFile ref={draggedFileRef} />
      <div
        data-cy='dragged-file'
        ref={dragOverlayRef}
        className='absolute top-0 left-0 z-20 h-full w-full pointer-events-none opacity-0 transition-all duration-100'
      >
        <div className='z-20 h-full w-full bg-blue-300 border-2 border-solid border-blue-500 opacity-30 pointer-events-none' />
        <span className='flex flex-col items-center gap-2 fixed top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 text-xl bg-sky-600 rounded-lg'>
          <FileUploadIcon fontSize='large' />
          Drop files to upload into
          <span 
            ref={dragOverlayTextRef}
            className='font-bold'
          />
        </span>
      </div>
      <input {...getInputProps()} />
    </div>
  )
}