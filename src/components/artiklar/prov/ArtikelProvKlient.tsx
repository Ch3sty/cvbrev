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
import { facitVisat, sparrKontext } from '@/lib/analytics/sparren'
import { PROVA, brickorText } from '@/components/registrering/registrering-copy'
import Marke, { Las } from '@/components/session/Marke'
import { IkonPil } from '@/components/session/resultat/delar'
import OppetFacitKort from '@/components/publikt/prov/OppetFacitKort'
import { Loften, SkapaKontoLank, SparrGoogle, Villkorsrad, type SparrData } from '@/components/publikt/prov/ProvSparr'
import { sparrLage } from '@/components/publikt/prov/ProvResultatSida'
import { provAntal, type NyProvTyp, type ProvTyp, type PublikUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import type { ProvaResultat } from '@/lib/tests/prova-lokalt'
import { KNAPP_PRIMAR, KNAPP_PRIMAR_SMAL, LANK } from '@/components/shell/knappar'
import ProvUppgiftVy from '@/components/publikt/prov/ProvUppgiftVy'
import { franMatris, franPublika, oppenPost, varmProvet, type MatrisFraga, type ProvPost } from '@/components/publikt/prov/provPost'
import { PROV3, PROV_RAM } from '@/components/publikt/prov/prov-copy'
import { useArtikelProv, type ArtikelProvLage } from './useArtikelProv'

export type { MatrisFraga }

const A = PROV_RAM.artikel
const P3 = PROV3
const TOMT: Record<string, VnUnderlag> = {}

export function MatrisProv({ slug, forsta }: { slug: string; forsta: MatrisFraga }) {
  const las = useCallback((d: Record<string, unknown>) => (Array.isArray(d.questions) ? (d.questions as MatrisFraga[]) : []), [])
  const rutnat = useCallback((q: MatrisFraga) => q.grid, [])
  const { lage, svara } = useArtikelProv<MatrisFraga>({ typ: 'matris', slug, total: 5, lasUppgifter: las, rutnatFor: rutnat })
  const forstaPost = useMemo(() => franMatris(forsta), [forsta])
  const poster = useMemo(() => lage.uppgifter.map(franMatris), [lage.uppgifter])
  return <ProvRuta typ="matris" slug={slug} lage={lage} svara={svara} forsta={forstaPost} poster={poster} deltest={[]} underlag={TOMT} />
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
  const allaUnderlag = useMemo(() => ({ ...forstaUnderlag, ...(extraUnderlag ?? {}) }), [forstaUnderlag, extraUnderlag])
  const deltest = useMemo(() => (lage.uppgifter.length ? lage.uppgifter : [forsta]).map((u) => u.deltest ?? null), [lage.uppgifter, forsta])
  if (!forstaPost) return null
  return <ProvRuta typ={typ} slug={slug} lage={lage} svara={svara} forsta={forstaPost} poster={poster} deltest={deltest} underlag={allaUnderlag} />
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
  underlag,
}: {
  typ: ProvTyp
  slug: string
  underlag: Record<string, VnUnderlag>
  lage: ArtikelProvLage<U>
  svara: (s: string | number) => Promise<void>
  forsta: ProvPost
  poster: ProvPost[]
  deltest: (string | null)[]
}) {
  const [vald, setVald] = useState<number | null>(null)

  if (lage.fas === 'resultat' && lage.resultat && lage.token) {
    return <ProvResultatRuta typ={typ} slug={slug} resultat={lage.resultat} token={lage.token} poster={poster} underlag={underlag} />
  }
  // Sista svaret är skickat och rättningen pågår: resultatets ruta står
  // direkt i sin slutliga storlek, utan tal och märken, så att artikeln
  // under rutan inte flyttar när svaret kommer (slutkontrollen omgång 2, CLS 0).
  if (lage.fas === 'pagar' && lage.laddar && lage.index + 1 >= lage.total && lage.token) {
    return <ProvResultatRuta typ={typ} slug={slug} resultat={null} token={lage.token} poster={poster} underlag={underlag} total={lage.total} />
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

/**
 * Resultatet i artikelns provruta, omgång 3 (förlagan Publik-artikel-resultat,
 * beslut A och E): huvudtalet och brickorna, på telefon en kompakt kontorad
 * direkt under, det enda öppna facit, de andra missarna låsta och spärren med
 * löftena, Google och villkorsraden. Inga h1 till h6. Medan rättningen pågår
 * står rutan i en rimlig höjd utan tal och märken.
 */
export function ProvResultatRuta({
  typ,
  slug,
  resultat,
  token,
  poster,
  underlag,
  total: totalIn,
}: {
  typ: ProvTyp
  slug: string
  /** Null medan rättningen pågår. */
  resultat: ProvaResultat | null
  token: string
  poster: ProvPost[]
  underlag: Record<string, VnUnderlag>
  total?: number
}) {
  const total = resultat?.total ?? totalIn ?? 0
  const ktx = useMemo(() => sparrKontext({ test_kind: typ, plats: 'artikel', slug }, resultat ?? { fel: [] }), [typ, slug, resultat])
  const oppen = useMemo(() => (resultat ? oppenPost(resultat.oppet_facit, underlag) : null), [resultat, underlag])

  if (!resultat) {
    return (
      <div className="prov3-art" data-prov-vantar="" aria-busy="true">
        <div className="prov3-art-topp">
          <div>
            <p className="res-ey text-ink-3">{P3.artikel.eyebrow(typ)}</p>
            <p className="prov3-art-tal invisible">{A.huvudtal(0, total)}</p>
          </div>
          <ol className="prov3-art-brickor" style={{ ['--kol' as string]: total }} aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <li key={i} className="opacity-40">
                <b>{i + 1}</b>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-sm leading-5 text-ink-2" aria-live="polite">
          {A.rattar}
        </p>
        <div className="prov3-oppen min-h-[560px]" aria-hidden="true" />
      </div>
    )
  }

  const { variant, antalFel, oppenIndex, lasta, felSet } = sparrLage(resultat)
  const d: SparrData = { typ, variant, antalFel, antal: total, ratt: resultat.score, lasta, token, ktx, sourcePage: `/artiklar/${slug}`, cta: 'artikel-prov-gate' }
  const S = P3.sparr
  const missar = variant === 'noll' ? [] : lasta
  return (
    <div className="prov3-art" data-prov-resultat="" data-variant={variant}>
      <div className="prov3-art-topp">
        <div className="min-w-0">
          <p className="res-ey text-ink-3">{P3.artikel.eyebrow(typ)}</p>
          <p className="prov3-art-tal">{A.huvudtal(resultat.score, total)}</p>
          <p className="mt-1 max-w-[46ch] text-sm leading-5 text-ink-2">{P3.artikel.mening(variant, resultat.fel)}</p>
        </div>
        <ol className="prov3-art-brickor" style={{ ['--kol' as string]: total }} role="img" aria-label={brickorText(resultat.fel, total)}>
          {Array.from({ length: total }, (_, i) => {
            const ratt = !felSet.has(i)
            return (
              <li key={i} data-utfall={ratt ? 'ratt' : 'fel'} data-lista-rad={ratt ? 'ratt' : 'fel'}>
                <b>{i + 1}</b>
                <Marke typ={ratt ? 'ratt' : 'fel'} storlek={22} fylld />
                {ratt ? P3.ratt : P3.fel}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="prov3-art-kontorad" data-prov-kontorad>
        <span className="prov3-ark-las" aria-hidden="true">
          <Las storlek={16} />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-sm font-semibold leading-5">{S.arkRubrik(typ, variant, antalFel, total)}</b>
          <span className="block text-[12px] leading-4 text-vagg-mjuk">{S.litenKort}</span>
        </span>
        <SkapaKontoLank d={d} position="kort" cta="artikel-prov-gate-rad" className={`${KNAPP_PRIMAR_SMAL} !w-auto flex-shrink-0 px-4`}>
          {S.knappKort}
        </SkapaKontoLank>
      </div>

      {oppen ? (
        <OppetFacitKort
          post={oppen}
          nr={oppenIndex + 1}
          antal={total}
          titel={P3.artikel.oppenRubrik(variant, oppenIndex + 1)}
          piller={P3.artikel.oppenPiller}
          onSynlig={() => facitVisat(ktx, resultat.oppet_facit, token)}
        />
      ) : null}

      {missar.map((i, n) => (
        <div key={i} className="prov3-art-miss" data-lista-rad="fel" data-last="">
          <span className="res-nr" data-utfall="fel">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[15px] font-semibold leading-5 text-ink-1">{P3.kortUppgift(i + 1)}</b>
            <span className="block text-[13px] leading-[18px] text-ink-2">{P3.artikel.missRad(variant, n + 1)}</span>
          </span>
          <SkapaKontoLank d={d} position="kort" cta="artikel-prov-gate-miss" className="prov3-art-lank">
            <Las storlek={13} />
            {P3.radLasFel(typ)}
            <IkonPil size={16} />
          </SkapaKontoLank>
        </div>
      ))}

      <section aria-label={S.eyebrow} className="res-nasta prov3-art-sparr" data-prova-sparr>
        <p className="res-ey flex items-center gap-2" style={{ color: 'var(--sess-lucka-ink)' }}>
          <Las storlek={13} />
          {S.eyebrow}
        </p>
        <p className="prov3-sparr-rubrik">{S.rubrik(typ, variant, antalFel, total)}</p>
        <p className="mt-1.5 text-sm leading-5 text-vagg-mjuk">{S.under(typ, variant, lasta, total)}</p>
        <div className="mt-4">
          <Loften typ={typ} variant={variant} ratt={resultat.score} antal={total} lasta={lasta} layout="brickor" />
        </div>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <SkapaKontoLank d={d} position="kort" cta="artikel-prov-gate" className={`${KNAPP_PRIMAR} res-stor sm:!w-auto sm:min-w-[200px]`}>
            {S.knapp}
            <IkonPil />
          </SkapaKontoLank>
          <SparrGoogle token={token} ktx={ktx} className="prov3-google-ljus sm:min-w-[220px]" />
          <p className="text-center text-[13px] leading-[18px] text-vagg-mjuk sm:ml-auto sm:text-right">{S.liten}</p>
        </div>
        <Villkorsrad className="mt-4" />
      </section>
    </div>
  )
}
