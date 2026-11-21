'use client'

/**
 * Raden under arket (skissen yta 3, "Raden under arket, 375 px"):
 * typsnitt (Aa plus namnet i sitt typsnitt), färg (fyra prickar, 24 px
 * synliga, 44 px träffyta), ordning och foto. Fotoknappen syns bara i mallar
 * med fotoplats. Summan ryms på en rad; på smala skärmar rullar raden i
 * sidled. Alla val är gratis (beslut 7) och byts direkt i dokumentet bakom.
 */
import { useState } from 'react'
import type { MallKort, MallVal, Ordning, TypsnittId } from '@/lib/cv/mallar/kontrakt'
import { FONTS } from '@/lib/cv/preview-utils'
import { IkonFarg, IkonFoto, IkonOrdning } from '@/components/illustrations/MallIkoner'
import Ark from './Ark'
import { UPPSATTNING_IDS, UPPSATTNING_NAMN } from '@/lib/cv/rubriker'
import { UPPSATTNING_ARK, VAL_ARK, VERKTYG } from './texter'

export type Valhandelse =
  | { typ: 'typsnitt'; font: TypsnittId }
  | { typ: 'farg'; farg: number }
  | { typ: 'ordning'; ordning: Ordning }
  | { typ: 'enSida'; enSida: boolean }
  | { typ: 'uppsattning'; uppsattning: string }

export interface VerktygsradProps {
  mall: MallKort
  val: MallVal
  onVal: (nytt: MallVal, h: Valhandelse) => void
  /** Fotoknappen trycktes (arket ägs av ytan: utloggad eller inloggad). */
  onFoto?: () => void
  fotoPa?: boolean
  last?: boolean
  /** Uppsättningen rubrikmodellen valt för CV:t, markerad när inget är valt. */
  forvaldUppsattning?: string
  /** Innan ett ark utan dimma öppnas: ytan lägger dokumentet i vyn (V1). */
  onOppnaArk?: () => void
  /**
   * CV-rummets brickor (Mallar, skissen Mallar och Mobil-mallar): samma val
   * och samma ark, ritade som vita brickor med en underrad. `forst` står
   * först i raden (Ändra texten). Utelämnat: chippen som förut (publikt).
   */
  brickor?: boolean
  forst?: React.ReactNode
}

const GRUPPER: { namn: string; ids: readonly string[] }[] = [
  { namn: 'ATS-säkra', ids: ['calibri', 'arial', 'verdana', 'helvetica'] },
  { namn: 'Moderna', ids: ['lato', 'open-sans', 'roboto', 'poppins', 'montserrat', 'ibm-plex-sans'] },
  { namn: 'Formella', ids: ['georgia', 'garamond', 'times', 'lora'] },
]

const CHIP =
  'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border border-kant-stark bg-papper px-2.5 text-[13px] font-medium text-ink-1 hover:border-ink-1 disabled:opacity-60'

function Radio({ vald, onClick, children, stil }: { vald: boolean; onClick: () => void; children: React.ReactNode; stil?: React.CSSProperties }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={vald}
      onClick={onClick}
      className={`flex min-h-12 w-full items-center gap-2.5 rounded-[10px] px-1.5 text-left text-sm text-ink-1 ${vald ? 'bg-papper-2' : 'hover:bg-papper-2'}`}
      style={stil}
    >
      <span
        aria-hidden
        className={`h-[18px] w-[18px] shrink-0 rounded-full ${vald ? 'border-[5px] border-ink-1' : 'border-[1.5px] border-kant-stark'}`}
      />
      {children}
    </button>
  )
}

export default function Verktygsrad({ mall, val, onVal, onFoto, fotoPa, last, forvaldUppsattning, onOppnaArk, brickor, forst }: VerktygsradProps) {
  const [ark, setArkState] = useState<'typsnitt' | 'ordning' | 'uppsattning' | null>(null)
  const setArk = (a: 'typsnitt' | 'ordning' | 'uppsattning' | null) => {
    if (a && !ark) onOppnaArk?.()
    setArkState(a)
  }
  const font = FONTS.find((f) => f.id === (val.typsnitt ?? mall.typsnitt ?? 'calibri')) ?? FONTS[0]
  const farg = val.farg ?? 0
  const ordning = val.ordning ?? 'standard'

  const rad = brickor ? (
    <div className="cv3m-verktyg" role="group" aria-label={VERKTYG.anpassa}>
      {forst}
      <button type="button" className="cv3m-bricka" onClick={() => setArk('typsnitt')} disabled={last} aria-haspopup="dialog">
        <span className="cv3m-aa" aria-hidden="true" style={{ fontFamily: font.family }}>
          Aa
        </span>
        <span>
          <span className="block" style={{ fontFamily: font.family }}>{font.name}</span>
          <small>{VERKTYG.typsnitt}</small>
        </span>
      </button>
      <div className="cv3m-bricka cv3m-farger" role="radiogroup" aria-label={VERKTYG.farg}>
        {mall.accenter.map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            role="radio"
            aria-checked={farg === i}
            aria-label={`${VERKTYG.farg} ${i + 1}`}
            disabled={last}
            onClick={() => onVal({ ...val, farg: i }, { typ: 'farg', farg: i })}
          >
            <span style={{ background: c }} data-vald={farg === i ? '' : undefined} />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="cv3m-bricka"
        onClick={() => setArk('ordning')}
        disabled={last}
        aria-haspopup="dialog"
        aria-label={`${VAL_ARK.rubrik}: ${VERKTYG.ordning[ordning]}`}
      >
        <IkonOrdning size={20} />
        <span>
          <span className="block">{VERKTYG.ordning[ordning]}</span>
          <small>{VERKTYG.ordningKort}</small>
        </span>
      </button>
      {mall.foto && onFoto ? (
        <button type="button" className="cv3m-bricka" onClick={onFoto} disabled={last} aria-haspopup="dialog">
          <IkonFoto size={20} />
          <span>
            <span className="block">{fotoPa ? VERKTYG.fotoPa : VERKTYG.laggTill}</span>
            <small>{VERKTYG.foto}</small>
          </span>
        </button>
      ) : null}
    </div>
  ) : null

  return (
    <>
      {rad ?? <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button type="button" className={CHIP} onClick={() => setArk('typsnitt')} disabled={last} aria-haspopup="dialog">
          <span className="text-[15px] font-bold leading-none" style={{ fontFamily: font.family }}>
            Aa
          </span>
          <span className="[.rad-trang-1_&]:max-w-[88px] [.rad-trang-1_&]:truncate [.rad-trang-2_&]:hidden" style={{ fontFamily: font.family }}>
            {font.name}
          </span>
        </button>

        <div className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-[10px] border border-kant-stark bg-papper pl-2 pr-0.5" role="radiogroup" aria-label={VERKTYG.farg}>
          <IkonFarg size={16} className="text-ink-3" />
          {mall.accenter.map((c, i) => (
            <button
              key={`${c}-${i}`}
              type="button"
              role="radio"
              aria-checked={farg === i}
              aria-label={`${VERKTYG.farg} ${i + 1}`}
              disabled={last}
              onClick={() => onVal({ ...val, farg: i }, { typ: 'farg', farg: i })}
              className="inline-flex h-11 w-8 items-center justify-center"
            >
              <span
                className="block h-6 w-6 rounded-full"
                style={{ background: c, boxShadow: farg === i ? '0 0 0 2px var(--papper), 0 0 0 4px var(--ink-1)' : undefined }}
              />
            </button>
          ))}
        </div>

        {/* Trång fast rad (FastRad mäter): "Standard" säger inget, bara ikonen;
            ännu trängre: bara ikonen oavsett val (UX 2026-11-16). */}
        <button
          type="button"
          className={CHIP}
          onClick={() => setArk('ordning')}
          disabled={last}
          aria-haspopup="dialog"
          aria-label={`${VAL_ARK.rubrik}: ${VERKTYG.ordning[ordning]}`}
        >
          <IkonOrdning size={18} />
          <span className={ordning === 'standard' ? '[.rad-trang-1_&]:hidden [.rad-trang-2_&]:hidden' : '[.rad-trang-2_&]:hidden'}>{VERKTYG.ordning[ordning]}</span>
        </button>

        {mall.foto && onFoto ? (
          <button type="button" className={CHIP} onClick={onFoto} disabled={last} aria-haspopup="dialog">
            <IkonFoto size={18} />
            {!fotoPa ? (
              <span
                aria-hidden
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: mall.accenter[farg] }}
              >
                A
              </span>
            ) : null}
            {fotoPa ? VERKTYG.fotoPa : VERKTYG.foto}
          </button>
        ) : null}
      </div>}

      <Ark open={ark === 'typsnitt'} onClose={() => setArk(null)} rubrik={VERKTYG.typsnitt} under={VERKTYG.typsnittUnder} utanDimma>
        <div role="radiogroup" aria-label={VERKTYG.typsnitt}>
          {GRUPPER.map((g) => (
            <div key={g.namn} className="mt-2">
              <p className="pb-1 text-ey uppercase text-ink-3">{g.namn}</p>
              {g.ids.map((id) => {
                const f = FONTS.find((x) => x.id === id)
                if (!f) return null
                return (
                  <Radio
                    key={f.id}
                    vald={font.id === f.id}
                    stil={{ fontFamily: f.family }}
                    onClick={() => onVal({ ...val, typsnitt: f.id as TypsnittId }, { typ: 'typsnitt', font: f.id as TypsnittId })}
                  >
                    <span className="text-[15px]">{f.name}</span>
                    {g.namn === 'ATS-säkra' && f.id === 'calibri' ? (
                      <small className="ml-auto font-sans text-xs text-ink-3">{VERKTYG.typsnittAts}</small>
                    ) : null}
                  </Radio>
                )
              })}
            </div>
          ))}
          <p className="mt-3 text-meta text-ink-3">{VERKTYG.typsnittFot}</p>
        </div>
      </Ark>

      <Ark open={ark === 'ordning'} onClose={() => setArk(null)} rubrik={VAL_ARK.rubrik} under={VAL_ARK.under} utanDimma>
        <div role="radiogroup" aria-label={VAL_ARK.rubrik}>
          {(Object.keys(VAL_ARK.ordning) as Ordning[]).map((o) => (
            <Radio key={o} vald={ordning === o} onClick={() => onVal({ ...val, ordning: o }, { typ: 'ordning', ordning: o })}>
              <span>
                <span className="block font-semibold">{VAL_ARK.ordning[o].namn}</span>
                <span className="block text-meta text-ink-2">{VAL_ARK.ordning[o].text}</span>
              </span>
            </Radio>
          ))}
        </div>
        <div className="mt-2 border-t border-kant pt-2">
          <button
            type="button"
            role="switch"
            aria-checked={val.enSida === true}
            onClick={() => onVal({ ...val, enSida: !val.enSida }, { typ: 'enSida', enSida: !val.enSida })}
            className="flex min-h-12 w-full items-center gap-3 rounded-[10px] px-1.5 text-left hover:bg-papper-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-1">{VAL_ARK.enSida.namn}</span>
              <span className="block text-meta text-ink-2">{VAL_ARK.enSida.text}</span>
            </span>
            <span aria-hidden className={`relative h-6 w-10 shrink-0 rounded-full ${val.enSida ? 'bg-ink-1' : 'bg-kant-stark'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-papper transition-[left] ${val.enSida ? 'left-[18px]' : 'left-0.5'}`} />
            </span>
          </button>
          {[
            { t: VAL_ARK.rubriker, g: () => setArk('uppsattning') },
            { t: VAL_ARK.fargTypsnitt, g: () => setArk('typsnitt') },
          ].map(({ t, g }) => (
            <button key={t.namn} type="button" onClick={g} className="flex min-h-12 w-full items-center gap-3 rounded-[10px] px-1.5 text-left hover:bg-papper-2">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-1">{t.namn}</span>
                <span className="block text-meta text-ink-2">{t.text}</span>
              </span>
              <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      </Ark>

      <Ark
        open={ark === 'uppsattning'}
        onClose={() => setArk(null)}
        rubrik={VAL_ARK.rubriker.namn}
        under={UPPSATTNING_ARK.under}
        utanDimma
      >
        <div role="radiogroup" aria-label={VAL_ARK.rubriker.namn}>
          {UPPSATTNING_IDS.map((id) => (
            <Radio
              key={id}
              vald={(val.uppsattning ?? forvaldUppsattning ?? 'allman') === id}
              onClick={() => onVal({ ...val, uppsattning: id, rubriker: undefined }, { typ: 'uppsattning', uppsattning: id })}
            >
              {UPPSATTNING_NAMN[id]}
            </Radio>
          ))}
        </div>
      </Ark>
    </>
  )
}
