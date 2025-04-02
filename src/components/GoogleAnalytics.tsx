'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { pageview } from '@/lib/gtag';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      // Konstruera den fullständiga URL:en med sökparametrar
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      // Skicka sidvy till Google Analytics
      pageview(url);
    }
  }, [pathname, searchParams]);

  return null; // Denna komponent renderar inget i DOM
}