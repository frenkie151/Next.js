import dynamic from 'next/dynamic'
import Head from 'next/head'

// The app reads the clock and local time zone, so it renders in the browser only.
const DetentionApp = dynamic(() => import('../components/DetentionApp'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>Detention Rig</title>
        <meta name="description" content="Track truck detention live, see what to bill, and send the broker request in one tap." />
      </Head>
      <DetentionApp />
    </>
  )
}
