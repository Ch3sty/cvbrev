'use client';

/**
 * Provraden sist på logikkortet (skiss Provbladet, version 3): symbolen för
 * provläget, en rad om vad det är och en rad om formatet, under en hårlinje.
 * "Träna ovan, pröva här."
 *
 * Logikgruppens prov är generalrepetitionen i planens format (spec-rummen
 * 19.6), och raden säger formatet i ord ur PROVRAD (copy-premium avsnitt 5).
 * Provläget ingår i Premium: på gratisnivån är raden dämpad med lås och
 * trycket öppnar betalväggen.
 */

import Link from 'next/link';
import { IkonChev, IkonLas } from '@/components/illustrations/RumSymboler';
import { PROVRAD } from '../prov/prov-copy';
import SymProv from './SymProv';

interface Props {
  /** Startsidan för provet: generalrepetitionen eller provets testsida. */
  href: string;
  /** Rad 2, färdig mening ur PROVRAD.rad2 eller PROVRAD.rad2Format. */
  rad2: string;
  /** Skärmläsarens text för den låsta raden, ur PROVRAD.aria eller PROVRAD.ariaFormat. */
  aria: string;
  /** Sann när provläget inte ingår: raden är dämpad och öppnar betalväggen. */
  locked?: boolean;
  onLocked?: () => void;
}

const RAD =
  'mt-3 flex min-h-14 w-full items-center gap-3 border-t border-kant pt-3 text-left no-underline';

export default function ProvCard({ href, rad2, aria, locked, onLocked }: Props) {
  if (locked) {
    return (
      <button type="button" onClick={onLocked} aria-label={aria} className={RAD} data-provrad="last">
        <SymProv size={36} className="shrink-0 text-ink-3" />
        <span className="min-w-0 flex-1">
          <b className="block text-sm font-semibold leading-[19px] text-ink-3">{PROVRAD.titelLast}</b>
          <span className="block text-meta text-ink-3">{rad2}</span>
        </span>
        <IkonLas size={20} className="shrink-0 text-ink-3" />
      </button>
    );
  }

  return (
    <Link href={href} className={RAD} data-provrad="oppen">
      <SymProv size={36} className="shrink-0 text-ton-ink" />
      <span className="min-w-0 flex-1">
        <b className="block text-sm font-semibold leading-[19px] text-ink-1">{PROVRAD.titelOppen}</b>
        <span className="block text-meta text-ink-3">{rad2}</span>
      </span>
      <IkonChev size={20} className="shrink-0 text-ink-3" />
    </Link>
  );
}
