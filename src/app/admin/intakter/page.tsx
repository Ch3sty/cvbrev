/**
 * Intakter (docs/plan-admin.md avsnitt 4.2). Svarar pa fraga 1: tjanar vi mer
 * pengar an i gar och forra veckan, och varfor?
 *
 * Serverkomponent. Forsta malningen laser bara admin_daily_metrics och tva
 * sma Supabase-fragor, alltsa inget Stripe-anrop i kritiska vagen. Planmixen
 * och kupongerna finns bara i Stripe och ligger darfor i en Suspense-grans
 * langre ner med reserverad hojd: de kommer in efter LCP och flyttar
 * ingenting nar de gor det.
 *
 * Alla belopp i kronor med tabular-nums. Ore ar lagringsenheten, kronor
 * uppstar i format.ts.
 */

import { Suspense } from 'react';
import PageHeader from '@/components/shell/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import SectionCard from '@/components/admin/SectionCard';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import IntaktDiagram from './components/IntaktDiagram';
import HamtaNu from './components/HamtaNu';
import StripePaneler from './components/StripePaneler';
import { hamtaIntaktData } from './data';
import {
  kronor,
  kronorExakt,
  antal,
  forandring,
  deltaText,
  kortDatum,
  veckonummer,
  churnorsak,
  byggVattenfall,
  MRR_SANN_FRAN,
} from './format';

export const dynamic = 'force-dynamic';

const FONSTER_DAGAR = 90;

export default async function IntakterPage() {
  const data = await hamtaIntaktData(FONSTER_DAGAR);
  const {
    senaste,
    igar,
    forraVeckan,
    dagar,
    churnVeckor,
    trialPagaende,
    premiumGrantsRader,
    idagOfullstandig,
  } = data;

  const mrrOre = senaste?.mrr_ore ?? null;
  const arrOre = typeof mrrOre === 'number' ? mrrOre * 12 : null;
  const mrrDelta = forandring(mrrOre, forraVeckan?.mrr_ore);

  // Veckosummorna tar de sju senaste raderna med data, inte de sju senaste
  // kalenderdygnen. Skillnaden syns bara om en dag saknar rad helt, och da ar
  // "senaste sju dagarna med data" ett arligare tal an en summa dar en
  // saknad dag raknats som noll kronor.
  //
  // Nya betalande: i dag mot i gar, plus summan for veckan.
  const nyaIdag = senaste?.new_paying ?? null;
  const nyaVecka = dagar.slice(0, 7).reduce((s, d) => s + (d.new_paying ?? 0), 0);
  const nyaDelta = forandring(nyaIdag, igar?.new_paying);

  const misslyckade = senaste?.failed_payments ?? null;
  const misslyckadeVecka = dagar.slice(0, 7).reduce((s, d) => s + (d.failed_payments ?? 0), 0);

  const intaktVecka = dagar.slice(0, 7).reduce((s, d) => s + (d.revenue_ore ?? 0), 0);
  const intaktForegaende = dagar.slice(7, 14).reduce((s, d) => s + (d.revenue_ore ?? 0), 0);
  const intaktDelta = forandring(intaktVecka, intaktForegaende);

  const vattenfall = byggVattenfall(dagar);

  // Diagramrader i stigande ordning: hamtaDagligaMetrik ger fallande.
  const serie = [...dagar].reverse();
  const intaktRader = serie.map((d) => ({ dag: d.dag, intakt: d.revenue_ore }));
  const mrrRader = serie.map((d) => ({ dag: d.dag, mrr: d.mrr_ore }));
  const nyaRader = serie.map((d) => ({
    dag: d.dag,
    nya: d.new_paying,
    churnade: d.churned,
  }));

  const mrrHistorikPlatt = serie.some((d) => d.dag < MRR_SANN_FRAN);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Intäkter"
        description={
          senaste
            ? // kortDatum ger "14 sep." med punkt i svensk kort manadsform, sa
              // meningen far ingen egen punkt efter sig.
              // Står i dag som en rad utan Stripe-siffror skriver vi ut det,
              // i stället för att låta korten visa streck utan förklaring.
              `MRR, nya betalande, churn och plan-mix. Senaste dagen med data är ${kortDatum(senaste.dag)}${
                idagOfullstandig ? '. I dag hittills samlas fortfarande in' : ''
              }`
            : 'MRR, nya betalande, churn och plan-mix.'
        }
        action={<HamtaNu />}
      />

      {/* Fyra stora tal, de som ska ga att lasa pa tio sekunder. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="MRR"
          varde={kronor(mrrOre)}
          delta={mrrDelta}
          deltaText={deltaText(mrrDelta)}
          jamforelse="mot samma dag förra veckan"
        />
        <MetricCard
          etikett="ARR"
          varde={kronor(arrOre)}
          jamforelse="MRR gånger tolv"
        />
        <MetricCard
          etikett="Nya betalande i dag"
          varde={antal(nyaIdag)}
          delta={nyaDelta}
          deltaText={deltaText(nyaDelta)}
          jamforelse={`mot i går. ${antal(nyaVecka)} senaste sju dagarna`}
          datakvalitet={
            premiumGrantsRader === 0
              ? 'premium_grants är tom, så Stripe är enda källa. Engångsköp kan saknas.'
              : undefined
          }
        />
        <MetricCard
          etikett="Misslyckade betalningar"
          varde={antal(misslyckade)}
          inverterad
          jamforelse={`${antal(misslyckadeVecka)} senaste sju dagarna`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="Aktiva prenumerationer"
          varde={antal(senaste?.active_subs)}
          jamforelse="status active i Stripe"
        />
        <MetricCard
          etikett="Pågående trials"
          varde={antal(senaste?.trialing_subs)}
          jamforelse="status trialing i Stripe"
        />
        <MetricCard
          etikett="Intäkt senaste sju dagarna"
          varde={kronor(intaktVecka)}
          delta={intaktDelta}
          deltaText={deltaText(intaktDelta)}
          jamforelse="mot sju dagarna dessförinnan"
        />
        <MetricCard
          etikett="Trials i appen just nu"
          varde={antal(trialPagaende)}
          jamforelse="profiler med trialkälla i premium_source"
          datakvalitet="Trial till betalt står under Stripe längre ner: webhooken nollställer premium_source vid betalning, så konverteringen går inte att räkna här."
        />
      </div>

      <SectionCard rubrik={`Intäkt per dag i kronor, ${FONSTER_DAGAR} dagar`}>
        <IntaktDiagram
          data={intaktRader}
          enhet="ore"
          serier={[
            { nyckel: 'intakt', namn: 'Intäkt', typ: 'stapel', roll: 'primar' },
          ]}
          tomText="Ingen intäktsdata för perioden."
        />
        <p className="mt-3 text-meta text-ink-3">
          Byggd ur Stripes debiteringar, återbetalningar avdragna. En dag utan svar från
          Stripe står som lucka, aldrig som noll.
        </p>
      </SectionCard>

      <SectionCard rubrik={`MRR per dag i kronor, ${FONSTER_DAGAR} dagar`}>
        <IntaktDiagram
          data={mrrRader}
          enhet="ore"
          serier={[{ nyckel: 'mrr', namn: 'MRR', typ: 'linje', roll: 'framhavd' }]}
          tomText="Ingen MRR-data för perioden."
        />
        {mrrHistorikPlatt ? (
          <p className="mt-3 text-meta text-ink-3">
            Stripe har ingen historisk MRR. Dagar före {kortDatum(MRR_SANN_FRAN)} är
            backfyllda med värdet den dag backfyllningen kördes, så den delen av linjen är
            rak av tekniska skäl och säger ingenting om verksamheten. Från och med{' '}
            {kortDatum(MRR_SANN_FRAN)} är serien sann.
          </p>
        ) : null}
      </SectionCard>

      <SectionCard rubrik="Nya betalande och uppsagda per dag">
        <IntaktDiagram
          data={nyaRader}
          enhet="antal"
          serier={[
            { nyckel: 'nya', namn: 'Nya betalande', typ: 'stapel', roll: 'primar' },
            { nyckel: 'churnade', namn: 'Uppsagda', typ: 'stapel', roll: 'fel' },
          ]}
          tomText="Ingen data för perioden."
        />
      </SectionCard>

      {vattenfall ? (
        <SectionCard rubrik="MRR-vattenfall">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-meta text-ink-3">{kortDatum(vattenfall.franDag)}</dt>
              <dd className="mt-1 text-kort tabular-nums text-ink-1">
                {kronorExakt(vattenfall.fran)}
              </dd>
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
              <dd className="mt-1 text-kort tabular-nums text-fel">
                {kronorExakt(vattenfall.churn)}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">{kortDatum(vattenfall.tillDag)}</dt>
              <dd className="mt-1 text-kort tabular-nums text-ink-1">
                {kronorExakt(vattenfall.till)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-meta text-ink-3">
            Nytt och churn är antalet prenumerationer i fönstret gånger dagens
            genomsnittliga månadsbelopp. Expansion och nedgradering syns inte separat: de
            kräver en prenumerationshistorik som Stripe inte ger utan eventloggen.
          </p>
        </SectionCard>
      ) : (
        <SectionCard rubrik="MRR-vattenfall">
          <p className="text-sm text-ink-2">
            Kräver minst trettio dagars sann MRR-historik. Serien blir sann från{' '}
            {kortDatum(MRR_SANN_FRAN)}, så vattenfallet går att rita en månad efter det.
          </p>
        </SectionCard>
      )}

      <SectionCard rubrik="Churn per vecka, med orsak" naken>
        {churnVeckor.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-2">Ingen uppsägning i perioden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th scope="col" className="px-4 py-3">
                    Vecka
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Uppsagda
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Räddade
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Angivna orsaker
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {churnVeckor.map((v) => (
                  <tr key={v.vecka}>
                    <th scope="row" className="px-4 py-3 text-left font-normal text-ink-1">
                      v. {veckonummer(v.vecka)}
                      <span className="ml-2 text-meta text-ink-3">{kortDatum(v.vecka)}</span>
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {antal(v.churnade)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                      {antal(v.raddade)}
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      {v.orsaker.length === 0
                        ? '–'
                        : v.orsaker
                            .map((o) => `${churnorsak(o.orsak)} ${o.antal}`)
                            .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-4 py-3 text-meta text-ink-3">
          Uppsagda kommer ur Stripes canceled_at. Orsakerna kommer ur cancel_intents och
          finns bara för den som gick via uppsägningsflödet i appen, så en uppsägning gjord
          direkt i Stripes kundportal saknar orsak. Summan av orsaker är därför mindre än
          antalet uppsagda. Räddade är flöden som startades men inte fullföljdes.
        </p>
      </SectionCard>

      {/*
        Stripe-panelerna ligger utanfor kritiska vagen. Hojden ar reserverad av
        skelettet, sa ingenting flyttar nar de kommer in och CLS forblir noll.
      */}
      <Suspense
        fallback={
          <div className="space-y-8">
            {/*
              Skelettet ar variant text och inte list: list ritar egna paneler
              med border-kant, och de hade blivit paneler inuti SectionCards
              panel. Raderna ar lika manga som tabellen far, sa hojden stammer
              och ingenting hoppar nar Stripe svarar.
            */}
            <SectionCard rubrik="Fördelning per produktsteg">
              <LoadingSkeleton variant="text" count={5} label="Hämtar plan-mix från Stripe" />
            </SectionCard>
            <SectionCard rubrik="Kuponganvändning">
              <LoadingSkeleton variant="text" count={3} label="Hämtar kuponger från Stripe" />
            </SectionCard>
          </div>
        }
      >
        <StripePaneler />
      </Suspense>
    </div>
  );
}
