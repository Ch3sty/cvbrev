/**
 * Intäkternas delar ur köpliggaren (spec-admin-tydlighet punkt 1 och 2):
 * toppkorten, sektionen Köp och intäkten per dag.
 *
 * Serverkomponenter som läser Stripe via kop.ts, alltså alltid bakom en
 * Suspense-gräns med reserverad höjd i sidan. De delar ett anrop per
 * begäran genom lasKopLiggare (React cache).
 */

import Link from 'next/link';
import MetricCard from '@/components/admin/MetricCard';
import SectionCard from '@/components/admin/SectionCard';
import type { KopRad } from '@/lib/admin/kop';
import { datumKort, kronor, tal, tidKort } from '@/lib/admin/tomt';
import { lasKopLiggare } from '../kopKalla';
import {
  intaktPerDag,
  kopIFonster,
  kopTypText,
  senasteAv,
  uppraknat,
} from '../kopFormat';
import IntaktDiagram from './IntaktDiagram';

const FONSTER = 30;

function kontoKort(id: string | null): string {
  return id ? id.slice(0, 8) : 'okänt konto';
}

// ---------------------------------------------------------------------------
// Toppkorten
// ---------------------------------------------------------------------------

export async function KopToppkort({ nuMs }: { nuMs: number }) {
  const liggare = await lasKopLiggare();
  const f = kopIFonster(liggare.rader, FONSTER, nuMs);
  const s = f.summa;
  const raknas = f.rader.filter((r) => !r.internt && !r.aterbetalning);

  const fornyelser = raknas.filter((r) => r.typ === 'lopande' && !r.ny).length;
  const nyaLopande = raknas.filter((r) => r.typ === 'lopande' && r.ny).length;
  const lopandeText = [
    `${tal(fornyelser)} ${fornyelser === 1 ? 'förnyelse' : 'förnyelser'}`,
    nyaLopande ? `${tal(nyaLopande)} ${nyaLopande === 1 ? 'ny' : 'nya'}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const perPaket = new Map<string, number>();
  for (const r of raknas) {
    if (r.typ !== 'engangs') continue;
    perPaket.set(r.paketNamn, (perPaket.get(r.paketNamn) ?? 0) + 1);
  }
  const senasteEngangs = senasteAv(liggare.rader, 'engangs');
  const engangsText = perPaket.size
    ? uppraknat([...perPaket.entries()].map(([namn, n]) => `${n} ${namn}`))
    : senasteEngangs
      ? `0 st, senaste ${senasteEngangs.paketNamn} ${datumKort(senasteEngangs.tid)}`
      : `0 st på ${liggare.fonsterDagar} dagar`;

  const spann = `${datumKort(new Date(f.franMs).toISOString())} till ${datumKort(new Date(nuMs).toISOString())}`;

  return (
    <>
      <MetricCard
        etikett="Intäkt, 30 dagar"
        varde={kronor(s.totaltOre)}
        jamforelse={liggare.fel ? 'Stripe svarade inte, försök igen om en stund' : spann}
        andraJamforelse={
          s.aterbetaltOre > 0 ? `${kronor(s.aterbetaltOre)} återbetalt är avdraget` : undefined
        }
      />
      <MetricCard etikett="Löpande" varde={kronor(s.lopandeOre)} jamforelse={lopandeText} />
      <MetricCard etikett="Engångs" varde={kronor(s.engangsOre)} jamforelse={engangsText} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Köp
// ---------------------------------------------------------------------------

function KontoLank({ r }: { r: KopRad }) {
  if (!r.userId) return <span className="text-ink-3">okänt konto</span>;
  return (
    <Link
      href={`/admin/anvandare/${r.userId}`}
      className="font-mono text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
    >
      {kontoKort(r.userId)}
    </Link>
  );
}

function Internt() {
  return (
    <span className="ml-2 rounded-md border border-kant px-1.5 py-0.5 text-meta text-ink-3">
      internt
    </span>
  );
}

export async function KopSektion({ nuMs }: { nuMs: number }) {
  const liggare = await lasKopLiggare();
  const f = kopIFonster(liggare.rader, FONSTER, nuMs);
  const antal = f.rader.filter((r) => !r.internt).length;

  const meta: string[] = [];
  if (f.interna > 0) {
    meta.push(`${tal(f.interna)} ${f.interna === 1 ? 'internt köp' : 'interna köp'} undantagna.`);
  }
  meta.push(`Startade men inte betalda kassor senaste dygnet: ${tal(liggare.oppnaKassorIdag)}.`);

  const senaste = senasteAv(liggare.rader, 'engangs') ?? senasteAv(liggare.rader, 'lopande');

  return (
    <SectionCard rubrik={`Köp, senaste 30 dagarna (${tal(antal)})`} naken>
      {liggare.fel ? (
        <p className="px-4 py-4 text-sm text-ink-2">Köpen kunde inte läsas. {liggare.fel}</p>
      ) : f.rader.length === 0 ? (
        <p className="px-4 py-4 text-sm text-ink-2">
          {`0 köp sedan ${datumKort(new Date(f.franMs).toISOString())}.`}
          {senaste
            ? ` Senaste köp: ${tidKort(senaste.tid)}, ${senaste.paketNamn} ${kronor(senaste.beloppOre)}.`
            : ''}
        </p>
      ) : (
        <>
          {/* Mobil: en lista, så att sidan aldrig scrollar i sidled. */}
          <ul className="divide-y divide-kant sm:hidden">
            {f.rader.map((r) => (
              <li key={r.id} className={`px-4 py-3 ${r.internt ? 'text-ink-3' : ''}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink-1">
                    {r.paketNamn}
                    {r.internt ? <Internt /> : null}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-ink-1">
                    {kronor(r.beloppOre)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-meta text-ink-3">
                  <span className="tabular-nums">{tidKort(r.tid)}</span>
                  <span>·</span>
                  <span>{kopTypText(r)}</span>
                  <span>·</span>
                  <KontoLank r={r} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th scope="col" className="px-4 py-3">Datum</th>
                  <th scope="col" className="px-4 py-3">Paket</th>
                  <th scope="col" className="px-4 py-3">Konto</th>
                  <th scope="col" className="px-4 py-3">Typ</th>
                  <th scope="col" className="px-4 py-3 text-right">Belopp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {f.rader.map((r) => (
                  <tr key={r.id} className={r.internt ? 'text-ink-3' : 'text-ink-1'}>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">{tidKort(r.tid)}</td>
                    <td className="px-4 py-3">
                      {r.paketNamn}
                      {r.internt ? <Internt /> : null}
                    </td>
                    <td className="px-4 py-3">
                      <KontoLank r={r} />
                      {r.email ? (
                        <span className="block max-w-[220px] truncate text-meta text-ink-3">
                          {r.email}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-2">{kopTypText(r)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {kronor(r.beloppOre)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">{meta.join(' ')}</p>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Intäkt per dag
// ---------------------------------------------------------------------------

export async function IntaktPerDagSektion({ nuMs }: { nuMs: number }) {
  const liggare = await lasKopLiggare();
  const f = kopIFonster(liggare.rader, FONSTER, nuMs);
  const s = f.summa;
  const rader = intaktPerDag(liggare.rader, FONSTER, nuMs);

  return (
    <SectionCard rubrik="Intäkt per dag, 30 dagar">
      <IntaktDiagram
        data={rader}
        enhet="ore"
        serier={[
          { nyckel: 'lopande', namn: 'Löpande', typ: 'stapel', roll: 'allt', stackId: 'intakt' },
          // Orange markerar engångsköpen, det enskilda värdet ägaren letar efter.
          { nyckel: 'engangs', namn: 'Engångsköp', typ: 'stapel', roll: 'framhavd', stackId: 'intakt' },
        ]}
        tomText={`0 kr sedan ${datumKort(new Date(f.franMs).toISOString())}.`}
      />
      <p className="mt-3 text-meta text-ink-3">
        {`Stripe, debiteringar minus återbetalningar. 30 dagar: ${kronor(s.totaltOre)}, varav ${kronor(s.lopandeOre)} löpande och ${kronor(s.engangsOre)} engångs.`}
      </p>
    </SectionCard>
  );
}
