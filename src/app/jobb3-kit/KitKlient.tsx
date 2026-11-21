'use client'

/**
 * Kitsidans klientdelar: ljust och mörkt läge (?tema=mork|ljus), arket
 * Logga sökt tjänst (?ark=1 öppnar det direkt, för skärmbilder), växlarna
 * och strömbrytaren.
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Ark,
  Falt,
  FlerDetaljer,
  GruppEtikett,
  LitenKnapp,
  StorKnapp,
  Strombrytare,
  ValFalt,
  ValKnapp,
  ValRad,
  Vaxel,
  IkonBock,
  IkonDokument,
  IkonPersoner,
  IkonPlan,
  IkonPlus,
} from '@/components/jobb3/kit'

export function TemaVal() {
  const sok = useSearchParams()
  const [tema, setTema] = useState<'ljus' | 'mork' | 'system'>('system')
  useEffect(() => {
    const t = sok.get('tema')
    if (t === 'mork' || t === 'ljus') setTema(t)
  }, [sok])
  useEffect(() => {
    const r = document.documentElement
    if (tema === 'system') r.removeAttribute('data-theme')
    else r.setAttribute('data-theme', tema === 'mork' ? 'dark' : 'light')
  }, [tema])
  return (
    <Vaxel
      etikett="Läge"
      variant="liten"
      valt={tema}
      onVal={(v) => setTema(v as typeof tema)}
      val={[
        { id: 'ljus', text: 'Ljust' },
        { id: 'mork', text: 'Mörkt' },
        { id: 'system', text: 'System' },
      ]}
    />
  )
}

export function ArkDemo() {
  const sok = useSearchParams()
  const [oppen, setOppen] = useState(false)
  const [lage, setLage] = useState('sokt')
  const [hur, setHur] = useState('annons')
  const [cv, setCv] = useState('elin')
  const [fler, setFler] = useState(false)
  const [mal, setMal] = useState(false)
  useEffect(() => {
    if (sok.get('ark') === '1') setOppen(true)
  }, [sok])
  return (
    <div className="flex flex-wrap gap-3">
      <LitenKnapp ikon={<IkonPlus />} onClick={() => setOppen(true)}>
        Öppna arket Logga sökt tjänst
      </LitenKnapp>
      <LitenKnapp onClick={() => setMal(true)}>Öppna arket Ändra veckans mål</LitenKnapp>
      <Ark
        open={oppen}
        onClose={() => setOppen(false)}
        rubrik="Logga sökt tjänst"
        fot={
          <>
            <StorKnapp bred onClick={() => setOppen(false)}>
              {lage === 'sokt' ? 'Logga sökt tjänst' : 'Spara till Ska sökas'}
            </StorKnapp>
            <p>{lage === 'sokt' ? 'Brickan hamnar under Sökt. Vi säger till om det är tyst efter tolv dagar.' : 'Den räknas inte förrän du har sökt.'}</p>
          </>
        }
      >
        <Vaxel
          etikett="Har du sökt eller ska du söka?"
          variant="mork"
          valt={lage}
          onVal={setLage}
          val={[
            { id: 'sokt', text: <>{lage === 'sokt' ? <IkonBock size={16} /> : null}Jag har sökt</> },
            { id: 'ska', text: <>{lage === 'ska' ? <IkonBock size={16} /> : null}Jag ska söka</> },
          ]}
        />
        <Falt etikett="Tjänst" defaultValue="Redovisningsekonom" />
        <Falt etikett="Arbetsgivare" defaultValue="Balticgruppen" />
        {lage === 'sokt' ? <Falt etikett="Datum sökt" typ="datum" defaultValue="2026-11-21" /> : <Falt etikett="Sista ansökningsdag" typ="datum" defaultValue="2026-11-30" />}
        {lage === 'sokt' ? (
          <>
            <GruppEtikett>Hur sökte du?</GruppEtikett>
            <ValRad etikett="Hur sökte du?">
              <ValKnapp vald={hur === 'annons'} onClick={() => setHur('annons')} ikon={<IkonDokument />}>
                Annons
              </ValKnapp>
              <ValKnapp vald={hur === 'spontan'} onClick={() => setHur('spontan')} ikon={<IkonPlan />}>
                Spontan
              </ValKnapp>
              <ValKnapp vald={hur === 'kontakt'} onClick={() => setHur('kontakt')} ikon={<IkonPersoner />}>
                Via kontakt
              </ValKnapp>
            </ValRad>
            <GruppEtikett>Vilket CV skickade du?</GruppEtikett>
            <ValRad etikett="Vilket CV skickade du?">
              <ValKnapp form="rad" vald={cv === 'elin'} onClick={() => setCv('elin')} ikon={<IkonDokument />}>
                Elin Sundberg, ekonomi.pdf
              </ValKnapp>
              <ValKnapp form="rad" krymp vald={cv === 'vet-inte'} onClick={() => setCv('vet-inte')}>
                Vet inte
              </ValKnapp>
            </ValRad>
            <p className="j3-falt-hjalp">Vi räknar ut vilket av dina CV som ger flest svar.</p>
            <div style={{ marginTop: 10 }}>
              <FlerDetaljer oppen={fler} onClick={() => setFler(!fler)} tillagg="(valfritt): ort, länk, anteckning" />
            </div>
            {fler ? <Falt etikett="Länk till annonsen" tillagg="valfritt" typ="url" placeholder="https://" /> : null}
          </>
        ) : (
          <Falt etikett="Länk till annonsen" tillagg="valfritt" typ="url" placeholder="https://" />
        )}
      </Ark>
      <Ark
        open={mal}
        onClose={() => setMal(false)}
        rubrik="Ändra veckans mål"
        text="Hur många tjänster vill du söka i veckan? Veckan är måndag till söndag."
        bredd={460}
        fot={
          <StorKnapp bred onClick={() => setMal(false)}>
            Spara målet
          </StorKnapp>
        }
      >
        <ValFalt etikett="Sökta tjänster per vecka" defaultValue="3" alternativ={Array.from({ length: 10 }, (_, i) => ({ varde: String(i + 1), text: String(i + 1) }))} />
        <Falt etikett="Intervjutid" typ="tid" defaultValue="10:00" hjalp="Exempel på tidsfältet." />
      </Ark>
    </div>
  )
}

export function VaxelDemo() {
  const [vy, setVy] = useState('lista')
  const [per, setPer] = useState('vecka')
  return (
    <div className="flex flex-col gap-4">
      <Vaxel etikett="Vy" valt={vy} onVal={setVy} val={[{ id: 'lista', text: 'Lista' }, { id: 'statistik', text: 'Statistik' }, { id: 'rapport', text: 'Rapport' }]} />
      <Vaxel etikett="Period" variant="liten" valt={per} onVal={setPer} val={[{ id: 'vecka', text: 'Vecka' }, { id: 'manad', text: 'Månad' }]} />
    </div>
  )
}

export function BrytDemo() {
  const [pa, setPa] = useState(true)
  return <Strombrytare pa={pa} onClick={() => setPa(!pa)} rubrik={pa ? 'Du är sökbar' : 'Du är inte sökbar'} text="Anonym tills du själv säger ja till en rekryterare." />
}
