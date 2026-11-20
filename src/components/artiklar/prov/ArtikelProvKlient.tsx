'use client'

/**
 * Provet i artikeln, på klienten (omgång 2 steg C, skissen Artikel-prov och
 * Artikel-prov-resultat): en inbäddad provruta, ingen helskärm. Samma
 * uppgifter, Svarskort, talrad och matris som sessionsramen, ritade av
 * typens komponent i kompakt läge med p i stället för rubriker.
 *
 *   uppgift   bandet "Prova själv" med "Uppgift 1 av 5", uppgiften och foten
 *             med "Inget konto behövs." och Svara. Ett tryck markerar, Svara
 *             bekräftar. Uppgift 1 kommer från servern i artikelns HTML
 *             (artikelns frö) och går att trycka på innan skripten laddat;
 *             svaret startar provet och resten följer i samma ruta.
 *   resultat  ringen och "3 av 5 rätt" i bandet, Uppgiftslistans låsta rader
 *             och spärren med data-cta="artikel-prov-gate" inne i rutan.
 *
 * Inga h1 till h6 någonstans i rutan: artikelns rubrikträd ändras inte.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { PROVA } from '@/components/registrering/registrering-copy'
import { provAntal, type NyProvTyp, type ProvTyp, type PublikUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import type { ProvaResultat } from '@/lib/tests/prova-lokalt'
import { KNAPP_PRIMAR_SMAL, LANK } from '@/components/shell/knappar'
import ProvBrickor, { ProvRing } from '@/components/publikt/ProvBrickor'
import ProvUppgiftVy from '@/components/publikt/prov/ProvUppgiftVy'
import { franMatris, franPublika, varmProvet, type MatrisFraga, type ProvPost } from '@/components/publikt/prov/provPost'
import { PROV_RAM, forklaringOrd } from '@/components/publikt/prov/prov-copy'
import { useArtikelProv, type ArtikelProvLage } from './useArtikelProv'

export type { MatrisFraga }

const A = PROV_RAM.artikel

export function MatrisProv({ slug, forsta }: { slug: string; forsta: MatrisFraga }) {
  const las = useCallback((d: Record<string, unknown>) => (Array.isArray(d.questions) ? (d.questions as MatrisFraga[]) : []), [])
  const rutnat = useCallback((q: MatrisFraga) => q.grid, [])
  const { lage, svara } = useArtikelProv<MatrisFraga>({ typ: 'matris', slug, total: 5, lasUppgifter: las, rutnatFor: rutnat })
  const forstaPost = useMemo(() => franMatris(forsta), [forsta])
  const poster = useMemo(() => lage.uppgifter.map(franMatris), [lage.uppgifter])
  return <ProvRuta typ="matris" slug={slug} lage={lage} svara={svara} forsta={forstaPost} poster={poster} deltest={[]} />
}

export function TypProv({
  typ,
  slug,
  forsta,
  underlag: forstaUnderlag,
}: {
  typ: NyProvTyp
  slug: string
  forsta: PublikUppgift
  underlag: Record<string, VnUnderlag>
}) {
  const las = useCallback((d: Record<string, unknown>) => (Array.isArray(d.uppgifter) ? (d.uppgifter as PublikUppgift[]) : []), [])
  const { lage, svara, extra } = useArtikelProv<PublikUppgift>({ typ, slug, total: provAntal(typ), lasUppgifter: las })
  const extraUnderlag = extra.underlag as Record<string, VnUnderlag> | undefined
  const forstaPost = useMemo(() => franPublika([forsta], forstaUnderlag)[0], [forsta, forstaUnderlag])
  const poster = useMemo(
    () => (lage.uppgifter.length ? franPublika(lage.uppgifter, { ...forstaUnderlag, ...(extraUnderlag ?? {}) }) : []),
    [lage.uppgifter, forstaUnderlag, extraUnderlag]
  )
  const deltest = useMemo(() => (lage.uppgifter.length ? lage.uppgifter : [forsta]).map((u) => u.deltest ?? null), [lage.uppgifter, forsta])
  if (!forstaPost) return null
  return <ProvRuta typ={typ} slug={slug} lage={lage} svara={svara} forsta={forstaPost} poster={poster} deltest={deltest} />
}

/* ------------------------------------------------------------ rutan */

function Band({ children }: { children: ReactNode }) {
  return <div className="flex min-h-12 items-center justify-between gap-3 bg-ton px-4 py-3 text-ton-ink sm:px-6">{children}</div>
}

function Eyebrow() {
  return <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ton-ink">{A.eyebrow}</p>
}

const KORT = 'overflow-hidden rounded-2xl border border-kant bg-papper font-sess-text shadow-[0_1px_2px_rgba(27,34,70,.05)]'

function ProvRuta<U>({
  typ,
  slug,
  lage,
  svara,
  forsta,
  poster,
  deltest,
}: {
  typ: ProvTyp
  slug: string
  lage: ArtikelProvLage<U>
  svara: (s: string | number) => Promise<void>
  forsta: ProvPost
  poster: ProvPost[]
  deltest: (string | null)[]
}) {
  const [vald, setVald] = useState<number | null>(null)

  if (lage.fas === 'resultat' && lage.resultat && lage.token) {
    return <ProvResultatRuta typ={typ} slug={slug} resultat={lage.resultat} token={lage.token} poster={poster} />
  }
  // Sista svaret är skickat och rättningen pågår: resultatets ruta står
  // direkt i sin slutliga storlek, utan tal och märken, så att artikeln
  // under rutan inte flyttar när svaret kommer (slutkontrollen omgång 2, CLS 0).
  if (lage.fas === 'pagar' && lage.laddar && lage.index + 1 >= lage.total && lage.token) {
    return <ProvResultatRuta typ={typ} slug={slug} resultat={null} token={lage.token} poster={poster} total={lage.total} />
  }

  const post = lage.fas === 'forsta' ? forsta : (poster[lage.index] ?? forsta)
  const nr = lage.fas === 'forsta' ? 1 : lage.index + 1
  const sista = lage.fas === 'pagar' && lage.index + 1 >= lage.total
  const bekrafta = () => {
    if (vald === null || lage.laddar) return
    const v = post.varde(vald)
    setVald(null)
    void svara(v)
  }

  return (
    <div className={KORT} aria-busy={lage.laddar} data-prov-ruta>
      <Band>
        <Eyebrow />
        <p className="text-[13px] leading-[18px] tabular-nums" aria-live="polite">
          {A.raknare(nr, lage.total)}
        </p>
      </Band>
      <div className="px-4 pb-1 pt-4 sm:px-6 sm:pt-5" key={post.u.nyckel}>
        <ProvUppgiftVy post={post} nr={nr} antal={lage.total} vald={vald} onValj={(i) => {
            if (lage.fas === 'forsta') varmProvet()
            setVald(i)
          }} last={lage.laddar} rubrik="p" deltest={deltest[nr - 1]} />
      </div>
      {lage.fel ? (
        <p role="alert" className="mx-4 mt-3 rounded-xl border border-kant bg-papper-2 px-3.5 py-2.5 text-sm leading-5 text-ink-1 sm:mx-6">
          {lage.fel}
          {lage.registerHref ? (
            <>
              {' '}
              <Link href={lage.registerHref} className={LANK}>
                {PROVA.intro.skapaKonto}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3.5 sm:px-6 sm:pb-5">
        <p className="min-w-0 text-[13px] leading-[18px] text-ink-3" aria-live="polite">
          {lage.laddar ? (nr <= 1 ? A.startar : A.rattar) : A.fot}
        </p>
        <button
          type="button"
          onClick={bekrafta}
          disabled={vald === null || lage.laddar}
          aria-busy={lage.laddar || undefined}
          className={`${KNAPP_PRIMAR_SMAL} min-w-[132px] flex-shrink-0 sm:min-w-[200px]`}
          data-artikel-prov-svara
        >
          {sista ? A.visaResultatet : A.svara}
        </button>
      </div>
    </div>
  )
}

function ProvResultatRuta({
  typ,
  slug,
  resultat,
  token,
  poster,
  total: totalIn,
}: {
  typ: ProvTyp
  slug: string
  /** Null medan rättningen pågår: samma ruta och storlek, utan tal, märken och länk. */
  resultat: ProvaResultat | null
  token: string
  poster: ProvPost[]
  total?: number
}) {
  const vantar = resultat === null
  const total = resultat?.total ?? totalIn ?? 0
  const score = resultat?.score ?? 0
  const registerHref = `/register?test=${encodeURIComponent(token)}`
  const S = PROV_RAM.sparr
  const mini = (i: number): ReactNode => {
    const p = poster[i]
    const Mini = p?.ritare.Miniatyr
    return p && Mini ? (
      <span aria-hidden="true" className="flex items-center">
        <Mini u={p.u} />
      </span>
    ) : null
  }
  return (
    <div className={KORT} {...(vantar ? { 'data-prov-vantar': '', 'aria-busy': true } : { 'data-prov-resultat': '' })}>
      <Band>
        <div className="flex items-center gap-3.5">
          <ProvRing andel={vantar ? 0 : total ? score / total : 0} storlek={48} />
          <div className="min-w-0">
            <Eyebrow />
            <p className={`mt-0.5 font-sess-display text-[22px] font-extrabold leading-7 tracking-[-.015em] text-ink-1 ${vantar ? 'invisible' : ''}`}>{A.huvudtal(score, total)}</p>
          </div>
        </div>
      </Band>
      <ProvBrickor totalt={total} fel={resultat?.fel ?? []} vantar={vantar} mini={mini} lasText={`Rätt svar och ${forklaringOrd(typ)}`} className="border-t border-kant" />
      <div className="border-t border-kant px-4 pb-4 pt-4 sm:px-6 sm:pb-5">
        <p className="font-sess-display text-[18px] font-bold leading-6 tracking-[-.01em] text-ink-1">{S.titel(typ)}</p>
        <p className="mt-1 text-sm leading-[21px] text-ink-2">{S.textKort(total)}</p>
        <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {vantar ? (
            <span aria-hidden="true" className={`${KNAPP_PRIMAR_SMAL} pointer-events-none w-full opacity-40 sm:w-auto sm:min-w-[240px]`}>
              {S.knapp}
            </span>
          ) : (
            <Link
              href={registerHref}
              data-cta="artikel-prov-gate"
              className={`${KNAPP_PRIMAR_SMAL} w-full sm:w-auto sm:min-w-[240px]`}
              onClick={() => capture('signup_started', { cluster: 'test', source_page: `/artiklar/${slug}` })}
            >
              {S.knapp}
            </Link>
          )}
          <p className="text-[13px] leading-[18px] text-ink-3">{S.litenKort}</p>
        </div>
      </div>
    </div>
  )
}
