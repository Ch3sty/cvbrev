/**
 * Tratt, vyn Veckor (det som var Funnel, spec-admin-tydlighet sidan 4
 * "efter").
 *
 * Samma källregel som Köpvägen: besökare ur PostHog (admin_funnel_weekly),
 * nya konton ur profiles, köp ur admin_daily_metrics.new_paying (Stripe,
 * kundens första lyckade debitering). Pågående vecka märks "v. 39, dag 2 av
 * 7" och jämförs mot förra hela veckan i text, aldrig som ett ras. Veckor
 * före ett stegs mätstart visas grått med "mäts från", inte som 0.
 *
 * Kritiska vägen läser bara Supabase. Köpens paket ur Stripe kommer i
 * Suspense.
 */

import { Suspense, cache } from 'react';
import MetricCard from '@/components/admin/MetricCard';
import { dagStr } from '@/lib/admin/collect';
import { hamtaKopLiggare } from '@/lib/admin/kop';
import type { Undantag } from '@/lib/admin/undantag';
import { datumKort, tal } from '@/lib/admin/tomt';
import { VeckoDiagram } from './TrattDiagram';
import { PaketNamn, Panel, Valrad } from './delar';
import { hamtaVeckoData, STEG_ETIKETT, VECKO_STEG, type VeckoRad } from './funnel-data';
import {
  DIAGRAM_DAGAR,
  PAKETEN,
  STEG_MATSTART,
  kopIFonster,
  kopLista,
  sparFranPaket,
  svenskMidnattIso,
  veckaInfo,
  veckaStatus,
  type Paket,
} from './berakning';

const VECKOVAL = [4, 8, 13, 26] as const;
const lasKop = cache(() => hamtaKopLiggare(30));
const KORT = 'min-h-[132px]';

type Kolumn = 'pageview' | 'nya_konton' | (typeof VECKO_STEG)[number] | 'kop';
const KOLUMNER: Kolumn[] = ['pageview', 'nya_konton', ...VECKO_STEG, 'kop'];

function varde(r: VeckoRad, k: Kolumn): number | null {
  if (k === 'pageview') return r.besokare;
  if (k === 'nya_konton') return r.nyaKonton;
  if (k === 'kop') return r.kop;
  return r.steg[k];
}

/**
 * En cell: talet, eller grått "mäts från" för en vecka före mätstarten.
 * En vecka som saknar insamling säger det, den blir aldrig 0.
 */
function Cell({ r, k }: { r: VeckoRad; k: Kolumn }) {
  const status = veckaStatus(k, r.vecka);
  const start = STEG_MATSTART[k];
  if (status === 'fore' && start) {
    return <span className="text-meta text-ink-3">mäts från {datumKort(start)}</span>;
  }
  const v = varde(r, k);
  if (v === null) return <span className="text-meta text-ink-3">inte insamlad</span>;
  return (
    <span className="tabular-nums text-ink-1">
      {tal(v)}
      {status === 'delvis' && start ? (
        <span className="ml-1 text-meta text-ink-3">från {datumKort(start)}</span>
      ) : null}
    </span>
  );
}

export default async function VeckorVy({
  antalVeckor,
  konton,
}: {
  antalVeckor: number;
  konton: Undantag['konton'];
}) {
  const n = (VECKOVAL as readonly number[]).includes(antalVeckor) ? antalVeckor : 8;
  const { veckor } = await hamtaVeckoData(n, konton);
  const idag = dagStr();

  const nu = veckor[0];
  const forra = veckor[1];
  const nuInfo = nu ? veckaInfo(nu.vecka, idag) : null;
  const forraInfo = forra ? veckaInfo(forra.vecka, idag) : null;
  const helaVeckor = veckor.filter((v) => !veckaInfo(v.vecka, idag).pagaende);
  const period = nuInfo?.pagaende ? 'veckan hittills' : 'senaste veckan';

  const jamfor = (etikett: string, forraVarde: number | null) =>
    forraInfo ? `${etikett} Hela v. ${forraInfo.nummer}: ${forraVarde === null ? 'inte insamlad' : tal(forraVarde)}.` : etikett;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Valrad
          etikett="Veckor"
          val={VECKOVAL.map((v) => ({
            namn: String(v),
            href: v === 8 ? '/admin/tratt?vy=veckor' : `/admin/tratt?vy=veckor&veckor=${v}`,
            aktiv: v === n,
          }))}
        />
        {nuInfo ? (
          <p className="text-meta text-ink-3">
            {nuInfo.pagaende
              ? `Vecka ${nuInfo.nummer} pågår, dag ${nuInfo.dag} av 7. Den jämförs inte rakt mot hela veckor.`
              : `Vecka ${nuInfo.nummer} är den senaste.`}
          </p>
        ) : null}
      </div>

      {nu ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard
            className={KORT}
            etikett={`Besökare, ${period}`}
            varde={nu.besokare === null ? <span className="block text-fraga">Inte insamlad än</span> : tal(nu.besokare)}
            jamforelse={jamfor(
              nuInfo?.pagaende ? `${nuInfo.dag} av 7 dagar, ur PostHog.` : 'ur PostHog.',
              forra?.besokare ?? null
            )}
          />
          <MetricCard
            className={KORT}
            etikett={`Nya konton, ${period}`}
            varde={nu.nyaKonton === null ? <span className="block text-fraga">Databasen svarade inte</span> : tal(nu.nyaKonton)}
            jamforelse={jamfor('ur databasen.', forra?.nyaKonton ?? null)}
          />
          <Suspense
            fallback={
              <MetricCard
                className={KORT}
                etikett={`Köp, ${period}`}
                varde={tal(nu.kop ?? 0)}
                jamforelse={jamfor('nya betalande ur Stripe.', forra?.kop ?? null)}
              />
            }
          >
            <KopVeckaKort vecka={nu} etikett={`Köp, ${period}`} jamforelse={jamfor('nya betalande ur Stripe.', forra?.kop ?? null)} />
          </Suspense>
        </section>
      ) : null}

      <Panel rubrik="Vecka för vecka">
        {/* Mobil: en ruta per vecka, inget sidledes rullande. */}
        <ul className="divide-y divide-kant sm:hidden">
          {veckor.map((r) => {
            const info = veckaInfo(r.vecka, idag);
            return (
              <li key={r.vecka} className="py-3">
                <p className="text-kort text-ink-1">
                  {info.etikett}
                  <span className="ml-2 text-meta font-normal text-ink-3">från {datumKort(r.vecka)}</span>
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {KOLUMNER.map((k) => (
                    <div key={k} className="contents">
                      <dt className="text-ink-3">{STEG_ETIKETT[k]}</dt>
                      <dd className="text-right">
                        <Cell r={r} k={k} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>

        <table className="hidden w-full text-sm sm:table">
          <thead>
            <tr className="border-b border-kant text-left text-ink-3">
              <th className="py-2 pr-3 font-medium">Vecka</th>
              {KOLUMNER.map((k) => (
                <th key={k} className="py-2 pr-3 text-right font-medium last:pr-0">
                  {STEG_ETIKETT[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {veckor.map((r) => {
              const info = veckaInfo(r.vecka, idag);
              return (
                <tr key={r.vecka} className={info.pagaende ? 'bg-insunken' : undefined}>
                  <td className="py-2 pr-3 text-ink-1">
                    {info.etikett}
                    <span className="block text-meta text-ink-3">från {datumKort(r.vecka)}</span>
                  </td>
                  {KOLUMNER.map((k) => (
                    <td key={k} className="py-2 pr-3 text-right last:pr-0">
                      <Cell r={r} k={k} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-meta text-ink-3">
          Besökare, spårval och köpsteg är unika personer per vecka ur PostHog. Nya konton ur
          databasen, köp är nya betalande ur Stripe (kundens första lyckade betalning). Grått
          &quot;mäts från&quot; betyder att händelsen inte fanns den veckan, inte att ingen gjorde det.
        </p>
      </Panel>

      {nu ? (
        <Suspense
          fallback={
            <Panel rubrik="Per paket">
              <div className="h-[168px] rounded-lg bg-insunken" aria-busy="true" aria-label="Hämtar köp ur Stripe" />
            </Panel>
          }
        >
          <PerPaket vecka={nu} idag={idag} />
        </Suspense>
      ) : null}

      {helaVeckor.length >= DIAGRAM_DAGAR ? (
        <Panel rubrik="Hela veckor över tid">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-kort text-ink-1">Besökare</p>
              <VeckoDiagram
                nyckel="besokare"
                namn="Besökare"
                data={[...helaVeckor].reverse().map((v) => ({ vecka: v.vecka, varde: v.besokare }))}
              />
            </div>
            <div>
              <p className="mb-2 text-kort text-ink-1">Nya konton</p>
              <VeckoDiagram
                nyckel="konton"
                namn="Nya konton"
                data={[...helaVeckor].reverse().map((v) => ({ vecka: v.vecka, varde: v.nyaKonton }))}
              />
            </div>
          </div>
          <p className="mt-3 text-meta text-ink-3">Pågående vecka är inte med, den skulle se ut som ett ras.</p>
        </Panel>
      ) : null}
    </div>
  );
}

/** Köpkortet med paket och belopp ur Stripe. Talet är detsamma som före. */
async function KopVeckaKort({ vecka, etikett, jamforelse }: { vecka: VeckoRad; etikett: string; jamforelse: string }) {
  const l = await lasKop();
  const fran = svenskMidnattIso(vecka.vecka);
  const kop = l.fel ? [] : kopIFonster(l.rader, fran).filter((r) => r.ny);
  return (
    <MetricCard
      className={KORT}
      etikett={etikett}
      varde={tal(vecka.kop ?? kop.length)}
      jamforelse={kop.length ? `${kopLista(kop)}. ${jamforelse}` : jamforelse}
    />
  );
}

/** Veckans köpsteg per paket i spårfärgerna, köpen ur Stripe. */
async function PerPaket({ vecka, idag }: { vecka: VeckoRad; idag: string }) {
  const l = await lasKop();
  const info = veckaInfo(vecka.vecka, idag);
  const kop = l.fel ? null : kopIFonster(l.rader, svenskMidnattIso(vecka.vecka));
  const kopPer = (p: Paket) => (kop ? kop.filter((r) => sparFranPaket(r.paket) === p).length : null);
  const steg = [...VECKO_STEG];

  return (
    <Panel rubrik={`Per paket, ${info.etikett}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-kant text-left text-ink-3">
            <th className="py-2 pr-2 font-medium">Paket</th>
            {steg.map((s) => (
              <th key={s} className="py-2 pr-2 text-right font-medium">
                {STEG_ETIKETT[s]}
              </th>
            ))}
            <th className="py-2 text-right font-medium">Köp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kant">
          {PAKETEN.map((p) => (
            <tr key={p}>
              <td className="py-2 pr-2 text-ink-1">
                <PaketNamn paket={p} />
              </td>
              {steg.map((s) => {
                const status = veckaStatus(s, vecka.vecka);
                const v = vecka.perPaket[p][s];
                return (
                  <td key={s} className="py-2 pr-2 text-right tabular-nums text-ink-1">
                    {status === 'fore' ? (
                      <span className="text-meta text-ink-3">mäts från {datumKort(STEG_MATSTART[s] ?? vecka.vecka)}</span>
                    ) : v === null ? (
                      <span className="text-meta text-ink-3">inte insamlad</span>
                    ) : (
                      tal(v)
                    )}
                  </td>
                );
              })}
              <td className="py-2 text-right tabular-nums text-ink-1">
                {kopPer(p) === null ? <span className="text-meta text-ink-3">Stripe svarar inte</span> : tal(kopPer(p))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-meta text-ink-3">
        Från spårvalet och framåt. Besökare och nya konton vet inte vilket paket som väljs och står
        bara i veckotabellen. Köp är köp ur Stripe den här veckan, förnyelser oräknade, Dagspasset
        räknas till Hela paketet.
      </p>
    </Panel>
  );
}
