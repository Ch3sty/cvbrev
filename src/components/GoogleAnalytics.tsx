// components/GoogleAnalytics.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Script from 'next/script'; // Importerad Script
import { GA_MEASUREMENT_ID, pageview } from '@/lib/gtag'; // Importerat GA ID och pageview

// *** Ditt Google Ads Conversion ID ***
const ADS_CONVERSION_ID = 'AW-16978324479'; // Ersätt om detta inte stämmer

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hantera sidvisningar vid navigering inom appen
  useEffect(() => {
    // Skicka endast pageview om gtag är laddat och sökvägen har ändrats
    if (pathname && typeof window.gtag === 'function') {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        console.log(`GA Pageview sent (navigation): ${url}`); // För felsökning
        pageview(url); // Skickar sidvisning för efterföljande SPA-navigeringar
    }
  }, [pathname, searchParams]); // Kör när sökväg eller parametrar ändras

  // Om något av ID:na saknas, rendera ingenting
  if (!GA_MEASUREMENT_ID || !ADS_CONVERSION_ID) {
    console.warn("Google Analytics or Ads ID is missing. Analytics/Ads scripts will not be loaded.");
    return null;
  }

  return (
    <>
      {/* Ladda gtag.js-biblioteket */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} // GA ID används för att ladda skriptet
        id="gtag-base-script" // Unikt ID för detta skript
      />
      {/* Initiera gtag för BÅDE GA och Ads, och skicka första sidvisningen */}
      <Script
        id="google-analytics-ads-init" // Uppdaterat unikt ID
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Initiera Google Analytics (skickar första sidvisningen)
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname + (window.location.search || ''),
              send_page_view: true
            });
            console.log('GA Initialized (ID: ${GA_MEASUREMENT_ID})');

            // *** Initiera Google Ads ***
            gtag('config', '${ADS_CONVERSION_ID}');
            console.log('Google Ads Initialized (ID: ${ADS_CONVERSION_ID})');
          `,
        }}
      />
    </>
  );
}