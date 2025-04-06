// app/layout.tsx
'use client';

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navbar'
import Link from 'next/link'
import { Facebook, Instagram } from 'lucide-react'
import Script from 'next/script'
import { Suspense, useState, useEffect } from 'react'; // Behåll useEffect
import CookieConsent, { Cookies, getCookieConsentValue, OPTIONS } from "react-cookie-consent";

const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = { ... }

const COOKIE_NAME = "cvBrevCookieConsent";
const GTM_ID = 'GTM-5KLW66PJ';

// Funktion för att köa gtag-anrop säkert (oförändrad från förra korrekta versionen)
function gtag(...args: any[]) {
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
          console.log("gtag stub created with inner check.");
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

  // Körs EN gång när komponenten monteras på klientsidan
  useEffect(() => {
    const consentValue = getCookieConsentValue(COOKIE_NAME);
    if (consentValue === "true") {
       console.log("Existing consent found ('true') on load, updating GTM consent state immediately.");
       // Uppdatera GTM direkt eftersom samtycke redan finns
       // Detta sker förhoppningsvis INNAN Initialization - All Pages triggern körs fullt ut
       gtag('consent', 'update', {
         'analytics_storage': 'granted',
         'ad_storage': 'granted',
         'ad_user_data': 'granted',
         'ad_personalization': 'granted'
       });
    } else {
        console.log("No existing consent found ('true') on load, relying on default 'denied' and banner interaction.");
        // Inget 'update' anrop här, förlitar oss på default 'denied'
    }
  }, []); // Tom array säkerställer att den körs bara en gång

  // Funktioner för att hantera knapptryckningar (oförändrade)
  const handleAcceptCookie = () => {
    console.log("Cookie consent accepted! Sending GTM Consent update...");
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
     console.log("GTM Consent update command sent.");
  };

  const handleDeclineCookie = () => {
     console.log("Cookie consent declined. Sending GTM Consent update...");
     gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
     console.log("GTM Consent update command sent.");
  };

  const resetConsent = () => {
    console.log("Resetting cookie consent...");
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

        {/* === GTM HEAD SNIPPET START (Laddas alltid - Oförändrad) === */}
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

        {/* Andra head-element */}
      </head>
      <body className={`${inter.className} bg-navy-900 text-white flex flex-col min-h-full`}>
        {/* === GTM BODY SNIPPET (NOSCRIPT) START (Laddas alltid - Oförändrad) === */}
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

        <Navbar />

        <main className="flex-grow">
          {children}
        </main>

        {/* === FOTER (Oförändrad) === */}
        <footer className="bg-navy-950 border-t border-navy-700/50 mt-auto relative">
         {/* ... */}
           <div className="container px-4 py-12 mx-auto">
             <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-left">
               {/* Kolumnerna */}
                {/* Kolumn 1: Om CVbrev */}
               <div>
                 <h3 className="mb-4 text-lg font-semibold text-white">CVbrev.se</h3>
                 <p className="text-sm text-gray-400">
                   Skapa professionella CV:n och personliga brev snabbt och enkelt med hjälp av AI.
                 </p>
               </div>
               {/* Kolumn 2: Snabblänkar */}
               <div>
                 <h3 className="mb-4 text-lg font-semibold text-white">Snabblänkar</h3>
                 <ul className="space-y-2">
                   <li><Link href="/" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Hem</Link></li>
                   <li><Link href="/funktioner" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Funktioner</Link></li>
                   <li><Link href="/priser" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Priser</Link></li>
                   <li><Link href="/artiklar" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Artiklar</Link></li>
                 </ul>
               </div>
               {/* Kolumn 3: Sociala medier & Legal */}
               <div>
                 <h3 className="mb-4 text-lg font-semibold text-white">Följ oss</h3>
                 <div className="flex justify-center mb-6 space-x-4 md:justify-start">
                   <a href="https://www.facebook.com/CVbrev/" target="_blank" rel="noopener noreferrer" aria-label="CVbrev på Facebook" className="text-gray-400 transition-colors hover:text-pink-500"><Facebook size={24} /></a>
                   <a href="https://www.instagram.com/cvbrev.se/" target="_blank" rel="noopener noreferrer" aria-label="CVbrev på Instagram" className="text-gray-400 transition-colors hover:text-pink-500"><Instagram size={24} /></a>
                 </div>
                  <h3 className="mb-4 text-lg font-semibold text-white">Legal</h3>
                  <ul className="space-y-2">
                   <li><Link href="/integritetspolicy" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Integritetspolicy</Link></li>
                   <li><Link href="/anvandarvillkor" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Användarvillkor</Link></li>
                  </ul>
               </div>
             </div>
             {/* Knapp */}
             <div className="flex justify-center mt-8 md:justify-start">
                 <button
                     onClick={resetConsent}
                     className="text-xs text-gray-400 underline transition-colors hover:text-pink-500"
                 >
                     Hantera cookie-samtycke
                 </button>
             </div>
             {/* Copyright */}
             <div className="pt-8 mt-6 text-sm text-center text-gray-500 border-t border-navy-700/50">
               © {new Date().getFullYear()} CVbrev. Alla rättigheter förbehållna.
             </div>
           </div>
        </footer>
        {/* === FOTER SLUT === */}

        {/* === COOKIE BANNER (Oförändrad) === */}
        <CookieConsent
          // ... (props)
           location={OPTIONS.BOTTOM}
          buttonText="Jag förstår och accepterar"
          declineButtonText="Avvisa"
          cookieName={COOKIE_NAME}
          style={{ background: "#111827", fontSize: "14px", borderTop: "1px solid #374151" }}
          buttonStyle={{ background: "#ec4899", color: "white", fontSize: "13px", borderRadius: "5px", padding: "8px 15px" }}
          declineButtonStyle={{ background: "#4b5563", color: "white", fontSize: "13px", borderRadius: "5px", margin: "0 10px", padding: "8px 15px" }}
          expires={180}
          enableDeclineButton
          onAccept={handleAcceptCookie}
          onDecline={handleDeclineCookie}
          ariaAcceptLabel="Acceptera cookies"
          ariaDeclineLabel="Avvisa cookies"
        >
           Vi använder cookies för att förbättra din upplevelse och förstå hur webbplatsen används (analys). Genom att klicka "Acceptera" samtycker du till användningen av analyscookies.{" "}
          <Link href="/integritetspolicy#cookies" className="font-semibold text-pink-500 underline hover:text-pink-400">
             Läs mer om cookies i vår integritetspolicy
          </Link>.
        </CookieConsent>
        {/* === COOKIE BANNER SLUT === */}

      </body>
    </html>
  )
}