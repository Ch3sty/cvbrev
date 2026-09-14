/**
 * Panelerna som bara Stripe kan svara pa: fordelning per produktsteg,
 * kuponganvandning och misslyckade betalningar i detalj.
 *
 * Ligger i en egen serverkomponent bakom en Suspense-grans i sidan, sa att
 * Stripe-anropet hamnar utanfor kritiska vagen. Sidan har redan malats nar
 * den har kors. Snapshotet ar cachat 15 minuter med adminens taggar, sa en
 * omladdning inom kvarten ar noll externa anrop, och "Hamta nu" rensar
 * taggen.
 *
 * Avvikelse fran planens avsnitt 4.2, upskriven i rapporten: planmix och
 * kuponger finns inte i admin_daily_metrics, och collect.ts fran vag 1 far
 * inte andras. Den har vagen ar det narmaste planens anda som gar utan att
 * rora vag 1.
 */

import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import { hamtaStripeSnapshot, RETENTIONSKUPONG } from '../data';
import { kronor, antal, procent, PLANSTEG } from '../format';

function tid(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(iso));
}

export default async function StripePaneler() {
  const snapshot = await hamtaStripeSnapshot();

  if (!snapshot.tillganglig) {
    return (
      <SectionCard rubrik="Fördelning, kuponger och misslyckade betalningar">
        <p className="text-sm text-ink-2">
          {snapshot.fel
            ? `Stripe svarade inte: ${snapshot.fel}`
            : 'STRIPE_SECRET_KEY saknas i miljön, så plan-mix och kuponger kan inte läsas.'}
        </p>
      </SectionCard>
    );
  }

  const totalMrr = snapshot.planMix.reduce((s, r) => s + r.mrrOre, 0);
  const retention = snapshot.kuponger.find((k) => k.id === RETENTIONSKUPONG);

  return (
    <div className="space-y-8">
      <SectionCard rubrik="Fördelning per produktsteg" naken>
        {snapshot.planMix.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-2">
            Ingen aktiv prenumeration att fördela.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th scope="col" className="px-4 py-3">
                    Produktsteg
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Aktiva
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    MRR
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Andel av MRR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {snapshot.planMix.map((rad) => (
                  <tr key={rad.nyckel}>
                    <th scope="row" className="px-4 py-3 text-left font-normal text-ink-1">
                      {PLANSTEG[rad.nyckel] ?? rad.nyckel}
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {antal(rad.aktiva)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {kronor(rad.mrrOre)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                      {totalMrr > 0 ? procent(rad.mrrOre / totalMrr) : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-4 py-3 text-meta text-ink-3">
          Steget avgörs av price id mot miljövariablerna, inte av prisets namn eller
          intervall. Priset 299 kr har recurring.interval month i Stripe trots att
          prisstegen säger kvartal, så en identifiering på intervall hade lagt
          kvartalskunderna under Månad.
        </p>
      </SectionCard>

      <SectionCard rubrik="Kuponganvändning" naken>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                <th scope="col" className="px-4 py-3">
                  Kupong
                </th>
                <th scope="col" className="px-4 py-3">
                  Rabatt
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Inlösta
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {snapshot.kuponger.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-ink-2">
                    Ingen kupong finns i Stripe.
                  </td>
                </tr>
              ) : (
                snapshot.kuponger.map((k) => (
                  <tr key={k.id}>
                    <th scope="row" className="px-4 py-3 text-left font-normal text-ink-1">
                      {k.namn ?? k.id}
                      {k.namn ? (
                        <span className="ml-2 text-meta text-ink-3">{k.id}</span>
                      ) : null}
                    </th>
                    <td className="px-4 py-3 tabular-nums text-ink-2">
                      {k.procentAv !== null
                        ? `${k.procentAv.toLocaleString('sv-SE')} %`
                        : kronor(k.beloppOre)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {antal(k.inlosta)}
                      {k.maxInlosta !== null ? (
                        <span className="text-ink-3"> av {antal(k.maxInlosta)}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      {k.giltig ? 'Giltig' : 'Utgången'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-meta text-ink-3">
          {retention
            ? `Retentionskupongen ${RETENTIONSKUPONG} erbjuds i uppsägningsflödet och är inlöst ${antal(retention.inlosta)} gånger. Noll inlösen betyder antingen att erbjudandet inte visas eller att ingen tackar ja; churntabellen ovan visar hur många som startade flödet.`
            : `Retentionskupongen ${RETENTIONSKUPONG} hittades inte i Stripe. Uppsägningsflödets erbjudande kan därför inte lösas in.`}
        </p>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          etikett="Trial till betalt"
          varde={procent(snapshot.trial.andel)}
          jamforelse={`${antal(snapshot.trial.betalande)} av ${antal(snapshot.trial.paborjade)} prenumerationer med trialperiod`}
          datakvalitet="Räknat på Stripes trial_end, som ligger kvar efter konvertering. Reverse trial gick live 2026-09-11, så talet blir tillförlitligt först efter två hela veckor."
        />
        <MetricCard
          etikett="Obetalda fakturor"
          varde={antal(snapshot.obetaldaFakturor)}
          inverterad
          jamforelse="status open eller uncollectible"
        />
        <MetricCard
          etikett="Utestående belopp"
          varde={kronor(snapshot.obetaldaFakturorOre)}
          inverterad
          jamforelse="summa amount_due"
        />
      </div>

      <SectionCard rubrik="Misslyckade betalningar, senaste 30 dagarna" naken>
        {snapshot.misslyckade.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-2">
            Ingen misslyckad debitering i perioden.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th scope="col" className="px-4 py-3">
                    Tidpunkt
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Kund
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Belopp
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Orsak
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {snapshot.misslyckade.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-ink-2">
                      {tid(m.skapad)}
                    </td>
                    <td className="px-4 py-3 text-ink-1">{m.kund ?? '–'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {kronor(m.belopp)}
                    </td>
                    <td className="px-4 py-3 text-ink-2">{m.orsak ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
