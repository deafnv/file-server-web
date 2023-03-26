import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import axios from 'axios'
import FileList from '@/components/FileList'

export default function Files({ fileArr }: { fileArr: any[] }) {
  console.log(fileArr)

  return (
    <>
      <Head>
        <title>File Server</title>
        <meta name="description" content="File Server" />
      </Head>
      <main className="flex flex-col items-center justify-center gap-4 xl:mx-96 lg:mx-80 sm:mx-36">
        <h2>Test</h2>
        <FileList fileArr={fileArr} />
      </main>
    </>
  )
}

export async function getServerSideProps({ req, res, params }: GetServerSidePropsContext) {
  const fileArr = await axios.get(`${process.env.FILE_SERVER_URL!}/list/${(params?.path as string[])?.join('/')}`)

  return {
    props: {
      fileArr: fileArr.data
    },
  } 
}
