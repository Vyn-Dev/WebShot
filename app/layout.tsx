import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebShot Vyn - Professional Website Screenshot Tool',
  description: 'Capture beautiful website screenshots with various styles and decorations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
          {children}
        </main>
      </body>
    </html>
  )
}
