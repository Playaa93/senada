import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/features/theme-provider';
import { NotificationProvider } from '@/components/providers/notification-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Senada - Gestion de Stock de Parfums',
    template: '%s | Senada',
  },
  description: 'Système moderne de gestion d\'inventaire de parfums avec suivi en temps réel et analyses',
  keywords: ['parfum', 'inventaire', 'gestion', 'stock', 'fragrance'],
  authors: [{ name: 'Équipe Senada' }],
  creator: 'Senada',
  publisher: 'Senada',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'),

  // Manifeste PWA
  manifest: '/manifest.json',

  // Icônes Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Senada',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'Senada - Gestion de Stock de Parfums',
    description: 'Système moderne de gestion d\'inventaire de parfums',
    siteName: 'Senada',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Senada - Gestion de Stock de Parfums',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Senada - Gestion de Stock de Parfums',
    description: 'Système moderne de gestion d\'inventaire de parfums',
    images: ['/twitter-image.png'],
  },

  // Icônes
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
      },
    ],
  },

  // Thème
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366F1' },
    { media: '(prefers-color-scheme: dark)', color: '#4F46E5' },
  ],

  // Vérification
  verification: {
    // google: 'votre-code-verification-google',
    // yandex: 'votre-code-verification-yandex',
  },

  // Catégorie
  category: 'business',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366F1' },
    { media: '(prefers-color-scheme: dark)', color: '#4F46E5' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Balises Meta PWA */}
        <meta name="application-name" content="Senada" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />

        {/* Préconnexion aux domaines externes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationProvider enableDemo={process.env.NODE_ENV === 'development'}>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
