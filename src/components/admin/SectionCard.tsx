/**
 * SectionCard: en panel med etikettrubrik.
 *
 * Rubriken star ovanfor panelen som en etikett i 14/500 ink-3, inte som en
 * fet rubrik inuti den (docs/designsystem.md v2 avsnitt 6). Da blir
 * kortrubriken 16/600 den tyngsta texten i innehallet och sidrubriken den
 * enda som ar storre.
 *
 * action ar en lank till hoger om rubriken, till exempel "Till Intakter" pa
 * Oversiktens fem sektioner. Den ar en textlank, aldrig en knapp.
 *
 * Serverkomponent.
 */

import type { ReactNode } from 'react';

export interface SectionCardProps {
  /** Sektionsetiketten. Ett h2, men i etikettens format. */
  rubrik: string;
  /**
   * Lank eller annat till hoger om rubriken. Skicka in en Link med
   * lankklassen fran designsystemet.
   */
  action?: ReactNode;
  children: ReactNode;
  /**
   * Utan padding i panelen. Anvands nar innehallet ar en lista med
   * divide-y eller en tabell som sjalv sater sin cellpadding.
   */
  naken?: boolean;
  className?: string;
}

export default function SectionCard({
  rubrik,
  action,
  children,
  naken = false,
  className,
}: SectionCardProps) {
  return (
    <section className={className}>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-ink-3">{rubrik}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div
        className={[
          'rounded-xl border border-kant bg-panel',
          naken ? '' : 'p-4 sm:p-5',
        ].join(' ')}
      >
        {children}
      </div>
    </section>
  );
}
