/**
 * Faktaraden (skiss Provbladet, version 3): tal över etiketter, aldrig tal i
 * löptext. Talen i display 18, etiketterna i 11 px ink-3. Centrerad under
 * bilden på mobil, vänsterställd och radbruten i bildens spalt på dator.
 */

export interface FaktaPost {
  tal: string;
  etikett: string;
}

/** "15" eller "20 till 30". */
export function spann(varden: number[]): string {
  const finns = varden.filter((v) => Number.isFinite(v) && v > 0);
  if (finns.length === 0) return '0';
  const min = Math.min(...finns);
  const max = Math.max(...finns);
  return min === max ? String(min) : `${min} till ${max}`;
}

export default function Fakta({ poster, className }: { poster: FaktaPost[]; className?: string }) {
  return (
    <dl className={`mt-2.5 flex flex-wrap justify-center gap-x-[18px] gap-y-2 ${className ?? ''}`} data-fakta>
      {poster.map((p) => (
        <div key={p.etikett} className="flex flex-col-reverse">
          <dt className="mt-px whitespace-nowrap text-[11px] leading-[14px] text-ink-3">{p.etikett}</dt>
          <dd className="m-0 whitespace-nowrap font-display text-[18px] font-bold leading-[22px] tracking-[-.02em] text-ink-1 tabular-nums">
            {p.tal}
          </dd>
        </div>
      ))}
    </dl>
  );
}
