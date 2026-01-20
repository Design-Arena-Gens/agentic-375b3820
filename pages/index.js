import Head from 'next/head';
import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <>
      <Head>
        <title>Elegant Calculator</title>
        <meta name="description" content="A modern calculator with history, built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <Calculator />
    </>
  );
}
