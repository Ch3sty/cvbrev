/**
 * Det som bara Stripe kan svara på: uppsägningarna de senaste 30 dagarna,
 * kupongerna och de misslyckade betalningarna.
 *
 * Ligger bakom en Suspense-gräns i sidan, så Stripe-anropet hamnar utanför
 * kritiska vägen. Snapshotet är cachat 15 minuter med adminens tagg.
 *
 * Tomma sektioner (spec-admin-tydlighet, Intäkter) krymper till en rad var
 * längst ned: "Retentionskupongen: 0 inlösta sedan den skapades." i stället
 * för en tom tabell som ser ut som mockup. Fördelningen per produktsteg
 * visas inte längre på sidan: Aktiva kunder per paket svarar på samma fråga
 * ur admin_daily_metrics. Den finns kvar i /api/admin/intakter.
 */

import SectionCard from '@/components/admin/SectionCard';
import { hamtaStripeSnapshot, RETENTIONSKUPONG } from '../data';
import { kronor, tal, tidKort, datumKort } from '@/lib/admin/tomt';

interface Props {
  /** Gånger uppsägningsflödet i appen startats totalt. Ur Supabase. */
  flodetStartat: number;
  /** Raden om MRR-vattenfallet när det inte går att rita än, annars null. */
  vattenfallRad: string | null;
}

export default async function StripePaneler({ flodetStartat, vattenfallRad }: Props) {
  const snapshot = await hamtaStripeSnapshot();
  const flodet = `Uppsägningsflödet i appen har startats ${tal(flodetStartat)} ${
    flodetStartat === 1 ? 'gång' : 'gånger'
  } totalt.`;

  if (!snapshot.tillganglig) {
    return (
      <SectionCard rubrik="Uppsägningar, kuponger och misslyckade betalningar">
        <p className="text-sm text-ink-2">
          {snapshot.fel
            ? `Stripe svarade inte: ${snapshot.fel}`
            : 'Stripe-nyckeln saknas på servern, så uppsägningar och kuponger kan inte läsas.'}{' '}
          {flodet}
        </p>
      </SectionCard>
    );
  }

  const retention = snapshot.kuponger.find((k) => k.id === RETENTIONSKUPONG);
  const inlostaKuponger = snapshot.kuponger.filter((k) => k.inlosta > 0);

  // Raderna längst ned: en per tom sektion.
  const rader: string[] = [];
  if (vattenfallRad) rader.push(vattenfallRad);
  if (!inlostaKuponger.length) {
    rader.push(
      retention
        ? 'Retentionskupongen: 0 inlösta sedan den skapades.'
        : `Retentionskupongen ${RETENTIONSKUPONG} finns inte i Stripe, så erbjudandet i uppsägningsflödet kan inte lösas in.`
    );
  }
  if (!snapshot.misslyckade.length) rader.push('Misslyckade betalningar: 0 på 30 dagar.');
  rader.push(
    snapshot.obetaldaFakturor
      ? `Obetalda fakturor: ${tal(snapshot.obetaldaFakturor)}, ${kronor(snapshot.obetaldaFakturorOre)} utestående.`
      : 'Obetalda fakturor: 0.'
  );

  const uppsagda = snapshot.uppsagda;

  return (
    <div className="space-y-8">
      <SectionCard rubrik="Uppsägningar, 30 dagar">
        <p className="text-sm leading-[22px] text-ink-2">
          {uppsagda.length
            ? `${tal(uppsagda.length)}: ${uppsagda
                .map((u) => `${datumKort(u.tid)}, ${u.vad}`)
                .join('; ')}. `
            : '0 uppsägningar på 30 dagar. '}
          {flodet}
        </p>
      </SectionCard>

      {inlostaKuponger.length ? (
        <SectionCard rubrik="Kuponganvändning" naken>
          <ul className="divide-y divide-kant">
            {inlostaKuponger.map((k) => (
              <li key={k.id} className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="min-w-0 text-sm text-ink-1">
                  {k.namn ?? k.id}
                  <span className="ml-2 text-meta text-ink-3">
                    {k.procentAv !== null
                      ? `${k.procentAv.toLocaleString('sv-SE')} %`
                      : kronor(k.beloppOre)}
                    {k.giltig ? '' : ', utgången'}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-ink-1">
                  {tal(k.inlosta)} inlösta
                  {k.maxInlosta !== null ? (
                    <span className="text-ink-3"> av {tal(k.maxInlosta)}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      {snapshot.misslyckade.length ? (
        <SectionCard rubrik="Misslyckade betalningar, senaste 30 dagarna" naken>
          <ul className="divide-y divide-kant">
            {snapshot.misslyckade.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-ink-1">
                    {m.kund ?? 'kund utan e-post'}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-ink-1">{kronor(m.belopp)}</span>
                </div>
                <div className="mt-1 text-meta text-ink-3">
                  {tidKort(m.skapad)}
                  {m.orsak ? `, ${m.orsak}` : ', ingen orsak från Stripe'}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      <ul className="space-y-1 text-meta text-ink-3">
        {rader.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
