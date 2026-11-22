'use client';

/**
 * Logga ut och Radera kontot i appens konto (konceptets kontoVy och arket
 * radera). Kontot raderas via /api/app/konto, som raderar allt med service
 * role på servern, samma väg som webbens Inställningar.
 *
 * Webbens väg (useKontoHandlingar.ts) anropar auth.admin.deleteUser från
 * webbläsaren, vilket alltid nekas med användarens nyckel, och reserven
 * delete_user_account finns inte i databasen. Därför går appen via servern.
 */
import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';
import { vidUtloggning } from '@/lib/lagring/kontoLagring';
import { haptik } from './skal';
import { ANLEDNINGAR, type Anledning } from '@/lib/konto/avslut';
import { DATALAGRING_HREF, R10B_LANKORD, RADERA_TEXT } from '@/lib/konto/radera-copy';

/**
 * Raderar kontot på servern med den frivilliga anledningen i kroppen
 * (beslut-mejl-och-radering 2c punkt 7). Ingen aktivitetsrad skrivs före:
 * den försvann ändå med kontot och höll kvar raderingen.
 */
export async function raderaKonto(anledning: Anledning | null): Promise<void> {
  const supabase = getSupabaseClient();
  // Servern raderar allt (lib/konto/raderaKonto.server.ts). De tidigare
  // anropen till /api/cv och /api/letters med DELETE är borta 2026-11-15:
  // brevens rutt saknar DELETE, och CV:na försvann även om raderingen avbröts.
  const res = await fetch('/api/app/konto', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anledning }),
  });
  if (!res.ok) throw new Error(`radera ${res.status}`);
  // Sessionen pekar på ett konto som inte finns; rensa den lokalt.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  vidUtloggning();
}

// epost tas fortfarande emot av anroparen men behövs inte längre här.
export default function KontoHandlingar({ userId }: { userId: string; epost: string | null }) {
  const [ark, setArk] = useState(false);
  const [text, setText] = useState('');
  const [anledning, setAnledning] = useState<Anledning | null>(null);
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
    setAnledning(null);
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
    vidUtloggning();
    window.location.href = '/login';
  };

  const radera = async () => {
    setArbetar(true);
    setFel(null);
    try {
      await raderaKonto(anledning);
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
            <span>{RADERA_TEXT.R11}</span>
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
              {RADERA_TEXT.R10}
            </p>
            <p className="tk-meta" style={{ marginTop: 8 }}>
              {RADERA_TEXT.R10b.split(R10B_LANKORD)[0]}
              <a className="tk-lank" href={DATALAGRING_HREF} style={{ fontSize: 'inherit' }}>
                {R10B_LANKORD}
              </a>
              {RADERA_TEXT.R10b.split(R10B_LANKORD)[1]}
            </p>
            <fieldset style={{ marginTop: 16, border: 0, padding: 0, minWidth: 0 }}>
              <legend className="tk-p" style={{ fontWeight: 600, padding: 0 }}>
                {RADERA_TEXT.R6}
              </legend>
              <p className="tk-meta" style={{ marginTop: 2 }}>
                {RADERA_TEXT.R7}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {ANLEDNINGAR.map((a) => {
                  const vald = anledning === a.nyckel;
                  return (
                    <button
                      key={a.nyckel}
                      type="button"
                      className="tk-val tk-tryck"
                      aria-pressed={vald}
                      disabled={arbetar}
                      onClick={() => setAnledning(vald ? null : a.nyckel)}
                    >
                      {a.etikett}
                    </button>
                  );
                })}
              </div>
            </fieldset>
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
