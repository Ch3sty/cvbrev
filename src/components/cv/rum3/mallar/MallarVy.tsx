'use client'

/**
 * Mallar i CV-rummets formspråk (byggspecen avsnitt 5, skissen Mallar och
 * Mobil-mallar). Ytan ritar; CvMallarClient äger datan, valen och vad
 * knapparna gör.
 *
 *   Dator (från 1280 px)  Väggen: vald mall, namnet med nivån, mallens rad,
 *                         verktygsbrickorna, format och nedladdning. Arket
 *                         står till höger och hänger ner över golvet, med
 *                         pilar, förstoringsglas och markering av avsnittet
 *                         under pekaren. Golvet: panelen med alla mallar till
 *                         vänster, och till höger en kolumn som följer med
 *                         vid bläddring (sidraden, gratisvägen, Premiumkortet
 *                         och, när arket rullat ur bild, vald mall med
 *                         nedladdningen).
 *   Telefon och mellan    Väggen: vald mall, arket med grannarna som skymtar
 *                         (svep byter), raden om rubrikerna och brickorna.
 *                         Golvet: panelen. Format och nedladdning i den fasta
 *                         raden längst ner.
 *
 * Bara ett ark monteras åt gången (dator eller telefon, efter
 * hydreringen); platsen är reserverad i båda (CLS 0).
 */
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import Link from 'next/link'
import type { Format, MallKort, Sektion } from '@/lib/cv/mallar/kontrakt'
import type { HuvudFalt, Matning } from '@/components/cv/Dokument/matning'
import type { Forhandsvisning } from '@/components/cv/Dokument/hooks'
import Dokument from '@/components/cv/Dokument/Dokument'
import EgenMiniatyr from '@/components/cv/Dokument/EgenMiniatyr'
import type { EgetCv } from '@/components/cv/Dokument/egnaMallar'
import { DOK, KNAPP } from '@/components/cv/Dokument/texter'
import { IkonLas, IkonPenna } from '@/components/illustrations/MallIkoner'
import { ChevronLeft, ChevronRight } from '@/components/illustrations/RumIkoner'
import { premiumKnapp, premiumPrisrad } from '@/lib/kampanj/kampanj'
import { useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import CvVagg from '../CvVagg'
import { oppnaNyttCv } from '../CvRad'
import { byggarenHref } from '../SkrivFranBorjan'
import { MALLAR } from '../texter'
import MallGalleri from './MallGalleri'

export type Byte = 'tryck' | 'lista' | 'svep' | 'pil'

const DATOR = '(min-width: 1280px)'
function prenumereraDator(f: () => void) {
  const mq = window.matchMedia(DATOR)
  mq.addEventListener('change', f)
  return () => mq.removeEventListener('change', f)
}
/** Dator eller telefon, efter hydreringen; null på servern (inget ark monteras). */
function useDator(): boolean | null {
  return useSyncExternalStore(
    prenumereraDator,
    () => window.matchMedia(DATOR).matches,
    () => null
  )
}

const TIPS_NYCKEL = 'jc_cv3_avsnitt_tips'

function Bock({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.5l5 5L20 6.5" />
    </svg>
  )
}

/** "Jobbcoach Premium, 149 kr i månaden." på en rad, "Säg upp när du vill." på nästa. */
function Prisrad({ text }: { text: string }) {
  const i = text.indexOf('. ')
  if (i < 0) return <b>{text}</b>
  return (
    <>
      <b>{text.slice(0, i + 1)}</b>
      <br /> {text.slice(i + 2)}
    </>
  )
}

export interface MallarVyProps {
  katalog: readonly MallKort[]
  mall: MallKort
  /** Hennes CV; null visar exempel-CV:t. */
  cv: EgetCv | null
  cvId: string | null
  cvRad: ReactNode
  foreslagna: readonly string[]
  skal?: string
  forhandsvisning: Forhandsvisning
  titel: string
  onMall: (id: string, byte: Byte) => void
  onPeka: (id: string) => void
  verktyg: ReactNode
  verktygMobil: ReactNode
  onRubrik?: (s: Sektion, text: string) => void
  onAvsnitt?: (s: Sektion) => void
  onHuvud?: (f: HuvudFalt) => void
  format: Format
  onFormat: (f: Format) => void
  /** Word är öppet i mallen (gratismall, eller kontot har Premium). */
  kanWord: boolean
  knapp: { text: string; under?: string; onClick: () => void; framsteg: number | null; disabled?: boolean }
  gratisVag: { mall: MallKort; onClick: () => void } | null
  /** Kontot har Premium: inget Premiumkort. */
  premium: boolean
  onKop: () => void
  onMatt: (m: Matning) => void
  sidor: number
  fel?: ReactNode
  /** En lugn rad vid nedladdningsknappen (siffrorna som står kvar). */
  pamin?: ReactNode
  last?: boolean
  lyft?: boolean
  /** Raden ovanför väggens innehåll (fotot efter kontot). */
  topp?: ReactNode
  helskarmRemsa?: ReactNode
  children?: ReactNode
}

export default function MallarVy(p: MallarVyProps) {
  const dator = useDator()
  const kampanj = useKampanjPris()
  const arkRef = useRef<HTMLDivElement>(null)
  const [arkSynligt, setArkSynligt] = useState(true)
  const [tips, setTips] = useState(false)
  const index = Math.max(0, p.katalog.findIndex((m) => m.id === p.mall.id))
  const n = p.katalog.length
  const granne = (r: 1 | -1) => p.katalog[(index + r + n) % n]
  const premiumMall = p.mall.niva === 'premium'
  const pagar = p.knapp.framsteg !== null

  // Datorns kolumn: vald mall med nedladdningen när arket rullat ur bild.
  useEffect(() => {
    if (!dator) return
    const el = arkRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setArkSynligt(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [dator])

  // Piltangenterna byter mall på datorn (med fördröjningen för snabb bläddring).
  useEffect(() => {
    if (!dator) return
    const tangent = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (document.documentElement.dataset.dialog === 'open' || document.querySelector('[role="dialog"][aria-modal="true"]')) return
      e.preventDefault()
      p.onMall(granne(e.key === 'ArrowRight' ? 1 : -1).id, 'pil')
    }
    window.addEventListener('keydown', tangent)
    return () => window.removeEventListener('keydown', tangent)
  })

  // Första besöket: raden om avsnitten bredvid arket i sex sekunder.
  useEffect(() => {
    if (!dator || !p.cv || !p.onAvsnitt) return
    let sett = true
    try {
      sett = window.localStorage.getItem(TIPS_NYCKEL) === '1'
      if (!sett) window.localStorage.setItem(TIPS_NYCKEL, '1')
    } catch {
      sett = true
    }
    if (sett) return
    setTips(true)
    const t = window.setTimeout(() => setTips(false), 6000)
    return () => window.clearTimeout(t)
    // En gång per besök.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dator])

  const oppnaHelskarm = () => arkRef.current?.querySelector<HTMLButtonElement>(`button[aria-label="${DOK.helskarm}"]`)?.click()

  const dokument = (
    <Dokument
      storlek="stor"
      vagg
      html={p.forhandsvisning.html}
      src={p.forhandsvisning.src}
      kalla={p.forhandsvisning.kalla}
      laddar={false}
      titel={p.titel}
      mall={p.mall}
      ordning={p.katalog}
      last={p.last}
      lyft={p.lyft}
      onSvep={(id) => p.onMall(id, 'svep')}
      onRubrik={p.onRubrik}
      onAvsnitt={p.onAvsnitt}
      onHuvud={p.onHuvud}
      onMatt={p.onMatt}
      helskarmRemsa={p.helskarmRemsa}
    />
  )

  const niva = (
    <span className="cv3m-niva" data-ton={premiumMall ? 'premium' : 'gratis'}>
      {premiumMall ? MALLAR.premium : MALLAR.gratis}
    </span>
  )

  const formatSeg = (liten = false) => (
    <div className="cv3m-seg" data-liten={liten ? '' : undefined} role="radiogroup" aria-label={MALLAR.format}>
      <button type="button" role="radio" aria-checked={p.format === 'pdf'} onClick={() => p.onFormat('pdf')} disabled={p.last}>
        PDF
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={p.format === 'docx'}
        aria-label={!p.mall.word ? MALLAR.wordSaknas : p.kanWord ? 'Word' : MALLAR.wordLast}
        onClick={() => p.onFormat('docx')}
        disabled={p.last || !p.mall.word}
      >
        Word
        {p.mall.word && !p.kanWord ? <IkonLas size={14} /> : null}
      </button>
    </div>
  )

  const laddaKnapp = (klass = '') => (
    <button
      type="button"
      className={`cv3m-stor ${klass}`}
      onClick={p.knapp.onClick}
      disabled={p.knapp.disabled || pagar}
      aria-busy={pagar}
      data-ladda-knapp
    >
      {pagar ? <span aria-hidden className="cv3m-stor-fyll" style={{ width: `${Math.round((p.knapp.framsteg ?? 0) * 100)}%` }} /> : null}
      <b>{pagar ? (p.format === 'docx' ? KNAPP.skaparWord : KNAPP.skaparPdf) : p.knapp.text}</b>
      {p.knapp.under && !pagar ? <small>{p.knapp.under}</small> : null}
    </button>
  )

  const exempelVagar = (bred = false) => (
    <div className={`cv3m-exempel${bred ? ' cv3m-exempel-bred' : ''}`}>
      <button type="button" className={`t3-stor${bred ? ' t3-stor-bred' : ''}`} onClick={() => oppnaNyttCv()}>
        {MALLAR.exempelLadda}
      </button>
      <Link href={byggarenHref('')} className="cv3-glas cv3-glas-stor">
        {MALLAR.exempelSkriv}
      </Link>
    </div>
  )

  const gratisVag = p.gratisVag ? (
    <button type="button" className="cv3m-fri" onClick={p.gratisVag.onClick} disabled={p.last} data-gratisvag>
      <span className="cv3m-fri-bild">
        <EgenMiniatyr mall={p.gratisVag.mall} cv={p.cv} bild="liten" />
      </span>
      <span className="min-w-0">
        <b>{MALLAR.gratisVag(p.gratisVag.mall.namn)}</b>
        <small>{MALLAR.gratisVagRad}</small>
      </span>
      <ChevronRight size={20} strokeWidth={2.4} className="ml-auto shrink-0" />
    </button>
  ) : null

  const premiumKort = p.premium ? null : (
    <div className="cv3m-prem" data-premiumkort>
      <p className="t3-ogon-golv cv3m-prem-ogon">{MALLAR.premOgon}</p>
      <h3 className="cv3m-prem-rubrik">{MALLAR.premRubrik(n)}</h3>
      <ul className="cv3m-ing">
        {MALLAR.premPunkter.map((t) => (
          <li key={t}>
            <i>
              <Bock />
            </i>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="cv3m-prem-pris">
        <Prisrad text={premiumPrisrad(kampanj)} />
      </p>
      <button type="button" className="cv3-kopknapp cv3m-kop" onClick={p.onKop}>
        {premiumKnapp(kampanj)}
      </button>
    </div>
  )

  /* ------------------------------------------------------------- väggen */

  const vanster = (
    <>
      {p.topp}
      <p className="t3-ogon">{MALLAR.ogon(index + 1, n)}</p>
      <div className="cv3m-namnrad">
        <h1 className="t3-h1 cv3m-h1">{p.mall.namn}</h1>
        {niva}
      </div>
      <p className="cv3-ingress cv3m-ingress">
        {p.mall.stil}. {p.cv ? MALLAR.foljer : MALLAR.exempelFoljer}
      </p>
      {p.verktyg}
      {p.cv ? (
        <div className="cv3m-ladda">
          {formatSeg()}
          {laddaKnapp()}
        </div>
      ) : (
        exempelVagar()
      )}
      {p.cv && p.pamin ? <div className="cv3m-pamin">{p.pamin}</div> : null}
      {p.fel ? <div className="cv3m-fel">{p.fel}</div> : null}
    </>
  )

  const mobil = (
    <div className="cv3m-mobil">
      {p.topp}
      <div className="cv3m-mobil-topp">
        <div className="min-w-0">
          <p className="t3-ogon">{MALLAR.ogon(index + 1, n)}</p>
          <div className="cv3m-namnrad">
            <h1 className="cv3m-h1-mobil">{p.mall.namn}</h1>
            {niva}
          </div>
        </div>
        <span className="cv3m-svep" aria-hidden="true">
          {MALLAR.svep[0]}
          <br />
          {MALLAR.svep[1]}
        </span>
      </div>
      <div className="cv3m-karusell">
        <span className="cv3m-granne" data-sida="v" aria-hidden="true">
          <EgenMiniatyr mall={granne(-1)} cv={p.cv} />
        </span>
        <span className="cv3m-granne" data-sida="h" aria-hidden="true">
          <EgenMiniatyr mall={granne(1)} cv={p.cv} />
        </span>
        <div className="cv3m-ark-mobil" ref={dator === false ? arkRef : undefined} data-ark-stor>
          {dator === false ? dokument : null}
        </div>
      </div>
      <p className="cv3m-hjalp">{MALLAR.tipsMobil}</p>
      {p.verktygMobil}
    </div>
  )

  return (
    <div className="cv3m" data-mallar-vy data-exempel={p.cv ? undefined : ''}>
      <CvVagg
        aktiv="mallar"
        cvId={p.cvId}
        cvRad={p.cvRad}
        vanster={vanster}
        hoger={null}
        mobil={mobil}
        etikett={`Mallar, ${p.mall.namn}`}
        lage={p.cv ? (premiumMall ? 'premiummall' : 'gratismall') : 'exempel'}
        dekor={
          <>
            <svg className="cv3m-kullar hidden xl:block" viewBox="0 0 1440 558" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 558V470C260 440 560 500 840 430S1260 330 1440 350V558Z" fill="var(--t3-kulle-1)" />
              <path d="M0 558V520C300 500 620 540 900 490S1300 420 1440 440V558Z" fill="var(--t3-kulle-2)" />
            </svg>
            <svg className="cv3m-kullar cv3m-kullar-mobil xl:hidden" viewBox="0 0 412 260" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 260V120C100 90 230 150 412 50V260Z" fill="var(--t3-kulle-1)" />
              <path d="M0 260V190C120 170 260 210 412 150V260Z" fill="var(--t3-kulle-2)" />
            </svg>
          </>
        }
      />

      <div className="cv3m-golv">
        <div className="cv3m-golv-inre">
          <MallGalleri
            katalog={p.katalog}
            vald={p.mall.id}
            foreslagna={p.foreslagna}
            skal={p.skal}
            cv={p.cv}
            onValj={(id) => p.onMall(id, 'lista')}
            onPeka={p.onPeka}
            last={p.last}
            topp={gratisVag ? <div className="cv3m-bara-mobil cv3m-panel-topp">{gratisVag}</div> : null}
          />

          {/* Datorn: arket och kolumnen som följer med. */}
          <aside className="cv3m-sida" aria-label={MALLAR.valdMall}>
            <div className="cv3m-arkplats" ref={dator ? arkRef : undefined} data-ark-stor data-laddar={p.forhandsvisning.laddar ? '' : undefined}>
              {dator ? dokument : null}
              <button type="button" className="cv3m-pil" data-sida="v" aria-label={MALLAR.forra} onClick={() => p.onMall(granne(-1).id, 'pil')} disabled={p.last}>
                <ChevronLeft size={22} strokeWidth={2.6} />
              </button>
              <button type="button" className="cv3m-pil" data-sida="h" aria-label={MALLAR.nasta} onClick={() => p.onMall(granne(1).id, 'pil')} disabled={p.last}>
                <ChevronRight size={22} strokeWidth={2.6} />
              </button>
              {tips ? (
                <span className="cv3m-tips" role="status">
                  {MALLAR.tipsDator}
                </span>
              ) : null}
            </div>
            <div className="cv3m-folj">
              {!arkSynligt ? (
                <div className="cv3m-vald">
                  <button type="button" className="cv3m-vald-bild" onClick={() => arkRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })} aria-label={MALLAR.tillArket}>
                    <EgenMiniatyr mall={p.mall} cv={p.cv} bild="liten" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="t3-ogon-matt">{MALLAR.valdMall}</p>
                    <p className="cv3m-vald-namn">
                      <b>{p.mall.namn}</b>
                      {niva}
                    </p>
                    {p.cv ? (
                      <div className="cv3m-vald-ladda">
                        {formatSeg(true)}
                        {laddaKnapp('cv3m-stor-liten')}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <p className="cv3m-sidrad">
                <b>{MALLAR.sidaAv(1, p.sidor)}</b>{' '}
                <button type="button" className="cv3-textlank" onClick={oppnaHelskarm}>
                  {MALLAR.lasHelskarm}
                </button>
              </p>
              {gratisVag}
              {premiumKort}
            </div>
          </aside>
        </div>
        {/* Telefonen: Premiumkortet under panelen. */}
        {premiumKort ? <div className="cv3m-bara-mobil cv3m-prem-mobil">{premiumKort}</div> : null}
      </div>

      {/* Telefonen: format och nedladdning i den fasta raden. */}
      <style>{'@media (max-width:1279.98px){main.dashboard-main-content{padding-bottom:0!important}}'}</style>
      <div className="cv3m-fast" data-fast-rad data-pamin={p.cv && p.pamin ? '' : undefined}>
        {p.cv ? (
          <>
            {p.pamin ? <div className="cv3m-fast-pamin">{p.pamin}</div> : null}
            {formatSeg()}
            {laddaKnapp()}
          </>
        ) : (
          exempelVagar(true)
        )}
      </div>
      {p.fel ? <div className="cv3m-fast-fel cv3m-bara-mobil">{p.fel}</div> : null}
      <div aria-hidden className="cv3m-fast-luft" />
      {p.children}
    </div>
  )
}

/** "Ändra texten" som bricka, först i verktygsraden (öppnar arbetsläget). */
export function AndraBricka({ href }: { href: string }) {
  return (
    <Link href={href} className="cv3m-bricka" data-ton="persika" data-andra-texten>
      <IkonPenna size={20} />
      <span>
        <span className="block">{MALLAR.andra}</span>
        <small>{MALLAR.andraUnder}</small>
      </span>
    </Link>
  )
}
