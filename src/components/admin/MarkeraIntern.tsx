'use client';

/**
 * Markerar superadmin som intern i PostHog.
 *
 * Ägarens beslut 2026-09-22: adminkontot undantas ur all data. Adminens egna
 * frågor filtrerar redan på konto-id (src/lib/admin/undantag.ts), men
 * dashboarden i PostHog och alla insikter som byggs där för hand behöver en
 * personegenskap att filtrera på. Den som öppnar /admin är per definition
 * superadmin (layouten har redan kontrollerat rollen), så här sätts
 * is_internal = true på personen och registreras på alla följande händelser.
 *
 * PostHog initieras först efter LCP, så komponenten väntar in init:en i
 * högst tjugo sekunder. Renderar ingenting.
 */

import { useEffect } from 'react';

export default function MarkeraIntern() {
  useEffect(() => {
    let avbruten = false;
    let forsok = 0;

    const kor = () => {
      if (avbruten) return;
      void import('posthog-js').then(({ default: posthog }) => {
        if (avbruten) return;
        if (!posthog.__loaded) {
          if (++forsok < 20) window.setTimeout(kor, 1000);
          return;
        }
        try {
          posthog.setPersonProperties({ is_internal: true });
          posthog.register({ is_internal: true });
        } catch {
          // Mätningen får aldrig fälla adminen.
        }
      });
    };

    kor();
    return () => {
      avbruten = true;
    };
  }, []);

  return null;
}
