/**
 * Delarna som navet /personligt-brev-exempel och de tio kategorisidorna
 * delar i publikt omgång 3 (skissen brev-exempelnav, beslut 7: kategori-
 * sidorna följer navets skiss). Serverkomponenter.
 *
 *  - BranschBrickor: lyftkortet med de tio branscherna, största först, med
 *    antalet som stort tal och en stapel. Samma länkar som filterraden hade.
 *  - NavBild: hjältens tre brev (brevmotorns egna miniatyrer) med yrkes-
 *    lappar och talet. aria-hidden, Exempel.
 */

import Link from 'next/link'
import { KATEGORIER, type Kategori } from '@/app/(public)/exempel/components/exempel-data'
import type { GalleriYrke } from '@/app/(public)/exempel/components/GalleriPageContent'
import { MINIATYR_BREDD, MINIATYR_HOJD, brevMiniatyrSrc } from '@/components/publikt/brevmallar'
import { Lyft, Svav } from '@/components/publikt/v3'
import { storForst, talOrd } from '@/components/publikt/talord'

/** Galleridatan skriver 'teknik' där kategorierna heter 'tech'. */
export function normaliseraKategori(input: string): Kategori['slug'] {
  if (input === 'teknik') return 'tech'
  return input as Kategori['slug']
}

/** Branscherna med antalet brevexempel, största först (vid lika: katalogens ordning). */
export function branscher(yrken: readonly GalleriYrke[]) {
  return KATEGORIER.map((kat, i) => ({
    kat,
    i,
    antal: yrken.filter((y) => normaliseraKategori(y.kategori) === kat.slug).length,
  }))
    .filter((k) => k.antal > 0)
    .sort((a, b) => b.antal - a.antal || a.i - b.i)
}

export function BranschBrickor({
  yrken,
  vald,
  allaHref,
  uppmaning = 'Hitta den som är din.',
}: {
  yrken: readonly GalleriYrke[]
  /** Kategorisidans egen bransch, som blir den mörka brickan. Utan: Alla yrken är mörk. */
  vald?: Kategori['slug']
  /** Alla yrken: #yrken på navet, navet från en kategorisida. */
  allaHref: string
  /** Raden efter antalet branscher, som räknas ur datan (SEO:s slutbesked, avsnitt 3). */
  uppmaning?: string
}) {
  const lista = branscher(yrken)
  const storst = Math.max(...lista.map((k) => k.antal), 1)
  const rubrik = `${storForst(talOrd(lista.length))} branscher. ${uppmaning}`
  return (
    <Lyft id="branscher" etikett="Välj bransch">
      <p className="p3-ey">Välj bransch</p>
      <p className="bx-bransch-rubrik">{rubrik}</p>
      <nav className="bx-branscher" aria-label="Filtrera efter bransch">
        <a className={`bx-bricka bx-alla ${vald ? '' : 'bx-mork'}`.trim()} href={allaHref} aria-current={vald ? undefined : 'page'}>
          {/* Ankartexten står i samma ordning som förut ("Alla yrken 89"); talet ritas först med CSS. */}
          <span className="bx-bricka-namn">Alla yrken</span> <b>{yrken.length}</b>
          <small>{vald ? 'Tillbaka till hela listan' : 'Hela listan står här nedanför'}</small>
        </a>
        {lista.map(({ kat, antal }) => {
          const ar = kat.slug === vald
          return (
            <Link
              key={kat.slug}
              className={`bx-bricka ${ar ? 'bx-mork' : ''}`.trim()}
              href={`/personligt-brev-exempel/kategori/${kat.slug}`}
              aria-current={ar ? 'page' : undefined}
            >
              <span className="bx-bricka-namn">{kat.namn}</span> <b>{antal}</b>
              <i className="bx-stapel" aria-hidden="true">
                <i style={{ width: `${Math.round((antal / storst) * 100)}%` }} />
              </i>
            </Link>
          )
        })}
      </nav>
    </Lyft>
  )
}

/** Hjältens tre brev med yrkeslappar och talet (bara bild). */
export function NavBild({ antal, lappar }: { antal: number; lappar: readonly string[] }) {
  return (
    <div className="bx-navbild" aria-hidden="true">
      {(['bjork', 'koppar', 'linne'] as const).map((id, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={id} className={`bx-navbild-ark bx-navbild-${i + 1}`} src={brevMiniatyrSrc(id)} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} decoding="async" />
      ))}
      {lappar.slice(0, 3).map((l, i) => (
        <span key={l} className={`bx-navbild-lapp bx-navbild-lapp-${i + 1}`}>
          {l}
        </span>
      ))}
      <Svav className="bx-navbild-tal" gungar stor={antal} under="yrken, ett färdigt brev var" />
    </div>
  )
}
