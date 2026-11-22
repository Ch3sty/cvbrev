/**
 * CV-analysens genomgång: läsbarhetspoängen, vägen till 100 och delarna med
 * poäng kvar. Delarnas namn och maxpoäng läses ur poängmodellen. Exemplet
 * (Sara Lindström, textbeslut TEL-1): Erfarenhet tappar på punkter som inte
 * börjar med vad hon gjorde, det som Jobbcoachens förslag skriver om, och
 * Språk på en saknad nivå, som bara hon själv kan fylla i. Telefonen visar
 * de två delarna med poäng kvar och raden om de fem som är klara.
 */

import type { CSSProperties } from 'react'
import { KATEGORIER } from '@/lib/cv/poang/modell'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

/** Exemplets poäng per del. */
const EXEMPEL: Record<(typeof KATEGORIER)[number]['id'], { poang: number; rad?: string }> = {
  kontakt: { poang: 10 },
  profil: { poang: 15 },
  erfarenhet: { poang: 30, rad: 'Punkterna börjar med vad du gjorde' },
  kompetenser: { poang: 12 },
  utbildning: { poang: 8 },
  sprak: { poang: 3, rad: 'Nivå på varje språk' },
  format: { poang: 15 },
}

const DELAR = KATEGORIER.map((k) => ({ ...k, ...EXEMPEL[k.id] }))
const POANG = DELAR.reduce((s, d) => s + d.poang, 0)
const KVAR = DELAR.filter((d) => d.poang < d.max)
const KLARA = DELAR.length - KVAR.length
/** Vägen till 100: det Jobbcoachens förslag tar och det bara du kan fylla i. */
const VAGEN = [
  { namn: 'I dag', tal: String(POANG) },
  { namn: 'Våra förslag', tal: '+5' },
  { namn: 'Du själv', tal: '+2' },
]

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju']
const ord = (n: number) => ORD[n] ?? String(n)
const Ord = (n: number) => ord(n).charAt(0).toUpperCase() + ord(n).slice(1)

export default function SkarmCvAnalys({ glid, className }: { glid?: boolean; className?: string }) {
  const ringStil = { '--mal-p': POANG / 100, '--mal-n': POANG } as CSSProperties
  return (
    <Telefon rum="cv" glid={glid} className={className}>
      <SkarmVagg kick="Läsbarhetspoäng">
        <div className="s-rad" style={{ marginTop: 8, alignItems: 'center' }}>
          <div className="s-ring" style={ringStil}>
            <svg viewBox="0 0 96 96" focusable="false">
              <circle className="s-bak" cx="48" cy="48" r="42" />
              <circle className="s-fram" cx="48" cy="48" r="42" />
            </svg>
            <div className="s-siffra">
              <span className="s-tal">{POANG}</span>
              <small>av 100 i dag</small>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
            <div className="s-rub" style={{ fontSize: 17 }}>
              {100 - POANG} poäng kvar till 100
            </div>
            <div className="s-sub">De sitter i {ord(KVAR.length)} delar.</div>
          </div>
        </div>
      </SkarmVagg>
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Vägen till 100</div>
          {VAGEN.map((v) => (
            <div className="s-rad" key={v.namn} style={{ marginTop: 4 }}>
              <span>{v.namn}</span>
              <b>{v.tal}</b>
            </div>
          ))}
        </div>
        <div className="s-kort">
          <div className="s-kick2">Genomgången, del för del</div>
          <b style={{ fontSize: 13 }}>
            {Ord(DELAR.length)} delar. {Ord(KVAR.length)} har poäng kvar.
          </b>
          {KVAR.map((d) => (
            <div key={d.id} style={{ marginTop: 6 }}>
              <div className="s-rad">
                <span>{d.namn}</span>
                <span className="s-dim" style={{ whiteSpace: 'nowrap' }}>
                  {d.poang} av {d.max} <span className="s-pill">Delvis</span>
                </span>
              </div>
              {d.rad ? <p className="s-dim">{d.rad}</p> : null}
            </div>
          ))}
          <p className="s-dim" style={{ marginTop: 6 }}>
            {Ord(KLARA)} delar är klara
          </p>
        </div>
      </SkarmGolv>
      <SkarmFot>
        <div className="s-knapp">Hämta Jobbcoachens förslag</div>
        <p className="s-dim" style={{ textAlign: 'center', marginTop: 4 }}>
          En gång ingår gratis.
        </p>
      </SkarmFot>
    </Telefon>
  )
}
