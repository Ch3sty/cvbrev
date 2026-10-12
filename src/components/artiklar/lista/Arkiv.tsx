/**
 * Artikelarkivet, publikt v2 (spec-publikt-v2 del B 3.2): hjälten på
 * grafitvägg med antalet och ämnesfiltret, korten med tumnagel och
 * sidnavigeringen. Samma länkar, h1 och h2 som i ArtikelLista.tsx; den
 * filens ArtikelKort står kvar för författarsidorna. Serverkomponenter.
 */

import Image from 'next/image'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { PostMeta } from '@/lib/blog'
import { getCtaVariantForTags } from '@/lib/cta/clusters'
import { KLUSTER_ETIKETT } from '@/components/publikt/innehall/artikel-kluster'
import Smula from '@/components/publikt/innehall/Smula'

function bildSrc(src?: string): string | null {
  if (!src || typeof src !== 'string' || !src.trim()) return null
  let s = src.trim()
  if (s.startsWith('/public/')) s = s.replace('/public', '')
  else if (s.startsWith('public/')) s = s.replace('public', '')
  if (!s.startsWith('/') && !s.startsWith('http')) s = `/${s}`
  return s
}

export function ArkivHjalte({
  antal,
  kategorier,
  aktiv,
  bunt,
}: {
  antal: number
  kategorier: { tag: string; count: number }[]
  aktiv?: string
  /** Tre artikelbilder i solfjäder (dator). */
  bunt: string[]
}) {
  const pill = (href: string, label: string, count: number, ar: boolean, tag: string) => (
    <Link
      key={href}
      href={href}
      data-tag={tag.toLowerCase()}
      aria-current={ar ? 'page' : undefined}
      className={ar ? 'aktiv' : undefined}
    >
      {label} <em>{count}</em>
    </Link>
  )
  return (
    <section className="pub-sek pub-yta-vagg pub-rum-neu ib-hjalte ib-arkiv-hjalte" id="arkiv-hjalte">
      <div className="pub-wrap">
        <Smula steg={[{ namn: 'Hem', href: '/' }, { namn: 'Artiklar' }]} />
        <div className="ib-arkiv-topp">
          <div>
            <p className="pub-kick">Karriärbibliotek</p>
            <h1 className="ib-h1-stor">Artiklar som förbättrar din jobbsökning</h1>
            <p className="pub-ingress">
              Lär dig skriva starkare ansökningar och CV:n som går igenom. Guider som granskas av HR-experter och
              uppdateras varje vecka.
            </p>
            <p className="ib-antal">
              <b>{antal}</b>artiklar
            </p>
          </div>
          <div className="ib-bunt" aria-hidden="true">
            {bunt.slice(0, 3).map((src) => (
              <span className="ib-tumme" key={src}>
                <Image src={src} alt="" width={1536} height={1024} sizes="260px" loading="lazy" />
              </span>
            ))}
          </div>
        </div>
        <nav className="ib-filter" aria-label="Filtrera efter ämne">
          {pill('/artiklar', 'Alla artiklar', antal, !aktiv, '')}
          {kategorier
            .filter((k) => k.tag?.trim())
            .map((k) =>
              pill(
                `/artiklar?tag=${encodeURIComponent(k.tag)}`,
                k.tag.charAt(0).toUpperCase() + k.tag.slice(1),
                k.count,
                aktiv?.toLowerCase() === k.tag.toLowerCase(),
                k.tag
              )
            )}
        </nav>
      </div>
    </section>
  )
}

/** Arkivets kort: bild, kategori, h2 med länk, ingress, ämnen och datum. */
export function ArkivKort({ post, stor = false, prioritet = false }: { post: PostMeta; stor?: boolean; prioritet?: boolean }) {
  const src = bildSrc(post.image)
  const minuter = Math.max(1, Math.ceil((post.wordCount || 0) / 200))
  let datum: string | null = null
  if (post.date) {
    try {
      const d = parseISO(post.date)
      datum = isNaN(d.getTime()) ? post.date : format(d, 'd MMMM yyyy', { locale: sv })
    } catch {
      datum = post.date
    }
  }
  const taggar = post.tags?.slice(0, stor ? 3 : 2) ?? []
  return (
    <li className={stor ? 'stor ib-akort' : 'ib-akort'}>
      <article>
        <Link href={`/artiklar/${post.slug}`} className="ib-tumme" aria-label={`Läs ${post.title}`}>
          {src ? (
            <Image
              src={src}
              alt={post.title ?? 'Artikelbild'}
              width={1536}
              height={1024}
              sizes={
                stor
                  ? '(min-width: 1120px) 600px, (min-width: 760px) 55vw, 100vw'
                  : '(min-width: 1120px) 360px, (min-width: 760px) 33vw, 100vw'
              }
              priority={prioritet}
              loading={prioritet ? undefined : 'lazy'}
            />
          ) : null}
        </Link>
        <div>
          <small>{KLUSTER_ETIKETT[getCtaVariantForTags(post.tags)]}</small>
          <h2 className="ib-kort-h2">
            <Link href={`/artiklar/${post.slug}`}>{post.title}</Link>
          </h2>
          {post.description ? <p className="ib-kort-ingress">{post.description}</p> : null}
          {taggar.length ? (
            <ul className="ib-akort-amnen">
              {taggar.map((t) => (
                <li key={t}>
                  <Link href={`/artiklar?tag=${encodeURIComponent(t)}`}>{t}</Link>
                </li>
              ))}
            </ul>
          ) : null}
          <span className="ib-akort-datum">
            {datum ? <time dateTime={post.date}>{datum}</time> : null}
            {datum ? ', ' : ''}
            {minuter} min
          </span>
        </div>
      </article>
    </li>
  )
}

export function ArkivSidor({
  sida,
  sidor,
  totalt,
  perSida,
  tag,
}: {
  sida: number
  sidor: number
  totalt: number
  perSida: number
  tag?: string
}) {
  if (sidor <= 1) return null
  const href = (n: number) => {
    const p = new URLSearchParams()
    if (tag) p.set('tag', tag)
    if (n > 1) p.set('page', String(n))
    const qs = p.toString()
    return qs ? `/artiklar?${qs}` : '/artiklar'
  }
  const start = (sida - 1) * perSida + 1
  const slut = Math.min(sida * perSida, totalt)
  const lista: (number | 'e')[] = [1]
  const min = Math.max(2, sida - 1)
  const max = Math.min(sidor - 1, sida + 1)
  if (min > 2) lista.push('e')
  for (let i = min; i <= max; i++) lista.push(i)
  if (max < sidor - 1) lista.push('e')
  lista.push(sidor)
  return (
    <nav className="ib-sidor" aria-label="Paginering">
      <span>
        Visar {start} till {slut} av {totalt} artiklar
      </span>
      <div>
        {sida > 1 ? (
          <Link href={href(sida - 1)} aria-label="Föregående sida">
            Föregående
          </Link>
        ) : null}
        {lista.map((n, i) =>
          n === 'e' ? (
            <span key={`e${i}`} aria-hidden="true">
              till
            </span>
          ) : (
            <Link key={n} href={href(n)} aria-current={n === sida ? 'page' : undefined} aria-label={`Sida ${n}`}>
              {n}
            </Link>
          )
        )}
        {sida < sidor ? (
          <Link href={href(sida + 1)} aria-label="Nästa sida">
            Nästa
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
