import { FormEvent, forwardRef, ForwardedRef, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, m } from 'framer-motion'
import Search from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'

function SearchBar(_: any, ref: ForwardedRef<HTMLInputElement>) {
  const filterSettingsRef = useRef<HTMLDivElement>(null)
  const filterSettingsButtonRef = useRef<HTMLButtonElement>(null)

  const [isSearching, setIsSearching] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    file: true,
    directory: true,
  })

  const router = useRouter()

  //* Prevent searching too fast
  useEffect(() => {
    setTimeout(() => setIsSearching(false), 500)
  }, [router.query])

  useEffect(() => {
    const exitSettingsFilter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        !filterSettingsButtonRef.current?.contains(target) &&
        !filterSettingsRef.current?.contains(target)
      ) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', exitSettingsFilter)

    return () => {
      document.removeEventListener('mousedown', exitSettingsFilter)
    }
  }, [])

  function search(e: FormEvent) {
    e.preventDefault()
    const target = e.target as HTMLFormElement

    if (isSearching || (target[0] as HTMLInputElement).value == '') return
    setIsSearching(true)

    //FIXME: Change this
    let typeFilters = ''
    if (!(filters.file && filters.directory)) {
      typeFilters = filters.file ? 'file' : 'directory'
    }

    router.push(
      `/search?q=${(target[0] as HTMLInputElement).value}${
        typeFilters ? `&filter=${typeFilters}` : ''
      }`
    )
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

  return (
    <div className='relative flex items-center gap-2 pl-3 pr-1 h-2/3 w-1/2 bg-foreground rounded-full'>
      <Search />
      <form onSubmit={search} className='w-full'>
        <input
          ref={ref}
          placeholder='Search files / folders'
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
            className='absolute top-[45px] right-0 flex flex-col p-2 pl-4 bg-foreground rounded-md shadow-md shadow-black select-none'
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
                  label='Directories'
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
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default forwardRef(SearchBar)
