/**
 * Tabellen for toppsidor, toppord och tappare.
 *
 * Serverkomponent. Sorteringen sker i datalagret, sa tabellen behover ingen
 * klientgrans och ingen kolumnsortering: den har redan ratt ordning nar den
 * kommer ut ur servern.
 *
 * Alla tal star i tabular-nums, rubrikraden i 14/500 ink-3 och raderna
 * separeras med divide-y divide-kant enligt designsystemets avsnitt 6.
 * Tabellen ar bred, sa den bar sin egen overflow-x-auto: body far aldrig
 * horisontell scroll.
 */

import type { TrafikRad } from './data';
import {
  antal,
  deltaPosition,
  deltaProcent,
  position as formateraPosition,
  procent,
  sokvag,
} from './format';

interface Props {
  rader: TrafikRad[];
  /** page visar sokvag, query visar soktermen rakt av. */
  sort: 'page' | 'query';
  /** Text nar listan ar tom. */
  tomText: string;
  /** Visar positionsdelta i stallet for CTR. Anvands av tapparlistan. */
  visaPositionsdelta?: boolean;
}

/**
 * Forandringen som text. Inga streck (spec-admin-tydlighet princip 1): en
 * rad som inte fanns i foregaende period ar "ny", en rad som gick fran noll
 * klick sager det.
 */
function forandringText(rad: TrafikRad): string {
  if (rad.klickDelta !== null) return deltaProcent(rad.klickDelta);
  if (rad.klickFore === null) return 'ny';
  return rad.klick > 0 ? 'från 0' : '0 %';
}

/** Ingen visning ger varken CTR eller placering. Text, aldrig streck. */
const INGEN_VISNING = 'ingen visning';

/** Klickdelta: ner ar fel, upp ar positivt. Noll och okant ar ink-3. */
function klickKlass(delta: number | null): string {
  if (delta === null) return 'text-ink-3';
  if (delta > 0.001) return 'text-positiv';
  if (delta < -0.001) return 'text-fel';
  return 'text-ink-3';
}

/** Positionsdelta: hogre tal ar samre placering, alltsa vand farg. */
function positionKlass(delta: number | null): string {
  if (delta === null) return 'text-ink-3';
  if (delta > 0.05) return 'text-fel';
  if (delta < -0.05) return 'text-positiv';
  return 'text-ink-3';
}

export default function TrafikTabell({
  rader,
  sort,
  tomText,
  visaPositionsdelta = false,
}: Props) {
  if (!rader.length) {
    return <p className="px-4 py-6 text-sm text-ink-2">{tomText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
            <th scope="col" className="px-4 py-3 font-medium">
              {sort === 'page' ? 'Sida' : 'Sökord'}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Klick
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Förändring
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Visningar
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              {visaPositionsdelta ? 'Position, förr' : 'CTR'}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Position
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-kant">
          {rader.map((rad) => (
            <tr key={rad.nyckel}>
              <td className="max-w-[320px] px-4 py-3 text-ink-1">
                <span className="block truncate" title={rad.nyckel}>
                  {sort === 'page' ? sokvag(rad.nyckel) : rad.nyckel}
                </span>
              </td>

              <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                {antal(rad.klick)}
              </td>

              <td
                className={`px-4 py-3 text-right tabular-nums ${klickKlass(rad.klickDelta)}`}
              >
                {forandringText(rad)}
              </td>

              <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                {antal(rad.visningar)}
              </td>

              <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                {visaPositionsdelta
                  ? rad.positionFore === null
                    ? INGEN_VISNING
                    : formateraPosition(rad.positionFore)
                  : rad.ctr === null
                    ? INGEN_VISNING
                    : procent(rad.ctr)}
              </td>

              <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                {rad.position === null ? INGEN_VISNING : formateraPosition(rad.position)}
                {visaPositionsdelta && rad.positionDelta !== null ? (
                  <span
                    className={`ml-2 text-meta ${positionKlass(rad.positionDelta)}`}
                  >
                    {deltaPosition(rad.positionDelta)}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
