import path from 'path'
import { Fragment, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios, { AxiosError } from 'axios'
import { deleteCookie, getCookie } from 'cookies-next'
import prettyBytes from 'pretty-bytes'
import isEqual from 'lodash/isEqual'
import CircularProgress from '@mui/material/CircularProgress'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import RedoIcon from '@mui/icons-material/Redo'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { getIcon, sortFileArr } from '@/lib/methods'
import { FileListProps, FileServerFile } from '@/lib/types'
import DragSelectionArea from '@/components/DragSelection'
import { useLoading } from '@/components/contexts/LoadingContext'
import { useAppContext } from '@/components/contexts/AppContext'
import DraggedFile from '@/components/DraggedFile'

export default function FileList({
  isSearching = false,
  fileRefs,
  fileListRef,
  sortMethodRef,
  getRootProps,
  getInputProps,
}: FileListProps) {
  const startingFileSelect = useRef<number | null>(null)
  const dragOverlayRef = useRef<HTMLDivElement>(null)
  const dragOverlayTextRef = useRef<HTMLSpanElement>(null)
  const draggedFileRef = useRef<HTMLDivElement>(null)
  const timeSinceStartDrag = useRef(0)
  const allowDragSelect = useRef(true) //? For dragging selected file

  const [locationHover, setLocationHover] = useState<boolean[]>([])
  const [fileArrLoaded, setFileArrLoaded] = useState(false)

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
    setOpenDeleteConfirm,
  } = useAppContext()

  useEffect(() => {
    const preventShiftSelect = (e: any) => {
      document.onselectstart = function () {
        return !(e.key == 'Shift' && e.shiftKey)
      }
    }

    ;['keyup', 'keydown'].forEach(function (event) {
      window.addEventListener(event, preventShiftSelect)
    })

    return () => {
      ;['keyup', 'keydown'].forEach((event) => {
        window.removeEventListener(event, preventShiftSelect)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //* Prevent animation from triggering before load
  //FIXME: Make this less hacky
  useEffect(() => {
    if (fileArr?.length) {
      setTimeout(() => setFileArrLoaded(true), 350)
    } else {
      setFileArrLoaded(false)
    }
  }, [fileArr])

  useEffect(() => {
    //* Allows navigation of file list with arrow keys and enter
    //FIXME: Weird interactions with ctrl + a select all
    const keyboardNavigate = (e: KeyboardEvent) => {
      const navigationKeys = ['ArrowDown', 'ArrowUp', 'Enter']

      if (!(fileArr instanceof Array) || !navigationKeys.includes(e.key)) return

      //* Allow navigation only if selected file, or body is active element (allows immediate keyboard navigation)
      if (
        (!selectedFile.length && document.activeElement?.tagName !== 'BODY') ||
        (document.activeElement?.tagName !== 'BODY' &&
          document.activeElement !== fileListRef.current)
      )
        return

      const lastSelectedFile = selectedFile[selectedFile.length - 1]
      const lastSelectedFileIndex = fileArr.lastIndexOf(lastSelectedFile)
      let toSelect: FileServerFile[] = []
      let shouldSet: boolean = true //* Set to false if at top or bottom of list
      switch (e.key) {
        case 'ArrowDown':
          if (
            selectedFile.includes(fileArr[fileArr.length - 1]) &&
            selectedFile.length !== fileArr.length
          ) {
            shouldSet = false
            break
          }
          toSelect = !selectedFile.length ? [fileArr[0]] : [fileArr[lastSelectedFileIndex + 1]]
          if (!e.shiftKey)
            startingFileSelect.current = !selectedFile.length ? 0 : lastSelectedFileIndex + 1
          break
        case 'ArrowUp':
          if (selectedFile.includes(fileArr[0]) && selectedFile.length !== fileArr.length) {
            shouldSet = false
            break
          }
          toSelect = !selectedFile.length ? [fileArr[0]] : [fileArr[lastSelectedFileIndex - 1]]
          if (!e.shiftKey)
            startingFileSelect.current = !selectedFile.length ? 0 : lastSelectedFileIndex - 1
          break
        case 'Enter':
          shouldSet = false
          if (selectedFile.length !== 1) break
          selectedFile[0].isDirectory
            ? router.push(`/files${selectedFile[0].path}`)
            : router.push(
                `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${selectedFile[0].path}`
              )
        default:
          break
      }
      //* If shift key pressed behave combine selections, or remove them
      if (e.shiftKey) {
        if (selectedFile.includes(toSelect[0])) toSelect = selectedFile.slice(0, -1)
        else toSelect = selectedFile.concat(toSelect)
      }
      //? I have no clue why there is undefined in the array, but this fixes it. Something with ctrl + a
      if (shouldSet) {
        setSelectedFile(toSelect.filter((item) => item))
        fileListRef.current?.focus()
      }
    }

    document.addEventListener('keydown', keyboardNavigate)

    return () => document.removeEventListener('keydown', keyboardNavigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileArr, selectedFile])

  async function moveFile(files: FileServerFile[], directory: FileServerFile | string) {
    if (files.length == 0) return
    if (!getCookie('userdata')) return setLoggedOutWarning(true)
    setLoading(true)
    try {
      await axios({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/move`,
        data: {
          pathToFiles: files?.map((file) =>
            file.isShortcut ? file.isShortcut.shortcutPath : file.path
          ),
          newPath: typeof directory == 'string' ? directory : directory.path,
        },
        withCredentials: true,
      })
      setLoading(false)
      setSelectedFile([])
      const directoryParse =
        typeof directory == 'string' ? path.parse(directory).name : path.parse(directory.path).name
      setProcessInfo(
        files.length > 1
          ? `Moved ${files.length} files into ${directoryParse ? directoryParse : 'Root'}`
          : `Moved ${files[0].name} into ${directoryParse ? directoryParse : 'Root'}`
      )
    } catch (err) {
      if ((err as AxiosError).response?.status == 403) {
        setProcessError('Error: Forbidden')
      } else if ((err as AxiosError).response?.status == 401) {
        alert('Error: Unauthorized, try logging in again.')
        deleteCookie('userdata')
        router.reload()
      } else {
        alert(`Error. The server is probably down. ${err}`)
      }
      setLoading(false)
    }
  }

  function stopDrag() {
    //* Remove greyed out effect on stop drag
    const selectedFileRefs = fileRefs.current.filter((item) => selectedFile.includes(item.file))
    selectedFileRefs.forEach((item) => {
      item.ref.style.opacity = ''
      item.ref.style.backgroundColor = ''
    })

    //* Remove dragged file visual
    if (draggedFileRef.current) draggedFileRef.current.style.visibility = 'hidden'

    allowDragSelect.current = true
    timeSinceStartDrag.current = 0
  }

  useEffect(() => {
    const moveDraggedFile = (e: MouseEvent) => {
      //TODO: Refactor/remove useless code
      if (timeSinceStartDrag.current) {
        const closestFileHovered = fileRefs.current.filter(
          (item) => (e.target as HTMLElement).closest('[data-isfile]') == item.ref
        )
        if (closestFileHovered.length && performance.now() - 150 > timeSinceStartDrag.current) {
          //! File moving animation here (file under mouse, outline hovered files)
        }

        if (draggedFileRef.current && performance.now() - 150 > timeSinceStartDrag.current) {
          //* Make selected files greyed out while dragging them
          const selectedFileRefs = fileRefs.current.filter((item) =>
            selectedFile.includes(item.file)
          )
          selectedFileRefs.forEach((item) => {
            item.ref.style.opacity = '0.3'
            item.ref.style.backgroundColor = 'gray'
          })

          draggedFileRef.current.style.visibility = 'visible'
          draggedFileRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
        }
      }
    }

    const dropFile = (e: MouseEvent) => {
      if (timeSinceStartDrag.current) {
        const closestFileDropped = fileRefs.current.filter(
          (item) => (e.target as HTMLElement).closest('[data-isfile]') == item.ref
        )
        const closestPathDropped = (e.target as HTMLElement).closest('[data-isdirpath]')

        //* If dropped on file, and has been dragged for at least 150ms
        if (performance.now() - 150 > timeSinceStartDrag.current) {
          if (closestFileDropped.length) {
            //* If dropping into directory, and directory is not selected
            if (
              closestFileDropped[0].file.isDirectory &&
              !selectedFile.includes(closestFileDropped[0].file)
            ) {
              moveFile(selectedFile, closestFileDropped[0].file)
            }
          } else if (closestPathDropped) {
            //* If dropped on file path at the top
            const pathAttribute = closestPathDropped.getAttribute('data-path')
            if (pathAttribute) {
              moveFile(selectedFile, pathAttribute)
            }
          }
        } else if (!e.ctrlKey && !e.shiftKey) {
          //* Select file if not actually dragging anything and not ctrl/shift selecting
          setSelectedFile([closestFileDropped[0].file])
        }

        stopDrag()
      }
    }

    document.addEventListener('mousemove', moveDraggedFile)
    document.addEventListener('mouseup', dropFile)

    return () => {
      document.removeEventListener('mousemove', moveDraggedFile)
      document.removeEventListener('mouseup', dropFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  //* Stop dragging after switching directories
  useEffect(() => {
    setSelectedFile([])
    stopDrag()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])

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
      if (e.ctrlKey && e.key == 'a' && document.activeElement == fileListRef.current)
        e.preventDefault()
      if (
        e.ctrlKey &&
        e.key == 'a' &&
        fileArr &&
        typeof fileArr !== 'string' &&
        document.activeElement == fileListRef.current
      ) {
        e.preventDefault()
        setSelectedFile(fileArr)
      }

      //* Copy files into directory Ctrl + V
      if (e.ctrlKey && e.key == 'v') {
        const clipboardData = await navigator.clipboard.read()
        //* If clipboard has text/html and file list has focus
        if (
          clipboardData.some((item) => item.types.some((type) => type.includes('text/html'))) &&
          document.activeElement == fileListRef.current
        ) {
          clipboardData.forEach((item) =>
            item
              .getType('text/html')
              .then(async (clipboardItem) => {
                const text = await clipboardItem.text()
                const parsedText: { action: 'COPY' | 'CUT'; files: string[] } = JSON.parse(text)

                //* Copy or cut/move file into current folder
                axios({
                  method: 'POST',
                  url: `${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/${
                    parsedText.action == 'COPY' ? 'copy' : 'move'
                  }`,
                  data: {
                    pathToFiles: parsedText.files,
                    newPath: (router.query.path as string[])?.join('/') ?? '/',
                  },
                  withCredentials: true,
                })
                  .then(() => setProcessInfo(`Copied files(s) sucessfully`))
                  .catch((err) => setProcessInfo('Something went wrong while copying files'))

                //* Clear clipboard if files were cut
                if (parsedText.action == 'CUT') navigator.clipboard.writeText('').catch((err) => {})
              })
              .catch((err) => {})
          )
        }
      }
    }

    document.addEventListener('keydown', keyDownListener)

    return () => document.removeEventListener('keydown', keyDownListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileListRef.current, fileArr])

  useEffect(() => {
    const keyDownActions = async (e: KeyboardEvent) => {
      //* Copy link and list of paths to clipboard
      if (e.key == 'c' && e.ctrlKey && selectedFile.length) {
        const links = selectedFile
          .map((file) =>
            file.isDirectory
              ? `${location.origin}/files${file.path}`
              : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`
          )
          .join(',')
        const htmlItem = {
          action: 'COPY',
          files: selectedFile.map((file) =>
            file.isShortcut ? file.isShortcut.shortcutPath : file.path
          ),
        }

        const textItem = new ClipboardItem({
          'text/plain': new Blob([links], { type: 'text/plain' }),
          'text/html': new Blob([JSON.stringify(htmlItem)], { type: 'text/html' }),
        })
        await navigator.clipboard.write([textItem])
        setProcessInfo('Item copied to clipboard')
      }

      //* Cut files into clipboard
      if (e.key == 'x' && e.ctrlKey && selectedFile.length) {
        const links = selectedFile
          .map((file) =>
            file.isDirectory
              ? `${location.origin}/files${file.path}`
              : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`
          )
          .join(',')
        const htmlItem = {
          action: 'CUT',
          files: selectedFile.map((file) =>
            file.isShortcut ? file.isShortcut.shortcutPath : file.path
          ),
        }
        const textItem = new ClipboardItem({
          'text/plain': new Blob([links], { type: 'text/plain' }),
          'text/html': new Blob([JSON.stringify(htmlItem)], { type: 'text/html' }),
        })
        await navigator.clipboard.write([textItem])
        setProcessInfo('Item cut into clipboard')
      }

      //* Delete file with key Del
      if (e.key == 'Delete' && selectedFile.length) {
        setOpenDeleteConfirm(selectedFile)
      }
    }

    document.addEventListener('keydown', keyDownActions)

    return () => document.removeEventListener('keydown', keyDownActions)
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
          if (selectedFile.includes(file)) {
            setSelectedFile(selectedFile.filter((item) => !isEqual(item, file)))
          } else {
            setSelectedFile(selectedFile.concat([file]))
          }
        } else {
          startingFileSelect.current = index
          setSelectedFile([file])
        }
      }
    }

    if (e.button === 1) {
      e.preventDefault()
      window.open(
        file.isDirectory
          ? `/files${file.path}`
          : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`,
        '_blank'
      )
    }

    //* Determine if pressed element is file, start drag if mousedown on file name or file is selected
    if (
      e.button === 0 &&
      ((e.target as HTMLElement).getAttribute('data-isfilename') == 'true' ||
        selectedFile.includes(file))
    ) {
      allowDragSelect.current = false
      //* To allow drag multiple files, and fixes ctrlkey/shiftkey behavior
      if (!(selectedFile.includes(file) && !e.ctrlKey && !e.shiftKey)) {
        selectItem()
      }
      timeSinceStartDrag.current = performance.now()
    } else if (
      e.button === 0 &&
      (e.currentTarget as HTMLElement).getAttribute('data-isfile') == 'true'
    ) {
      selectItem()
    }
  }

  if (fileArr == null) {
    //TODO: Better loading, don't use useLoading
    return (
      <div className='relative flex flex-col ml-0 md:ml-2 p-2 pt-0 h-full bg-foreground md:rounded-lg overflow-x-hidden overflow-y-auto outline-none select-none'>
        <div className='sticky z-10 top-0 mb-1 flex text-base md:text-lg border-b bg-foreground'>
          <span className='relative hidden lg:flex items-center justify-center p-3 mr-0 min-w-[3rem] max-w-[3rem]'>
            #
          </span>
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
      <div className='relative flex flex-col ml-0 md:ml-2 p-2 pt-0 h-full bg-foreground md:rounded-lg overflow-x-hidden overflow-y-auto outline-none select-none'>
        <div className='sticky z-10 top-0 mb-1 flex text-base md:text-lg border-b bg-foreground'>
          <span className='relative hidden lg:flex items-center justify-center p-3 mr-0 min-w-[3rem] max-w-[3rem]'>
            #
          </span>
          <span className='p-3 flex-grow'>Name</span>
          <span className='p-3 min-w-[5rem] md:min-w-[8rem]'>Size</span>
          <span className='hidden lg:block p-3 min-w-[10rem]'>Created At</span>
        </div>
        <div className='h-full w-full flex items-center justify-center text-2xl'>{fileArr}</div>
      </div>
    )
  }

  function handleDragOver(e: React.DragEvent) {
    if (
      e.dataTransfer.types.includes('Files') &&
      dragOverlayRef.current &&
      dragOverlayTextRef.current
    ) {
      const closestFileDropped = fileRefs.current.filter(
        (item) => (e.target as HTMLElement).closest('[data-isfile]') == item.ref
      )
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
      fileRefs.current.forEach((element) => (element.ref.style.outlineWidth = ''))
      dragOverlayRef.current.style.opacity = '0'
    }
  }

  function handleLocationHover(index: number, state: boolean) {
    setLocationHover((val) => {
      let newArr = [...val]
      newArr[index] = state
      return newArr
    })
  }

  return (
    <div
      {...getRootProps?.({
        onDrop: (e) => {
          if (e.dataTransfer.types.includes('Files') && dragOverlayRef.current)
            dragOverlayRef.current.style.opacity = '0'
        },
      })}
      data-cy='file-list'
      data-disableselect={false}
      ref={fileListRef}
      onBlur={() => {
        if (!contextMenu) setSelectedFile([])
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onContextMenu={(e) => {
        if (e.target == fileListRef.current) setContextMenu('directory')
      }}
      className='relative flex flex-col ml-0 md:ml-2 p-2 pt-0 h-full max-w-[100dvw] bg-foreground md:rounded-lg overflow-x-hidden overflow-y-auto outline-none select-none'
    >
      <div className='sticky z-10 top-0 mb-1 flex text-base border-b bg-foreground'>
        <span
          title='Sort by type'
          onClick={() => sortFileArr('type', fileArr, setFileArr, sortMethodRef)}
          className='relative flex items-center justify-center p-3 mr-0 min-w-[3rem] max-w-[3rem] cursor-pointer'
        >
          #
          {sortMethodRef.current.includes('type') && (
            <ArrowDropDownIcon
              style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }}
              className='absolute -right-1'
            />
          )}
        </span>
        <span
          title='Sort by name'
          onClick={() => sortFileArr('name', fileArr, setFileArr, sortMethodRef)}
          className='p-3 flex-grow cursor-pointer'
        >
          Name
          {sortMethodRef.current.includes('name') && (
            <ArrowDropDownIcon
              style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }}
            />
          )}
        </span>
        <span
          title='Sort by date created'
          onClick={() => sortFileArr('created', fileArr, setFileArr, sortMethodRef)}
          className='hidden lg:block p-3 min-w-[10rem] cursor-pointer'
        >
          Date modified
          {sortMethodRef.current.includes('created') && (
            <ArrowDropDownIcon
              style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }}
            />
          )}
        </span>
        <span
          title='Sort by size'
          onClick={() => sortFileArr('size', fileArr, setFileArr, sortMethodRef)}
          className='p-3 min-w-[5rem] md:min-w-[8rem] cursor-pointer'
        >
          Size
          {sortMethodRef.current.includes('size') && (
            <ArrowDropDownIcon
              style={{ transform: sortMethodRef.current.includes('asc') ? 'rotate(180deg)' : '' }}
            />
          )}
        </span>
        {isSearching && <span className='hidden lg:block p-3 min-w-[8rem] w-[8rem]'>Location</span>}
      </div>
      {fileArr.map((file, index) => {
        const dateObj = new Date(file.modified)
        const currentSelected = selectedFile.includes(file)
        return (
          <div
            key={index}
            ref={(ref) => {
              if (ref) fileRefs.current[index] = { file, ref }
            }}
            data-isfile
            data-filehierarchy
            onDoubleClick={() =>
              file.isDirectory
                ? router.push(`/files${file.path}`)
                : router.push(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${file.path}`)
            }
            onContextMenu={() => handleOnContextMenu(file)}
            onMouseDown={(e) => handleSelect(e, file, index)}
            className={`relative flex text-base rounded-md cursor-default ${
              currentSelected ? 'bg-secondary' : 'hover:bg-secondary/40'
            }`}
          >
            <span className='relative lg:block m-3 mr-0 min-w-[2.5rem] max-w-[2.5rem] pointer-events-none'>
              {getIcon(file)}
              {file.isShortcut && (
                <div className='absolute flex items-center justify-center bottom-0 left-0 h-4 w-4 text-sm rounded-full bg-gray-600'>
                  <RedoIcon fontSize='inherit' className='-rotate-90' />
                </div>
              )}
            </span>
            <div
              data-filehierarchy
              title={file.name}
              className='flex-grow line-clamp-1 max-w-full p-3 overflow-hidden'
            >
              <p
                data-isfilename
                className='max-w-fit text-ellipsis whitespace-nowrap overflow-hidden'
              >
                {file.name}
              </p>
            </div>
            <span
              title={dateObj.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              className='hidden lg:block p-3 min-w-[10rem]'
            >
              {dateObj.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span title={`${file.size} bytes`} className='p-3 min-w-[5rem] md:min-w-[8rem]'>
              {file.isDirectory ? '—' : prettyBytes(file.size, { space: true })}
            </span>
            {isSearching && (
              <div
                title={path.basename(path.dirname(file.path))}
                onMouseEnter={() => handleLocationHover(index, true)}
                onMouseLeave={() => handleLocationHover(index, false)}
                className='relative hidden lg:block min-w-[8rem] w-[8rem]'
              >
                <div className='p-1 overflow-hidden text-ellipsis'>
                  <p className='block p-2 max-w-min text-ellipsis whitespace-nowrap overflow-hidden rounded-full'>
                    {path.dirname(file.path) != '/'
                      ? path.basename(path.dirname(file.path))
                      : 'Root'}
                  </p>
                </div>
                <div
                  className={`absolute top-0 right-0 z-10 hidden lg:flex gap-1 p-2 w-fit min-w-[8rem] bg-background rounded-full ${
                    locationHover[index]
                      ? 'animate-in fade-in zoom-in-95 origin-right ease-in'
                      : `animate-out fade-out zoom-out-95 origin-right fill-mode-forwards pointer-events-none ${
                          fileArrLoaded ? '' : 'duration-0'
                        }`
                  }`}
                >
                  {path
                    .dirname(file.path)
                    .split('/')
                    .map((segment, index) => {
                      const link = path
                        .dirname(file.path)
                        .split('/')
                        .slice(0, index + 1)
                        .join('/')

                      if (!(!segment && index > 0))
                        return (
                          <Fragment key={segment}>
                            {index != 0 && (
                              <div className='flex items-center'>
                                <ChevronRightIcon />
                              </div>
                            )}
                            <Link
                              href={link ? `/files${link}` : '/files'}
                              style={{
                                minWidth:
                                  index == path.dirname(file.path).split('/').length - 1
                                    ? '8rem'
                                    : 'initial',
                              }}
                              className='p-2 whitespace-nowrap hover:bg-secondary rounded-full transition-colors'
                            >
                              {segment ? segment : 'Root'}
                            </Link>
                          </Fragment>
                        )
                    })}
                </div>
              </div>
            )}
          </div>
        )
      })}
      <DragSelectionArea
        fileListRef={fileListRef}
        allowDragSelect={allowDragSelect}
        fileArr={fileArr}
      />
      <DraggedFile ref={draggedFileRef} />
      <div
        data-cy='dragged-file'
        ref={dragOverlayRef}
        className='absolute top-0 left-0 z-20 h-full w-full pointer-events-none opacity-0 transition-all duration-100'
      >
        <div className='z-20 h-full w-full bg-primary border-2 border-solid border-primary opacity-30 pointer-events-none' />
        <span className='flex flex-col items-center gap-2 fixed top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 text-xl bg-primary rounded-lg'>
          <FileUploadIcon fontSize='large' />
          Drop files to upload into
          <span ref={dragOverlayTextRef} className='font-bold' />
        </span>
      </div>
      {getInputProps && <input {...getInputProps()} />}
    </div>
  )
}
