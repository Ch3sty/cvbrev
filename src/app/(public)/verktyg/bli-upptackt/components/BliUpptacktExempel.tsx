/**
 * Avidentifierad exempelprofil: exakt vad en rekryterare ser, inte mer.
 * Arbetsstilen visas som två spektra i ord, aldrig som siffror, och
 * testresultatet som placering, aldrig som råpoäng.
 *
 * Publikt omgång 3 (skissen bli-upptackt): ön i rummets färg med
 * kandidatkortet i full storlek, byggt efter RecruiterPreviewCard. Exemplet
 * är Sara Lindström, projektledare i Västra Götaland, utan namn. Texten om
 * vad rekryteraren ser och inte ser står ordagrant som förut (samtyckesnära,
 * rörs inte). Serverkomponent.
 */

import type { CSSProperties } from 'react'
import { O } from '@/components/publikt/v3'

const SKILLS = ['projektledning', 'LOU', 'budgetansvar', 'AMA', 'tidplan']

const SPEKTRA: { vanster: string; hoger: string; lage: string; aktiv: 'vanster' | 'hoger' }[] = [
  { vanster: 'Improviserar och anpassar', hoger: 'Planerar och strukturerar', lage: '88%', aktiv: 'hoger' },
  { vanster: 'Får energi av eget fokusarbete', hoger: 'Får energi av samarbete i grupp', lage: '68%', aktiv: 'hoger' },
]

/** Kandidatkortet som rekryteraren ser det. kort = hjältens kortare form. */
export function KandidatKort({ kort }: { kort?: boolean }) {
  return (
    <div className="bu-kkort" role="img" aria-label="Exempel: kandidatkortet som en rekryterare ser det, utan namn">
      <div className="bu-kk-huvud">
        <span className="bu-kk-avatar">P</span>
        <div>
          <b>Projektledare</b>
          <span>
            Västra Götaland <span className="bu-kk-anonym">Anonym</span>
          </span>
        </div>
      </div>
      <p className="bu-kk-rad">
        <b>8 års erfarenhet</b>, senast projektledare (5 år), civilingenjör
      </p>
      {kort ? null : (
        <p className="bu-kk-rad">Projektledare som håller ihop upphandling och tidplan. Trivs bäst där många ska dra åt samma håll.</p>
      )}
      <div className="bu-kk-chips">
        <span className="bu-test">Matrislogik, topp 15 %</span>
        {kort ? null : <span className="bu-test">Numeriskt, topp 30 %</span>}
        <span className="bu-styrka">Strukturerad</span>
        <span className="bu-styrka">Lugn under press</span>
      </div>
      {kort ? null : (
        <div className="bu-kk-stil">
          {SPEKTRA.map((s) => (
            <div key={s.vanster} className="bu-spektrum">
              <div>
                <span className={s.aktiv === 'vanster' ? 'bu-pa' : undefined}>{s.vanster}</span>
                <span className={s.aktiv === 'hoger' ? 'bu-pa' : undefined}>{s.hoger}</span>
              </div>
              <i style={{ ['--lage' as string]: s.lage } as CSSProperties} />
            </div>
          ))}
          <p>Trivs när processer är tydliga och kvalitet hinner göras rätt.</p>
        </div>
      )}
      <div className="bu-kk-chips">
        {(kort ? SKILLS.slice(0, 4) : SKILLS).map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <p className="bu-kk-fot">3 månader, hybrid, heltid, B-körkort</p>
    </div>
  )
}

export default function BliUpptacktExempel() {
  return (
    <O
      farg="jobb"
      ikon="jobb"
      etikett="Exempelprofil"
      rubrik="Det här ser en rekryterare av din profil"
      rubrikNiva="h2"
      varde={
        <>
          Rekryteraren ser din yrkesroll, region, kompetenser, dina testresultat och din arbetsstil. Rekryteraren ser inte ditt namn, ditt
          foto, dina kontaktuppgifter, ditt CV-dokument, ditt lönespann eller vilket företag du jobbar på i dag.
        </>
      }
      bild={<KandidatKort />}
    />
  )
}
