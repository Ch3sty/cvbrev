'use client';

/**
 * Provraden sist på testkortet (skiss Testerna v2, skiss 1, riktlinjerna 1.5
 * och 5.3): provsymbolen, rad 1 "Övningsprov mot klockan", rad 2 formatet ur
 * planens leverantör och, när tabellen har en, anmärkningen under. Höger pil
 * eller lås. Inget tal på raden: resultatet bor på kurvan.
 *
 * Övningsprovet ingår i Premium på alla tre testtyper. Låst rad är dämpad men
 * läsbar, formatet står kvar i klartext, för det är det som säljer.
 */

import Link from 'next/link';
import { IkonChev, IkonLas } from '@/components/illustrations/RumSymboler';
import { PROVRAD_TITEL } from '@/lib/ovningsprov/format';
import SymProv from './SymProv';

interface Props {
  /** Startarket för övningsprovet. */
  href: string;
  /** Rad 2: "Samma format som Matrigma: cirka 35 uppgifter på 40 minuter." */
  rad2: string;
  /** Anmärkningen under rad 2, eller null. */
  anm?: string | null;
  /** Skärmläsarens text för hela raden. */
  aria: string;
  /** Sann när övningsprovet inte ingår: raden är dämpad och öppnar betalväggen. */
  locked?: boolean;
  onLocked?: () => void;
}

const RAD =
  'mt-3 flex min-h-14 w-full items-center gap-3 border-t border-kant pt-3 text-left no-underline';

export default function ProvCard({ href, rad2, anm, aria, locked, onLocked }: Props) {
  const text = (
    <span className="min-w-0 flex-1">
      <b className={`block text-sm leading-[19px] ${locked ? 'font-medium text-ink-3' : 'font-semibold text-ink-1'}`}>
        {PROVRAD_TITEL}
      </b>
      <span className="block text-meta text-ink-3">{rad2}</span>
      {anm ? <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">{anm}</span> : null}
    </span>
  );

  // Låst: raden öppnar startarket, vars betalvägg säger formatet och datumet
  // (riktlinjerna 1.7). Exponeringen mäts där med kalla 'provrad' (1.8).
  if (locked) {
    return (
      <Link href={`${href}?fran=provrad`} aria-label={aria} className={RAD} data-provrad="last" onClick={onLocked}>
        <SymProv size={36} className="shrink-0 text-ink-3" />
        {text}
        <IkonLas size={20} className="shrink-0 text-ink-3" />
      </Link>
    );
  }

  return (
    <Link href={href} aria-label={aria} className={RAD} data-provrad="oppen">
      <SymProv size={36} className="shrink-0 text-ton-ink" />
      {text}
      <IkonChev size={20} className="shrink-0 text-ink-3" />
    </Link>
  );
}
