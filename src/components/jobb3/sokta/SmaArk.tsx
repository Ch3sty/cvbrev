'use client'

/**
 * De små arken i Sökta tjänster, alla i rummets ark ur kitet (BYGGSPEC 5):
 * Ändra veckans mål, Lägg till händelse, Intervjuns tid (Ändra tid och
 * "Den blev flyttad") och en bekräftelse (Ta bort).
 */

import { useEffect, useState } from 'react'
import {
  Ark,
  Falt,
  LitenKnapp,
  StorKnapp,
  TextFalt,
  ValFalt,
  ValKnapp,
  ValRad,
  IkonAvslag,
  IkonBock,
  IkonFlagga,
  IkonKalender,
  IkonVaska,
  IkonPersoner,
  IkonRutnat,
} from '@/components/jobb3/kit'
import { STATUS_META } from '@/lib/applications/status'
import { dagFor, handelseForeSokt, idagSv, klockslag, VECKANS_MAL_MAX, VECKANS_MAL_MIN, type ApplicationEventType, type Dag } from '@/lib/jobbsok'

export async function anropa(url: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    const fel = new Error(json.error || 'Det gick inte att spara just nu. Försök igen.') as Error & { status?: number; json?: any }
    fel.status = res.status
    fel.json = json
    throw fel
  }
  return json
}

function Fel({ text }: { text: string | null }) {
  return text ? (
    <p className="j3-falt-fel" role="alert">
      {text}
    </p>
  ) : null
}

/* ------------------------------------------------------- Veckans mål */

export function MalArk({ open, onClose, mal, onSparat }: { open: boolean; onClose: () => void; mal: number; onSparat: () => void }) {
  const [varde, setVarde] = useState(String(mal))
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  useEffect(() => {
    if (open) {
      setVarde(String(mal))
      setFel(null)
    }
  }, [open, mal])
  const spara = async () => {
    setSparar(true)
    setFel(null)
    try {
      await anropa('/api/jobbsok/veckans-mal', 'PUT', { mal: Number(varde) })
      onSparat()
      onClose()
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Det gick inte att spara just nu.')
    } finally {
      setSparar(false)
    }
  }
  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik="Ändra veckans mål"
      text="Hur många tjänster vill du söka i veckan? Veckan är måndag till söndag."
      bredd={460}
      fot={
        <StorKnapp bred onClick={spara} disabled={sparar}>
          {sparar ? 'Sparar' : 'Spara målet'}
        </StorKnapp>
      }
    >
      <ValFalt
        etikett="Sökta tjänster per vecka"
        value={varde}
        onChange={(e) => setVarde(e.target.value)}
        alternativ={Array.from({ length: VECKANS_MAL_MAX - VECKANS_MAL_MIN + 1 }, (_, i) => ({ varde: String(i + VECKANS_MAL_MIN), text: String(i + VECKANS_MAL_MIN) }))}
      />
      <Fel text={fel} />
    </Ark>
  )
}

/* -------------------------------------------------- Lägg till händelse */

const VAL: { typ: ApplicationEventType; ikon: React.ReactNode }[] = [
  { typ: 'test_invited', ikon: <IkonRutnat /> },
  { typ: 'interview_invited', ikon: <IkonKalender /> },
  { typ: 'interview_completed', ikon: <IkonBock /> },
  { typ: 'trial_work_completed', ikon: <IkonVaska /> },
  { typ: 'offer_received', ikon: <IkonFlagga /> },
  { typ: 'accepted', ikon: <IkonBock /> },
  { typ: 'declined', ikon: <IkonPersoner /> },
  { typ: 'rejected', ikon: <IkonAvslag /> },
]

export function handelseNamn(typ: ApplicationEventType, genomforda = 0): string {
  if (typ === 'interview_completed') return genomforda > 0 ? `Intervju ${genomforda + 1} genomförd` : 'Intervju genomförd'
  if (typ === 'trial_work_completed') return 'Provjobbade'
  if (typ === 'offer_received') return 'Fick erbjudande'
  if (typ === 'rejected') return 'Fick avslag'
  return STATUS_META[typ].label
}

/**
 * Lägg till händelse. `typ` förvalt från snabbvalen; utan typ väljer hon i
 * arket ("Annat"). "Kallad till intervju" frågar efter intervjuns dag, tid
 * och plats (F6), alla valfria. Dagen kan inte ligga före dagen tjänsten
 * söktes (`sokt`): samma kontroll och text som rutten (klicktestet 2026-11-21).
 */
export function HandelseArk({
  open,
  onClose,
  ansokanId,
  typ: forval,
  genomforda,
  sokt,
  onSparat,
}: {
  open: boolean
  onClose: () => void
  ansokanId: string
  typ: ApplicationEventType | null
  genomforda: number
  /** Dagen tjänsten söktes; ingen händelse får ligga före den. */
  sokt: Dag
  onSparat: (typ: ApplicationEventType) => void
}) {
  const idag = idagSv()
  const [typ, setTyp] = useState<ApplicationEventType | null>(forval)
  const [datum, setDatum] = useState(idag)
  const [intDag, setIntDag] = useState('')
  const [intTid, setIntTid] = useState('')
  const [plats, setPlats] = useState('')
  const [notis, setNotis] = useState('')
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTyp(forval)
    setDatum(idagSv())
    setIntDag('')
    setIntTid('')
    setPlats('')
    setNotis('')
    setFel(null)
  }, [open, forval])

  const spara = async () => {
    if (!typ) return
    const foreSokt = handelseForeSokt(typ, datum || idag, sokt)
    if (foreSokt) {
      setFel(foreSokt)
      return
    }
    setSparar(true)
    setFel(null)
    try {
      await anropa(`/api/applications/${ansokanId}/events`, 'POST', {
        event_type: typ,
        occurred_at: datum || idag,
        note: notis.trim() || null,
        ...(typ === 'interview_invited' && intDag ? { intervju: { datum: intDag, tid: intTid || null, plats: plats.trim() || null } } : {}),
      })
      onSparat(typ)
      onClose()
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Det gick inte att spara just nu.')
    } finally {
      setSparar(false)
    }
  }

  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik={forval ? handelseNamn(forval, genomforda) : 'Lägg till händelse'}
      fot={
        <StorKnapp bred onClick={spara} disabled={!typ || sparar}>
          {sparar ? 'Sparar' : 'Spara händelsen'}
        </StorKnapp>
      }
    >
      {!forval ? (
        <ValRad etikett="Vad hände?">
          {VAL.map((v) => (
            <ValKnapp key={v.typ} form="rad" vald={typ === v.typ} onClick={() => setTyp(v.typ)} ikon={v.ikon}>
              {handelseNamn(v.typ, genomforda)}
            </ValKnapp>
          ))}
        </ValRad>
      ) : null}
      <Falt etikett={typ === 'interview_invited' || typ === 'test_invited' ? 'Dagen du blev kallad' : 'Datum'} typ="datum" value={datum} min={typ === 'applied' ? undefined : sokt} max={idag} onChange={(e) => setDatum(e.target.value)} />
      {typ === 'interview_invited' ? (
        <>
          <Falt etikett="Intervjuns dag" tillagg="valfritt" typ="datum" value={intDag} min={idag} onChange={(e) => setIntDag(e.target.value)} />
          <Falt etikett="Tid" tillagg="valfritt" typ="tid" value={intTid} onChange={(e) => setIntTid(e.target.value)} disabled={!intDag} />
          <Falt etikett="Plats" tillagg="valfritt" value={plats} onChange={(e) => setPlats(e.target.value)} maxLength={200} placeholder="Till exempel på plats, video eller telefon" />
        </>
      ) : null}
      <TextFalt etikett="Anteckning" tillagg="valfritt" value={notis} onChange={(e) => setNotis(e.target.value)} rows={2} maxLength={2000} placeholder="Vem du träffade eller vad som sades" />
      <Fel text={fel} />
    </Ark>
  )
}

/* ----------------------------------------------------- Intervjuns tid */

/**
 * Intervjuns tid: "Ändra tid" (PUT /api/jobbsok/intervju/[id]) och "Den blev
 * flyttad" (POST .../utfall med svar flyttad). Tiden är valfri, dagen krävs.
 */
export function IntervjuTidArk({
  open,
  onClose,
  ansokanId,
  tid,
  plats: nuvarandePlats,
  flyttad,
  onSparat,
}: {
  open: boolean
  onClose: () => void
  ansokanId: string
  tid: string | null
  plats: string | null
  /** "Den blev flyttad": loggas som utfall. */
  flyttad?: boolean
  onSparat: () => void
}) {
  const idag = idagSv()
  const [dag, setDag] = useState('')
  const [kl, setKl] = useState('')
  const [plats, setPlats] = useState('')
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  useEffect(() => {
    if (!open) return
    setDag(flyttad ? '' : dagFor(tid) ?? '')
    setKl(flyttad ? '' : (klockslag(tid) ?? '').replace('.', ':'))
    setPlats(nuvarandePlats ?? '')
    setFel(null)
  }, [open, tid, nuvarandePlats, flyttad])

  const spara = async () => {
    if (!dag) return
    setSparar(true)
    setFel(null)
    try {
      const kropp = { datum: dag, tid: kl || null, plats: plats.trim() || null }
      if (flyttad) await anropa(`/api/jobbsok/intervju/${ansokanId}/utfall`, 'POST', { svar: 'flyttad', ...kropp })
      else await anropa(`/api/jobbsok/intervju/${ansokanId}`, 'PUT', kropp)
      onSparat()
      onClose()
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Det gick inte att spara just nu.')
    } finally {
      setSparar(false)
    }
  }
  const taBort = async () => {
    setSparar(true)
    try {
      await anropa(`/api/jobbsok/intervju/${ansokanId}`, 'DELETE')
      onSparat()
      onClose()
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Det gick inte att ta bort tiden just nu.')
    } finally {
      setSparar(false)
    }
  }

  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik={flyttad ? 'Ny tid för intervjun' : tid ? 'Ändra tid' : 'Sätt tid för intervjun'}
      text={flyttad ? 'Vi frågar hur det gick dagen efter den nya tiden.' : undefined}
      bredd={480}
      fot={
        <StorKnapp bred onClick={spara} disabled={!dag || sparar}>
          {sparar ? 'Sparar' : 'Spara tiden'}
        </StorKnapp>
      }
    >
      <Falt etikett="Dag" typ="datum" value={dag} min={flyttad ? idag : undefined} onChange={(e) => setDag(e.target.value)} />
      <Falt etikett="Tid" tillagg="valfritt" typ="tid" value={kl} onChange={(e) => setKl(e.target.value)} />
      <Falt etikett="Plats" tillagg="valfritt" value={plats} onChange={(e) => setPlats(e.target.value)} maxLength={200} />
      {!flyttad && tid ? (
        <div style={{ marginTop: 12 }}>
          <LitenKnapp onClick={taBort} disabled={sparar}>
            Ta bort tiden
          </LitenKnapp>
        </div>
      ) : null}
      <Fel text={fel} />
    </Ark>
  )
}

/* -------------------------------------------------------- bekräftelse */

export function BekraftArk({
  open,
  onClose,
  rubrik,
  text,
  knapp,
  onJa,
}: {
  open: boolean
  onClose: () => void
  rubrik: string
  text: string
  knapp: string
  onJa: () => Promise<void>
}) {
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  useEffect(() => {
    if (open) setFel(null)
  }, [open])
  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik={rubrik}
      text={text}
      bredd={480}
      fot={
        <div className="flex flex-wrap gap-3">
          <LitenKnapp
            storlek={52}
            disabled={sparar}
            onClick={async () => {
              setSparar(true)
              setFel(null)
              try {
                await onJa()
                onClose()
              } catch (e) {
                setFel(e instanceof Error ? e.message : 'Det gick inte just nu. Försök igen.')
              } finally {
                setSparar(false)
              }
            }}
          >
            {sparar ? 'Tar bort' : knapp}
          </LitenKnapp>
          <LitenKnapp storlek={52} variant="streckad" onClick={onClose}>
            Avbryt
          </LitenKnapp>
        </div>
      }
    >
      <Fel text={fel} />
    </Ark>
  )
}

/* ------------------------------------------------- Hur gick intervjun? */

/**
 * De tre svaren (F6). "Den är genomförd" loggar Intervju genomförd på
 * intervjudagen, "Den blev inställd" tar bort tiden, "Den blev flyttad"
 * öppnar arket för ny tid (vyn sköter det via onFlyttad).
 */
export function HurGickSvar({ ansokanId, onKlar, onFlyttad, mork }: { ansokanId: string; onKlar: () => void; onFlyttad: () => void; mork?: boolean }) {
  const [sparar, setSparar] = useState<string | null>(null)
  const [fel, setFel] = useState<string | null>(null)
  const svara = async (svar: 'genomford' | 'installd') => {
    setSparar(svar)
    setFel(null)
    try {
      await anropa(`/api/jobbsok/intervju/${ansokanId}/utfall`, 'POST', { svar })
      onKlar()
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Det gick inte att spara just nu.')
    } finally {
      setSparar(null)
    }
  }
  const variant = mork ? 'morkt' : 'vit'
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <LitenKnapp storlek={48} variant={variant} ikon={<IkonBock />} onClick={() => svara('genomford')} disabled={!!sparar}>
          {sparar === 'genomford' ? 'Sparar' : 'Den är genomförd'}
        </LitenKnapp>
        <LitenKnapp storlek={48} variant={variant} ikon={<IkonKalender />} onClick={onFlyttad} disabled={!!sparar}>
          Den blev flyttad
        </LitenKnapp>
        <LitenKnapp storlek={48} variant={variant} ikon={<IkonAvslag />} onClick={() => svara('installd')} disabled={!!sparar}>
          {sparar === 'installd' ? 'Sparar' : 'Den blev inställd'}
        </LitenKnapp>
      </div>
      <Fel text={fel} />
    </div>
  )
}

