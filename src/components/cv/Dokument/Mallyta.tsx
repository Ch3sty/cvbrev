'use client'

/**
 * Arbetsytan: dokumentet är sidan (beslut 3). Samma yta på mallsidan,
 * provsidan och inloggat; ytan runt omkring äger datan (utkastet eller
 * CV:t i databasen) och vad knappen gör.
 *
 * Mobil (under 900 px): dokumentet, raden under arket, remsan med
 * Föreslagna för dig, mallraden, gratisvägen som bild och den fasta raden
 * med format och knapp. Dator (UX:s layout): arket 600 px (520 vid 1024) i
 * en zon om 744 px och mallkolumnen 336 px med tre miniatyrer per rad;
 * verktygsraden och knappen i en fast rad om 64 px längst ner. Inga linjer
 * utanför arket.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { capture } from '@/lib/analytics/events'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { Format, MallKort, MallVal, Sektion } from '@/lib/cv/mallar/kontrakt'
import Dokument from './Dokument'
import Remsa, { remsansMallar } from './Remsa'
import AllaArk, { AllaInnehall } from './AllaArk'
import Miniatyr from './Miniatyr'
import Verktygsrad, { type Valhandelse } from './Verktygsrad'
import Mallrad from './MallArk'
import RubrikArk from './RubrikArk'
import AvsnittArk, { type Redigerbart } from './AvsnittArk'
import FastRad, { FormatVal, LaddaKnapp } from './FastRad'
import type { HuvudFalt, Matning } from './matning'
import type { Kalla } from './hooks'
import { KNAPP, KOLUMN, REMSA } from './texter'

export type Bytesmetod = 'svep' | 'tryck' | 'lista'

export interface MallytaProps {
  surface: string
  katalog: readonly MallKort[]
  mall: MallKort
  onMall: (id: string, metod: Bytesmetod) => void
  val: MallVal
  onVal: (v: MallVal, h: Valhandelse) => void
  format: Format
  onFormat: (f: Format) => void
  forhandsvisning: { html: string | null; src: string | null; laddar: boolean; kalla?: Kalla | null }
  titel: string
  foreslagna: readonly string[]
  skal?: string
  /** Raden ovanför arket: filen som chip, CV-chippen. */
  topp?: ReactNode
  /** Rader mellan arket och verktygsraden ("Vi hittade ..."). */
  status?: ReactNode
  kanWord: boolean
  /** Premiumpriset som text, för mallraden. */
  pris?: string
  /** under: andra raden (priset) i en premiumknapp (granskningen V3). */
  knapp: { text: string; under?: string; onClick: () => void; framsteg: number | null; disabled?: boolean }
  /** Gratisvägen som bild, när vald mall är Premium och kontot saknar den. */
  gratisVag?: { mall: MallKort; onClick: () => void } | null
  fel?: ReactNode
  /** Rubrikerna: nuvarande text och om CV:t valt egen. */
  rubriker?: {
    egen: (s: Sektion) => boolean
    onVal: (s: Sektion, rubrik: string | null, kalla: 'forslag' | 'egen') => void
  }
  /** Avsnitten: CV:t att redigera och sparandet. */
  avsnitt?: { cv: CVMetadata; onSpara: (cv: CVMetadata) => void; tomma?: readonly Sektion[] }
  onFoto?: () => void
  fotoPa?: boolean
  /** Rubrikuppsättningen rubrikmodellen valt för CV:t (forvalFor). */
  forvaldUppsattning?: string
  ovanNav?: boolean
  last?: boolean
  lyft?: boolean
  onMatt?: (m: Matning) => void
  /** Ark som ytan äger (konto, final, merförsäljning). */
  children?: ReactNode
}

export default function Mallyta(p: MallytaProps) {
  const [alla, setAlla] = useState(false)
  const [rubrik, setRubrik] = useState<{ sektion: Sektion; text: string } | null>(null)
  const [avsnitt, setAvsnitt] = useState<Redigerbart | null>(null)
  const [huvudFokus, setHuvudFokus] = useState<HuvudFalt | undefined>(undefined)
  const [matning, setMatning] = useState<Matning | null>(null)
  const [allaKolumn, setAllaKolumn] = useState(false)
  const rotRef = useRef<HTMLDivElement>(null)
  const visad = useRef<string | null>(null)
  const forslagSett = useRef(false)
  const tier = p.mall.niva === 'gratis' ? 'free' : 'premium'

  useEffect(() => {
    if (forslagSett.current || p.foreslagna.length === 0) return
    forslagSett.current = true
    capture('forslag_visad', { grupp: 'foreslagna', templates: p.foreslagna.join(','), surface: p.surface })
  }, [p.foreslagna, p.surface])

  const mallIndex = p.katalog.findIndex((m) => m.id === p.mall.id)

  const valjMall = (id: string, metod: Bytesmetod) => {
    if (id === p.mall.id) return
    const fi = p.foreslagna.indexOf(id)
    const m = p.katalog.find((k) => k.id === id)
    if (fi >= 0 && m) {
      capture('forslag_vald', { grupp: 'foreslagna', position: fi, template: id, tier: m.niva === 'gratis' ? 'free' : 'premium', surface: p.surface })
    }
    if (m) {
      capture('mall_bytt', {
        template: id,
        method: metod,
        tier: m.niva === 'gratis' ? 'free' : 'premium',
        har_word: m.word,
        surface: p.surface,
        index: p.katalog.indexOf(m),
      })
    }
    p.onMall(id, metod)
  }

  const onMatt = (m: Matning) => {
    setMatning(m)
    p.onMatt?.(m)
    if (visad.current !== p.mall.id) {
      visad.current = p.mall.id
      capture('mall_visad', { template: p.mall.id, tier, har_word: p.mall.word, surface: p.surface, index: mallIndex })
      capture('sidantal_visat', { template: p.mall.id, tier, sidor: m.sidor, surface: p.surface })
    }
  }

  const onVal = (v: MallVal, h: Valhandelse) => {
    if (h.typ === 'typsnitt') capture('typsnitt_bytt', { font: h.font, surface: p.surface, template: p.mall.id, tier })
    if (h.typ === 'farg') capture('farg_bytt', { template: p.mall.id, tier, farg: h.farg, surface: p.surface })
    if (h.typ === 'ordning') capture('ordning_bytt', { template: p.mall.id, tier, ordning: h.ordning, surface: p.surface })
    p.onVal(v, h)
  }

  const verktyg = (
    <Verktygsrad
      mall={p.mall}
      val={p.val}
      onVal={onVal}
      onFoto={p.onFoto}
      fotoPa={p.fotoPa}
      last={p.last}
      forvaldUppsattning={p.forvaldUppsattning}
      onOppnaArk={() => {
        // Arket står kvar så hon kan jämföra (granskningen V1): dokumentets
        // överkant mot vyns topp innan typsnitts- eller ordningsarket öppnas.
        const el = rotRef.current?.querySelector<HTMLElement>('.dok-ark-yta')
        if (!el) return
        el.style.scrollMarginTop = '8px'
        el.scrollIntoView({ block: 'start' })
      }}
    />
  )
  const formatKompakt = (
    <FormatVal format={p.format} onFormat={p.onFormat} mallHarWord={p.mall.word} kanWord={p.kanWord} last={p.last} kompakt />
  )
  const knapp = (
    <LaddaKnapp
      text={p.knapp.framsteg !== null ? (p.format === 'docx' ? KNAPP.skaparWord : KNAPP.skaparPdf) : p.knapp.text}
      under={p.knapp.under}
      format={p.format}
      onClick={p.knapp.onClick}
      framsteg={p.knapp.framsteg}
      disabled={p.knapp.disabled}
    />
  )
  const gratisVag = p.gratisVag ? (
    <button
      type="button"
      onClick={p.gratisVag.onClick}
      disabled={p.last}
      className="flex w-full items-center gap-3 rounded-xl border border-kant bg-papper p-2.5 text-left hover:border-ink-1"
    >
      <span className="relative block aspect-[210/297] w-10 shrink-0 overflow-hidden rounded-[3px] border border-kant bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.gratisVag.mall.bild.liten} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-1">{KNAPP.gratisI(p.gratisVag.mall.namn)}</span>
        <span className="block text-meta text-ink-3">{KNAPP.gratisUnder}</span>
      </span>
    </button>
  ) : null

  const remsaGrupper = remsansMallar(p.katalog, p.foreslagna)
  const helskarmRemsa = (
    <Remsa katalog={p.katalog} vald={p.mall.id} foreslagna={p.foreslagna} onValj={(id) => valjMall(id, 'tryck')} onAlla={() => setAlla(true)} last={p.last} kompakt />
  )

  return (
    <div className="mallyta overflow-x-clip" ref={rotRef}>
      <div
        className="grid gap-4 min-[900px]:grid-cols-[minmax(0,1fr)_296px] min-[900px]:gap-6 xl:grid-cols-[minmax(0,744px)_336px] xl:justify-center"
      >
        {/* Arbetsytan med arket. */}
        <div className="min-w-0 scroll-mt-[72px]" data-arbetsyta>
          {p.topp ? <div className="mb-2.5">{p.topp}</div> : null}
          {p.status ? <div className="mx-auto mb-2 max-w-[600px]">{p.status}</div> : null}
          <Dokument
            storlek="stor"
            className="min-[900px]:max-w-[520px] xl:max-w-[600px]"
            html={p.forhandsvisning.html}
            src={p.forhandsvisning.src}
            kalla={p.forhandsvisning.kalla}
            laddar={p.forhandsvisning.laddar}
            titel={p.titel}
            mall={p.mall}
            ordning={p.katalog}
            last={p.last}
            lyft={p.lyft}
            onSvep={(id) => valjMall(id, 'svep')}
            onRubrik={p.rubriker ? (s, text) => setRubrik({ sektion: s, text }) : undefined}
            onAvsnitt={p.avsnitt ? (s) => setAvsnitt(s) : undefined}
            onHuvud={
              p.avsnitt
                  ? (f) => {
                      setHuvudFokus(f)
                      setAvsnitt('huvud')
                    }
                  : undefined
            }
            tommaAvsnitt={p.avsnitt?.tomma}
            valtAvsnitt={avsnitt === 'huvud' ? null : avsnitt}
            onMatt={onMatt}
            helskarmRemsa={helskarmRemsa}
          />

          {/* Mobil: raden under arket, remsan, mallraden, gratisvägen. */}
          <div className="mx-auto mt-3 grid w-full min-w-0 max-w-[600px] gap-3 min-[900px]:hidden">
            {verktyg}
            <Remsa
              katalog={p.katalog}
              vald={p.mall.id}
              foreslagna={p.foreslagna}
              skal={p.skal}
              onValj={(id) => valjMall(id, 'tryck')}
              onAlla={() => setAlla(true)}
              last={p.last}
            />
            <Mallrad mall={p.mall} pris={p.pris} harWord={p.kanWord} />
            {gratisVag}
          </div>
        </div>

        {/* Dator: mallkolumnen. */}
        <aside className="hidden min-w-0 min-[900px]:block" aria-label={REMSA.foreslagna}>
          <div className="min-[900px]:sticky min-[900px]:top-20">
            <p className="text-ey uppercase text-ink-3">{REMSA.foreslagna}</p>
            {p.skal ? <p className="mt-0.5 text-meta text-ink-2">{p.skal}</p> : null}
            <div className="mt-2 grid grid-cols-3 gap-2.5">
              {remsaGrupper.foreslagna.map((m) => (
                <Miniatyr key={m.id} mall={m} vald={m.id === p.mall.id} onValj={(id) => valjMall(id, 'tryck')} storlek="rutnat" lat={false} disabled={p.last} />
              ))}
            </div>
            {gratisVag ? <div className="mt-3">{gratisVag}</div> : null}
            {/* Kolumnen ryms i vyn och klistrar (granskningen P5): resten av
                mallarna bakom en rad. */}
            {allaKolumn ? (
              <div className="mt-4 max-h-[calc(100dvh-220px)] overflow-y-auto bg-golv pr-1">
                <AllaInnehall katalog={p.katalog} vald={p.mall.id} foreslagna={p.foreslagna} onValj={(id) => valjMall(id, 'lista')} utanForeslagna last={p.last} yta="golv" />
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setAllaKolumn((v) => !v)}
              aria-expanded={allaKolumn}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              {allaKolumn ? KOLUMN.visaFarre : KOLUMN.visaAlla(p.katalog.length)}
            </button>
          </div>
        </aside>
      </div>

      <FastRad
        ovanNav={p.ovanNav}
        formatKompakt={formatKompakt}
        knapp={knapp}
        fel={p.fel}
        dator={<div className="min-w-0 shrink">{verktyg}</div>}
      />

      <AllaArk
        open={alla}
        onClose={() => setAlla(false)}
        katalog={p.katalog}
        vald={p.mall.id}
        foreslagna={p.foreslagna}
        onValj={(id) => valjMall(id, 'lista')}
      />

      {p.rubriker && rubrik ? (
        <RubrikArk
          sektion={rubrik.sektion}
          nuvarande={p.val.rubriker?.[rubrik.sektion] ?? rubrik.text}
          egenVald={p.rubriker.egen(rubrik.sektion)}
          onVal={(s, r, kalla) => {
            capture('rubrik_bytt', { template: p.mall.id, tier, sektion: s, val: r === null ? 'standard' : kalla, surface: p.surface })
            p.rubriker?.onVal(s, r, kalla)
          }}
          onClose={() => setRubrik(null)}
        />
      ) : null}

      {p.avsnitt && avsnitt ? (
        <AvsnittArk
          sektion={avsnitt}
          fokus={avsnitt === 'huvud' ? huvudFokus : undefined}
          rubrik={matning?.rubriker.find((r) => r.sektion === avsnitt)?.text}
          cv={p.avsnitt.cv}
          onSpara={p.avsnitt.onSpara}
          onClose={() => setAvsnitt(null)}
        />
      ) : null}

      {p.children}
    </div>
  )
}
