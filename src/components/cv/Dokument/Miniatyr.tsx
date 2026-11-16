/**
 * En mall som miniatyr (skissen: .mini). Riktig bild ur katalogen (webp,
 * renderad ur definitionen), vald med kopparram och bock, formatbrickorna
 * nere till höger (PDF på alla, W när mallen finns i Word; ägaren
 * 2026-11-16), namnet och nivån under. 3:4-ytan är reserverad (CLS 0) och
 * bilden laddas lat utanför första vyn.
 *
 * Storlekar: remsa (64 px, två rader text), helskarm (80 px, helskärmens
 * remsa på datorn, namn och nivå på en rad) och rutnat (fyller sin cell).
 *
 * Ingen 'use client': används i server- och klientkomponenter.
 */
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { REMSA } from './texter'
import { Formatbrickor, formatTillagg } from './Formatbrickor'

export interface MiniatyrProps {
  mall: MallKort
  vald?: boolean
  /** Text under namnet; standard är nivån. */
  under?: string
  onValj?: (id: string) => void
  /** Länk i stället för knapp (publikt galleri utan JavaScript). */
  href?: string
  lat?: boolean
  storlek?: 'remsa' | 'helskarm' | 'rutnat'
  disabled?: boolean
}

export default function Miniatyr({ mall, vald, under, onValj, href, lat = true, storlek = 'remsa', disabled }: MiniatyrProps) {
  const niva = under ?? REMSA.niva[mall.niva]
  const innehall = (
    <>
      <span
        className={`relative block aspect-[210/297] w-full overflow-hidden rounded-md bg-white transition-colors duration-150 ${
          vald ? 'border-2 border-koppar' : 'border border-kant group-hover:border-ink-1 group-focus-visible:border-ink-1'
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
        <Formatbrickor word={mall.word} stor={storlek === 'rutnat'} />
      </span>
      {storlek === 'helskarm' ? (
        <span className="mt-1 block truncate text-xs">
          <span className="font-semibold text-ink-1">{mall.namn}</span>
          <span className="text-ink-3"> · {niva}</span>
        </span>
      ) : (
        <>
          <span className="mt-1 block truncate text-xs font-semibold text-ink-1">{mall.namn}</span>
          <span className="block truncate text-[11px] text-ink-3">{niva}</span>
        </>
      )}
    </>
  )
  const bredd = storlek === 'remsa' ? 'w-16 shrink-0 snap-start' : storlek === 'helskarm' ? 'w-20 shrink-0 snap-start' : 'w-full'
  const klass = `group block min-w-0 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar-ink ${bredd} ${
    disabled ? 'pointer-events-none opacity-60' : ''
  }`
  const etikett = `${mall.namn}, ${REMSA.niva[mall.niva]}${formatTillagg(mall.word)}`
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
