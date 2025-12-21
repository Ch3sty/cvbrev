'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress - Subtil progress bar som visas vid navigation
 *
 * Design specs:
 * - 2px hög
 * - Pink-to-purple gradient (matchar jobbcoach.ai varumärke)
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
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Navigerar..."
    >
      <div
        className="h-full bg-gradient-to-r from-pink-500 via-pink-400 to-purple-500 transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(219, 39, 119, 0.5), 0 0 5px rgba(219, 39, 119, 0.3)',
        }}
      />
    </div>
  );
}
