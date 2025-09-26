import { Toaster } from 'react-hot-toast';

import type { Metadata, Viewport } from 'next';
import { Comfortaa, Fredoka } from 'next/font/google';

import './globals.css';

const fredoka = Fredoka({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fredoka',
  display: 'swap',
});

const comfortaa = Comfortaa({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-comfortaa',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'ZEREKlab - Образовательные наборы для детей',
  description:
    'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт. Идеально для STEM-образования и творческого обучения.',
  keywords:
    'образовательные наборы, робототехника, для детей, STEM, обучение, электроника, программирование, конструкторы',
  authors: [{ name: 'ZEREKlab' }],
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://zereklab.com',
    title: 'ZEREKlab - Образовательные наборы для детей',
    description:
      'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт.',
    siteName: 'ZEREKlab',
    images: [
      {
        url: '/logo/zereklab.png',
        width: 1200,
        height: 630,
        alt: 'ZEREKlab Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZEREKlab - Образовательные наборы для детей',
    description:
      'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт.',
    images: ['/logo/zereklab.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body
        className={`${fredoka.variable} ${comfortaa.variable} font-comfortaa`}
      >
        {children}
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
  );
}
