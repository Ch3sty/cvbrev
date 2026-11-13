'use client';

/**
 * Flikbytet (konceptet, Rörelse och känsla): ny vy tonar in och lyfter 10 px
 * på 160 ms, inget glid. Första ritningen står stilla, så att kallstarten
 * inte väntar på en toning (LCP). Minskad rörelse ger bara toningen.
 *
 * Här sätts också statusfältet till mörka ikoner, eftersom flikarna står i
 * det ljusa rummet, och remsan bakom fältet får rummets färg. Passen ritar
 * sin egen mörka vägg, så remsan och ikonerna går tillbaka när flikarna lämnas.
 */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { statusfalt } from './skal';

export default function FlikInnehall({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? '';
  const forra = useRef(path);
  const animera = useRef(false);
  if (forra.current !== path) {
    forra.current = path;
    animera.current = true;
  }

  useEffect(() => {
    const rot = document.querySelector<HTMLElement>('[data-mobilapp]');
    const gammal = rot?.style.backgroundColor ?? '';
    if (rot) rot.style.backgroundColor = 'var(--a-bg)';
    statusfalt('ljust');
    return () => {
      if (rot) rot.style.backgroundColor = gammal;
      statusfalt('morkt');
    };
  }, []);

  return (
    <div key={path} className={`flex flex-1 flex-col${animera.current ? ' tk-in' : ''}`}>
      {children}
    </div>
  );
}
