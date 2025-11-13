// app/layout.tsx
'use client';

// CRITICAL: Import storage initialization FIRST before anything else
import '@/lib/supabase/storage-init';

import './globals.css'
// import type { Metadata } from 'next' // Metadata kan inte användas med 'use client'
import { Inter } from 'next/font/google'
import PremiumFooter from '@/components/PremiumFooter'
import Link from 'next/link'
import Script from 'next/script'
import { Suspense, useState, useEffect } from 'react';
import CookieConsent, { Cookies, getCookieConsentValue, OPTIONS } from "react-cookie-consent";
import { NotificationProvider } from '@/context/notificationcontext';
import { GlobalCountersProvider } from '@/contexts/GlobalCountersContext';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = { ... } // Kan inte användas med 'use client'

const COOKIE_NAME = "cvBrevCookieConsent";
const GTM_ID = 'GTM-5KLW66PJ';

// Funktion för att köa gtag-anrop säkert (Oförändrad)
function gtag(...args: any[]) {
  // ... (samma gtag-funktion som tidigare)
  if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== 'function') {
          window.gtag = function(...innerArgs: any[]) {
              if(window.dataLayer) {
                 window.dataLayer.push(...innerArgs);
              } else {
                 console.warn("gtag stub called but dataLayer was not available inside stub.");
              }
          } as (...args: any[]) => void;
          // console.log("gtag stub created with inner check.");
      }
      if (typeof window.gtag === 'function') {
          (window.gtag as (...args: any[]) => void)(...args);
      } else {
         console.error("window.gtag is still not a function after stub creation attempt.");
      }
  } else {
    console.warn("gtag called in non-browser environment.");
  }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  // Körs EN gång när komponenten monteras (Oförändrad)
  useEffect(() => {
    const consentValue = getCookieConsentValue(COOKIE_NAME);
    if (consentValue === "true") {
       // console.log("Existing consent found ('true') on load, updating GTM consent state immediately.");
       gtag('consent', 'update', {
         'analytics_storage': 'granted',
         'ad_storage': 'granted',
         'ad_user_data': 'granted',
         'ad_personalization': 'granted'
       });
    } else {
        // console.log("No existing consent found ('true') on load, relying on default 'denied' and banner interaction.");
    }
  }, []);

  // Funktioner för att hantera knapptryckningar (Oförändrade)
  const handleAcceptCookie = () => {
    // console.log("Cookie consent accepted! Sending GTM Consent update...");
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
     // console.log("GTM Consent update command sent.");
  };

  const handleDeclineCookie = () => {
     // console.log("Cookie consent declined. Sending GTM Consent update...");
     gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
     // console.log("GTM Consent update command sent.");
  };

  const resetConsent = () => {
    // console.log("Resetting cookie consent...");
    Cookies.remove(COOKIE_NAME);
     gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'wait_for_update': 500
    });
    window.location.reload();
  };


  return (
    <html lang="sv" className="h-full">
      <head>
        {/* Ensure dataLayer exists synchronously before GTM */}
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];`
        }} />

        {/* === GTM DEFAULT CONSENT STATE START (Oförändrad) === */}
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

        {/* === GTM HEAD SNIPPET START (Oförändrad) === */}
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

        {/* Basic meta tags */}
        <title>Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester</title>
        <meta name="description" content="Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige." />

        {/* Open Graph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Jobbcoach.ai" />
        <meta property="og:title" content="Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester" />
        <meta property="og:description" content="Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige." />
        <meta property="og:url" content="https://jobbcoach.ai" />
        <meta property="og:locale" content="sv_SE" />
        <meta property="og:image" content="https://jobbcoach.ai/opengraph-image" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Skapa ATS-anpassade CV:n, personliga brev och träna på rekryteringstester med Jobbcoach.ai" />
        <meta property="fb:app_id" content="1234567890" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@jobbcoach_ai" />
        <meta name="twitter:title" content="Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester" />
        <meta name="twitter:description" content="Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige." />
        <meta name="twitter:image" content="https://jobbcoach.ai/opengraph-image" />
        <meta name="twitter:image:alt" content="Skapa ATS-anpassade CV:n, personliga brev och träna på rekryteringstester med Jobbcoach.ai" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://jobbcoach.ai" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 flex flex-col min-h-full`}>
        {/* === GTM BODY SNIPPET (NOSCRIPT) START (Oförändrad) === */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            aria-hidden="true"
          ></iframe>
        </noscript>
        {/* === GTM BODY SNIPPET (NOSCRIPT) SLUT === */}

        <GlobalCountersProvider>
          <NotificationProvider>
            <main className="flex-grow">
              {children}
            </main>

          {/* Footer - använd PremiumFooter överallt utom på dashboard */}
          {!isDashboard && <PremiumFooter />}

          {/* === COOKIE BANNER === */}
          <CookieConsent
            location={OPTIONS.BOTTOM}
            buttonText="Acceptera"
            declineButtonText="Avvisa"
            cookieName={COOKIE_NAME}
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              fontSize: "13px",
              borderTop: "1px solid rgb(226 232 240)",
              color: "rgb(51 65 85)",
              padding: "12px 20px",
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.08)"
            }}
            buttonStyle={{
              background: "linear-gradient(to right, rgb(219 39 119), rgb(147 51 234))",
              color: "white",
              fontSize: "13px",
              borderRadius: "8px",
              padding: "8px 20px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(219, 39, 119, 0.2)"
            }}
            declineButtonStyle={{
              background: "rgb(241 245 249)",
              color: "rgb(71 85 105)",
              fontSize: "13px",
              borderRadius: "8px",
              margin: "0 8px",
              padding: "8px 20px",
              fontWeight: "600",
              border: "1px solid rgb(226 232 240)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            expires={180}
            enableDeclineButton
            onAccept={handleAcceptCookie}
            onDecline={handleDeclineCookie}
            ariaAcceptLabel="Acceptera cookies"
            ariaDeclineLabel="Avvisa cookies"
            overlay={false}
          >
            <span style={{ fontSize: "13px", lineHeight: "1.5" }}>
              Vi använder cookies för att förbättra din upplevelse.
            </span>{" "}
            <Link
              href="/integritetspolicy#cookies"
              className="font-semibold underline hover:text-pink-700 transition-colors"
              style={{ color: "rgb(219 39 119)" }}
            >
              Läs mer
            </Link>
          </CookieConsent>
          {/* === COOKIE BANNER SLUT === */}
          </NotificationProvider>
        </GlobalCountersProvider>
      </body>
    </html>
  )
}