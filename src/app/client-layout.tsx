'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Script from 'next/script'
import { Suspense, useState, useEffect } from 'react';
import CookieConsent, { Cookies, getCookieConsentValue, OPTIONS } from "react-cookie-consent";
import { NotificationProvider } from '@/context/notificationcontext';
import { GlobalCountersProvider } from '@/contexts/GlobalCountersContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ActivityTracker from '@/components/ActivityTracker';
import PostHogIdentify from '@/components/PostHogProvider';
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
        <PostHogIdentify />
        <ActivityTracker />
        <GlobalCountersProvider>
          <NotificationProvider>
            <main className="flex-grow">
              {children}
            </main>

        {/* Footer - visas overallt utom pa dashboard */}
        {!isDashboard && <Footer />}

        {/* === COOKIE BANNER === */}
        <CookieConsent
          location={OPTIONS.BOTTOM}
          buttonText="Acceptera"
          declineButtonText="Avvisa"
          cookieName={COOKIE_NAME}
          containerClasses="cookie-banner-container"
          contentClasses="cookie-banner-content"
          buttonWrapperClasses="cookie-banner-buttons"
          disableStyles={true}
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "rgb(51 65 85)",
            padding: "14px 20px",
            borderTop: "1px solid #FED7AA",
            boxShadow: "0 -8px 24px -8px rgba(249, 115, 22, 0.18)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            zIndex: 999,
            paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 14px, 14px)",
          }}
          buttonStyle={{
            background:
              "linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)",
            color: "white",
            fontSize: "13px",
            borderRadius: "10px",
            padding: "10px 20px",
            fontWeight: "700",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            boxShadow: "0 8px 20px -6px rgba(220, 38, 38, 0.45)",
            minHeight: "40px",
          }}
          declineButtonStyle={{
            background: "white",
            color: "rgb(71 85 105)",
            fontSize: "13px",
            borderRadius: "10px",
            margin: "0 8px 0 0",
            padding: "10px 20px",
            fontWeight: "700",
            border: "1px solid #E2E8F0",
            cursor: "pointer",
            transition: "border-color 0.15s ease, background 0.15s ease",
            minHeight: "40px",
          }}
          expires={180}
          enableDeclineButton
          onAccept={handleAcceptCookie}
          onDecline={handleDeclineCookie}
          ariaAcceptLabel="Acceptera cookies"
          ariaDeclineLabel="Avvisa cookies"
          overlay={false}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: "1 1 auto",
              minWidth: "0",
              maxWidth: "560px",
            }}
          >
            {/* Custom cookie-SVG i orange/röd-DNA */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <defs>
                <linearGradient
                  id="cookie-warm"
                  x1="0"
                  y1="0"
                  x2="40"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#F97316" />
                  <stop offset="1" stopColor="#DC2626" />
                </linearGradient>
                <linearGradient
                  id="cookie-soft"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#FFEDD5" />
                  <stop offset="1" stopColor="#FED7AA" />
                </linearGradient>
              </defs>
              {/* Cookie-bakgrund */}
              <circle cx="20" cy="20" r="16" fill="url(#cookie-soft)" />
              {/* Bett-urtag */}
              <path
                d="M 32 12 Q 33 14 32 16 Q 30 17 29 15 Q 28 13 30 12 Q 31 11 32 12 Z"
                fill="white"
                stroke="#FED7AA"
                strokeWidth="0.8"
              />
              {/* Cookie-yta gradient */}
              <circle
                cx="20"
                cy="20"
                r="14"
                fill="none"
                stroke="url(#cookie-warm)"
                strokeWidth="2"
              />
              {/* Choklad-bitar */}
              <circle cx="14" cy="15" r="2" fill="url(#cookie-warm)" />
              <circle cx="22" cy="13" r="1.5" fill="#DC2626" />
              <circle cx="16" cy="22" r="1.6" fill="#BE185D" />
              <circle cx="24" cy="24" r="2.2" fill="url(#cookie-warm)" />
              <circle cx="13" cy="26" r="1.2" fill="#DC2626" />
              <circle cx="20" cy="28" r="1" fill="#BE185D" />
            </svg>
            <div style={{ flex: "1 1 auto", minWidth: "0" }}>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: "0",
                  color: "#0F172A",
                  fontWeight: "600",
                }}
              >
                Vi använder cookies
              </p>
              <p
                style={{
                  fontSize: "12px",
                  lineHeight: "1.45",
                  margin: "2px 0 0 0",
                  color: "#475569",
                }}
              >
                För att göra plattformen bättre.{" "}
                <Link
                  href="/integritetspolicy#cookies"
                  style={{
                    color: "#C2410C",
                    fontWeight: "700",
                    textDecoration: "underline",
                    textDecorationColor: "#FED7AA",
                    textUnderlineOffset: "2px",
                  }}
                >
                  Läs mer
                </Link>
              </p>
            </div>
          </div>
        </CookieConsent>
          {/* === COOKIE BANNER SLUT === */}
          </NotificationProvider>
        </GlobalCountersProvider>
      </AuthProvider>
    </>
  )
}
