import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'ZerekLab - Образовательные наборы для детей',
  description: 'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт. Идеально для STEM-образования и творческого обучения.',
  keywords: 'образовательные наборы, робототехника, для детей, STEM, обучение, электроника, программирование, конструкторы',
  authors: [{ name: 'ZerekLab' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://zereklab.com',
    title: 'ZerekLab - Образовательные наборы для детей',
    description: 'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт.',
    siteName: 'ZerekLab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZerekLab - Образовательные наборы для детей',
    description: 'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #f97316',
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #22c55e',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  )
} 