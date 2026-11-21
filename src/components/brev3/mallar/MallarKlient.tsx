'use client'

/**
 * Fliken Mallar (skissen Mallar, BYGGSPEC avsnitt 7). Sidan ritar arket och
 * de åtta första mallarna på servern; här provas mallar och typsnitt (arket
 * byts direkt, utan AI), mallen och typsnittet sparas med motorns PUT när
 * användaren får ha dem, och nedladdningen startar eller öppnar spärren.
 *
 * Regler:
 *  - Premium: en provad mall sparas direkt ("Brevet står nu i Björk").
 *  - Gratis: Linne och Björk sparas, övriga provas ("Du provar mallen
 *    Koppar", "Tillbaka till Linne"). Låst brev: allt provas, inget sparas.
 *  - Nedladdning kräver letter_download. Utan: BrevSparr variant nedladdning,
 *    köpet går tillbaka hit med mall och format, och ?ladda=1 laddar ner
 *    filen av sig själv.
 *  - Utan brev: exempelbrevet med användarens namn och "Skriv brevet".
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import BrevArk from '@/components/brev3/ark/BrevArk'
import {
  Bricka,
  BrevFlikar,
  BrevSparrLaddare,
  BrevVagg,
  Golv,
  IkonLaddaNer,
  IkonLas,
  IkonPenna,
  LitenKnapp,
  LyftPanel,
  Radkort,
  SektionsHuvud,
  StorKnapp,
} from '@/components/brev3/kit'
import NameRequiredNotice from '@/components/shared/NameRequiredNotice'
import { PAKETRADER, paywallPrisrad } from '@/components/paywall/paywall-copy'
import { useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import { kampanjPrisPeriod, premiumKnapp } from '@/lib/kampanj/kampanj'
import { SALD_PLAN, prisPeriod } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { farSparaMall } from '@/lib/letters/brevRegler'
import { BREV_TYPSNITT, malltypsnittNamn, typsnittNamn } from '@/lib/letters/typsnitt'
import { fontFace } from '@/lib/cv/mallar/typsnitt-filer'
import type { TypsnittId } from '@/lib/cv/mallar/kontrakt'
import { getFontFamilyForHTML } from '@/lib/documents/typsnitt'
import type { Scope } from '@/lib/access/features'
import { MALL_FILTER, passarFilter, type MallarKort, type MallFilter } from './filter'
import { MallKort } from './MallKort'
import { EXEMPEL_ID, MallarFel, forhandsvisa, forhandsvisaIOmgangar, laddaNerBrev, markeraKopierat, sparaVal, type Filformat } from './klient'
import { MALLAR_TEXT as T } from './text'
import { stadaKopreturAdress, useKopretur } from '../kit/kopretur'

const BytBrevArk = dynamic(() => import('./BytBrevArk'), { ssr: false })

export interface MallarBrev {
  id: string
  foretag: string | null
  tjanst: string | null
  /** Gratis, äldre än de två senaste: provas men sparas inte. */
  isLocked: boolean
  /** Brevets sparade mall, null = gammalt brev i en gammal mall. */
  sparadMall: string | null
  /** Filens namn (utan ändelse). */
  filnamn: string
}

export interface MallarKlientProps {
  brev: MallarBrev | null
  /** Användarens brev för "Byt brev". */
  breven: { id: string; foretag: string | null; tjanst: string | null }[]
  katalog: MallarKort[]
  /** Så många mallar visas innan "Visa de N övriga". */
  forstaAntal: number
  /** Brevet ritat på servern: mallens id -> HTML (i initialFont). */
  initialHtml: Record<string, string>
  /** Mallen som visas först. */
  initialMall: string
  initialFont: string | null
  /** Mallen ett gammalt brev får vid första ändringen (CV:ts mall eller Linne). */
  startmall: string
  cvMall: string | null
  /** Betald behörighet ('any'): får spara alla mallar och Helvetica. */
  harBetalt: boolean
  /** letter_download: får ladda ner PDF och Word. */
  kanLaddaNer: boolean
  scope: Scope | null
  track: Scope | null
  harAldreBrev: boolean
  /** Brevets text för "Kopiera texten i stället". */
  kopieraText: string | null
  /** Tillbaka från kassan: ladda ner av sig själv. */
  ladda: boolean
  laddaFormat: Filformat
  /** ?premium_activated=true: direkt från ett köp, så tillgången väntas in om webhooken ligger efter. */
  kopRetur: boolean
}

const nyckel = (mall: string, font: string | null) => `${mall}|${font ?? ''}`

/** Mallarnas egna typsnitt och brevets elva, som @font-face (egna filer), så att namnen står i sig själva. */
const TYPSNITT_CSS = fontFace([...BREV_TYPSNITT.map((t) => t.id), 'montserrat', 'lora', 'ibm-plex-sans'] as TypsnittId[])

export default function MallarKlient(p: MallarKlientProps) {
  const { brev, katalog } = p
  const kampanj = useKampanjPris()
  const router = useRouter()
  const brevId = brev?.id ?? EXEMPEL_ID

  const [visad, setVisad] = useState(p.initialMall)
  const [sparad, setSparad] = useState<string | null>(brev?.sparadMall ?? null)
  const [font, setFont] = useState<string | null>(p.initialFont)
  const [arkHtml, setArkHtml] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(p.initialHtml).map(([m, h]) => [nyckel(m, p.initialFont), h])),
  )
  const [kortHtml, setKortHtml] = useState<Record<string, string>>(p.initialHtml)
  const [filter, setFilter] = useState<MallFilter>('alla')
  const [utfalld, setUtfalld] = useState(false)
  const [hamtar, setHamtar] = useState(false)
  const [kvitto, setKvitto] = useState<string | null>(null)
  const [fel, setFel] = useState<string | null>(null)
  const [sparr, setSparr] = useState(false)
  const [laddar, setLaddar] = useState<Filformat | null>(null)
  const [namnKravs, setNamnKravs] = useState<Filformat | null>(null)
  const [bytBrev, setBytBrev] = useState(false)
  const sparning = useRef<Promise<unknown>>(Promise.resolve())

  const kort = (id: string | null) => (id ? katalog.find((k) => k.id === id) : undefined)
  const visadKort = kort(visad) ?? katalog[0]
  const sparadKort = kort(sparad)
  const premiumMall = visadKort.niva === 'premium'
  const kanSpara = useCallback((id: string) => !!brev && !brev.isLocked && farSparaMall(id, p.harBetalt), [brev, p.harBetalt])
  const provar = !!brev && visad !== sparad && !kanSpara(visad)
  // Gammalt brev (ingen mall bland de 40 ännu): allt som visas provas tills något sparas.
  const provarVisning = provar || (!!brev && !sparad)

  /* ---------------------------------------------------------------- adressen */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (brev) q.set('brev', brev.id)
    q.set('mall', visad)
    // Köpreturens parametrar står kvar medan tillgången väntas in (router.refresh
    // läser dem); kit/kopretur städar dem när returen är klar.
    if (!(p.ladda && p.kopRetur && !p.kanLaddaNer)) {
      q.delete('ladda')
      q.delete('format')
      q.delete('premium_activated')
    }
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${q.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visad, brev])

  /* ---------------------------------------------------------------- arket */
  const hamtaArk = useCallback(
    async (mall: string, f: string | null) => {
      const k = nyckel(mall, f)
      if (arkHtml[k]) return
      try {
        const html = await forhandsvisa(brevId, mall, f)
        setArkHtml((a) => ({ ...a, [k]: html }))
        if (!kortHtml[mall]) setKortHtml((a) => ({ ...a, [mall]: html }))
      } catch {
        setFel(T.fel.forhandsvisa)
      }
    },
    [arkHtml, kortHtml, brevId],
  )

  const spara = useCallback(
    (andring: { mall_id?: string; font_id?: string | null }) => {
      if (!brev) return Promise.resolve(false)
      const p2 = sparning.current
        .catch(() => undefined)
        .then(() => sparaVal(brev.id, andring))
        .then(() => true)
        .catch((e: unknown) => {
          setFel(e instanceof MallarFel && e.code === 'letter_locked' ? T.fel.last : T.fel.spara)
          return false
        })
      sparning.current = p2
      return p2
    },
    [brev],
  )

  const prova = useCallback(
    async (id: string) => {
      setFel(null)
      setVisad(id)
      void hamtaArk(id, font)
      if (kanSpara(id) && id !== sparad) {
        const namn = kort(id)?.namn ?? id
        if (await spara({ mall_id: id })) {
          setSparad(id)
          setKvitto(T.starNu(namn))
        }
      } else setKvitto(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [font, sparad, kanSpara, hamtaArk, spara],
  )

  const valjFont = useCallback(
    async (f: string | null) => {
      if (f && BREV_TYPSNITT.find((t) => t.id === f)?.premium && !p.harBetalt) return
      setFel(null)
      setFont(f)
      void hamtaArk(visad, f)
      if (brev && !brev.isLocked) {
        // Ett gammalt brev flyttas till nya formatet vid första ändringen och får då startmallen.
        if ((await spara({ font_id: f })) && !sparad) setSparad(p.startmall)
      }
    },
    [p.harBetalt, p.startmall, visad, brev, hamtaArk, spara, sparad],
  )

  const ark = arkHtml[nyckel(visad, font)] ?? kortHtml[visad] ?? null

  /* ---------------------------------------------------------------- rutnätet */
  const filtrerade = useMemo(() => katalog.filter((k) => passarFilter(k, filter)), [katalog, filter])
  const synliga = utfalld ? filtrerade : filtrerade.slice(0, p.forstaAntal)
  const ovriga = Math.max(0, filtrerade.length - p.forstaAntal)
  const synligaNyckel = synliga.map((k) => k.id).join(',')
  // Korten som redan har brevet läses ur en ref, så att en färdig omgång inte startar om hämtningen.
  const kortHtmlRef = useRef(kortHtml)
  kortHtmlRef.current = kortHtml

  useEffect(() => {
    const saknas = synligaNyckel.split(',').filter((id) => id && !kortHtmlRef.current[id])
    if (!saknas.length) return
    const ctrl = new AbortController()
    setHamtar(true)
    // I omgångar med nytt försök vid fel (klient.ts): ett anrop för alla övriga kunde svara 504 och lämna korten med katalogens CV-bilder.
    forhandsvisaIOmgangar(brevId, saknas, font, (ut) => setKortHtml((a) => ({ ...ut, ...a })), { signal: ctrl.signal })
      .then((misslyckade) => {
        if (misslyckade.length) setFel(T.fel.forhandsvisa)
      })
      .catch((e) => {
        if ((e as Error)?.name !== 'AbortError') setFel(T.fel.forhandsvisa)
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setHamtar(false)
      })
    return () => ctrl.abort()
    // Hämtas med typsnittet som gäller när korten visas; byte av typsnitt ritar bara arket om.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synligaNyckel, brevId])

  /* ---------------------------------------------------------------- nedladdning */
  const returTill = brev ? `/dashboard/mina-brev/mallar?${new URLSearchParams({ brev: brev.id, mall: visad, format: 'pdf' }).toString()}` : null

  const laddaNer = useCallback(
    async (format: Filformat) => {
      if (!brev || laddar) return
      if (!p.kanLaddaNer) {
        setSparr(true)
        return
      }
      setFel(null)
      setNamnKravs(null)
      setLaddar(format)
      try {
        await sparning.current.catch(() => undefined)
        // Filen ritas ur brevets sparade mall: det som visas sparas först.
        if (visad !== sparad && kanSpara(visad)) {
          if (!(await spara({ mall_id: visad }))) return
          setSparad(visad)
        }
        await laddaNerBrev(brev.id, format, brev.filnamn)
      } catch (e) {
        if (e instanceof MallarFel && e.status === 402) setSparr(true)
        else if (e instanceof MallarFel && e.status === 422) setNamnKravs(format)
        else setFel(T.fel.ladda)
      } finally {
        setLaddar(null)
      }
    },
    [brev, laddar, p.kanLaddaNer, visad, sparad, kanSpara, spara],
  )

  // Tillbaka från kassan (?ladda=1): filen laddas ner en gång, av sig själv.
  // Hinner webhooken inte före returen väntar vi in tillgången med
  // router.refresh (kit/kopretur), som Brevet gör.
  const kop = useKopretur(
    {
      begart: p.ladda ? p.laddaFormat : null,
      kopRetur: p.kopRetur,
      kanLaddaNer: p.kanLaddaNer,
      formatFinns: !!brev && (p.laddaFormat === 'pdf' || visadKort.word),
    },
    { refresh: () => router.refresh(), laddaNer: (f) => void laddaNer(f), stadaAdress: stadaKopreturAdress },
  )
  // Under väntan visar knappen samma upptagna läge som en vanlig nedladdning.
  // Word-knappen syns först med tillgång, så väntan visas på huvudknappen.
  const upptagen = laddar ?? (kop.vantar ? 'pdf' : null)
  const felText = fel ?? (kop.ejRegistrerat ? T.fel.kopEjRegistrerat : null)

  const kopiera = async () => {
    if (!p.kopieraText || !brev) return
    try {
      await navigator.clipboard.writeText(p.kopieraText)
      setKvitto(T.kopieratKvitto)
      void markeraKopierat(brev.id)
    } catch {
      setFel(T.fel.ladda)
    }
  }

  /* ---------------------------------------------------------------- texter */
  const pris = kampanj ? kampanjPrisPeriod(kampanj) : prisPeriod(SALD_PLAN)
  const fontNamn = font ? typsnittNamn(font) : malltypsnittNamn(visadKort.typsnitt)
  const tillbaka = !provar || brev?.isLocked ? undefined : (sparadKort ?? kort(p.startmall))
  const ogon = !brev
    ? T.exempelOgon(visadKort.namn)
    : provarVisning
      ? T.provar(visadKort.namn)
      : kvitto && kvitto !== T.kopieratKvitto
        ? kvitto
        : T.star(visadKort.namn)
  const mallarHref = brev ? `/dashboard/mina-brev/mallar?brev=${brev.id}` : '/dashboard/mina-brev/mallar'
  const kopHref = kopstegHref(SALD_PLAN, 'mall', { retur: returTill, mall: visad })

  const laddaKnapp = brev ? (
    <StorKnapp onClick={() => void laddaNer('pdf')} disabled={upptagen !== null}>
      <IkonLaddaNer size={20} />
      {upptagen === 'pdf' ? T.laddarNer : T.laddaNer(visadKort.namn)}
    </StorKnapp>
  ) : (
    <StorKnapp href="/dashboard/skapa-brev">
      <IkonPenna size={20} />
      {T.skrivBrevet}
    </StorKnapp>
  )
  const wordKnapp =
    brev && p.kanLaddaNer && visadKort.word ? (
      <Bricka onClick={() => void laddaNer('docx')} disabled={upptagen !== null}>
        <IkonLaddaNer size={18} />
        {upptagen === 'docx' ? T.laddarNer : T.word}
      </Bricka>
    ) : null
  const sidorad = !brev ? null : p.kanLaddaNer ? T.sidoradPremium(visadKort.word) : T.sidoradGratis(visadKort.word, pris)

  return (
    <div className="b3-sida b3-ml" data-rum="brev">
      <style>{TYPSNITT_CSS}</style>
      <BrevVagg hojd={558} kulle etikett="Mallar" className="b3-ml-vagg">
        <div className="b3-topp">
          <BrevFlikar aktiv="mallar" hrefDinaBrev="/dashboard/mina-brev" hrefMallar={mallarHref} />
          {brev ? (
            <div className="b3-cvrad b3-ml-cvrad">
              <span>
                {T.brevRad} <b>{[brev.foretag, brev.tjanst].filter(Boolean).join(', ') || 'Ditt brev'}</b>
              </span>
              {p.breven.length > 1 ? (
                <button type="button" className="b3-ml-lankknapp" onClick={() => setBytBrev(true)}>
                  {T.bytBrev}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="b3-ml-hjalte">
          <div className="b3-ml-text">
            <p className="b3-ogon b3-ml-ogon" aria-live="polite">
              {brev?.isLocked && provar ? T.last : ogon}
              {provar && premiumMall && !brev?.isLocked ? (
                <span className="b3-ml-prm">
                  <IkonLas size={11} />
                  {PAKETRADER.bricka}
                </span>
              ) : null}
            </p>
            <h1 className="b3-h1">{T.rubrik}</h1>
            <p className="b3-ingress">
              {brev ? (
                <>
                  <span className="hidden xl:inline">{T.ingress}</span>
                  <span className="xl:hidden">{T.ingressMobil}</span>
                </>
              ) : (
                T.exempelIngress
              )}
            </p>
          </div>

          <div className="b3-ml-par" role="img" aria-label={T.arkEtikett(visadKort.namn)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="b3-ml-cv" src={`/mallar/v2/${visad}-stor.webp`} alt="" width={222} height={314} />
            <span className="b3-chip glas b3-ml-cv-etikett">{T.dittCv}</span>
            <div className="b3-ml-brev" aria-busy={!arkHtml[nyckel(visad, font)]}>
              {ark ? <BrevArk html={ark} lage="golv" /> : null}
            </div>
            <span className="b3-ml-brev-etikett">{T.dittBrev}</span>
          </div>

          <div className="b3-ml-knappar">
            <div className="b3-ml-brickor">
              {brev ? (
                <Bricka href={`/dashboard/mina-brev/${brev.id}?flik=texten`}>
                  <IkonPenna size={18} />
                  {T.andraTexten}
                </Bricka>
              ) : null}
              <Bricka onClick={() => document.getElementById('b3-ml-typsnitt')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                <span className="b3-ml-aa" aria-hidden="true">
                  Aa
                </span>
                {T.typsnitt(fontNamn)}
              </Bricka>
              {tillbaka ? (
                <Bricka onClick={() => void prova(tillbaka.id)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" />
                    <path d="M18 3v4h-4M6 21v-4h4" />
                  </svg>
                  {T.tillbaka(tillbaka.namn)}
                </Bricka>
              ) : null}
            </div>
            <div className="b3-ml-ladda">
              {laddaKnapp}
              {wordKnapp}
              {sidorad ? <span className="b3-sidorad b3-ml-sidorad">{sidorad}</span> : null}
            </div>
          </div>
        </div>
      </BrevVagg>

      <Golv>
        <LyftPanel etikett={T.panelOgon}>
          {namnKravs ? (
            <NameRequiredNotice className="mb-4" rubrik={T.namnRubrik} text={T.namnText} onSaved={() => void laddaNer(namnKravs)} />
          ) : null}
          {felText ? (
            <p className="b3-ml-fel" role="alert">
              {felText}
            </p>
          ) : null}
          <div className="b3-ml-panelhuvud">
            <div>
              <p className="b3-ogon-golv">{T.panelOgon}</p>
              <h2 className="b3-h2 b3-ml-h2">{T.panelRubrik(katalog.length)}</h2>
            </div>
            <div className="b3-filter" role="group" aria-label={T.filterEtikett}>
              {MALL_FILTER.map((f) => (
                <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.etikett(katalog.length)}
                </button>
              ))}
            </div>
          </div>

          <div className="b3-mallrutnat" aria-busy={hamtar}>
            {synliga.map((k) => (
              <MallKort key={k.id} mall={k} html={kortHtml[k.id]} vald={k.id === visad} provar={k.id === visad && provarVisning} cvMall={k.id === p.cvMall} onProva={(id) => void prova(id)} />
            ))}
            {!utfalld && ovriga > 0 ? (
              <button type="button" className="b3-mallk-fler" onClick={() => setUtfalld(true)}>
                {T.visaOvriga(ovriga)}
              </button>
            ) : null}
          </div>
          {(!utfalld && ovriga > 0) || p.harAldreBrev ? (
            <p className="b3-ml-ovriga">
              {!utfalld && ovriga > 0 ? (
                <span className="b3-ml-ovriga-lank">
                  <button type="button" className="b3-ml-lank" onClick={() => setUtfalld(true)}>
                    {T.visaOvriga(ovriga)}
                  </button>
                  {p.harAldreBrev ? '. ' : null}
                </span>
              ) : null}
              {p.harAldreBrev ? T.aldreBrev : null}
            </p>
          ) : null}
        </LyftPanel>

        <SektionsHuvud rubrik={T.typsnittRubrik} under={T.typsnittUnder} id="b3-ml-typsnitt" />
        <div className="b3-typ" role="group" aria-label={T.typsnittEtikett}>
          <button type="button" aria-pressed={font === null} style={{ fontFamily: getFontFamilyForHTML(visadKort.typsnitt) }} onClick={() => void valjFont(null)}>
            Mallens eget
          </button>
          {BREV_TYPSNITT.map((t) => {
            const last = t.premium && !p.harBetalt
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={font === t.id}
                aria-disabled={last || undefined}
                data-las={last ? '' : undefined}
                style={{ fontFamily: t.familj }}
                onClick={() => (last ? undefined : void valjFont(t.id))}
                aria-label={last ? `${t.namn}, ${PAKETRADER.ingar}` : undefined}
              >
                {t.namn}
                {t.premium ? <span className="b3-premium-rad">{PAKETRADER.bricka}</span> : null}
              </button>
            )
          })}
        </div>

        {!p.kanLaddaNer ? (
          <Radkort
            variant="prem"
            className="b3-ml-prem"
            ikon={<IkonLas size={22} strokeWidth={2.4} />}
            rubrik={T.premiumRubrik(katalog.length)}
            text={paywallPrisrad(SALD_PLAN, kampanj)}
            handling={
              <LitenKnapp kop href={kopHref}>
                {premiumKnapp(kampanj)}
              </LitenKnapp>
            }
          />
        ) : null}
      </Golv>

      {/* Telefonen: nedladdningen i en fast rad direkt ovanför bottennavet,
          samma mönster som CV-mallarnas FastRad: rullytans luft för navet
          nollas och läggs under raden i stället, så att inget glapp med
          innehåll syns mellan raden och navet. */}
      {laddaKnapp ? (
        <>
          <style>{'@media (max-width:1279.98px){main.dashboard-main-content{padding-bottom:0!important}}'}</style>
          <div className="b3-ml-fast">
            {laddaKnapp}
            {wordKnapp}
          </div>
          <div aria-hidden className="b3-ml-fast-luft" />
        </>
      ) : null}

      {kvitto === T.kopieratKvitto ? (
        <p className="sr-only" role="status">
          {kvitto}
        </p>
      ) : null}

      <BrevSparrLaddare
        open={sparr}
        variant="nedladdning"
        onClose={() => setSparr(false)}
        brevRubrik={brev?.foretag ? `Ditt brev till ${brev.foretag}` : undefined}
        onKopiera={p.kopieraText ? kopiera : undefined}
        scope={p.scope}
        track={p.track}
        isPremium={p.kanLaddaNer}
        returTill={returTill}
        mall={{ id: visad, tier: premiumMall ? 'premium' : 'free' }}
      >
        {ark ? <BrevArk html={ark} lage="golv" /> : null}
      </BrevSparrLaddare>

      {bytBrev ? <BytBrevArk open={bytBrev} onClose={() => setBytBrev(false)} breven={p.breven} valt={brev?.id ?? null} /> : null}
    </div>
  )
}
