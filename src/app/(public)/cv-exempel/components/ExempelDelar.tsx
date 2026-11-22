/**
 * Delarna som /cv-exempel och kategorisidorna under /cv-exempel/kategori
 * delar i publikt omgång 3 (navets skiss, beslut 7): branschbrickorna i det
 * lyfta kortet och yrkeskorten. Serverkomponenter.
 */
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { mallBild } from '@/lib/cv/mallar/katalog'
import { KATEGORIER, type Kategori } from '@/app/(public)/exempel/components/exempel-data'
import type { GalleriYrke } from '@/app/(public)/exempel/components/GalleriPageContent'
import './exempel-v3.css'

/** Galleridatan skriver 'teknik' där kategorierna heter 'tech'. */
export function normalizeKategori(input: string): Kategori['slug'] {
  if (input === 'teknik') return 'tech'
  return input as Kategori['slug']
}

/** Branscherna med antalet CV-exempel, största först. */
export function branscher(yrken: readonly GalleriYrke[]) {
  return KATEGORIER.map((kat) => ({
    kat,
    antal: yrken.filter((y) => normalizeKategori(y.kategori) === kat.slug).length,
  }))
    .filter((k) => k.antal > 0)
    .sort((a, b) => b.antal - a.antal)
}

/**
 * Branschbrickorna: "Alla yrken" först, sedan en bricka per bransch med
 * antalet och en stapel för storleken. vald är branschen sidan står på
 * (mörk bricka); på navet är "Alla yrken" vald.
 */
export function Branscher({ yrken, vald, allaHref }: { yrken: readonly GalleriYrke[]; vald?: Kategori['slug']; allaHref: string }) {
  const lista = branscher(yrken)
  const storst = Math.max(1, ...lista.map((b) => b.antal))
  return (
    <nav className="cve-bransch" aria-label="Filtrera efter bransch">
      <a href={allaHref} className={vald ? undefined : 'cve-vald'} aria-current={vald ? undefined : 'page'}>
        <b>{yrken.length}</b>
        <span>Alla yrken</span>
        <i style={{ ['--andel' as string]: '100%' } as CSSProperties} />
      </a>
      {lista.map(({ kat, antal }) => (
        <Link
          key={kat.slug}
          href={`/cv-exempel/kategori/${kat.slug}`}
          className={vald === kat.slug ? 'cve-vald' : undefined}
          aria-current={vald === kat.slug ? 'page' : undefined}
        >
          <b>{antal}</b>
          <span>{kat.namn}</span>
          <i style={{ ['--andel' as string]: `${Math.round((antal / storst) * 100)}%` } as CSSProperties} />
        </Link>
      ))}
    </nav>
  )
}

export interface YrkesKortRad {
  yrke: string
  slug: string
  /** Liten rad ovanför yrket (branschen eller "CV-exempel"). */
  ovan?: string
  text?: string
}

/** Linne-miniatyren som dekor på korten (SEO-beskedet avsnitt 14: en gemensam miniatyr, tomt alt). */
const MINIATYR = mallBild('linne').liten

/** Yrkeskorten: miniatyren, raden ovanför, yrket som h3 och raden under. Hela kortet är länken. */
export function YrkesKortLista({ yrken, id }: { yrken: readonly YrkesKortRad[]; id?: string }) {
  return (
    <ul className="cve-yrken" id={id}>
      {yrken.map((y) => (
        <li key={y.slug} data-yrke={`${y.yrke} ${y.slug}`.toLowerCase()}>
          <Link href={`/cv-exempel/${y.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MINIATYR} alt="" width={112} height={158} loading="lazy" decoding="async" />
            <div>
              {y.ovan ? <small>{y.ovan}</small> : null}
              <h3 className="p3-h3">{y.yrke}</h3>
              <span className="cve-rad">{y.text ?? 'Se CV-exempel'}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
