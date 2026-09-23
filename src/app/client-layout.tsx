'use client';

import './globals.css'
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
import { scheduleIdle } from '@/lib/scheduleIdle';
import dynamic from 'next/dynamic';

// Service workern och installationseventen (docs/plan-pwa.md). Renderar
// ingenting, registrerar efter load på idle, och laddas bara på appytorna.
const PwaRegister = dynamic(() => import('@/components/shell/PwaRegister'), {
  ssr: false,
});

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
  initialUser = null,
}: {
  children: React.ReactNode
  /** Läst på servern i rot-layouten, så AuthProvider slipper en rundtur. */
  initialUser?: import('@supabase/supabase-js').User | null
}) {
  const pathname = usePathname();
  // Appytor (kandidatens dashboard + rekryterarportalen) ska INTE ha den
  // publika konsument-footern (artikelguider, "skapa CV" m.m.) — den hör hemma
  // på marknadsföringssidorna, inte inne i verktygen.
  const isAppSurface =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/rekryterare') ||
    pathname?.startsWith('/admin');

  // Cookie-bannern renderas av ett tredjepartsbibliotek med inline-stilar, så
  // den kan inte få Tråden-tokens via props. Vi märker rotelementet i stället
  // och målar om bannern i globals.css när användaren står på en appyta.
  /**
   * Cookie-bannern monteras först när sidan är klar med sin första målning.
   *
   * Biblioteket ritar bannern med inline `bottom: 0` och blir sedan omplacerad
   * av regeln för flödessidor (`html[data-flow-active]` lyfter den ovanför
   * Fortsätt-foten). De två sakerna hände i olika bilder: bannern stod först
   * längst ned och hoppade 169 px uppåt strax efteråt. Ett fixed element som
   * flyttar sig räknas som layoutskifte, och det var hela skapa-cv steg 7:s
   * CLS på 0,052.
   *
   * Väntar vi till efter första målningen står både `data-flow-active` och
   * `--flow-footer-h` redan rätt, och bannern dyker upp på sin slutliga plats.
   * Samtycket går fortfarande att lämna, bara en aning senare.
   */
  const [bannerRedo, setBannerRedo] = useState(false);
  useEffect(() => {
    const avbryt = scheduleIdle(() => setBannerRedo(true), 2500);
    return avbryt;
  }, []);

  // Bannern tas aldrig bort: samtycket måste gå att lämna även för den som
  // registrerar sig och aldrig återvänder till en publik sida.
  useEffect(() => {
    const root = document.documentElement;
    if (isAppSurface) root.setAttribute('data-app-surface', 'true');
    else root.removeAttribute('data-app-surface');
    return () => root.removeAttribute('data-app-surface');
  }, [isAppSurface]);

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

      <AuthProvider initialUser={initialUser}>
        <PostHogIdentify />
        <ActivityTracker />
        {isAppSurface && <PwaRegister />}
        <GlobalCountersProvider>
          <NotificationProvider>
            <main className="flex-grow">
              {children}
            </main>

        {/* Footer - visas overallt utom pa appytorna (dashboard + rekryterarportal) */}
        {!isAppSurface && <Footer />}

        {/* === COOKIE BANNER === */}
        {/* Aldrig under /admin: bannern täckte nedre kanten av adminsidorna
            (docs/design/spec-admin-tydlighet-2026-09-22.html, punkt 5). */}
        {bannerRedo && !pathname?.startsWith('/admin') && (
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
            // Tråden (docs/designsystem.md §12, en linje): panel, hårlinje,
            // svävande skugga, bläckknapp. Ingen gradient.
            background: "var(--panel)",
            color: "var(--ink-2)",
            padding: "14px 20px",
            borderTop: "1px solid var(--kant)",
            boxShadow: "0 -8px 24px rgba(28, 25, 23, 0.08)",
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
            background: "var(--ink-1)",
            color: "white",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "10px 20px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            minHeight: "44px",
          }}
          declineButtonStyle={{
            background: "var(--panel)",
            color: "var(--ink-1)",
            fontSize: "14px",
            borderRadius: "8px",
            margin: "0 8px 0 0",
            padding: "10px 20px",
            fontWeight: "600",
            border: "1px solid var(--kant-stark)",
            cursor: "pointer",
            minHeight: "44px",
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
            <div style={{ flex: "1 1 auto", minWidth: "0" }}>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: "0",
                  color: "var(--ink-1)",
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
                  color: "var(--ink-2)",
                }}
              >
                För att göra plattformen bättre.{" "}
                <Link
                  href="/integritetspolicy#cookies"
                  aria-label="Läs mer om hur vi använder cookies i vår integritetspolicy"
                  style={{
                    color: "var(--ink-1)",
                    fontWeight: "600",
                    textDecoration: "underline",
                    textDecorationColor: "var(--kant-stark)",
                    textUnderlineOffset: "2px",
                  }}
                >
                  Läs mer
                </Link>
              </p>
            </div>
          </div>
        </CookieConsent>
        )}
          {/* === COOKIE BANNER SLUT === */}
          </NotificationProvider>
        </GlobalCountersProvider>
      </AuthProvider>
    </>
  )
}
