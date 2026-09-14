'use client';

/**
 * Prisjamforelsen mellan PLANS och Stripe.
 *
 * Komponenten far forvantningarna fardiga fran servern och hamtar
 * speglingen efterat fran /api/admin/installningar/stripe. Det ar medvetet:
 * priserna ur PLANS ar sidans varde och maste sta pa skarmen direkt, medan
 * Stripe-anropet tar den tid det tar. Hade jamforelsen gjorts i
 * serverrenderingen hade hela sidan vantat pa Stripe, och LCP under 1,5
 * sekunder vore omojligt.
 *
 * Ytan ar reserverad innan svaret kommer: skelettet har lika manga rader som
 * det finns produktsteg, sa listan byter innehall utan att flytta nagot.
 *
 * Adminen skriver aldrig till Stripe. Ett felkonfigurerat pris rapporteras
 * har och rattas av agaren i Stripes egen instrumentpanel.
 */

import { useEffect, useState } from 'react';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import FlowError from '@/components/shell/FlowError';
import type { ForvantanRad } from './data';

interface Prisrad {
  id: string;
  produkt: string | null;
  beloppOre: number | null;
  valuta: string;
  typ: 'one_time' | 'recurring';
  intervall: string | null;
  intervallAntal: number | null;
  aktiv: boolean;
}

interface Kupongrad {
  id: string;
  namn: string | null;
  avdragOre: number | null;
  avdragProcent: number | null;
  varaktighet: string;
  manader: number | null;
  inlosta: number;
  giltig: boolean;
}

interface Spegling {
  priser: Prisrad[];
  kuponger: Kupongrad[];
  hamtad: string;
}

/*
 * Forvantningarna kommer fardigt serialiserade fran data.ts.
 *
 * Bade typen ForvantanRad och omvandlingen tillRad bor dar, inte har. En
 * funktion som exporteras ur en 'use client'-fil gar inte att anropa fran
 * servern: Next kastar "Attempted to call tillRad() from the server but
 * tillRad is on the client" och sidan renderar tomt, med status 200 och utan
 * ett enda synligt fel i webblasaren. Den har kommentaren star kvar sa att
 * ingen flyttar tillbaka den.
 */

function kronor(ore: number | null | undefined): string {
  if (typeof ore !== 'number') return 'saknas';
  return `${(ore / 100).toLocaleString('sv-SE')} kr`;
}

/**
 * Perioden i klartext.
 *
 * Stripe beskriver ett kvartal som interval month med interval_count 3, inte
 * som ett eget kvartalsintervall. Att lasa bara interval och se "month" ar
 * darfor att lasa halva faltet: ett kvartalspris ser ut som ett manadspris.
 * Har lases bada, och kvartalet skrivs ut som kvartal.
 */
function period(pris: Prisrad): string {
  if (pris.typ === 'one_time') return 'engångs';
  const antal = pris.intervallAntal ?? 1;
  const enhet = pris.intervall ?? 'month';
  if (enhet === 'month' && antal === 1) return 'per månad';
  if (enhet === 'month' && antal === 3) return 'per kvartal';
  if (enhet === 'month') return `var ${antal}:e månad`;
  if (enhet === 'year' && antal === 1) return 'per år';
  if (enhet === 'week') return antal === 1 ? 'per vecka' : `var ${antal}:e vecka`;
  if (enhet === 'day') return antal === 1 ? 'per dag' : `var ${antal}:e dag`;
  return `${enhet} x ${antal}`;
}

/** Manader per debitering, for att jamfora mot PLANS. */
function manaderPerDebitering(pris: Prisrad): number | null {
  if (pris.typ === 'one_time') return null;
  const antal = pris.intervallAntal ?? 1;
  if (pris.intervall === 'month') return antal;
  if (pris.intervall === 'year') return antal * 12;
  return null;
}

interface Avvikelse {
  rad: ForvantanRad;
  text: string;
}

export default function Stripejamforelse({
  forvantningar,
  retentionkupong,
}: {
  forvantningar: ForvantanRad[];
  retentionkupong: string;
}) {
  const [spegling, setSpegling] = useState<Spegling | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [rakna, setRakna] = useState(0);

  useEffect(() => {
    let avbruten = false;
    setFel(null);
    setSpegling(null);

    fetch('/api/admin/installningar/stripe')
      .then(async (svar) => {
        const kropp = await svar.json();
        if (!svar.ok) throw new Error(kropp?.error ?? `Servern svarade ${svar.status}`);
        return kropp as Spegling;
      })
      .then((s) => {
        if (!avbruten) setSpegling(s);
      })
      .catch((e: unknown) => {
        if (!avbruten) setFel(e instanceof Error ? e.message : 'Stripe svarade inte.');
      });

    return () => {
      avbruten = true;
    };
  }, [rakna]);

  if (fel) {
    return (
      <FlowError
        title="Stripe svarade inte"
        message={fel}
        onRetry={() => setRakna((n) => n + 1)}
      />
    );
  }

  if (!spegling) {
    return <LoadingSkeleton variant="list" count={forvantningar.length} label="Stripe hämtas" />;
  }

  const perId = new Map(spegling.priser.map((p) => [p.id, p]));

  const avvikelser: Avvikelse[] = [];

  for (const rad of forvantningar) {
    if (!rad.prisId) {
      avvikelser.push({
        rad,
        text: `Env-variabeln ${rad.envNamn} är inte satt, så steget går inte att sälja.`,
      });
      continue;
    }

    const pris = perId.get(rad.prisId);
    if (!pris) {
      avvikelser.push({
        rad,
        text: `Price-id ${rad.prisId} finns inte bland Stripes priser.`,
      });
      continue;
    }

    if (!pris.aktiv) {
      avvikelser.push({ rad, text: 'Priset är arkiverat i Stripe men används fortfarande.' });
    }

    if (pris.beloppOre !== rad.forvantatOreEtt) {
      avvikelser.push({
        rad,
        text: `Beloppet är ${kronor(pris.beloppOre)} i Stripe men ${kronor(rad.forvantatOreEtt)} i prisstegen.`,
      });
    }

    if (pris.typ !== rad.forvantadTyp) {
      avvikelser.push({
        rad,
        text:
          rad.forvantadTyp === 'recurring'
            ? 'Prisstegen säger prenumeration, Stripe säger engångsköp.'
            : 'Prisstegen säger engångsköp, Stripe säger prenumeration.',
      });
    } else if (rad.forvantadePerioderIManader !== null) {
      const manader = manaderPerDebitering(pris);
      if (manader !== rad.forvantadePerioderIManader) {
        avvikelser.push({
          rad,
          text: `Debiteringen är ${period(pris)} i Stripe men ska vara var ${rad.forvantadePerioderIManader}:e månad.`,
        });
      }
    }
  }

  const kupong = spegling.kuponger.find((k) => k.id === retentionkupong) ?? null;
  const ovriga = spegling.kuponger.filter((k) => k.id !== retentionkupong);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-ink-3">Prisstegen mot Stripe</h3>
          <button
            type="button"
            onClick={() => setRakna((n) => n + 1)}
            className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
          >
            Läs om
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-kant bg-panel">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className="border-b border-kant px-4 py-3 text-left text-sm font-medium text-ink-3">
                  Steg
                </th>
                <th scope="col" className="border-b border-kant px-4 py-3 text-left text-sm font-medium text-ink-3">
                  Prisstegen
                </th>
                <th scope="col" className="border-b border-kant px-4 py-3 text-left text-sm font-medium text-ink-3">
                  Stripe
                </th>
                <th scope="col" className="border-b border-kant px-4 py-3 text-left text-sm font-medium text-ink-3">
                  Price-id
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {forvantningar.map((rad) => {
                const pris = rad.prisId ? perId.get(rad.prisId) : undefined;
                const stamm = !avvikelser.some((a) => a.rad.nyckel === rad.nyckel);
                return (
                  <tr key={rad.nyckel}>
                    <td className="px-4 py-3 text-ink-1">{rad.namn}</td>
                    <td className="px-4 py-3 tabular-nums text-ink-2">
                      {kronor(rad.forvantatOreEtt)}{' '}
                      {rad.forvantadTyp === 'one_time'
                        ? 'engångs'
                        : rad.forvantadePerioderIManader === 3
                          ? 'per kvartal'
                          : 'per månad'}
                    </td>
                    <td className={`px-4 py-3 tabular-nums ${stamm ? 'text-positiv' : 'text-varning'}`}>
                      {pris ? `${kronor(pris.beloppOre)} ${period(pris)}` : 'saknas'}
                    </td>
                    <td className="px-4 py-3 text-meta text-ink-3">{rad.prisId ?? rad.envNamn}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-meta text-ink-3">
          {avvikelser.length === 0
            ? 'Alla fyra stegen stämmer mot Stripe.'
            : `${avvikelser.length} avvikelser. Rättningen görs i Stripe av ägaren: adminen skriver aldrig dit.`}{' '}
          Kvartalspriset läses som interval month med interval_count 3, vilket är hur
          Stripe beskriver ett kvartal. Läser man bara interval ser det ut som ett
          månadspris på 299 kr, och det är inte vad det är.
        </p>
      </div>

      {avvikelser.length ? (
        <div>
          <h3 className="mb-2 text-sm font-medium text-ink-3">Avvikelser</h3>
          <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
            {avvikelser.map((a, i) => (
              <li key={`${a.rad.nyckel}-${i}`} className="px-4 py-3">
                <p className="text-kort text-ink-1">{a.rad.namn}</p>
                <p className="mt-0.5 text-meta text-varning">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink-3">Kuponger</h3>
        <div className="rounded-xl border border-kant bg-panel">
          <ul className="divide-y divide-kant">
            <li className="px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-kort text-ink-1">{retentionkupong}</p>
                <p className="text-meta tabular-nums text-ink-3">
                  {kupong ? `${kupong.inlosta} inlösen` : 'finns inte i Stripe'}
                </p>
              </div>
              <p className="mt-0.5 text-meta text-ink-3">
                {kupong
                  ? `${kupong.namn ?? 'Utan namn'}, ${
                      kupong.avdragOre
                        ? `${kronor(kupong.avdragOre)} av`
                        : `${kupong.avdragProcent} procent av`
                    }, ${kupong.varaktighet}${kupong.manader ? ` i ${kupong.manader} månader` : ''}. ${
                      kupong.giltig ? 'Giltig.' : 'Ogiltig i Stripe.'
                    }`
                  : 'Erbjuds i uppsägningsflödet men saknas i Stripe. Flödet slutar då fungera tyst.'}
              </p>
            </li>

            {ovriga.map((k) => (
              <li key={k.id} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-kort text-ink-1">{k.id}</p>
                  <p className="text-meta tabular-nums text-ink-3">{k.inlosta} inlösen</p>
                </div>
                <p className="mt-0.5 text-meta text-ink-3">
                  {k.namn ?? 'Utan namn'},{' '}
                  {k.avdragOre ? `${kronor(k.avdragOre)} av` : `${k.avdragProcent} procent av`},{' '}
                  {k.varaktighet}
                  {k.manader ? ` i ${k.manader} månader` : ''}.{' '}
                  {k.giltig ? 'Giltig.' : 'Ogiltig, används inte längre.'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-meta text-ink-3">
        Läst ur Stripe {new Date(spegling.hamtad).toLocaleString('sv-SE')}. Läsning bara:
        rutten har ingen skrivväg.
      </p>
    </div>
  );
}
