// CRITICAL: Import storage initialization FIRST before anything else
import '@/lib/supabase/storage-init';

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import ClientLayout from './client-layout'

const inter = Inter({ subsets: ['latin'] })

const GTM_ID = 'GTM-5KLW66PJ';

// Export metadata for Open Graph / Twitter Cards
export const metadata: Metadata = {
  title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
  description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai',
    siteName: 'Jobbcoach.ai',
    title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
    description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
    images: [
      {
        url: 'https://jobbcoach.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Skapa ATS-anpassade CV:n, personliga brev och träna på rekryteringstester med Jobbcoach.ai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jobbcoach_ai',
    title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
    description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
    images: ['https://jobbcoach.ai/og-image.png'],
  },
  other: {
    'fb:app_id': '1234567890',
  },
}

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="h-full">
      <head>
        {/* Ensure dataLayer exists synchronously before GTM */}
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];`
        }} />

        {/* === GTM DEFAULT CONSENT STATE START === */}
        <Script
          id="gtm-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />
        {/* === GTM DEFAULT CONSENT STATE SLUT === */}

        {/* === GTM HEAD SNIPPET START === */}
        <Script
          id="google-tag-manager-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
        {/* === GTM HEAD SNIPPET SLUT === */}

        {/* Suppress GTM timing errors */}
        <Script
          id="gtm-error-handler"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (
                    e.message.includes('isInitialized') ||
                    e.message.includes('e.sent') ||
                    e.message.includes('multiVariateTestingCS')
                )) {
                  console.warn('[GTM] Timing issue suppressed');
                  e.preventDefault();
                  return true;
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 flex flex-col min-h-full`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
