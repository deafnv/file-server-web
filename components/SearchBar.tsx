import { FormEvent, forwardRef, ForwardedRef, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, m } from 'framer-motion'
import Search from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useLocalStorage } from '@/lib/methods'

function SearchBar(_: any, ref: ForwardedRef<HTMLInputElement>) {
  const searchFormRef = useRef<HTMLFormElement>(null)
  const filterSettingsRef = useRef<HTMLDivElement>(null)
  const filterSettingsButtonRef = useRef<HTMLButtonElement>(null)
  const currentDirectoryRef = useRef('')
  const isSearchingRef = useRef(true)

  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useLocalStorage('searchopts', {
    file: true,
    directory: true,
    location: false,
  })

  const router = useRouter()

  //* Prevent searching too fast
  useEffect(() => {
    setTimeout(() => (isSearchingRef.current = false), 500)
  }, [router.query])

  useEffect(() => {
    if (router.asPath.startsWith('/files')) {
      const { path } = router.query
      const joinPath = path?.length ? (path as string[]).join('/') : ''
      currentDirectoryRef.current = joinPath ? `/${joinPath}` : '/'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])

  useEffect(() => {
    const exitFilterSettings = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        !filterSettingsButtonRef.current?.contains(target) &&
        !filterSettingsRef.current?.contains(target)
      ) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', exitFilterSettings)

    return () => {
      document.removeEventListener('mousedown', exitFilterSettings)
    }
  }, [])

  function search(e: FormEvent) {
    e.preventDefault()
    const target = e.target as HTMLFormElement

    if (isSearchingRef.current || (target[0] as HTMLInputElement).value == '') return
    isSearchingRef.current = true

    //FIXME: Change this
    let typeFilters = ''
    if (!(filters.file && filters.directory)) {
      typeFilters = filters.file ? 'file' : 'directory'
    }

    //* Build search url
    let searchUrl = `/search?q=${(target[0] as HTMLInputElement).value}`
    if (typeFilters) searchUrl += `&filter=${typeFilters}`
    if (filters.location) searchUrl += `&parent=${encodeURIComponent(currentDirectoryRef.current)}`

    router.push(searchUrl)
  }

  function handleTypeFilterChange(key: 'file' | 'directory', value: boolean) {
    const otherType = key == 'file' ? 'directory' : 'file'
    //* Disallow unselecting both types
    if (!filters[otherType]) {
      setFilters((val) => ({
        ...val,
        [key]: false,
        [otherType]: true,
      }))
    } else {
      setFilters((val) => ({
        ...val,
        [key]: value,
      }))
    }
  }

  function handleLocationFilterChange(key: 'location', value: boolean) {
    setFilters((val) => ({
      ...val,
      [key]: value,
    }))
  }

  let searchPlaceholder = 'Search '
  if (filters.file && filters.directory) {
    searchPlaceholder += 'files / folders'
  } else if (filters.file) {
    searchPlaceholder += 'files'
  } else {
    searchPlaceholder += 'folders'
  }

  return (
    <div className='relative flex items-center gap-2 pl-3 pr-1 h-2/3 w-1/2 bg-foreground rounded-full'>
      <div onClick={() => searchFormRef.current?.requestSubmit()} className='cursor-pointer'>
        <Search />
      </div>
      <form ref={searchFormRef} onSubmit={search} className='w-full'>
        <input
          ref={ref}
          placeholder={`${searchPlaceholder}${
            filters.location
              ? ` in "${currentDirectoryRef.current.split('/').slice(-1)[0] || 'Root'}"`
              : ''
          }`}
          className='w-full bg-transparent outline-none placeholder:text-text/50'
        />
      </form>
      <IconButton ref={filterSettingsButtonRef} onClick={() => setShowFilters((val) => !val)}>
        <TuneIcon />
      </IconButton>
      <AnimatePresence>
        {showFilters && (
          <m.div
            ref={filterSettingsRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: 'easeInOut', duration: 0.15 }}
            style={{ originY: 0.1 }}
            className='absolute top-[45px] right-0 flex flex-col gap-2 p-2 pl-4 max-w-2xl bg-foreground rounded-md shadow-lg shadow-black select-none overflow-hidden'
          >
            <div>
              <p className='p-1 cursor-default'>Include types</p>
              <FormGroup>
                <FormControlLabel
                  label='Files'
                  control={
                    <Checkbox
                      checked={filters.file}
                      onChange={(e) =>
                        handleTypeFilterChange('file', (e.target as HTMLInputElement).checked)
                      }
                    />
                  }
                />
                <FormControlLabel
                  label='Folders'
                  control={
                    <Checkbox
                      checked={filters.directory}
                      onChange={(e) =>
                        handleTypeFilterChange('directory', (e.target as HTMLInputElement).checked)
                      }
                    />
                  }
                />
              </FormGroup>
            </div>
            <div>
              <p className='p-1 cursor-default'>Location</p>
              <FormGroup>
                <FormControlLabel
                  label={`Search in "${
                    currentDirectoryRef.current.split('/').slice(-1)[0] || 'Root'
                  }"`}
                  control={
                    <Checkbox
                      checked={filters.location}
                      onChange={(e) =>
                        handleLocationFilterChange(
                          'location',
                          (e.target as HTMLInputElement).checked
                        )
                      }
                    />
                  }
                  className='break-all line-clamp-1'
                />
              </FormGroup>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default forwardRef(SearchBar)
