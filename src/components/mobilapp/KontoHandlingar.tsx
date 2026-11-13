'use client';

/**
 * Logga ut och Radera kontot i appens konto (konceptets kontoVy och arket
 * radera). CV och brev först, som webbens Inställningar, sedan kontot via
 * /api/app/konto, som raderar med service role på servern.
 *
 * Webbens väg (useKontoHandlingar.ts) anropar auth.admin.deleteUser från
 * webbläsaren, vilket alltid nekas med användarens nyckel, och reserven
 * delete_user_account finns inte i databasen. Därför går appen via servern.
 */
import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';
import { haptik } from './skal';

async function raderaKonto(userId: string, epost: string | null): Promise<void> {
  const supabase = getSupabaseClient();
  // Högst tre sekunder: loggningen får inte hålla kvar raderingen.
  await Promise.race([
    logUserActivity(userId, 'registered', 'Användaren raderade sitt konto', {
      email: epost,
      kalla: 'appen',
      timestamp: new Date().toISOString(),
    }).catch(() => {}),
    new Promise<void>((r) => setTimeout(r, 3000)),
  ]);
  await fetch('/api/cv', { method: 'DELETE' }).catch(() => {});
  await fetch('/api/letters', { method: 'DELETE' }).catch(() => {});
  const res = await fetch('/api/app/konto', { method: 'DELETE' });
  if (!res.ok) throw new Error(`radera ${res.status}`);
  // Sessionen pekar på ett konto som inte finns; rensa den lokalt.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
}

export default function KontoHandlingar({ userId, epost }: { userId: string; epost: string | null }) {
  const [ark, setArk] = useState(false);
  const [text, setText] = useState('');
  const [arbetar, setArbetar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const falt = useRef<HTMLInputElement>(null);

  // Arket i historiken: Android-tillbaka stänger det.
  useEffect(() => {
    const pop = () => setArk(false);
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const oppna = () => {
    window.history.pushState({ ...(window.history.state ?? {}), tkArk: true }, '');
    setText('');
    setFel(null);
    setArk(true);
  };
  const stang = () => {
    if ((window.history.state as { tkArk?: boolean } | null)?.tkArk) window.history.back();
    else setArk(false);
  };

  const loggaUt = async () => {
    setArbetar(true);
    logUserActivity(userId, 'logout', 'Användaren loggade ut', { from_page: 'appen' }).catch(() => {});
    await getSupabaseClient().auth.signOut();
    window.location.href = '/login';
  };

  const radera = async () => {
    setArbetar(true);
    setFel(null);
    try {
      await raderaKonto(userId, epost);
      haptik('latt');
      window.location.href = '/login';
    } catch (e) {
      console.error('[app] radera konto', e);
      setFel('Kontot gick inte att radera. Försök igen, eller skriv till oss på jobbcoach.ai.');
      setArbetar(false);
    }
  };

  return (
    <>
      <div className="tk-rader">
        <button type="button" className="tk-rad tk-tryck" onClick={loggaUt} disabled={arbetar}>
          <span className="t">
            <b>Logga ut</b>
          </span>
        </button>
        <button type="button" className="tk-rad tk-tryck" onClick={oppna}>
          <span className="t">
            <b style={{ color: 'var(--fel)' }}>Radera kontot</b>
            <span>Konto, nivå och resultat tas bort</span>
          </span>
        </button>
      </div>
      {ark && (
        <div className="tk-ark-lager" onClick={stang}>
          <div className="tk-ark" role="dialog" aria-modal="true" aria-labelledby="tk-radera" onClick={(e) => e.stopPropagation()}>
            <div className="handtag" />
            <h2 id="tk-radera" className="tk-h2">
              Radera kontot?
            </h2>
            <p className="tk-p" style={{ marginTop: 6 }}>
              Konto, nivå, pass och resultat raderas. En prenumeration avslutar du själv där du köpte den, raderingen gör det inte.
            </p>
            <label className="tk-meta" htmlFor="tk-radera-falt" style={{ display: 'block', marginTop: 16, marginBottom: 6 }}>
              Skriv RADERA för att bekräfta
            </label>
            <input
              id="tk-radera-falt"
              ref={falt}
              className="tk-falt"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoCapitalize="characters"
              autoComplete="off"
            />
            {fel && (
              <p className="tk-meta" role="alert" style={{ color: 'var(--fel)', marginTop: 8 }}>
                {fel}
              </p>
            )}
            <button
              type="button"
              className="tk-knapp fel tk-tryck"
              style={{ marginTop: 12 }}
              disabled={text.trim().toUpperCase() !== 'RADERA' || arbetar}
              onClick={radera}
            >
              {arbetar ? 'Raderar' : 'Radera kontot'}
            </button>
            <button type="button" className="tk-knapp ljus tk-tryck" style={{ marginTop: 8 }} onClick={stang}>
              Avbryt
            </button>
          </div>
        </div>
      )}
    </>
  );
}
