import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

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
  title: 'ZerekLab - Образовательные наборы для детей',
  description:
    'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт. Идеально для STEM-образования и творческого обучения.',
  keywords:
    'образовательные наборы, робототехника, для детей, STEM, обучение, электроника, программирование, конструкторы',
  authors: [{ name: 'ZerekLab' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://zereklab.com',
    title: 'ZerekLab - Образовательные наборы для детей',
    description:
      'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт.',
    siteName: 'ZerekLab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZerekLab - Образовательные наборы для детей',
    description:
      'Откройте для себя удивительные образовательные наборы, которые помогают детям учиться через практический опыт.',
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
