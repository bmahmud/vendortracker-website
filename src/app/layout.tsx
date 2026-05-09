import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'VendorTracker',
  description: 'Track your vendor relationships — hired, to hire, and do not hire.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
