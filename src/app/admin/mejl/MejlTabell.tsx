/**
 * Tabellen for mallar och livscykelsteg.
 *
 * Serverkomponent. Grad raknas mot levererade, inte mot skickade: ett mejl
 * som aldrig kom fram kan varken oppnas eller klickas, och att lata det dra
 * ner oppnandegraden blandar ihop tva olika problem. Leveransgraden ar den
 * som raknas mot skickade, och den ar sitt eget tal.
 */

import type { MejlRad } from './data';
import { antal, grad, mallNamn, procent, tidpunkt } from './format';

interface Props {
  rader: MejlRad[];
  tomText: string;
  /** Rubriken pa forsta kolumnen. */
  rubrik: string;
}

export default function MejlTabell({ rader, tomText, rubrik }: Props) {
  if (!rader.length) {
    return <p className="px-4 py-6 text-sm text-ink-2">{tomText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
            <th scope="col" className="px-4 py-3 font-medium">{rubrik}</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Skickade</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Levererade</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Öppnade</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Klick</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Studs</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Senast</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-kant">
          {rader.map((rad) => {
            const leveransgrad = grad(rad.levererade, rad.skickade);
            const oppnandegrad = grad(rad.oppnade, rad.levererade);
            const klickgrad = grad(rad.klick, rad.levererade);

            return (
              <tr key={rad.nyckel}>
                <td className="max-w-[260px] px-4 py-3 text-ink-1">
                  <span className="block truncate" title={rad.nyckel}>
                    {mallNamn(rad.nyckel)}
                  </span>
                </td>

                <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                  {antal(rad.skickade)}
                </td>

                <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                  {antal(rad.levererade)}
                  <span className="ml-2 text-meta text-ink-3">
                    {procent(leveransgrad, 0)}
                  </span>
                </td>

                <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                  {antal(rad.oppnade)}
                  <span className="ml-2 text-meta text-ink-3">
                    {procent(oppnandegrad, 0)}
                  </span>
                </td>

                <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                  {antal(rad.klick)}
                  <span className="ml-2 text-meta text-ink-3">
                    {procent(klickgrad, 0)}
                  </span>
                </td>

                <td
                  className={`px-4 py-3 text-right tabular-nums ${
                    rad.studs > 0 ? 'text-fel' : 'text-ink-3'
                  }`}
                >
                  {antal(rad.studs)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-ink-3">
                  {tidpunkt(rad.senast)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
