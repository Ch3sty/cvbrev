/**
 * Formatbrickorna på mallminiatyrerna (ägaren 2026-11-16, UX): PDF på alla
 * mallar, W bredvid när mallen finns i Word. aria-hidden; etiketten säger
 * formaten (formatTillagg). Liten fil utan texter.ts, så att artiklarnas
 * klientö inte drar in alla texter.
 *
 * Ingen 'use client': används i server- och klientkomponenter.
 */
import { IkonPdf, IkonWord } from '@/components/illustrations/MallIkoner'

/** Formaten i en miniatyrs etikett: alla mallar finns som PDF. */
export function formatTillagg(word: boolean): string {
  return word ? ', PDF och Word' : ', PDF'
}

/**
 * Artiklarnas variant (ägaren 2026-11-16: textbrickorna såg fula ut i
 * artikelns små miniatyrer): mallflödets filikoner i en liten ljus pill.
 */
export function Formatikoner({ word }: { word: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute bottom-1 right-1 flex items-center gap-px rounded-full bg-white/95 px-[3px] py-[2px] shadow-[0_1px_3px_rgba(0,0,0,.18)] ring-1 ring-black/[.08]"
      data-format={word ? 'pdf word' : 'pdf'}
    >
      <IkonPdf size={14} className="text-[#B3261E]" />
      {word ? <IkonWord size={14} className="text-[#1E4FA8]" /> : null}
    </span>
  )
}

export function Formatbrickor({ word, stor }: { word: boolean; stor?: boolean }) {
  const bricka = `rounded-[3px] border border-[#C9C6BF] bg-white text-center font-extrabold shadow-[0_0_0_1px_rgba(0,0,0,.08)] ${
    stor ? 'h-[18px] leading-4' : 'h-4 leading-[14px]'
  }`
  return (
    <span aria-hidden className="absolute bottom-[3px] right-[3px] flex gap-[2px]" data-format={word ? 'pdf word' : 'pdf'}>
      <span className={`${bricka} tracking-[0.02em] text-[#B3261E] ${stor ? 'w-[30px] text-[9px]' : 'w-[26px] text-[8px]'}`}>PDF</span>
      {word ? <span className={`${bricka} text-[#1E3A8A] ${stor ? 'w-[18px] text-[11px]' : 'w-4 text-[10px]'}`}>W</span> : null}
    </span>
  )
}
