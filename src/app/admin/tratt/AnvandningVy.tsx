/**
 * Tratt, vyn Användning (resten av det som var Funnel).
 *
 * Vilka funktioner som används och vilka som inte gör det, testerna per
 * typ, mallnedladdningarna, retentionskohorterna, spårningskontrollen och
 * Datakvalitet: det enda stället i adminen där förklaringarna om gamla
 * mätfel står.
 *
 * Allt läses ur Supabase, 30 dagar, cachat 15 minuter. Undantagna konton
 * är bortfiltrerade i varje fråga. Tabellerna har färre kolumner på mobil
 * så att sidan aldrig rullar i sidled på 412 px.
 */

import SectionCard from '@/components/admin/SectionCard';
import type { Undantag } from '@/lib/admin/undantag';
import { dagStr } from '@/lib/admin/collect';
import { tal } from '@/lib/admin/tomt';
import { hamtaAnvandningData } from './funnel-data';

/** Ett delta med tecken. Noll är "±0", aldrig ett streck. */
function deltaText(n: number): string {
  if (n === 0) return '±0';
  return `${n > 0 ? '+' : '−'}${Math.abs(n).toLocaleString('sv-SE')}`;
}

function relativTid(iso: string | null): string {
  if (!iso) return 'aldrig';
  const dagar = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dagar <= 0) return 'i dag';
  if (dagar === 1) return 'i går';
  return `för ${dagar} dagar sedan`;
}

/** Månader mellan en kohort (YYYY-MM) och i dag. */
function manaderSedan(kohort: string, idag: string): number {
  const [ka, km] = kohort.split('-').map(Number);
  const [ia, im] = idag.split('-').map(Number);
  return (ia - ka) * 12 + (im - km);
}

const TH = 'px-3 py-3 font-medium sm:px-4';
const TD = 'px-3 py-3 sm:px-4';
/** Kolumner som bara syns från sm och uppåt. */
const BRED = 'hidden sm:table-cell';

export default async function AnvandningVy({ konton }: { konton: Undantag['konton'] }) {
  const data = await hamtaAnvandningData(konton);
  const idag = dagStr();
  const toppFunktioner = data.funktioner.slice(0, 20);

  return (
    <div className="space-y-8">
      <SectionCard
        rubrik="Funktionsanvändning, ur tabellerna"
        action={<span className="text-meta text-ink-3">30 dagar</span>}
        naken
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kant text-left text-ink-3">
              <th className={TH}>Funktion</th>
              <th className={`${TH} text-right`}>7 dagar</th>
              <th className={`${TH} text-right ${BRED}`}>Mot veckan innan</th>
              <th className={`${TH} text-right`}>30 dagar</th>
              <th className={`${TH} text-right ${BRED}`}>Personer, 30 dagar</th>
              <th className={`${TH} text-right ${BRED}`}>Senast</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {data.sannaFunktioner.map((f) => (
              <tr key={f.nyckel}>
                <td className={`${TD} text-ink-1`}>
                  {f.etikett}
                  <span className="block text-meta text-ink-3">{f.kalla}</span>
                </td>
                <td className={`${TD} text-right tabular-nums text-ink-1`}>{tal(f.antal7)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>{deltaText(f.delta7)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2`}>{tal(f.antal30)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>{tal(f.personer30)}</td>
                <td className={`${TD} text-right text-meta text-ink-3 ${BRED}`}>{relativTid(f.senast)}</td>
              </tr>
            ))}
            {!data.sannaFunktioner.length ? (
              <tr>
                <td className={`${TD} text-ink-2`} colSpan={6}>
                  Ingen av tabellerna svarade.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard
        rubrik="Tester per typ"
        action={<span className="text-meta text-ink-3">testsessioner</span>}
        naken
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kant text-left text-ink-3">
              <th className={TH}>Test</th>
              <th className={`${TH} text-right ${BRED}`}>Startade, 7 d</th>
              <th className={`${TH} text-right`}>Slutförda, 7 d</th>
              <th className={`${TH} text-right ${BRED}`}>Mot veckan innan</th>
              <th className={`${TH} text-right ${BRED}`}>Startade, 30 d</th>
              <th className={`${TH} text-right`}>Slutförda, 30 d</th>
              <th className={`${TH} text-right ${BRED}`}>Slutförandegrad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {data.tester.map((t) => (
              <tr key={t.nyckel}>
                <td className={`${TD} text-ink-1`}>
                  {t.etikett}
                  <span className="block text-meta text-ink-3">senast {relativTid(t.senast)}</span>
                </td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>{tal(t.startade7)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-1`}>{tal(t.slutforda7)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>{deltaText(t.delta7)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>{tal(t.startade30)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2`}>{tal(t.slutforda30)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>
                  {t.slutforandegrad === null ? '0 startade' : `${Math.round(t.slutforandegrad * 100)} %`}
                </td>
              </tr>
            ))}
            {!data.tester.length ? (
              <tr>
                <td className={`${TD} text-ink-2`} colSpan={7}>
                  0 testsessioner de senaste 30 dagarna.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard
        rubrik="Mallnedladdningar, topp fem"
        action={<span className="text-meta text-ink-3">formatted_cv_downloads</span>}
        naken
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kant text-left text-ink-3">
              <th className={TH}>Mall</th>
              <th className={`${TH} text-right`}>7 dagar</th>
              <th className={`${TH} text-right ${BRED}`}>Mot veckan innan</th>
              <th className={`${TH} text-right`}>30 dagar</th>
              <th className={`${TH} text-right ${BRED}`}>Personer, 30 dagar</th>
              <th className={`${TH} text-right ${BRED}`}>Senast</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {data.mallar.map((m) => (
              <tr key={m.templateId}>
                <td className={`${TD} break-all text-ink-1`}>{m.templateId}</td>
                <td className={`${TD} text-right tabular-nums text-ink-1`}>{tal(m.antal7)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>{deltaText(m.delta7)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2`}>{tal(m.antal30)}</td>
                <td className={`${TD} text-right tabular-nums text-ink-2 ${BRED}`}>{tal(m.personer30)}</td>
                <td className={`${TD} text-right text-meta text-ink-3 ${BRED}`}>{relativTid(m.senast)}</td>
              </tr>
            ))}
            {!data.mallar.length ? (
              <tr>
                <td className={`${TD} text-ink-2`} colSpan={6}>
                  0 mallnedladdningar de senaste 30 dagarna.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard rubrik="Retentionskohorter" action={<span className="text-meta text-ink-3">aktiva per månad</span>} naken>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kant text-left text-ink-3">
              <th className={TH}>Kohort</th>
              <th className={`${TH} text-right`}>Storlek</th>
              {[0, 1, 2, 3, 4, 5].map((m) => (
                <th key={m} className={`${TH} text-right ${m > 2 ? BRED : ''}`}>
                  M{m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {data.kohorter.map((k) => {
              const passerade = manaderSedan(k.kohort, idag);
              return (
                <tr key={k.kohort}>
                  <td className={`${TD} text-ink-1`}>{k.kohort}</td>
                  <td className={`${TD} text-right tabular-nums text-ink-1`}>{tal(k.storlek)}</td>
                  {k.aktiva.map((a, i) => (
                    <td key={i} className={`${TD} text-right tabular-nums text-ink-2 ${i > 2 ? BRED : ''}`}>
                      {i > passerade ? <span className="text-ink-3" aria-label="Månaden har inte kommit än">ej än</span> : k.storlek > 0 ? `${Math.round((a / k.storlek) * 100)} %` : '0 %'}
                    </td>
                  ))}
                </tr>
              );
            })}
            {!data.kohorter.length ? (
              <tr>
                <td className={`${TD} text-ink-2`} colSpan={8}>
                  Inga kohorter i fönstret.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <p className="px-3 py-3 text-meta text-ink-3 sm:px-4">
          Andel av kohorten som var aktiv månaden efter registreringen. "Ej än" betyder att
          månaden inte har kommit än. M3 till M5 syns på bredare skärm.
        </p>
      </SectionCard>

      {toppFunktioner.length ? (
        <SectionCard
          rubrik="Händelser i koden, spårningskontroll"
          action={<span className="text-meta text-ink-3">user_activities</span>}
          naken
        >
          <p className="px-3 pt-4 text-sm text-ink-2 sm:px-4">
            Talen här är inte en mätning, se Datakvalitet. Listan visar vilka händelser som fyrar
            överhuvudtaget, så att en händelse som aldrig når fram går att skilja från en funktion
            som inte används.
          </p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-y border-kant text-left text-ink-3">
                <th className={TH}>Händelse</th>
                <th className={`${TH} text-right`}>Rader, 30 d</th>
                <th className={`${TH} text-right`}>Personer</th>
                <th className={`${TH} text-right ${BRED}`}>Senast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {toppFunktioner.map((f) => (
                <tr key={f.typ}>
                  <td className={`${TD} break-all text-ink-1`}>{f.typ}</td>
                  <td className={`${TD} text-right tabular-nums text-ink-1`}>{tal(f.antal)}</td>
                  <td className={`${TD} text-right tabular-nums text-ink-2`}>{tal(f.personer)}</td>
                  <td className={`${TD} text-right text-meta text-ink-3 ${BRED}`}>{relativTid(f.senast)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      ) : null}

      <SectionCard
        rubrik="Används inte"
        action={
          <span className="text-meta text-ink-3">
            {data.oanvanda.length} av {data.oanvanda.length + data.funktioner.length}
          </span>
        }
      >
        <p className="mb-3 text-sm text-ink-2">
          Händelserna finns i koden men har 0 rader de senaste 30 dagarna. Antingen används
          funktionen inte, eller så avfyras händelsen aldrig.
        </p>
        <ul className="flex flex-wrap gap-2">
          {data.oanvanda.map((f) => (
            <li key={f} className="rounded-md border border-kant bg-insunken px-2 py-1 text-meta text-ink-2">
              {f}
            </li>
          ))}
          {!data.oanvanda.length ? <li className="text-sm text-ink-2">Alla kända funktioner har använts.</li> : null}
        </ul>
      </SectionCard>

      <SectionCard rubrik="Datakvalitet" naken>
        <ul className="divide-y divide-kant">
          {data.datakvalitet.map((n) => (
            <li key={n.rubrik} className="px-4 py-3">
              <p className="text-kort text-ink-1">{n.rubrik}</p>
              <p className="mt-1 text-sm leading-[22px] text-ink-2">{n.text}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
