'use client';

/**
 * En kampanj i rutan "Kampanjmejlen" (lib/kampanj). Samma mönster som kortet
 * om Jobbsöket: tre brickor, en rad om läget och ett test till den inloggade
 * admin. Dessutom reservvägen när morgonkörningen inte nådde alla:
 * "Skicka till de N som återstår", som bara visas medan kampanjen pågår och
 * någon återstår, och som kräver ett andra tryck innan något skickas.
 *
 * Rutten (api/admin/email/kampanj) hoppar själv över dem som redan fått
 * mejlet och vägrar när kampanjen inte pågår. Den här komponenten skickar
 * aldrig utan bekräftelse och aldrig två anrop för ett tryck.
 *
 * Förhandsvisning saknas: rutten har ingen, och testet till mig fyller den
 * rollen.
 */

import { useRef, useState } from 'react';
import MetricCard from '@/components/admin/MetricCard';
import { antal } from './format';
import { bekraftaKnapp, resultatText, skickaKnapp, type KampanjRuta, type KampanjTal } from './kampanjlage';

const RUTT = '/api/admin/email/kampanj';

const KNAPP_SEKUNDAR =
  'min-h-[44px] rounded-xl border border-kant-stark px-4 text-sm font-medium text-ink-1 hover:border-ink-1 disabled:opacity-60';

const KNAPP_PRIMAR =
  'min-h-[44px] rounded-xl bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-60';

type TestLage = 'vilar' | 'skickar' | { klart: string } | { fel: string };
type SkickLage =
  | { steg: 'vilar' }
  | { steg: 'bekraftar'; antal: number }
  | { steg: 'skickar'; antal: number }
  | { steg: 'klart'; text: string }
  | { steg: 'fel'; text: string };

/** Felet ur rutten i klartext, eller en egen mening när svaret saknar ett. */
function felText(svar: unknown, status: number): string {
  const fel = (svar as { error?: unknown } | null)?.error;
  if (typeof fel === 'string' && fel.trim()) return `${fel}.`.replace(/\.\.$/, '.');
  if (status === 401 || status === 403) return 'Du är inte inloggad som admin.';
  return `Servern svarade med fel (${status}).`;
}

export default function KampanjKort({ ruta }: { ruta: KampanjRuta }) {
  const [tal, setTal] = useState<KampanjTal | null>(ruta.tal);
  const [test, setTest] = useState<TestLage>('vilar');
  const [skick, setSkick] = useState<SkickLage>({ steg: 'vilar' });
  // Spärren mot dubbeltryck. State hinner inte uppdateras mellan två snabba
  // klick, en ref gör det.
  const upptagen = useRef(false);

  const lasOm = async (): Promise<boolean> => {
    try {
      const res = await fetch(RUTT, { cache: 'no-store' });
      const svar = await res.json().catch(() => null);
      const rad = Array.isArray(svar?.data)
        ? svar.data.find((r: { kampanj?: string }) => r.kampanj === ruta.nyckel)
        : null;
      if (!res.ok || !rad) return false;
      setTal({ kvar: Number(rad.kvar) || 0, skickade: Number(rad.skickade) || 0 });
      return true;
    } catch {
      return false;
    }
  };

  const skickaTest = async () => {
    if (test === 'skickar') return;
    setTest('skickar');
    try {
      const res = await fetch(RUTT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'test', kampanj: ruta.nyckel }),
      });
      const svar = await res.json().catch(() => null);
      setTest(res.ok && svar?.recipient ? { klart: String(svar.recipient) } : { fel: felText(svar, res.status) });
    } catch {
      setTest({ fel: 'Testet gick inte att skicka. Anropet nådde inte servern.' });
    }
  };

  const skicka = async (antalMejl: number) => {
    if (upptagen.current) return;
    upptagen.current = true;
    setSkick({ steg: 'skickar', antal: antalMejl });
    try {
      let res: Response;
      try {
        res = await fetch(RUTT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'send', kampanj: ruta.nyckel, confirm: true }),
        });
      } catch {
        const omlast = await lasOm();
        setSkick({
          steg: 'fel',
          text: `Svaret kom aldrig fram, så vi vet inte hur många som gick iväg. ${
            omlast ? 'Talen ovan är omlästa: se Skickade innan du försöker igen.' : 'Ladda om sidan och se Skickade innan du försöker igen.'
          }`,
        });
        return;
      }
      const svar = await res.json().catch(() => null);
      if (!res.ok || svar?.success !== true) {
        await lasOm();
        setSkick({ steg: 'fel', text: felText(svar, res.status) });
        return;
      }
      const omlast = await lasOm();
      setSkick({
        steg: 'klart',
        text: `${resultatText(Number(svar.skickade) || 0, Number(svar.misslyckade) || 0)}${
          omlast ? '' : ' Talen kunde inte läsas om, ladda om sidan.'
        }`,
      });
    } finally {
      upptagen.current = false;
    }
  };

  const kvar = tal?.kvar ?? 0;
  const kanSkicka = ruta.lage === 'pagar' && tal !== null && kvar > 0;
  const kunde = (n: number) => (tal ? antal(n) : <span className="text-h1">Kunde inte läsas</span>);

  return (
    <div>
      <h3 className="text-sm font-medium text-ink-1">{ruta.namn}</h3>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard etikett="Utskicksdag" varde={<span className="text-h1">{ruta.utskicksdag}</span>} />
        <MetricCard etikett="Kvar att skicka" varde={kunde(tal?.kvar ?? 0)} />
        <MetricCard etikett="Skickade" varde={kunde(tal?.skickade ?? 0)} />
      </div>
      <p className="mt-4 text-sm text-ink-2">{ruta.lageText}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" onClick={skickaTest} disabled={test === 'skickar'} className={KNAPP_SEKUNDAR}>
          Skicka test till mig
        </button>

        {kanSkicka && skick.steg !== 'bekraftar' && skick.steg !== 'skickar' ? (
          <button
            type="button"
            onClick={() => setSkick({ steg: 'bekraftar', antal: kvar })}
            className={KNAPP_PRIMAR}
          >
            {skickaKnapp(kvar)}
          </button>
        ) : null}

        {skick.steg === 'bekraftar' ? (
          <>
            <button type="button" onClick={() => skicka(skick.antal)} className={KNAPP_PRIMAR}>
              {bekraftaKnapp(skick.antal)}
            </button>
            <button type="button" onClick={() => setSkick({ steg: 'vilar' })} className={KNAPP_SEKUNDAR}>
              Avbryt
            </button>
          </>
        ) : null}

        {skick.steg === 'skickar' ? (
          <button type="button" disabled className={KNAPP_PRIMAR}>
            {`Skickar ${antal(skick.antal)} mejl`}
          </button>
        ) : null}
      </div>

      {skick.steg === 'bekraftar' ? (
        <p className="mt-3 text-meta text-ink-3">
          Mejlet går till riktiga mottagare. De som redan fått det hoppas över.
        </p>
      ) : null}
      {skick.steg === 'skickar' ? (
        <p className="mt-3 text-meta text-ink-2" role="status">
          Vi skickar i omgångar om 100. Stanna kvar på sidan tills svaret kommer.
        </p>
      ) : null}
      {skick.steg === 'klart' ? (
        <p className="mt-3 text-meta text-ink-2" role="status">{skick.text}</p>
      ) : null}
      {skick.steg === 'fel' ? (
        <p className="mt-3 text-meta text-fel" role="alert">{`Utskicket gick inte: ${skick.text}`}</p>
      ) : null}

      {typeof test === 'object' && 'klart' in test ? (
        <p className="mt-3 text-meta text-ink-2" role="status">{`Testet skickat till ${test.klart}.`}</p>
      ) : null}
      {typeof test === 'object' && 'fel' in test ? (
        <p className="mt-3 text-meta text-fel" role="alert">{`Testet gick inte: ${test.fel}`}</p>
      ) : null}
    </div>
  );
}
