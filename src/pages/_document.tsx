import Header from '@/components/Header';
import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <div className="flex justify-center items-center flex-col">
          <Header />
          <Main />
          <NextScript />
        </div>
      </body>
    </Html>
  )
}
