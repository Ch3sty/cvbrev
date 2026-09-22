// CRITICAL: Import storage initialization FIRST before anything else
import '@/lib/supabase/storage-init';

import type { Metadata, Viewport } from 'next'
import { Inter, Schibsted_Grotesk } from 'next/font/google'
import Script from 'next/script'
import ClientLayout from './client-layout'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

// display: 'swap' ritar text direkt med reservsnittet i stället för att hålla
// den osynlig, och adjustFontFallback låter Next räkna fram ett reservsnitt
// vars metrik matchar Inter. Utan den matchningen är reservsnittet bredare,
// text radbryter annorlunda och block byter höjd när Inter tonar in. Det var
// grundorsaken bakom flera av de layoutskiften vi jagat sida för sida, bland
// annat hero-chipsen på cv-mallar (0,050) och rubrikerna i skapa-cv steg 7.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
})

// Schibsted Grotesk bär rubrikerna på prissidan och i köpvägen
// (docs/designsystem.md avsnitt 12). Den exponeras bara som variabel, så
// ingen text byter familj av sig själv: bara klassen font-display tar den,
// och utan variabeln faller den tillbaka på Inter.
const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
  adjustFontFallback: true,
})

const GTM_ID = 'GTM-5KLW66PJ';

// Export metadata for Open Graph / Twitter Cards
export const metadata: Metadata = {
  metadataBase: new URL('https://www.jobbcoach.ai'),
  title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
  description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai',
    siteName: 'Jobbcoach.ai',
    title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
    description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
    images: [
      {
        url: 'https://www.jobbcoach.ai/opengraph-image',
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
    images: ['https://www.jobbcoach.ai/opengraph-image'],
  },
  other: {
    'fb:app_id': '1234567890',

    /* appleWebApp.capable nedan ger numera bara den moderna
       mobile-web-app-capable. Safari på iOS 16 och äldre läser fortfarande
       den prefixade, och utan den öppnas appen med adressfält kvar. Båda
       kostar ingenting, så båda står här. */
    'apple-mobile-web-app-capable': 'yes',
  },

  /* Jobbcoach på hemskärmen (docs/plan-pwa.md, avsnitt 6).

     manifest pekar på src/app/manifest.ts. appleWebApp är iOS motsvarighet:
     Safari läser inte manifestet, utan de här taggarna. statusBarStyle
     default låter statusraden ta appens theme_color, alltså benvitt, i
     stället för att bli en svart list över en benvit sida.

     Ikonlänkarna skrivs inte här. Next genererar dem redan ur filnamnen i
     src/app (icon.png, apple-icon.png), och två uppsättningar link-taggar
     för samma sak är precis det som gör att en telefon plockar fel bild.
     apple-icon.png är därför utbytt mot den renderade 180-ikonen i stället
     för att få en egen tagg vid sidan av. */
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Jobbcoach',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  /* Samma benvita ton som marken och som manifestens theme_color, så att
     systemets fält runt appen matchar sidan i stället för att blinka vitt. */
  themeColor: '#EDE8DF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className={`h-full ${schibsted.variable}`}>
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
