/**
 * Artikellistans delar (docs/design/analys-artiklar-2026-09-23.html,
 * avsnitt 4, med ägarens justering: gallerilayouten med reklamkort
 * inblandade stannar, på desktop och mobil).
 *
 * Alla serverkomponenter utan framer-motion. Huvudet på mark med scen,
 * filtret som länkpiller (samma adresser och kodning som förut, så att
 * canonical och indexering inte rörs), artiklarna som paneler med bilden
 * överst, hover som mörkare kant i stället för lyft.
 */

import Image from 'next/image'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { PostMeta } from '@/lib/blog'
import { getCtaVariantForTags } from '@/lib/cta/clusters'
import { IlluScenBibliotek } from '@/components/illustrations/PriserScener'

/* ------------------------------------------------------------- huvudet */

export function ListHuvud({ antal }: { antal: number }) {
  return (
    <header className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
      <div>
        <nav aria-label="Brödsmulor" className="text-meta text-ink-3">
          <Link href="/" className="hover:text-ink-1">
            Hem
          </Link>{' '}
          <span aria-hidden="true">·</span> <span className="text-ink-2">Artiklar</span>
        </nav>
        <p className="mt-6 text-steg font-semibold uppercase text-ink-3">
          Karriärbibliotek · {antal} artiklar
        </p>
        <h1 className="mt-2 text-h1-pub text-ink-1">Artiklar som förbättrar din jobbsökning</h1>
        <p className="mt-4 max-w-[58ch] text-base leading-[27px] text-ink-2 lg:text-lg lg:leading-[29px]">
          Lär dig skriva starkare ansökningar och CV:n som går igenom. Guider som granskas av
          HR-experter och uppdateras varje vecka.
        </p>
      </div>
      <div className="hidden text-ink-1 lg:block" aria-hidden="true">
        <IlluScenBibliotek className="h-auto w-full" />
      </div>
    </header>
  )
}

/* ------------------------------------------------------------- filtret */

const PILL =
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-[120ms]'

export function FilterRad({
  kategorier,
  aktiv,
  totalt,
}: {
  kategorier: { tag: string; count: number }[]
  aktiv?: string
  totalt: number
}) {
  const pill = (href: string, label: string, count: number, ar: boolean, tag: string) => (
    <li key={href}>
      <Link
        href={href}
        data-tag={tag.toLowerCase()}
        aria-current={ar ? 'page' : undefined}
        className={`${PILL} ${
          ar
            ? 'border-ink-1 bg-ink-1 text-white'
            : 'border-kant bg-panel text-ink-2 hover:border-kant-stark hover:text-ink-1'
        }`}
      >
        {label}
        <span className={`text-meta tabular-nums ${ar ? 'text-ink-1-mjuk' : 'text-ink-3'}`}>{count}</span>
      </Link>
    </li>
  )
  return (
    <nav aria-label="Filtrera efter ämne" className="mt-8">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {pill('/artiklar', 'Alla artiklar', totalt, !aktiv, '')}
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
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------ kortet */

function bildSrc(src?: string): string | null {
  if (!src || typeof src !== 'string' || !src.trim()) return null
  let s = src.trim()
  if (s.startsWith('/public/')) s = s.replace('/public', '')
  else if (s.startsWith('public/')) s = s.replace('public', '')
  if (!s.startsWith('/') && !s.startsWith('http')) s = `/${s}`
  return s
}

/** Färgetiketten står bara på artiklar i CV- och testklustret. */
function etikett(tags?: string[]): { text: string; klass: string } | null {
  const k = getCtaVariantForTags(tags)
  if (k === 'test') return { text: 'Rekryteringstester', klass: 'bg-test-mjuk text-test' }
  if (k === 'cv' || k === 'letter') return { text: k === 'cv' ? 'CV' : 'Personligt brev', klass: 'bg-cv-mjuk text-cv' }
  return null
}

export function ArtikelKort({ post, stor = false, prioritet = false }: { post: PostMeta; stor?: boolean; prioritet?: boolean }) {
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
  const tagg = etikett(post.tags)
  const taggar = post.tags?.slice(0, stor ? 3 : 2) ?? []

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-kant bg-panel transition-colors duration-[120ms] hover:border-kant-stark ${
        stor ? 'md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[1.3fr_1fr]' : ''
      }`}
    >
      <Link href={`/artiklar/${post.slug}`} className="relative block bg-insunken" aria-label={`Läs ${post.title}`}>
        <div className={`relative ${stor ? 'aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[320px]' : 'aspect-[16/10]'}`}>
          {src ? (
            <Image
              src={src}
              alt={post.title ?? 'Artikelbild'}
              fill
              sizes={stor ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw'}
              className="object-cover"
              priority={prioritet}
            />
          ) : null}
        </div>
      </Link>

      <div className={`flex flex-1 flex-col ${stor ? 'p-5 sm:p-8' : 'p-5'}`}>
        <div className="flex flex-wrap items-center gap-2">
          {tagg ? (
            <span className={`rounded-md px-2 py-1 text-steg font-semibold uppercase ${tagg.klass}`}>{tagg.text}</span>
          ) : null}
          {taggar.map((t) => (
            <Link
              key={t}
              href={`/artiklar?tag=${encodeURIComponent(t)}`}
              className="text-meta text-ink-3 underline decoration-transparent underline-offset-4 hover:decoration-kant-stark"
            >
              {t}
            </Link>
          ))}
        </div>
        <h2
          className={`mt-3 font-display font-bold tracking-[-0.02em] text-ink-1 [text-wrap:balance] ${
            stor ? 'text-[26px] leading-[31px] lg:text-[32px] lg:leading-[36px]' : 'text-[19px] leading-6'
          }`}
        >
          <Link href={`/artiklar/${post.slug}`} className="hover:underline hover:decoration-kant-stark hover:underline-offset-4">
            {post.title}
          </Link>
        </h2>
        {post.description ? (
          <p className={`mt-2 text-sm leading-[22px] text-ink-2 ${stor ? 'line-clamp-3 sm:text-base sm:leading-6' : 'line-clamp-3'}`}>
            {post.description}
          </p>
        ) : null}
        <p className="mt-auto pt-4 text-meta text-ink-3">
          {datum ? <time dateTime={post.date}>{datum}</time> : null}
          {datum ? ' · ' : ''}
          {minuter} min
        </p>
      </div>
    </article>
  )
}

/* ------------------------------------------------------- pagineringen */

const SIDKNAPP =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium tabular-nums transition-colors'

export function Paginering({
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
    <div className="space-y-3">
      <p className="text-center text-meta text-ink-3">
        Visar <span className="font-semibold tabular-nums text-ink-1">{start} till {slut}</span> av{' '}
        <span className="font-semibold tabular-nums text-ink-1">{totalt}</span> artiklar
      </p>
      <nav aria-label="Paginering" className="flex items-center justify-center gap-2">
        {sida > 1 ? (
          <Link href={href(sida - 1)} aria-label="Föregående sida" className={`${SIDKNAPP} border-kant bg-panel text-ink-1 hover:border-kant-stark`}>
            ‹
          </Link>
        ) : null}
        {lista.map((n, i) =>
          n === 'e' ? (
            <span key={`e${i}`} className="px-1 text-ink-3" aria-hidden="true">
              …
            </span>
          ) : (
            <Link
              key={n}
              href={href(n)}
              aria-current={n === sida ? 'page' : undefined}
              aria-label={`Sida ${n}`}
              className={`${SIDKNAPP} ${
                n === sida ? 'border-ink-1 bg-ink-1 text-white' : 'border-kant bg-panel text-ink-2 hover:border-kant-stark hover:text-ink-1'
              }`}
            >
              {n}
            </Link>
          )
        )}
        {sida < sidor ? (
          <Link href={href(sida + 1)} aria-label="Nästa sida" className={`${SIDKNAPP} border-kant bg-panel text-ink-1 hover:border-kant-stark`}>
            ›
          </Link>
        ) : null}
      </nav>
    </div>
  )
}

/* ------------------------------------------------------ tomt tillstånd */

export function TomLista({ tag, populara }: { tag?: string; populara: string[] }) {
  return (
    <div className="rounded-xl border border-kant bg-panel p-6 text-center sm:p-10">
      <p className="text-varde text-ink-1">{tag ? `Inga artiklar om ${tag} än` : 'Inga artiklar än'}</p>
      <p className="mt-2 text-sm text-ink-2">Prova ett av de vanligaste ämnena.</p>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {populara.map((t) => (
          <li key={t}>
            <Link
              href={`/artiklar?tag=${encodeURIComponent(t)}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-kant px-3 text-sm text-ink-2 hover:border-kant-stark hover:text-ink-1"
            >
              {t}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/artiklar" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
        Visa alla artiklar
      </Link>
    </div>
  )
}
