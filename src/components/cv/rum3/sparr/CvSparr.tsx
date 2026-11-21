'use client'

/**
 * Spärrarna vid nedladdning i CV-rummets utseende (byggspecen avsnitt 9,
 * skissen Sparr-mall-1440 och Mobil-sparr). PaywallCard ritar hit när
 * utseendet är 'cv': texten, prisraden, köpknappen, länken och mätningen är
 * kortets egna, oförändrade. Här står bara bilden runt dem:
 *
 *   Vänster (dator) eller överst (telefon)  hennes CV i vald mall, PDF- och
 *       Word-brickorna och gratisvägen ("Välj bland de 2 fria").
 *   Höger  eyebrow = dagens rubrik för varianten, den nya rubriken, dagens
 *       brödtext, tre talrutor (antal mallar, antal med Word ur katalogen och
 *       plus i analysen bara när en analys finns), tre punkter som alla är
 *       sanna mot koden, prisraden, köpknappen och "Se vad som ingår".
 */
import type { ReactNode } from 'react'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import EgenMiniatyr from '@/components/cv/Dokument/EgenMiniatyr'
import type { EgetCv } from '@/components/cv/Dokument/egnaMallar'
import { lista } from '@/components/cv/Dokument/texter'
import { ChevronRight } from '@/components/illustrations/RumIkoner'
import { SPARR } from '../texter'

/** Det spärren behöver veta om CV:t och mallen, från galleriet. */
export interface CvSparrData {
  mall: MallKort
  cv: EgetCv | null
  antalMallar: number
  antalWord: number
  /** Plus i analysen; null utan analys (rutan utelämnas). */
  plusPoang: number | null
  /** Gratismallarna, för gratisvägen i varianten mall. */
  fria: readonly MallKort[]
}

export type CvSparrVariant = 'mall' | 'cv-export-word' | 'cv-export'

function Bock() {
  return (
    <i>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 12.5l5 5L20 6.5" />
      </svg>
    </i>
  )
}

function Stang({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="cv3s-stang" onClick={onClick} aria-label={SPARR.stang}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  )
}

export interface CvSparrProps {
  data: CvSparrData
  variant: CvSparrVariant
  /** Dagens rubrik för varianten (eyebrow). */
  titel: string
  body: string
  prisrad: ReactNode
  kop: ReactNode
  /** "Se vad som ingår". */
  lank: ReactNode
  /** Gratisvägen med variantens sekundära text, bara i varianten mall. */
  fria?: { text: string; onClick: () => void } | null
  onStang?: (() => void) | null
}

export default function CvSparr({ data, variant, titel, body, prisrad, kop, lank, fria, onStang }: CvSparrProps) {
  const { mall } = data
  const ordet = data.cv ? SPARR.ditt(mall.namn) : SPARR.exempel(mall.namn)
  const friaNamn = lista(data.fria.map((m) => m.namn))
  const brickor = (
    <span className="cv3s-fm-rad">
      <span className="cv3s-fm">PDF</span>
      {mall.word ? <span className="cv3s-fm">Word</span> : null}
    </span>
  )

  return (
    <div className="cv3s" data-cv-sparr={variant}>
      <div className="cv3s-vagg">
        <span className="cv3s-cirkel" aria-hidden="true" />
        <span className="cv3s-kulle" aria-hidden="true" />
        <div className="cv3s-vagg-topp">
          <div className="min-w-0">
            <p className="cv3s-ogon-vagg">{ordet}</p>
            <span className="md:hidden">{brickor}</span>
          </div>
          <span className="hidden md:inline-flex">{brickor}</span>
          {onStang ? (
            <span className="md:hidden">
              <Stang onClick={onStang} />
            </span>
          ) : null}
        </div>
        <div className="cv3s-ark">
          <EgenMiniatyr mall={mall} cv={data.cv} direkt alt={ordet} />
        </div>
        {fria ? (
          <button type="button" className="cv3s-fri hidden md:flex" onClick={fria.onClick}>
            <span className="cv3s-fri-bild">{data.fria[0] ? <EgenMiniatyr mall={data.fria[0]} cv={data.cv} bild="liten" /> : null}</span>
            <span className="min-w-0">
              <b>{fria.text}</b>
              <small>{SPARR.friaRad(friaNamn)}</small>
            </span>
            <ChevronRight size={18} strokeWidth={2.4} className="ml-auto shrink-0" />
          </button>
        ) : null}
      </div>

      <div className="cv3s-text">
        {onStang ? (
          <span className="hidden md:block">
            <Stang onClick={onStang} />
          </span>
        ) : null}
        <p className="cv3s-ogon">{titel}</p>
        <h2 className="cv3s-rubrik">{SPARR.rubrik[variant]}</h2>
        <p className="cv3s-body">{body}</p>

        <div
          className="cv3s-tal hidden md:grid"
          data-antal={data.plusPoang ? 3 : 2}
          role="img"
          aria-label={SPARR.talAria(data.antalMallar, data.antalWord, data.plusPoang)}
        >
          <div>
            <b>{data.antalMallar}</b>
            <span>{SPARR.mallar}</span>
          </div>
          <div>
            <b>{data.antalWord}</b>
            <span>{SPARR.word}</span>
          </div>
          {data.plusPoang ? (
            <div>
              <b>+{data.plusPoang}</b>
              <span>{SPARR.poang}</span>
            </div>
          ) : null}
        </div>

        <ul className="cv3s-ing">
          <li>
            <Bock />
            <span>
              <b>{SPARR.punktFil(mall.namn, mall.word)}</b>
              {SPARR.punktFilRad}
            </span>
          </li>
          <li>
            <Bock />
            <span>
              <b>{SPARR.punktNy}</b>
              <span className="hidden md:inline">{SPARR.punktNyRad}</span>
              <span className="md:hidden">{SPARR.punktNyRadKort}</span>
            </span>
          </li>
          <li>
            <Bock />
            <span>
              <b>{SPARR.punktAnalys}</b>
              <span className="hidden md:inline">{SPARR.punktAnalysRad}</span>
              <span className="md:hidden">{SPARR.punktAnalysRadKort}</span>
            </span>
          </li>
        </ul>

        <div className="cv3s-fot">
          <p className="cv3s-pris">{prisrad}</p>
          <div className="cv3s-kop">{kop}</div>
          <div className="cv3s-lankar">
            {fria ? (
              <button type="button" className="cv3s-lank md:hidden" onClick={fria.onClick}>
                {fria.text}
              </button>
            ) : null}
            {lank}
          </div>
        </div>
      </div>
    </div>
  )
}
