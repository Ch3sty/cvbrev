/**
 * Personlighetstestets resultat: profilmeningen, de fem dimensionerna med
 * band (aldrig råpoäng i text) och två kravprofiler. Allt räknas ur
 * smakprov-tolkning.ts med exempelprofilen.
 */

import { bandFor } from '@/lib/personalityTest/insights'
import {
  BAND_ORD,
  FAKTORER,
  KRAVPROFILER,
  kravUtfall,
  profilMening,
  visadPoang,
} from '@/lib/personlighet/smakprov-tolkning'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'
import { EXEMPELPROFIL } from './exempelprofil'

const BAND_KLASS = { high: 's-band s-hog', mid: 's-band', low: 's-band s-lag' } as const

/** Kravprofilerna som visas: en som kräver ett svar, en som passar. */
const VISADE_KRAV = ['Ledarskap och projektledning', 'Ekonomi och administration']

export default function SkarmPersonlighet({ glid, className }: { glid?: boolean; className?: string }) {
  const krav = VISADE_KRAV.map((n) => KRAVPROFILER.find((k) => k.namn === n)).filter((k) => k !== undefined)
  return (
    <Telefon rum="brev" glid={glid} className={className}>
      <SkarmVagg kick="Personlighetstestet" rubrik="Din profil" sub={profilMening(EXEMPELPROFIL)} />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Dina fem dimensioner</div>
          {FAKTORER.map((f, i) => {
            const p = visadPoang(EXEMPELPROFIL, f.key)
            const band = bandFor(p)
            return (
              <div key={f.key}>
                <div className="s-rad" style={i ? { marginTop: 5 } : undefined}>
                  <span>{f.namn}</span>
                  <em className={BAND_KLASS[band]}>{BAND_ORD[band]}</em>
                </div>
                <div className="s-matare">
                  <i style={{ width: `${p}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="s-kort">
          <div className="s-kick2">Så läses profilen mot kravprofiler</div>
          {krav.map((k) => {
            const utfall = kravUtfall(EXEMPELPROFIL, k)
            return (
              <div className="s-krav" key={k.namn}>
                <b>{k.namn}</b>
                <span className={utfall === 'Passar profilen' ? 's-ok' : undefined}>{utfall}</span>
              </div>
            )
          })}
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Det du kan säga på intervjun" />
    </Telefon>
  )
}
