import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import axios from 'axios'
import prettyBytes from 'pretty-bytes'
import Link from 'next/link'

export async function getServerSideProps({ req, res, params }: GetServerSidePropsContext) {
  const fileArr = await axios.get(`${process.env.NEXT_PUBLIC_FILE_SERVER_URL!}/list/${(params?.path as string[])?.join('/') ?? ''}`)

  return {
    props: {
      params: params?.path ?? [],
      fileArr: fileArr.data
    },
  } 
}

export default function Files({ params, fileArr }: { params: string[], fileArr: any[] }) {
  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="flex items-center justify-center">
        <section className='h-[calc(100dvh-60px)] w-[20%] bg-gray-500'>
          
        </section>
        <section className='p-12 h-[calc(100dvh-60px)] w-[80%] bg-slate-600'>
          <span className='text-xl'>
            <Link 
              href={''}
              className='p-2 rounded-md hover:bg-gray-500'
            >
              Files
            </Link>
            {params.map((item, index) => (
              <>
                /
                <Link 
                  key={index}
                  href={params.slice(0, index + 1).join('/')}
                  className='p-2 rounded-md hover:bg-gray-500'
                >
                  {item}
                </Link>
              </>
            ))}
          </span>
          <FileList fileArr={fileArr} />
        </section>
      </main>
    </>
  )
}

function FileList({ fileArr }: { fileArr: any[] | string }) {
  if (!(fileArr instanceof Array)) {
    return (
      <div className='flex flex-col m-4 p-2 pt-0 h-full w-full bg-black rounded-lg overflow-auto'>
        <div className='sticky top-0 flex text-lg border-b-[1px] bg-black'>
          <span className='p-3 flex-grow'>Name</span>
          <span className='p-3 min-w-[10rem]'>Size</span>
          <span className='p-3 min-w-[10rem]'>Created At</span>
        </div>
        <div className='h-full w-full flex items-center justify-center text-2xl'>
          Directory not found
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col m-4 p-2 pt-0 h-full w-full bg-black rounded-lg overflow-auto'>
      <div className='sticky top-0 flex text-lg border-b-[1px] bg-black'>
        <span className='p-3 flex-grow'>Name</span>
        <span className='p-3 min-w-[10rem]'>Size</span>
        <span className='p-3 min-w-[10rem]'>Created At</span>
      </div>
      {fileArr.map((item, index) => {
        return (
          <Link 
            key={index}
            href={item.isDirectory ? `/files${item.path}` : `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/retrieve${item.path}`}
            className='flex text-lg rounded-md cursor-pointer hover:bg-gray-500'
          >
            <span className='p-3 flex-grow'>{item.name}</span>
            <span className='p-3 min-w-[10rem]'>{prettyBytes(item.size)}</span>
            <span className='p-3 min-w-[10rem]'>
              {new Date(item.created).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </Link>
        )
      })}
    </div>
  )
}