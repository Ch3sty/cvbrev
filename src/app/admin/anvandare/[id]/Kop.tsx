/**
 * Sektionen Kop pa detaljsidan (spec-admin-tydlighet 2026-09-22 punkt 9).
 *
 * Svarar pa supportfragan "vad har den har kunden kopt" pa ett stalle: en rad
 * per betalning ur Stripe, med datum, paket, belopp, betalsatt och ny eller
 * fornyelse, plus angerrattssamtycket och hur lange kopet galler.
 *
 * Stripe-anrop, sa sektionen ligger i en Suspense-grans med reserverad hojd
 * och laser en cachad funktion (15 minuter, adminens tagg). Profilen,
 * paketet och kvoten star kvar medan den hamtas.
 *
 * En lista, inte en tabell: pa 412 px far varje kop tva rader i stallet for
 * en tabell som scrollar i sidled.
 */

import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { MATSTART, kronor, tidKort } from '@/lib/admin/tomt';
import { hamtaKontotsKop, hamtaPrenumerationStart } from '../stripe';
import { gallerTill, type PaketEtikett } from '../format';

/** Samma hojd som skelettet, sa att ytan inte hoppar nar listan kommer. */
export const KOP_MINHOJD = 'min-h-[176px]';

export function KopSkelett() {
  return (
    <div className={`p-4 ${KOP_MINHOJD}`}>
      <LoadingSkeleton variant="row" count={3} label="Köpen hämtas från Stripe" />
    </div>
  );
}

export default async function Kop({
  kund,
  userId,
  email,
  samtycke,
  etikett,
  premiumUntil,
}: {
  kund: string | null;
  userId: string;
  email: string | null;
  /** profiles.angerratt_samtycke_at */
  samtycke: string | null;
  /** Kontots paket, for raden "Galler till". */
  etikett: PaketEtikett;
  premiumUntil: string | null;
}) {
  if (!kund) {
    return (
      <p className="px-4 py-3 text-sm text-ink-2">
        Inga köp. Kontot har aldrig gått till kassan, så det finns ingen
        Stripe-kund.
      </p>
    );
  }

  const [{ rader, fel }, starter] = await Promise.all([
    hamtaKontotsKop(kund, userId, email),
    etikett.lopande ? hamtaPrenumerationStart() : Promise.resolve({} as Record<string, string>),
  ]);
  const gallerTillText = gallerTill(etikett, { premium_until: premiumUntil }, starter[kund] ?? null);

  // Samtycket skrivs fran paketreleasen. Saknas det pa ett konto som kopt
  // fore den vet vi inte; saknas det annars har kunden aldrig gett det.
  const koptFore = rader.some((r) => !r.aterbetalning && r.tid < MATSTART.paket);
  const samtyckeText = samtycke
    ? tidKort(samtycke)
    : koptFore
      ? `okänt, före ${tidKort(MATSTART.paket)}`
      : 'aldrig givet';

  return (
    <div className={KOP_MINHOJD}>
      {fel ? (
        <p className="border-b border-kant px-4 py-3 text-meta text-ink-3">{fel}</p>
      ) : null}

      {rader.length === 0 && !fel ? (
        <p className="px-4 py-3 text-sm text-ink-2">
          Inga betalningar i Stripe. Kunden har öppnat kassan men aldrig betalat.
        </p>
      ) : (
        <ul className="divide-y divide-kant">
          {rader.map((r) => (
            <li key={r.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
              <span className="min-w-0">
                <span className="block text-sm text-ink-1">
                  {r.aterbetalning ? `Återbetalning, ${r.paketNamn}` : r.paketNamn}
                </span>
                <span className="mt-0.5 block text-meta text-ink-3">
                  {[
                    tidKort(r.tid),
                    r.betalsatt ?? 'okänt betalsätt',
                    r.aterbetalning
                      ? null
                      : `${r.ny ? 'ny' : 'förnyelse'}, ${r.typ === 'lopande' ? 'löpande' : 'engångs'}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <span
                className={`shrink-0 text-sm tabular-nums ${r.aterbetalning ? 'text-fel' : 'text-ink-1'}`}
              >
                {kronor(r.beloppOre)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="border-t border-kant px-4 py-3 text-meta text-ink-3">
        <div className="flex flex-wrap gap-x-2">
          <dt>Ångerrättssamtycke:</dt>
          <dd className="text-ink-2">{samtyckeText}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt>Gäller till:</dt>
          <dd className="text-ink-2">{gallerTillText}</dd>
        </div>
      </dl>
    </div>
  );
}
