'use client';

import './globals.css'
import Footer from '@/components/Footer'
import { useEffect } from 'react';
import { NotificationProvider } from '@/context/notificationcontext';
import { GlobalCountersProvider } from '@/contexts/GlobalCountersContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ActivityTracker from '@/components/ActivityTracker';
import PostHogIdentify from '@/components/PostHogProvider';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Service workern och installationseventen (docs/plan-pwa.md). Renderar
// ingenting, registrerar efter load på idle, och laddas bara på appytorna.
const PwaRegister = dynamic(() => import('@/components/shell/PwaRegister'), {
  ssr: false,
});

const GTM_ID = 'GTM-5KLW66PJ';

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

  // Appytan märks på rotelementet, för globals.css (bland annat
  // cookie-bannerns placering i flöden).
  useEffect(() => {
    const root = document.documentElement;
    if (isAppSurface) root.setAttribute('data-app-surface', 'true');
    else root.removeAttribute('data-app-surface');
    return () => root.removeAttribute('data-app-surface');
  }, [isAppSurface]);

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

        {/* Cookie-samtycket ritas av rot-layouten som server-HTML
            (src/components/samtycke/CookieBanner.tsx), utan React här. */}
          </NotificationProvider>
        </GlobalCountersProvider>
      </AuthProvider>
    </>
  )
}
