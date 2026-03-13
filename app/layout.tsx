import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { ConditionalLayout } from '@/components/layout';
import '@/styles/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Tapix - Electronics & Smart Accessories',
    template: '%s | Tapix',
  },
  description:
    'Shop premium electronics, gadgets, and smart accessories at Tapix. Smartphones, earbuds, smart watches, power banks, phone cases, gaming accessories, and more.',
  keywords: [
    'electronics store',
    'smartphones',
    'wireless earbuds',
    'smart watches',
    'power banks',
    'phone cases',
    'gaming accessories',
    'laptop accessories',
    'smart gadgets',
    'mobile accessories',
  ],
  authors: [{ name: 'Tapix' }],
  creator: 'Tapix',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tapix.com',
    siteName: 'Tapix',
    title: 'Tapix - Electronics & Smart Accessories',
    description:
      'Shop premium electronics, gadgets, and smart accessories at Tapix. Smartphones, earbuds, smart watches, power banks, phone cases, gaming accessories, and more.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tapix - Electronics & Smart Accessories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tapix - Electronics & Smart Accessories',
    description:
      'Shop premium electronics, gadgets, and smart accessories at Tapix. Smartphones, earbuds, smart watches, power banks, phone cases, gaming accessories, and more.',
    images: ['/og-image.jpg'],
    creator: '@tapix',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="min-h-screen bg-beige-50 font-sans antialiased">
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
