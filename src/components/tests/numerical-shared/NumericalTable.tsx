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
 * Premium-stylad tabell-komponent med orange/röd-DNA.
 *
 * Används för att visa data-tabeller i passages (försäljnings-data,
 * lönsamhets-data etc).
 */
export default function NumericalTable({ data }: NumericalTableProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-orange-200/60 bg-white"
    >
      <div className="overflow-x-auto p-3 sm:p-4">
        <table className="w-full border-collapse text-sm">
          {data.caption && (
            <caption className="text-left text-sm font-bold text-neutral-900 mb-3 caption-top">
              {data.caption}
            </caption>
          )}
          <thead>
            <tr>
              {data.headers.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-xs font-bold uppercase tracking-wider border-b-2 border-orange-200 ${
                    i === 0
                      ? 'text-left text-neutral-700'
                      : 'text-right text-orange-700'
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => {
              const isLast = ri === data.rows.length - 1;
              const isHighlighted = data.highlightLastRow && isLast;
              return (
                <tr
                  key={ri}
                  className={`${
                    isHighlighted
                      ? 'bg-orange-50/80 font-bold border-t-2 border-orange-200'
                      : ri % 2 === 1
                      ? 'bg-orange-50/30'
                      : ''
                  }`}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 sm:px-4 py-2.5 ${
                        ci === 0
                          ? 'text-left text-neutral-900 font-semibold'
                          : 'text-right tabular-nums text-neutral-700'
                      } ${
                        isHighlighted ? 'text-orange-900' : ''
                      }`}
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
