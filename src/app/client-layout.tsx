'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import PremiumFooter from '@/components/PremiumFooter'
import Link from 'next/link'
import Script from 'next/script'
import { Suspense, useState, useEffect } from 'react';
import CookieConsent, { Cookies, getCookieConsentValue, OPTIONS } from "react-cookie-consent";
import { NotificationProvider } from '@/context/notificationcontext';
import { GlobalCountersProvider } from '@/contexts/GlobalCountersContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

const COOKIE_NAME = "cvBrevCookieConsent";
const GTM_ID = 'GTM-5KLW66PJ';

// Funktion för att köa gtag-anrop säkert
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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  // Körs EN gång när komponenten monteras
  useEffect(() => {
    const consentValue = getCookieConsentValue(COOKIE_NAME);
    if (consentValue === "true") {
       gtag('consent', 'update', {
         'analytics_storage': 'granted',
         'ad_storage': 'granted',
         'ad_user_data': 'granted',
         'ad_personalization': 'granted'
       });
    }
  }, []);

  // Funktioner för att hantera knapptryckningar
  const handleAcceptCookie = () => {
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
  };

  const handleDeclineCookie = () => {
     gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  };

  const resetConsent = () => {
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
    <>
      {/* === GTM BODY SNIPPET (NOSCRIPT) START === */}
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

      <AuthProvider>
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
      </AuthProvider>
    </>
  )
}
