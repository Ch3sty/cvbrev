/**
 * En mall som miniatyr (skissen: .mini). Riktig bild ur katalogen (webp,
 * renderad ur definitionen), vald med kopparram och bock, W när mallen finns
 * i Word, namnet och nivån under. 3:4-ytan är reserverad (CLS 0) och bilden
 * laddas lat utanför första vyn.
 *
 * Ingen 'use client': används i server- och klientkomponenter.
 */
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { REMSA, wordTillagg } from './texter'

export interface MiniatyrProps {
  mall: MallKort
  vald?: boolean
  /** Text under namnet; standard är nivån. */
  under?: string
  onValj?: (id: string) => void
  /** Länk i stället för knapp (publikt galleri utan JavaScript). */
  href?: string
  lat?: boolean
  storlek?: 'remsa' | 'rutnat'
  disabled?: boolean
}

export default function Miniatyr({ mall, vald, under, onValj, href, lat = true, storlek = 'remsa', disabled }: MiniatyrProps) {
  const innehall = (
    <>
      <span
        className={`relative block aspect-[210/297] w-full overflow-hidden rounded-md bg-white ${
          vald ? 'border-2 border-koppar' : 'border border-kant'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={storlek === 'rutnat' ? mall.bild.stor : mall.bild.liten}
          alt=""
          loading={lat ? 'lazy' : undefined}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        {vald ? (
          <span aria-hidden className="absolute right-[3px] top-[3px] flex h-4 w-4 items-center justify-center rounded-full bg-ink-1 text-papper">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        ) : null}
        {mall.word ? (
          <span
            aria-hidden
            className="absolute bottom-[3px] right-[3px] h-4 w-4 rounded-[3px] border border-[#C9C6BF] bg-white text-center text-[10px] font-extrabold leading-[14px] text-[#1E3A8A]"
          >
            W
          </span>
        ) : null}
      </span>
      <span className="mt-1 block truncate text-xs font-semibold text-ink-1">{mall.namn}</span>
      <span className="block truncate text-[11px] text-ink-3">{under ?? REMSA.niva[mall.niva]}</span>
    </>
  )
  const klass = `block min-w-0 text-left ${storlek === 'remsa' ? 'w-16 shrink-0 snap-start' : 'w-full'} ${
    disabled ? 'pointer-events-none opacity-60' : ''
  }`
  const etikett = `${mall.namn}, ${REMSA.niva[mall.niva]}${wordTillagg(mall.niva === 'gratis', mall.word)}`
  if (href) {
    return (
      <a href={href} className={klass} aria-label={etikett} aria-current={vald ? 'true' : undefined}>
        {innehall}
      </a>
    )
  }
  return (
    <button type="button" onClick={() => onValj?.(mall.id)} className={klass} aria-label={etikett} aria-pressed={vald} disabled={disabled}>
      {innehall}
    </button>
  )
}
