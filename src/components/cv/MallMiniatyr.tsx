/**
 * En mallminiatyr: arket i 3:4 på panel, namnet under. Bruten ur
 * MallMiniatyrer.tsx så att den som bara vill rita en miniatyr slipper
 * mallregistret: den filen läser SIMPLE_TEMPLATES för artiklarnas urval, och
 * importen drog in hela registret i mallsidans JavaScript (2026-09-24).
 *
 * Inga hooks och ingen 'use client': används i både server- och
 * klientkomponenter.
 */

import type { ReactNode } from 'react'
import type { SimpleTemplate } from '@/lib/cv/simple-templates'

export interface MallMiniatyrProps {
  mall: Pick<SimpleTemplate, 'id' | 'name' | 'imagePath' | 'tier'>
  /** Raden under namnet: "gratis", "CV-paketet". */
  under?: ReactNode
  vald?: boolean
  /** Mallen ingår inte i paketet: insunken med lås. */
  last?: boolean
  className?: string
}

/** En miniatyr: arket i 3:4 på panel, namnet under. */
export function MallMiniatyr({ mall, under, vald, last, className }: MallMiniatyrProps) {
  return (
    <figure className={`min-w-0 ${className ?? ''}`}>
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-lg border ${
          vald ? 'border-ink-1 shadow-val' : 'border-kant'
        } ${last ? 'bg-insunken' : 'bg-panel'}`}
      >
        {/* Registrets förhandsvisning. Dokumentet är papper: vit bakgrund är
            designsystemets undantag för mallförhandsvisning (§10). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mall.imagePath}
          alt={`Mallen ${mall.name}`}
          width={300}
          height={400}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${last ? 'opacity-50' : ''}`}
        />
        {last ? (
          <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-panel text-ink-2" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <rect x="6" y="11" width="12" height="9" rx="2" />
              <path d="M9 11V8a3 3 0 0 1 6 0v3" />
            </svg>
          </span>
        ) : null}
      </div>
      <figcaption className="mt-2">
        <span className="block truncate text-sm font-semibold text-ink-1">{mall.name}</span>
        {under ? <span className="block truncate text-meta text-ink-3">{under}</span> : null}
      </figcaption>
    </figure>
  )
}
