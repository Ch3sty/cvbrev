/**
 * Intakter (docs/plan-admin.md avsnitt 4.2, omgjord efter
 * spec-admin-tydlighet 2026-09-22). Fem sekunder-fragan: vem kopte vad och
 * nar, och vad blev det i kronor?
 *
 * Serverkomponent. Forsta malningen laser bara Supabase: MRR-kortet,
 * provperioderna, aktiva kunder per paket och MRR-diagrammet ur
 * admin_daily_metrics och profiles. Allt som kommer ur Stripe (kopen,
 * intakten, uppsagningarna, kupongerna) ligger i Suspense-granser med
 * reserverad hojd och kommer in efter LCP utan att flytta nagot.
 *
 * Inga streck: noll skrivs 0 med sedan nar, och tomma sektioner krymper till
 * en rad var langst ned.
 */

import { Suspense } from 'react';
import PageHeader from '@/components/shell/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import SectionCard from '@/components/admin/SectionCard';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import IntaktDiagram from './components/IntaktDiagram';
import HamtaNu from './components/HamtaNu';
import StripePaneler from './components/StripePaneler';
import { IntaktPerDagSektion, KopSektion, KopToppkort } from './components/KopDelar';
import { hamtaIntaktData } from './data';
import { kronorExakt, forandring, deltaText, byggVattenfall, paketRader } from './format';
import { uppraknat } from './kopFormat';
import { hamtaUndantagCachad } from '@/lib/admin/metrics';
import { undantagText } from '@/lib/admin/undantag';
import type { PaketNyckel } from '@/lib/admin/collect';
import { PLANS } from '@/lib/plans/plans';
import { MATSTART, datumKort, kronor, tal, tidKort } from '@/lib/admin/tomt';

export const dynamic = 'force-dynamic';

const ALLT_DAGEN_KR = PLANS.find((p) => p.key === 'all_day')?.amount ?? 49;

/** Dagsrader som lases. Vattenfallet behover mer an 30 dagar bakat. */
const FONSTER_DAGAR = 90;
/** MRR-diagrammet visar de senaste 30. */
const DIAGRAM_DAGAR = 30;

/** Paketen som borjade saljas 22 sep 10.51 (MATSTART.paket). */
const NYA_PAKET: PaketNyckel[] = ['cv_week', 'test_week', 'all_week', 'all_quarter'];

/** Platshallare med ett MetricCards hojd, medan Stripe svarar. */
function KortPlats({ etikett }: { etikett: string }) {
  return (
    <div className="h-[118px] rounded-xl border border-kant bg-panel p-4" aria-busy="true">
      <div className="text-sm font-medium text-ink-3">{etikett}</div>
      <div className="mt-2 h-8 w-20 rounded-lg bg-insunken" />
    </div>
  );
}

/** Datum MATSTART plus antal dagar, som YYYY-MM-DD. */
function dagEfter(dag: string, dagar: number): string {
  const d = new Date(`${dag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dagar);
  return d.toISOString().slice(0, 10);
}

export default async function IntakterPage() {
  const [data, u] = await Promise.all([hamtaIntaktData(FONSTER_DAGAR), hamtaUndantagCachad()]);
  const { senaste, forraVeckan, dagar, idagOfullstandig, provperioder } = data;
  const nuMs = Date.now();

  const mrrOre = senaste?.mrr_ore ?? null;
  const mrrDelta = forandring(mrrOre, forraVeckan?.mrr_ore);

  // Aktiva kunder per paket: rader bara for paket med kunder.
  const paket = paketRader(senaste);
  const medKunder = paket.filter((p) => (p.aktiva ?? 0) > 0);
  const nyaUtan = paket.filter((p) => !(p.aktiva ?? 0) && NYA_PAKET.includes(p.nyckel));
  const gamlaUtan = paket.filter((p) => !(p.aktiva ?? 0) && !NYA_PAKET.includes(p.nyckel));

  const vattenfall = byggVattenfall(dagar);
  const vattenfallRad = vattenfall
    ? null
    : `MRR-vattenfallet: ritas från ${datumKort(dagEfter(MATSTART.mrr, 30))}, när det finns 30 dagar sann MRR.`;

  // Diagrammet i stigande ordning, de senaste 30 dagarna.
  const mrrRader = [...dagar]
    .slice(0, DIAGRAM_DAGAR)
    .reverse()
    .map((d) => ({ dag: d.dag, mrr: d.mrr_ore }));

  const beskrivning = senaste
    ? `Talen gäller 30 dagar till ${datumKort(new Date(nuMs).toISOString())}. MRR från ${datumKort(senaste.dag)}${
        idagOfullstandig ? ', i dag samlas fortfarande in' : ''
      }. ${undantagText(u)}.`
    : `Talen gäller 30 dagar till ${datumKort(new Date(nuMs).toISOString())}. ${undantagText(u)}.`;

  return (
    <div className="space-y-8">
      <PageHeader title="Intäkter" description={beskrivning} action={<HamtaNu />} />

      {/* Toppkorten. Tre ur Stripe i Suspense, MRR ur dagsraderna direkt. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense
          fallback={
            <>
              <KortPlats etikett="Intäkt, 30 dagar" />
              <KortPlats etikett="Löpande" />
              <KortPlats etikett="Engångs" />
            </>
          }
        >
          <KopToppkort nuMs={nuMs} />
        </Suspense>
        <MetricCard
          etikett="MRR"
          varde={kronor(mrrOre)}
          delta={mrrDelta}
          deltaText={deltaText(mrrDelta)}
          jamforelse={mrrDelta === null ? `sann sedan ${datumKort(MATSTART.mrr)}` : 'mot samma dag förra veckan'}
          andraJamforelse={
            mrrOre === null
              ? 'Stripe har inte svarat i fönstret'
              : mrrDelta === null
                ? undefined
                : `Sann sedan ${datumKort(MATSTART.mrr)}`
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="Provperioder i appen"
          varde={tal(provperioder.antal)}
          jamforelse={
            provperioder.sista
              ? `pågår nu, sista går ut ${datumKort(provperioder.sista)}`
              : 'ingen provperiod pågår'
          }
        />
        <MetricCard
          etikett="Aktiva prenumerationer"
          varde={tal(senaste?.active_subs)}
          jamforelse="löpande i Stripe"
        />
      </div>

      <div id="kop" className="scroll-mt-24">
        <Suspense
          fallback={
            <SectionCard rubrik="Köp, senaste 30 dagarna">
              <LoadingSkeleton variant="text" count={5} label="Hämtar köpen från Stripe" />
            </SectionCard>
          }
        >
          <KopSektion nuMs={nuMs} />
        </Suspense>
      </div>

      {/*
        Aktiva kunder per paket, ur de sex kolumnerna i admin_daily_metrics.
        Per manad ar normaliserad: ett veckopaket ar 52/12 veckor i manaden.
      */}
      <SectionCard rubrik="Aktiva kunder per paket" naken>
        {medKunder.length ? (
          <ul className="divide-y divide-kant">
            {medKunder.map((p) => (
              <li key={p.nyckel} className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="min-w-0 text-sm text-ink-1">
                  {p.namn}
                  <span className="ml-2 text-meta text-ink-3">
                    {p.nyckel === 'all_day'
                      ? data.engangsGiltigTill
                        ? `gäller till ${tidKort(data.engangsGiltigTill)}`
                        : 'engångs'
                      : 'löpande'}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-ink-1">
                  {tal(p.aktiva)} {p.aktiva === 1 ? 'kund' : 'kunder'}
                  <span className="text-ink-3">
                    {' · '}
                    {p.nyckel === 'all_day'
                      ? `engångs ${ALLT_DAGEN_KR} kr`
                      : `${kronorExakt(p.mrrOre)} i månaden`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-3 text-sm text-ink-2">
            {senaste ? `0 aktiva kunder ${datumKort(senaste.dag)}.` : '0 aktiva kunder.'}
          </p>
        )}
        {nyaUtan.length || gamlaUtan.length ? (
          <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">
            {nyaUtan.length
              ? `${uppraknat(nyaUtan.map((p) => p.namn))}: 0 kunder, i salu sedan ${tidKort(MATSTART.paket)}. `
              : ''}
            {gamlaUtan.length ? `${uppraknat(gamlaUtan.map((p) => p.namn))}: 0 kunder.` : ''}
          </p>
        ) : null}
      </SectionCard>

      <Suspense
        fallback={
          <SectionCard rubrik="Intäkt per dag, 30 dagar">
            <div className="h-[240px] rounded-lg bg-insunken" />
          </SectionCard>
        }
      >
        <IntaktPerDagSektion nuMs={nuMs} />
      </Suspense>

      <SectionCard rubrik="MRR per dag, 30 dagar">
        <IntaktDiagram
          data={mrrRader}
          enhet="ore"
          serier={[{ nyckel: 'mrr', namn: 'MRR', typ: 'linje', roll: 'primar' }]}
          matstart={MATSTART.mrr}
          matstartText={`mäts från ${datumKort(MATSTART.mrr)}`}
          tomText="Ingen MRR sedan mätstart."
        />
        <p className="mt-3 text-meta text-ink-3">
          Stripe har ingen historisk MRR, så linjen börjar vid mätstart.
        </p>
      </SectionCard>

      {vattenfall ? (
        <SectionCard rubrik="MRR-vattenfall">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-meta text-ink-3">{datumKort(vattenfall.franDag)}</dt>
              <dd className="mt-1 text-kort tabular-nums text-ink-1">{kronorExakt(vattenfall.fran)}</dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">Nytt</dt>
              <dd className="mt-1 text-kort tabular-nums text-positiv">
                {vattenfall.nytt > 0 ? '+' : ''}
                {kronorExakt(vattenfall.nytt)}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">Churn</dt>
              <dd className="mt-1 text-kort tabular-nums text-fel">{kronorExakt(vattenfall.churn)}</dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">{datumKort(vattenfall.tillDag)}</dt>
              <dd className="mt-1 text-kort tabular-nums text-ink-1">{kronorExakt(vattenfall.till)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-meta text-ink-3">
            Nytt och churn är antalet prenumerationer i fönstret gånger dagens genomsnittliga
            månadsbelopp.
          </p>
        </SectionCard>
      ) : null}

      {/*
        Uppsagningarna, kupongerna och de misslyckade betalningarna finns bara
        i Stripe. Hojden reserveras av skelettet.
      */}
      <Suspense
        fallback={
          <SectionCard rubrik="Uppsägningar, 30 dagar">
            <LoadingSkeleton variant="text" count={2} label="Hämtar uppsägningar från Stripe" />
          </SectionCard>
        }
      >
        <StripePaneler
          flodetStartat={data.uppsagningsflodetStartat}
          vattenfallRad={vattenfallRad}
        />
      </Suspense>
    </div>
  );
}
