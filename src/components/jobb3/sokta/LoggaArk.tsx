'use client'

/**
 * Arket Logga sökt tjänst (skissen Mobil-logga, samma ark på dator).
 *
 * Tre lägen:
 *   - ny: växeln "Jag har sökt" / "Jag ska söka" (F3). Sökt skapar en sökt
 *     tjänst (POST /api/applications), ska söka sparar en rad under Ska
 *     sökas (POST /api/jobbsok/ska-sokas).
 *   - från en Ska sökas-rad (`forifyllt.sparadId`): "Markera som sökt" och
 *     "Sökt ändå" skapar tjänsten ur raden (POST .../ska-sokas/[id]/sokt).
 *   - redigera (`redigera`): samma fält, PUT /api/applications/[id].
 *
 * Förifyllt från en träff: `forifyllt` med tjänst, arbetsgivare, länk,
 * sista dag och af_ad_id (adressen ?logga=1&tjanst=...&arbetsgivare=..., se
 * byggnoterna). CV-listan hämtas först när arket öppnas, som förut.
 */

import { useEffect, useState, type FormEvent } from 'react'
import {
  Ark,
  Falt,
  FlerDetaljer,
  GruppEtikett,
  StorKnapp,
  TextFalt,
  ValFalt,
  ValKnapp,
  ValRad,
  Vaxel,
  IkonBock,
  IkonDokument,
  IkonPersoner,
  IkonPlan,
} from '@/components/jobb3/kit'
import { idagSv, type ApplicationChannel, type JobApplication } from '@/lib/jobbsok'

export interface LoggaForifyllt {
  lage?: 'sokt' | 'ska-soka'
  job_title?: string
  company?: string
  location?: string | null
  job_ad_url?: string | null
  last_application_date?: string | null
  af_ad_id?: string | null
  match_score?: number | null
  /** Raden under Ska sökas som blir sökt. */
  sparadId?: string
}

export type LoggaResultat = { typ: 'sokt'; data: JobApplication; nytt: boolean } | { typ: 'sparad' } | { typ: 'andrad' }

interface CvVal {
  id: string
  file_name: string | null
}

const KANALER: { id: ApplicationChannel; text: string; ikon: React.ReactNode }[] = [
  { id: 'ad', text: 'Annons', ikon: <IkonDokument /> },
  { id: 'unsolicited', text: 'Spontan', ikon: <IkonPlan /> },
  { id: 'network', text: 'Via kontakt', ikon: <IkonPersoner /> },
]

async function skicka(url: string, method: string, body: unknown): Promise<any> {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new Error(json.error || 'Det gick inte att spara just nu. Försök igen.')
  }
  return json
}

export default function LoggaArk({
  open,
  onClose,
  onKlar,
  forifyllt,
  redigera,
}: {
  open: boolean
  onClose: () => void
  onKlar: (r: LoggaResultat) => void
  forifyllt?: LoggaForifyllt | null
  redigera?: JobApplication | null
}) {
  const idag = idagSv()
  const franSparad = !!forifyllt?.sparadId
  const [lage, setLage] = useState<'sokt' | 'ska-soka'>('sokt')
  const [titel, setTitel] = useState('')
  const [foretag, setForetag] = useState('')
  const [datum, setDatum] = useState(idag)
  const [sistaDag, setSistaDag] = useState('')
  const [kanal, setKanal] = useState<ApplicationChannel>('ad')
  const [cvId, setCvId] = useState('')
  const [cver, setCver] = useState<CvVal[] | null>(null)
  const [fler, setFler] = useState(false)
  const [ort, setOrt] = useState('')
  const [lank, setLank] = useState('')
  const [anteckning, setAnteckning] = useState('')
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const r = redigera
    const f = forifyllt
    setLage(r || franSparad ? 'sokt' : f?.lage ?? 'sokt')
    setTitel(r?.job_title ?? f?.job_title ?? '')
    setForetag(r?.company ?? f?.company ?? '')
    setDatum(r?.applied_at ?? idagSv())
    setSistaDag(f?.last_application_date ?? '')
    setKanal((r?.application_channel as ApplicationChannel) ?? 'ad')
    setCvId(r?.cv_id ?? '')
    setOrt(r?.location ?? f?.location ?? '')
    setLank(r?.job_ad_url ?? f?.job_ad_url ?? '')
    setAnteckning(r?.notes ?? '')
    // Förifyllt från en träff (?logga=1&ort=...&lank=...): visa fälten, så att det som följer med syns.
    setFler(Boolean(r?.location || r?.job_ad_url || r?.notes || (!r && (f?.location || f?.job_ad_url))))
    setFel(null)
  }, [open, redigera, forifyllt, franSparad])

  useEffect(() => {
    if (!open || cver) return
    let av = false
    fetch('/api/cv/list')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!av) setCver(((json?.cvs ?? json?.data ?? []) as CvVal[]).filter((c) => c?.id))
      })
      .catch(() => {
        if (!av) setCver([])
      })
    return () => {
      av = true
    }
  }, [open, cver])

  const skaSoka = lage === 'ska-soka'
  const kanSpara = titel.trim().length > 0 && foretag.trim().length > 0 && !sparar

  const spara = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!kanSpara) return
    setSparar(true)
    setFel(null)
    try {
      if (skaSoka) {
        await skicka('/api/jobbsok/ska-sokas', 'POST', {
          job_title: titel.trim(),
          company: foretag.trim(),
          location: ort.trim() || forifyllt?.location || null,
          job_ad_url: lank.trim() || null,
          last_application_date: sistaDag || null,
          source: forifyllt?.af_ad_id ? 'match' : 'egen',
          af_ad_id: forifyllt?.af_ad_id ?? null,
          match_score: forifyllt?.match_score ?? null,
        })
        onKlar({ typ: 'sparad' })
      } else {
        const falt = {
          job_title: titel.trim(),
          company: foretag.trim(),
          applied_at: datum || idagSv(),
          application_channel: kanal,
          cv_id: cvId || null,
          location: ort.trim() || null,
          job_ad_url: lank.trim() || null,
          notes: anteckning.trim() || null,
        }
        if (redigera) {
          await skicka(`/api/applications/${redigera.id}`, 'PUT', falt)
          onKlar({ typ: 'andrad' })
        } else if (forifyllt?.sparadId) {
          const json = await skicka(`/api/jobbsok/ska-sokas/${forifyllt.sparadId}/sokt`, 'POST', falt)
          onKlar({ typ: 'sokt', data: json.data as JobApplication, nytt: !json.alreadyExists })
        } else {
          const json = await skicka('/api/applications', 'POST', { ...falt, ...(forifyllt?.af_ad_id ? { af_ad_id: forifyllt.af_ad_id } : {}) })
          onKlar({ typ: 'sokt', data: json.data as JobApplication, nytt: !json.alreadyExists })
        }
      }
      onClose()
    } catch (err) {
      setFel(err instanceof Error ? err.message : 'Det gick inte att spara just nu. Försök igen.')
    } finally {
      setSparar(false)
    }
  }

  const rubrik = redigera ? 'Redigera sökt tjänst' : franSparad ? 'Markera som sökt' : 'Logga sökt tjänst'
  const knapp = sparar ? 'Sparar' : redigera ? 'Spara ändringar' : skaSoka ? 'Spara till Ska sökas' : franSparad ? 'Markera som sökt' : 'Logga sökt tjänst'
  const fotText = redigera
    ? null
    : skaSoka
      ? 'Den räknas inte förrän du har sökt.'
      : 'Brickan hamnar under Sökt. Vi säger till om det är tyst efter tolv dagar.'

  const visaCv = !skaSoka && (cver?.length ?? 0) > 0

  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik={rubrik}
      fot={
        <>
          <StorKnapp bred type="submit" disabled={!kanSpara} onClick={() => spara()}>
            {knapp}
          </StorKnapp>
          {fotText ? <p>{fotText}</p> : null}
        </>
      }
    >
      <form onSubmit={spara} noValidate>
        {!redigera && !franSparad ? (
          <>
            <Vaxel
              etikett="Har du sökt eller ska du söka?"
              variant="mork"
              valt={lage}
              onVal={(v) => setLage(v as 'sokt' | 'ska-soka')}
              val={[
                { id: 'sokt', text: <>{lage === 'sokt' ? <IkonBock size={16} /> : null}Jag har sökt</> },
                { id: 'ska-soka', text: <>{lage === 'ska-soka' ? <IkonBock size={16} /> : null}Jag ska söka</> },
              ]}
            />
            <p className="j3-falt-hjalp">Ska söka sparar annonsen med sista ansökningsdag.</p>
          </>
        ) : null}
        <Falt etikett="Tjänst" value={titel} onChange={(e) => setTitel(e.target.value)} maxLength={200} required autoComplete="organization-title" placeholder="Till exempel ekonomiassistent" />
        <Falt etikett="Arbetsgivare" value={foretag} onChange={(e) => setForetag(e.target.value)} maxLength={200} required autoComplete="organization" placeholder="Till exempel Volvo Cars" />
        {skaSoka ? (
          <>
            <Falt etikett="Sista ansökningsdag" tillagg="valfritt" typ="datum" value={sistaDag} min={idag} onChange={(e) => setSistaDag(e.target.value)} />
            <Falt etikett="Länk till annonsen" tillagg="valfritt" typ="url" value={lank} onChange={(e) => setLank(e.target.value)} placeholder="https://" maxLength={2048} />
          </>
        ) : (
          <>
            <Falt etikett="Datum sökt" typ="datum" value={datum} max={idag} onChange={(e) => setDatum(e.target.value)} />
            <GruppEtikett>Hur sökte du?</GruppEtikett>
            <ValRad etikett="Hur sökte du?">
              {KANALER.map((k) => (
                <ValKnapp key={k.id} vald={kanal === k.id} onClick={() => setKanal(k.id)} ikon={k.ikon}>
                  {k.text}
                </ValKnapp>
              ))}
            </ValRad>
            {visaCv ? (
              <>
                {(cver?.length ?? 0) <= 2 ? (
                  <>
                    <GruppEtikett>Vilket CV skickade du?</GruppEtikett>
                    <ValRad etikett="Vilket CV skickade du?">
                      {(cver ?? []).map((c) => (
                        <ValKnapp key={c.id} form="rad" vald={cvId === c.id} onClick={() => setCvId(c.id)} ikon={<IkonDokument />}>
                          {c.file_name || 'CV utan namn'}
                        </ValKnapp>
                      ))}
                      <ValKnapp form="rad" krymp vald={cvId === ''} onClick={() => setCvId('')}>
                        Vet inte
                      </ValKnapp>
                    </ValRad>
                  </>
                ) : (
                  <ValFalt
                    etikett="Vilket CV skickade du?"
                    value={cvId}
                    onChange={(e) => setCvId(e.target.value)}
                    alternativ={[{ varde: '', text: 'Vet inte' }, ...(cver ?? []).map((c) => ({ varde: c.id, text: c.file_name || 'CV utan namn' }))]}
                  />
                )}
                <p className="j3-falt-hjalp">Vi räknar ut vilket av dina CV som ger flest svar.</p>
              </>
            ) : null}
            <div style={{ marginTop: 10 }}>
              <FlerDetaljer oppen={fler} onClick={() => setFler(!fler)} tillagg="(valfritt): ort, länk, anteckning" />
            </div>
            {fler ? (
              <>
                <Falt etikett="Ort" value={ort} onChange={(e) => setOrt(e.target.value)} maxLength={200} autoComplete="address-level2" placeholder="Till exempel Umeå" />
                <Falt etikett="Länk till annonsen" typ="url" value={lank} onChange={(e) => setLank(e.target.value)} placeholder="https://" maxLength={2048} />
                <TextFalt etikett="Anteckning" value={anteckning} onChange={(e) => setAnteckning(e.target.value)} rows={3} maxLength={4000} placeholder="Kontaktperson, intryck, det du vill komma ihåg" />
              </>
            ) : null}
          </>
        )}
        {fel ? (
          <p className="j3-falt-fel" role="alert">
            {fel}
          </p>
        ) : null}
      </form>
    </Ark>
  )
}
