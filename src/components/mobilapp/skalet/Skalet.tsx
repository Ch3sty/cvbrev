'use client';

/**
 * Skalets inbyggda delar som hela appens ram behöver (konceptet, Rörelse och
 * känsla och Kanterna). Monteras en gång i src/app/app/layout.tsx och ritar
 * inget utom raden "Tryck igen för att stänga". I webbläsaren gör den inget.
 *
 * - Startskärmen döljs när första vyn är målad.
 * - Android-tillbaka, i den här ordningen:
 *   1. Ett öppet ark (köp, notis, ett test, radera) stängs.
 *   2. I passen, Nivåkollen, övningsproven och resultaten gör tillbaka
 *      samma sak som krysset uppe till vänster.
 *   3. En undersida går till sin flik: via toppradens tillbakapil om den
 *      finns, annars till Tester för testernas sidor och Idag för resten.
 *   4. Tester och Utveckling går till Idag.
 *   5. Idag (och inloggningen) visar "Tryck igen för att stänga"; ett andra
 *      tryck inom två sekunder stänger appen.
 * - Mejllänkar som öppnar appen (App Links) laddas i webbvyn.
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { APP_FLIK, appFlik } from '@/lib/mobilapp/appvag';
import { arAppen, doljStartskarm, plattform, stangAppen } from '../skal';
import { finnsPlugin, kalla, lyssnaPa } from '../skal-plugin';

const STANG_FONSTER_MS = 2000;

/** Kryssen i de delade passvyerna (PassShell, ResultatSkal, Kvitto, IprovFlode, övningsproven). */
const KRYSS = ['Avsluta passet', 'Stäng', 'Avbryt', 'Avbryt provet', 'Tillbaka till resultatet']
  .map((etikett) => `button[aria-label="${etikett}"], a[aria-label="${etikett}"]`)
  .join(', ');

function synlig(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

/** Krysset uppe till vänster i en helskärmsvy: det första synliga i övre delen av skärmen. */
function hittaKryss(): HTMLElement | null {
  const kandidater = Array.from(document.querySelectorAll(KRYSS)).filter(synlig);
  return kandidater.find((el) => el.getBoundingClientRect().top < 140) ?? null;
}

function hittaTillbakapil(): HTMLElement | null {
  return Array.from(document.querySelectorAll('button[aria-label="Tillbaka"], a[aria-label="Tillbaka"]')).find(synlig) ?? null;
}

function arRot(path: string): boolean {
  return appFlik(path) === 'idag' || path === '/login' || path === '/register' || path.startsWith('/register/');
}

/** Ladda en adress från en App Link i webbvyn, om den hör till sajten. */
function oppnaLank(url: string | undefined): void {
  if (!url) return;
  try {
    const u = new URL(url);
    const egen = u.host === window.location.host || u.host === 'www.jobbcoach.ai' || u.host === 'jobbcoach.ai';
    if (!egen) return;
    const mal = `${u.pathname}${u.search}${u.hash}`;
    if (mal === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    window.location.assign(mal);
  } catch {
    // En trasig länk lämnar appen där den är.
  }
}

export default function Skalet() {
  const router = useRouter();
  const path = usePathname() ?? '';
  const pathRef = useRef(path);
  pathRef.current = path;
  const senastTryck = useRef(0);
  const [visaStang, setVisaStang] = useState(false);

  useEffect(() => {
    if (!arAppen()) return;
    doljStartskarm();
    // Utan App-pluginet finns varken länkar eller tillbakaknapp att lyssna på.
    if (!finnsPlugin('App')) return;

    // Kallstart från en mejllänk: skalet öppnar alltid Idag, så länken
    // laddas efteråt. Bara en gång per länk, annars laddas den om och om igen.
    kalla<{ url?: string }>('App', 'getLaunchUrl')
      .then((r) => {
        if (!r?.url) return;
        try {
          if (sessionStorage.getItem('tk-startlank') === r.url) return;
          sessionStorage.setItem('tk-startlank', r.url);
        } catch {
          // Utan sessionStorage öppnas länken ändå en gång per sidladdning.
        }
        oppnaLank(r.url);
      })
      .catch(() => {});
    const avLank = lyssnaPa('App', 'appUrlOpen', (d) => oppnaLank((d as { url?: string } | null)?.url));

    if (plattform() !== 'android') return avLank;

    let stangTimer: number | undefined;
    const avTillbaka = lyssnaPa('App', 'backButton', () => {
      const p = pathRef.current;

      // 1. Ett öppet ark stängs (KatalogVy och KontoHandlingar lägger arket i historiken).
      if ((window.history.state as { tkArk?: boolean } | null)?.tkArk) {
        window.history.back();
        return;
      }

      const flik = appFlik(p);
      if (flik === null && !arRot(p)) {
        // 2. Helskärm: samma som krysset.
        const kryss = hittaKryss();
        if (kryss) {
          kryss.click();
          return;
        }
        // 3. Undersida till sin flik.
        const pil = hittaTillbakapil();
        if (pil) {
          pil.click();
          return;
        }
        router.replace(p.startsWith(`${APP_FLIK.tester}/`) ? APP_FLIK.tester : APP_FLIK.idag);
        return;
      }

      // 4. Annan flik till Idag.
      if (flik === 'tester' || flik === 'utveckling') {
        router.replace(APP_FLIK.idag);
        return;
      }

      // 5. Idag: andra trycket inom fönstret stänger appen.
      const nu = Date.now();
      if (nu - senastTryck.current < STANG_FONSTER_MS) {
        stangAppen();
        return;
      }
      senastTryck.current = nu;
      setVisaStang(true);
      window.clearTimeout(stangTimer);
      stangTimer = window.setTimeout(() => setVisaStang(false), STANG_FONSTER_MS);
    });

    return () => {
      avLank();
      avTillbaka();
      window.clearTimeout(stangTimer);
    };
  }, [router]);

  if (!visaStang) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(env(safe-area-inset-bottom) + 96px)',
        transform: 'translateX(-50%)',
        zIndex: 80,
        padding: '10px 18px',
        borderRadius: 999,
        background: 'var(--natt, #121325)',
        color: 'var(--natt-ink, #F4F3FA)',
        fontFamily: 'var(--tk-text)',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        whiteSpace: 'nowrap',
        boxShadow: '0 10px 28px -12px rgba(11,12,25,.5)',
        pointerEvents: 'none',
      }}
    >
      Tryck igen för att stänga
    </div>
  );
}
