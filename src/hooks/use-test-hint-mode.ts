'use client';

import { useEffect, useState, useCallback } from 'react';

// Delad inställning för om test-frågor visar ledtråd (titel + regel-text) eller
// körs skarpt (bara rutnät + svarsalternativ, som ett riktigt rekryteringstest).
// Default: AV (skarpt). Sparas i localStorage så valet minns sig mellan tester.

const STORAGE_KEY = 'tester:hint-mode';

export function useTestHintMode() {
  const [showHint, setShowHint] = useState(false); // default: skarpt
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'on') setShowHint(true);
    } catch {
      /* localStorage ej tillgängligt */
    }
    setHydrated(true);
  }, []);

  const toggle = useCallback(() => {
    setShowHint((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
      } catch {
        /* ignorera */
      }
      return next;
    });
  }, []);

  // hydrated: false under SSR/första render → undvik flimmer genom att rendera
  // skarpt läge tills vi vet det sparade valet.
  return { showHint: hydrated ? showHint : false, toggle, hydrated };
}
