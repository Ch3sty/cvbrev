'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress - Subtil progress bar som visas vid navigation
 *
 * Tråden (docs/designsystem.md): 2 px accentlinje längs skärmens överkant.
 * - Visas ENDAST vid navigation som tar >200ms
 * - Animerar från 0% → 90% (långsamt), sedan 90% → 100% (instant vid complete)
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBar, setShowBar] = useState(false);

  // Spåra den aktuella URL:en för att upptäcka navigation
  const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

  // Starta progress när navigation påbörjas
  const startProgress = useCallback(() => {
    setIsNavigating(true);
    setProgress(0);

    // Vänta 200ms innan vi visar progress bar (undvik flicker vid snabb navigation)
    const showTimeout = setTimeout(() => {
      setShowBar(true);
    }, 200);

    // Animera progress från 0% till 90% under 2 sekunder
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 90) {
        currentProgress = 90;
        clearInterval(interval);
      }
      setProgress(currentProgress);
    }, 200);

    return () => {
      clearTimeout(showTimeout);
      clearInterval(interval);
    };
  }, []);

  // Slutför progress när navigation är klar
  const completeProgress = useCallback(() => {
    setProgress(100);

    // Vänta lite så användaren ser 100%, sedan göm och återställ
    setTimeout(() => {
      setShowBar(false);
      setIsNavigating(false);
      setProgress(0);
    }, 200);
  }, []);

  // Lyssna på route-ändringar
  useEffect(() => {
    // Vid första render, gör inget
    let cleanup: (() => void) | undefined;

    // Använd MutationObserver eller custom event för att upptäcka navigation
    // Next.js App Router triggar inte beforeunload, så vi använder pathname-ändringar

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Reagera på URL-ändringar
  useEffect(() => {
    if (isNavigating) {
      completeProgress();
    }
  }, [currentUrl, isNavigating, completeProgress]);

  // Interceptera klick på länkar för att starta progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link) {
        const href = link.getAttribute('href');

        // Endast interna länkar som börjar med /
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          // Ignorera om det är samma sida eller anchor-länkar
          if (href === currentUrl || href.startsWith('#')) {
            return;
          }

          // Ignorera externa protokoll
          if (link.target === '_blank' || link.download) {
            return;
          }

          // Starta progress
          startProgress();
        }
      }
    };

    // Interceptera också programmatisk navigation via router.push
    const handleRouteChangeStart = () => {
      startProgress();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('routeChangeStart', handleRouteChangeStart);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('routeChangeStart', handleRouteChangeStart);
    };
  }, [currentUrl, startProgress]);

  // Rendera inte om vi inte navigerar eller inte ska visa baren än
  if (!showBar) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 bg-transparent"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Navigerar"
    >
      {/* Tråden: samma linje som visar var du är, här på väg någonstans. */}
      <div
        className="h-full bg-accent transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
