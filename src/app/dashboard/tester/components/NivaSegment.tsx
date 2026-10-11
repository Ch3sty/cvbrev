'use client';

/**
 * Nivåsegmentet på testkortet (skiss Provbladet, version 3, avsnitt 1).
 *
 * Ett tal bär segmentet, aldrig en rad med tal:
 * - gjord: namnet och bocken, bästa procenten i display 22 och en 4 px stapel
 * - inte gjord: minuterna dämpade och etiketten "inte gjord"
 * - låst: låset och "Premium"; trycket öppnar betalväggen
 *
 * "14 av 15" och antal försök står i title och aria-label, aldrig i text
 * (minnet feedback_data_som_bild_inte_text). Kopparn finns inte i
 * segmenten; val är bläck.
 */

import Link from 'next/link';
import { IkonCheck, IkonLas } from '@/components/illustrations/RumSymboler';

export type NivaLage =
  | { typ: 'gjord'; procent: number; title: string; aria: string }
  | { typ: 'ny'; minuter: number; etikett: string; aria: string; title?: string }
  | { typ: 'last'; etikett: string; aria: string };

export interface NivaSegmentProps {
  namn: string;
  lage: NivaLage;
  href: string;
  onLocked?: () => void;
}

const BAS =
  'relative flex min-h-[78px] w-full flex-col justify-start rounded-xl border px-3 py-2.5 text-left no-underline transition-[border-color] duration-[120ms]';

export default function NivaSegment({ namn, lage, href, onLocked }: NivaSegmentProps) {
  if (lage.typ === 'last') {
    return (
      <button
        type="button"
        onClick={onLocked}
        aria-label={lage.aria}
        className={`${BAS} border-kant bg-papper-2 hover:border-kant-stark`}
        data-niva="last"
      >
        <b className="text-[12px] font-semibold leading-4 tracking-[.02em] text-ink-3">{namn}</b>
        <span className="mt-1 flex h-[26px] items-center text-ink-3" aria-hidden="true">
          <IkonLas size={20} />
        </span>
        <small className="mt-1 text-[11px] leading-[14px] text-ink-3">{lage.etikett}</small>
      </button>
    );
  }

  if (lage.typ === 'ny') {
    return (
      <Link
        href={href}
        aria-label={lage.aria}
        title={lage.title}
        className={`${BAS} border-kant bg-papper hover:border-kant-stark`}
        data-niva="ny"
      >
        <b className="text-[12px] font-semibold leading-4 tracking-[.02em] text-ink-2">{namn}</b>
        <em className="mt-1 font-display text-[18px] font-semibold not-italic leading-[26px] tracking-[-.02em] text-ink-3 tabular-nums">
          {lage.minuter} min
        </em>
        <small className="mt-1 text-[11px] leading-[14px] text-ink-3">{lage.etikett}</small>
      </Link>
    );
  }

  const bredd = Math.max(0, Math.min(100, lage.procent));
  return (
    <Link
      href={href}
      aria-label={lage.aria}
      title={lage.title}
      className={`${BAS} border-ink-1 bg-papper shadow-val`}
      data-niva="gjord"
    >
      <b className="flex items-center justify-between gap-1.5 text-[12px] font-semibold leading-4 tracking-[.02em] text-ink-2">
        {namn}
        <IkonCheck size={14} strokeWidth={2} className="shrink-0 text-ink-1" />
      </b>
      <em className="mt-1 font-display text-[22px] font-bold not-italic leading-[26px] tracking-[-.02em] text-ink-1 tabular-nums">
        {bredd} %
      </em>
      <span className="mt-2 block h-1 overflow-hidden rounded-sm border border-kant bg-papper-2" aria-hidden="true">
        <i className="block h-full rounded-sm bg-ton-ink" style={{ width: `${bredd}%` }} />
      </span>
    </Link>
  );
}
