import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'semantic-ui-css/semantic.min.css'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ระบบจัดการโครงการและเอกสารงวดงาน',
  description: 'Project Management & Document Tracking System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
