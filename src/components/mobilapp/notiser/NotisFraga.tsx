'use client';

/**
 * Notisfrågan efter första klara passet (konceptets ark "notis" och
 * "system", docs/plan-app.md 2.7). Aldrig vid start: flikarnas layout
 * skickar visa bara när kontot har ett klart pass och ingen telefon i
 * app_enheter. Vår egen fråga kommer först; systemets dialog visas bara
 * efter ett ja här. "Inte nu" sparas på telefonen och frågan kommer inte
 * igen; påminnelsen går att slå på i kontot.
 *
 * Har kontot redan en telefon förnyas tokenen tyst vid start, eftersom
 * Firebase kan byta den.
 */
import { useEffect, useState } from 'react';
import { PAMINNELSE_STANDARD, PAMINNELSE_TIDER } from '@/lib/mobilapp/notis';
import { IkonBell } from '../ikoner';
import { haptik } from '../skal';
import { fornyaToken, harPush, pushBehorighet, slaPaPaminnelse } from '../skal-notiser';
import { Toast } from '../kop/KopVy';
import '../kop/kop.css';

const SVAR_NYCKEL = 'tk-notisfraga';

function lasSvar(): string | null {
  try {
    return window.localStorage.getItem(SVAR_NYCKEL);
  } catch {
    return null;
  }
}
function sparaSvar(v: string): void {
  try {
    window.localStorage.setItem(SVAR_NYCKEL, v);
  } catch {
    // Utan lagring kan frågan komma igen, inget annat.
  }
}

export default function NotisFraga({ visa, harEnhet }: { visa: boolean; harEnhet: boolean }) {
  const [oppen, setOppen] = useState(false);
  const [tid, setTid] = useState(PAMINNELSE_STANDARD);
  const [arbetar, setArbetar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (harEnhet) void fornyaToken();
  }, [harEnhet]);

  useEffect(() => {
    if (!visa || harEnhet || !harPush() || lasSvar()) return;
    let avbruten = false;
    const t = setTimeout(async () => {
      // Har de redan nekat i systemet hjälper inte frågan.
      if ((await pushBehorighet()) === 'denied' || avbruten) return;
      window.history.pushState({ ...(window.history.state ?? {}), tkArk: true }, '');
      setOppen(true);
      haptik('latt');
    }, 600);
    return () => {
      avbruten = true;
      clearTimeout(t);
    };
  }, [visa, harEnhet]);

  // Android-tillbaka stänger arket, som "Inte nu".
  useEffect(() => {
    if (!oppen) return;
    const pop = () => {
      if (!lasSvar()) sparaSvar('inte-nu');
      setOppen(false);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [oppen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const stang = (svar: string) => {
    sparaSvar(svar);
    setOppen(false);
    if ((window.history.state as { tkArk?: boolean } | null)?.tkArk) window.history.back();
  };

  const ja = async () => {
    setArbetar(true);
    setFel(null);
    const utfall = await slaPaPaminnelse(tid);
    setArbetar(false);
    if (utfall === 'pa') {
      stang('ja');
      haptik('latt');
      setToast(`Påminnelse kl ${tid}`);
    } else if (utfall === 'nekad') {
      stang('nekad');
    } else {
      setFel('Påminnelsen gick inte att slå på. Försök igen, eller gör det senare i kontot.');
    }
  };

  return (
    <>
      {oppen && (
        <div className="tk-ark-lager" onClick={() => stang('inte-nu')}>
          <div className="tk-ark" role="dialog" aria-modal="true" aria-labelledby="tk-notis" onClick={(e) => e.stopPropagation()}>
            <div className="handtag" />
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span
                className="tk-sym"
                style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--kop-mjuk)', color: 'var(--kop-ink)', display: 'grid', placeItems: 'center' }}
              >
                <IkonBell />
              </span>
              <h2 id="tk-notis" className="tk-h2">
                Ska vi påminna dig?
              </h2>
            </div>
            <p className="tk-p" style={{ marginTop: 12 }}>
              En notis om dagen, &quot;Dags för dagens pass i Testklar&quot;. Aldrig mer än en, och du stänger av när du vill.
            </p>
            <p className="tk-ey" style={{ marginTop: 16 }}>
              När passar det?
            </p>
            <div className="tk-tidchips" style={{ marginTop: 8 }} role="radiogroup" aria-label="Tid för påminnelsen">
              {PAMINNELSE_TIDER.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={tid === t} className={`tk-tryck${tid === t ? ' vald' : ''}`} onClick={() => setTid(t)}>
                  {t}
                </button>
              ))}
            </div>
            {fel && (
              <p className="tk-meta" role="alert" style={{ color: 'var(--fel)', marginTop: 10 }}>
                {fel}
              </p>
            )}
            <button type="button" className="tk-knapp kop tk-tryck" style={{ marginTop: 16 }} disabled={arbetar} onClick={ja}>
              {arbetar ? 'Slår på' : `Påminn mig kl ${tid}`}
            </button>
            <button type="button" className="tk-lank" style={{ display: 'block', margin: '14px auto 0' }} onClick={() => stang('inte-nu')}>
              Inte nu
            </button>
          </div>
        </div>
      )}
      {toast && <Toast text={toast} />}
    </>
  );
}
