'use client';

/**
 * Nivåsegmentet på testkortet (skiss Testerna v2, skiss 1).
 *
 * Ett tal bär segmentet, aldrig en rad med tal. Samma höjd i alla tillstånd:
 * - gjord: namnet och bocken, bästa procenten i display 22 och en 4 px stapel
 * - ny: minuterna dämpade och vad nivån gör ("en regel", "två regler"),
 *   aldrig "lätt" och aldrig rang (riktlinjerna 2.3)
 * - låst: låset och "Premium"; trycket öppnar betalväggen
 * - profil (personlighet): "Profil" och dagen den gjordes, ingen procent
 *
 * "Nästa" i koppar på ett segment per kort när nivån under sitter
 * (SITTER_PROCENT). Kopparkanten är det enda kopparn gör i segmenten.
 *
 * "14 av 15" och antal försök står i title och aria-label, aldrig i text
 * (minnet feedback_data_som_bild_inte_text).
 */

import Link from 'next/link';
import { IkonCheck, IkonLas } from '@/components/illustrations/RumSymboler';

export type NivaLage =
  | { typ: 'gjord'; procent: number; title: string; aria: string }
  | { typ: 'ny'; minuter: number; etikett: string; aria: string; title?: string }
  | { typ: 'last'; etikett: string; aria: string }
  | { typ: 'profil'; etikett: string; aria: string };

export interface NivaSegmentProps {
  namn: string;
  lage: NivaLage;
  href: string;
  onLocked?: () => void;
  /** Segmentet är nästa nivå att göra: koppar kant och etiketten "Nästa". */
  nasta?: boolean;
}

export const NASTA_ETIKETT = 'Nästa';

const BAS =
  'relative flex min-h-[82px] w-full flex-col justify-start rounded-xl border px-2.5 py-2.5 text-left no-underline transition-[border-color] duration-[120ms]';

export default function NivaSegment({ namn, lage, href, onLocked, nasta }: NivaSegmentProps) {
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
        <small className="mt-auto text-[11px] leading-[14px] text-ink-3">{lage.etikett}</small>
      </button>
    );
  }

  if (lage.typ === 'ny') {
    return (
      <Link
        href={href}
        aria-label={lage.aria}
        title={lage.title}
        className={`${BAS} bg-papper ${
          nasta ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]' : 'border-kant hover:border-kant-stark'
        }`}
        data-niva="ny"
        data-nasta={nasta ? 'ja' : undefined}
      >
        <b className="flex items-center justify-between gap-1.5 text-[12px] font-semibold leading-4 tracking-[.02em] text-ink-2">
          {namn}
          {nasta ? (
            <span className="text-[10px] font-semibold uppercase leading-[14px] tracking-[.06em] text-koppar-ink">
              {NASTA_ETIKETT}
            </span>
          ) : null}
        </b>
        <em className="mt-1 font-display text-[18px] font-semibold not-italic leading-[26px] tracking-[-.02em] text-ink-3 tabular-nums">
          {lage.minuter} min
        </em>
        <small className="mt-auto text-[11px] leading-[14px] text-ink-3">{lage.etikett}</small>
      </Link>
    );
  }

  if (lage.typ === 'profil') {
    return (
      <Link
        href={href}
        aria-label={lage.aria}
        className={`${BAS} border-ink-1 bg-papper shadow-val`}
        data-niva="gjord"
      >
        <b className="flex items-center justify-between gap-1.5 text-[12px] font-semibold leading-4 tracking-[.02em] text-ink-2">
          {namn}
          <IkonCheck size={14} strokeWidth={2} className="shrink-0 text-ink-1" />
        </b>
        <em className="mt-1 font-display text-[18px] font-semibold not-italic leading-[26px] tracking-[-.02em] text-ink-1">
          Profil
        </em>
        <small className="mt-auto text-[11px] leading-[14px] text-ink-3">{lage.etikett}</small>
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
      <span className="mt-auto block h-1 overflow-hidden rounded-sm border border-kant bg-papper-2" aria-hidden="true">
        <i className="block h-full rounded-sm bg-ton-ink" style={{ width: `${bredd}%` }} />
      </span>
    </Link>
  );
}
