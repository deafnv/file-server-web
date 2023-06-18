import { FormEvent, forwardRef, ForwardedRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Search from '@mui/icons-material/Search'

function SearchBar(_: any, ref: ForwardedRef<HTMLInputElement>) {
  const [isSearching, setIsSearching] = useState(true)

  const router = useRouter()

  //* Prevent searching too fast
  useEffect(() => {
    setTimeout(() => setIsSearching(false), 500)
  }, [router.query])

  function search(e: FormEvent) {
    e.preventDefault()

    if (isSearching) return
    setIsSearching(true)

    const target = e.target as HTMLFormElement
    router.push(`/search?q=${(target[0] as HTMLInputElement).value}`)
  }

  return (
    <div className='flex items-center gap-2 pl-3 pr-6 h-2/3 w-1/2 bg-foreground rounded-full'>
      <Search />
      <form onSubmit={search} className='w-full'>
        <input
          ref={ref}
          placeholder='Search files / folders'
          className='w-full bg-transparent outline-none placeholder:text-text/50'
        />
      </form>
    </div>
  )
}

export default forwardRef(SearchBar)
