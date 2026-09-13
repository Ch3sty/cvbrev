'use client';

interface TableData {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  highlightLastRow?: boolean;
}

interface NumericalTableProps {
  data: TableData;
}

/**
 * Datatabellen i de numeriska passagerna.
 *
 * En panel med en riktig tabell inuti. Raderna skiljs med kant, aldrig med
 * varannan färgad rad, och en summarad markeras med en starkare överkant och
 * halvfet text i ink-1. Tabellen scrollar i sin egen ruta så sidan aldrig
 * scrollar i sidled.
 */
export default function NumericalTable({ data }: NumericalTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-kant bg-panel">
      <div className="overflow-x-auto p-3 sm:p-4">
        <table className="w-full border-collapse text-sm">
          {data.caption && (
            <caption className="caption-top mb-3 text-left text-kort text-ink-1">
              {data.caption}
            </caption>
          )}
          <thead>
            <tr>
              {data.headers.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`border-b border-kant-stark px-3 py-2.5 text-steg uppercase text-ink-3 sm:px-4 ${
                    i === 0 ? 'text-left' : 'text-right'
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {data.rows.map((row, ri) => {
              const isLast = ri === data.rows.length - 1;
              const isHighlighted = data.highlightLastRow && isLast;
              return (
                <tr key={ri} className={isHighlighted ? 'border-t border-kant-stark' : ''}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 py-2.5 sm:px-4 ${
                        ci === 0
                          ? 'text-left text-ink-1'
                          : 'text-right tabular-nums text-ink-2'
                      } ${isHighlighted ? 'font-medium text-ink-1' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
