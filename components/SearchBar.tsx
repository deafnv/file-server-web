import { FormEvent, forwardRef, ForwardedRef } from 'react'
import { useRouter } from 'next/router'
import Search from '@mui/icons-material/Search'

function SearchBar(_: any, ref: ForwardedRef<HTMLInputElement>) {
  const router = useRouter()

  function search(e: FormEvent) {
    const target = e.target as HTMLFormElement
    e.preventDefault()
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
