/**
 * Sektionen Raderade konton på /admin/anvandare (beslut-mejl-och-radering
 * 2c punkt 8). Serverrenderad, adminens egna texter.
 */

import MetricCard from '@/components/admin/MetricCard';
import SectionCard from '@/components/admin/SectionCard';
import { MATSTART, nollSedan, tidKort } from '@/lib/admin/tomt';
import { tal } from './format';
import { AVSLUT_MINSTA_ANTAL, type Andel, type AvslutSammanstallning } from './avslut';

/** En liten tabell med antal och andel. Inga diagram: färre än sju punkter. */
function AndelTabell({ rubrik, rader, av }: { rubrik: string; rader: Andel[]; av: number }) {
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-medium text-ink-1">{rubrik}</h3>
      <table className="mt-2 w-full text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">Värde</th>
            <th scope="col">Antal</th>
            <th scope="col">Andel</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kant">
          {rader.map((r) => (
            <tr key={r.etikett}>
              <td className="py-1.5 pr-3 text-ink-2">{r.etikett}</td>
              <td className="py-1.5 text-right tabular-nums text-ink-1">{tal(r.antal)}</td>
              <td className="w-16 py-1.5 text-right tabular-nums text-ink-3">
                {av > 0 ? `${Math.round((r.antal / av) * 100)} %` : '0 %'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Raderade konton (beslut-mejl-och-radering 2c punkt 8). Aldrig rad för rad,
 * aldrig korstabeller, fördelningen först vid fem raderade konton.
 */
export default function RaderadeKonton({ avslut }: { avslut: AvslutSammanstallning }) {
  if (avslut.antal === 0) {
    return (
      <SectionCard rubrik="Raderade konton">
        <p className="text-sm text-ink-2">{`${nollSedan('raderade konton', MATSTART.avslut)}.`}</p>
      </SectionCard>
    );
  }
  const kort = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard etikett="Raderade konton" varde={tal(avslut.antal)} jamforelse={`sedan ${tidKort(MATSTART.avslut)}`} />
    </div>
  );
  if (avslut.antal < AVSLUT_MINSTA_ANTAL) {
    return (
      <SectionCard rubrik="Raderade konton">
        {kort}
        <p className="mt-4 text-meta text-ink-3">
          Fördelningen visas när fem konton har raderats, så att ingen enskild rad går att känna igen.
        </p>
      </SectionCard>
    );
  }
  return (
    <SectionCard rubrik="Raderade konton">
      {kort}
      <ul className="mt-4 space-y-0.5 text-sm tabular-nums text-ink-2">
        {avslut.perKvartal.map((k) => (
          <li key={k.etikett}>{`${k.etikett}: ${tal(k.antal)}`}</li>
        ))}
      </ul>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AndelTabell rubrik="Anledning" rader={avslut.anledning} av={avslut.antal} />
        <AndelTabell rubrik="Kontots ålder" rader={avslut.alder} av={avslut.antal} />
        <AndelTabell rubrik="Premium" rader={avslut.premium} av={avslut.antal} />
        <AndelTabell rubrik="Senast aktiv" rader={avslut.senastAktiv} av={avslut.antal} />
        <AndelTabell rubrik="Användning" rader={avslut.anvandning} av={avslut.antal} />
      </div>
    </SectionCard>
  );
}

