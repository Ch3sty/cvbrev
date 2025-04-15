// app/layout.tsx
'use client';

import './globals.css'
// import type { Metadata } from 'next' // Metadata kan inte användas med 'use client'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navbar'
import Link from 'next/link'
import { Facebook, Instagram, Users, HelpCircle } from 'lucide-react'
import Script from 'next/script'
import { Suspense, useState, useEffect } from 'react';
import CookieConsent, { Cookies, getCookieConsentValue, OPTIONS } from "react-cookie-consent";
import { NotificationProvider } from '@/context/notificationcontext';

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

        <title>Jobbcoach.ai - Skapa CV och Personligt Brev med AI</title>
        <meta name="description" content="Skapa professionella CV:n och personliga brev snabbt och enkelt med hjälp av AI från Jobbcoach.ai." />
        {/* Andra head-element */}
      </head>
      <body className={`${inter.className} bg-navy-900 text-white flex flex-col min-h-full`}>
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

        <NotificationProvider>
          <Navbar />

          <main className="flex-grow">
            {children}
          </main>

          {/* ================= FOOTER START (UPPDATERAD MED NY TEXT) ================= */}
          <footer className="bg-navy-950 border-t border-navy-700/50 mt-auto">
             <div className="container px-4 py-12 mx-auto">
               <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-left">

                 {/* Kolumn 1: Om jobbcoach.ai */}
                 <div>
                   {/* Logotyp i footer */}
                   <Link href="/" className="inline-block mb-4">
                      <span className="text-lg font-bold text-white hover:opacity-90 transition-opacity">
                        Jobbcoach
                      </span>
                      <span className="text-lg font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-md px-1.5 py-0.5 ml-1 leading-tight hover:opacity-90 transition-opacity shadow-sm">
                        .ai
                      </span>
                   </Link>
                   {/* === NY BESKRIVNINGSTEXT HÄR === */}
                   <p className="text-sm text-gray-400">
                     Ta kontroll över din jobbsökning med Jobbcoach.ai – din digitala jobbcoach. Vi kombinerar avancerad AI med insikter om rekrytering för att guida dig rätt. Skapa enastående ansökningshandlingar som fångar arbetsgivares intresse, få djupgående analyser av ditt CV och det strategiska stöd du behöver för att sticka ut och landa drömjobbet.
                   </p>
                   {/* === SLUT PÅ NY BESKRIVNINGSTEXT === */}
                 </div>

                 {/* Kolumn 2: Snabblänkar (inkl. Om Oss, Kontakt) */}
                 <div>
                   <h3 className="mb-4 text-lg font-semibold text-white">Utforska</h3>
                   <ul className="space-y-2">
                     <li><Link href="/" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Hem</Link></li>
                     <li><Link href="/funktioner" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Funktioner</Link></li>
                     <li><Link href="/priser" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Priser</Link></li>
                     <li><Link href="/om-oss" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Om Oss</Link></li>
                     <li><Link href="/kontakt" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Kontakt</Link></li>
                     {/* <li><Link href="/artiklar" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Artiklar</Link></li> */}
                   </ul>
                 </div>

                 {/* Kolumn 3: Sociala medier & Legal */}
                 <div>
                   {/* Sociala medier sektion */}
                   <h3 className="mb-4 text-lg font-semibold text-white">Följ oss</h3>
                   <div className="flex justify-center mb-6 space-x-4 md:justify-start">
                     <a href="https://www.facebook.com/CVbrev/" target="_blank" rel="noopener noreferrer" aria-label="Jobbcoach.ai på Facebook" className="text-gray-400 transition-colors hover:text-pink-400"><Facebook size={24} /></a>
                     <a href="https://www.instagram.com/jobbcoach.ai/" target="_blank" rel="noopener noreferrer" aria-label="Jobbcoach.ai på Instagram" className="text-gray-400 transition-colors hover:text-pink-400"><Instagram size={24} /></a>
                   </div>
                   {/* Legal sektion */}
                    <h3 className="mb-4 text-lg font-semibold text-white">Legal</h3>
                    <ul className="space-y-2">
                     <li><Link href="/integritetspolicy" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Integritetspolicy</Link></li>
                     <li><Link href="/anvandarvillkor" className="text-sm text-gray-400 transition-colors hover:text-pink-400">Användarvillkor</Link></li>
                    </ul>
                 </div>
               </div>

               {/* Cookie Consent Management & Copyright */}
               <div className="pt-8 mt-8 border-t border-navy-700/50 flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
                  <p className="text-sm text-gray-500 text-center md:text-left">
                    © {new Date().getFullYear()} jobbcoach.ai. Alla rättigheter förbehållna.
                  </p>
                  <button
                       onClick={resetConsent}
                       className="text-xs text-gray-400 underline transition-colors hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-950 rounded"
                   >
                       Hantera cookie-samtycke
                   </button>
               </div>
             </div>
          </footer>
          {/* ================= FOOTER SLUT ================= */}

          {/* === COOKIE BANNER (Oförändrad) === */}
          <CookieConsent
            location={OPTIONS.BOTTOM}
            buttonText="Jag förstår och accepterar"
            declineButtonText="Avvisa"
            cookieName={COOKIE_NAME}
            style={{ background: "rgb(3 7 18 / 0.9)", backdropFilter: "blur(4px)", fontSize: "14px", borderTop: "1px solid rgb(55 65 81 / 0.5)" }}
            buttonStyle={{ background: "#db2777", color: "white", fontSize: "13px", borderRadius: "6px", padding: "8px 15px", fontWeight: "500" }}
            declineButtonStyle={{ background: "#374151", color: "white", fontSize: "13px", borderRadius: "6px", margin: "0 10px", padding: "8px 15px", fontWeight: "500" }}
            expires={180}
            enableDeclineButton
            onAccept={handleAcceptCookie}
            onDecline={handleDeclineCookie}
            ariaAcceptLabel="Acceptera cookies"
            ariaDeclineLabel="Avvisa cookies"
            overlay={false}
          >
             Vi använder cookies för att förbättra din upplevelse och förstå hur webbplatsen används (analys). Genom att klicka "Acceptera" samtycker du till användningen av analyscookies.{" "}
            <Link href="/integritetspolicy#cookies" className="font-semibold text-pink-400 underline hover:text-pink-300">
               Läs mer om cookies i vår integritetspolicy
            </Link>.
          </CookieConsent>
          {/* === COOKIE BANNER SLUT === */}
        </NotificationProvider>
      </body>
    </html>
  )
}