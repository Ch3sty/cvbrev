'use client'

/**
 * "När är intervjun?" i sektionen Intervjuer på gång (Jobbsöket omgång 2,
 * byggspec 9.2 till 9.7). Klientö som IntervjuHubb alltid ritar direkt under
 * sektionens rubrik, så att kvittensen överlever router.refresh() när listan
 * fylls.
 *
 *   tom lista   det öppna kortet (TomtLage) och raden "Har du fått en
 *               intervjutid?" ritas båda; attributet data-intervjufraga på
 *               <html> väljer vilket som syns (skriptet i IntervjuHubb sätter
 *               det före första ritningen, så Hoppa över flyttar inget)
 *   arket       Dag, Tid, Plats, sedan tjänsten: ett val bland sökta tjänster
 *               eller Tjänst, Arbetsgivare och Datum sökt (tomt, obligatoriskt)
 *   spara       POST /api/applications (bara ny tjänst), sedan
 *               POST /api/applications/<id>/events med kallelsen och tiden
 */

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Ark,
  Bricka,
  Falt,
  GruppEtikett,
  IkonKalender,
  IkonPlus,
  Kort,
  LitenKnapp,
  StorKnapp,
  TextLank,
  TomtLage,
  ValKnapp,
  ValRad,
} from '@/components/jobb3/kit'
import { anropa } from '@/components/jobb3/sokta/SmaArk'
import { capture } from '@/lib/analytics/events'
import { idagSv } from '@/lib/jobbsok/datum'
import { tjanstHref } from '@/lib/jobbsok/adress'
import type { ValbarForIntervju } from '@/lib/jobbsok/intervju'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { useNotification } from '@/context/notificationcontext'
import { HUBB } from './text'

const T = HUBB.fraga

/** Nyckeln och attributet för "Ingen intervju bokad än" (9.3). */
export const IHOP_NYCKEL = 'intervjufraga_ihop'
const ATTRIBUT = 'data-intervjufraga'

/** Värdet för "En annan tjänst" bland valen. */
const ANNAN = '__annan__'

/** Så många valbara tjänster visas innan "Visa alla". */
const VISAS_FORST = 5

type FelNyckel = 'dag' | 'val' | 'tjanst' | 'arbetsgivare' | 'sokt'
type Fel = Partial<Record<FelNyckel, string>>
const FEL_ORDNING: readonly FelNyckel[] = ['dag', 'val', 'tjanst', 'arbetsgivare', 'sokt']

export interface Ifyllt {
  dag: string
  tjanst: string
  arbetsgivare: string
  sokt: string
  /** Vald tjänst (id), ANNAN eller null. */
  val: string | null
}

/** Felraderna i 9.4. `harValbara`: arket visar val bland sökta tjänster. */
export function valideraIntervjuFraga(f: Ifyllt, harValbara: boolean): Fel {
  const fel: Fel = {}
  if (!f.dag) fel.dag = T.fel.dag
  const nyTjanst = !harValbara || f.val === ANNAN
  if (harValbara && f.val === null) fel.val = T.fel.val
  if (nyTjanst) {
    if (!f.tjanst.trim()) fel.tjanst = T.fel.tjanst
    if (!f.arbetsgivare.trim()) fel.arbetsgivare = T.fel.arbetsgivare
    if (!f.sokt) fel.sokt = T.fel.sokt
    else if (f.dag && f.sokt > f.dag) fel.sokt = T.fel.soktEfter
  }
  return fel
}

function lasIhop(): boolean {
  try {
    return window.localStorage.getItem(IHOP_NYCKEL) === '1'
  } catch {
    return false
  }
}

function sattIhop(ihop: boolean) {
  const html = document.documentElement
  if (ihop) html.setAttribute(ATTRIBUT, 'ihop')
  else html.removeAttribute(ATTRIBUT)
}

export default function IntervjuFraga({ tom, valbara }: { tom: boolean; valbara: readonly ValbarForIntervju[] }) {
  const router = useRouter()
  const { refresh: refreshSummering } = useDashboardData()
  const { logActivity } = useNotification()
  const id = useId()
  const radRef = useRef<HTMLSpanElement>(null)
  const valRef = useRef<HTMLDivElement>(null)

  const [oppen, setOppen] = useState(false)
  const [dag, setDag] = useState('')
  const [tid, setTid] = useState('')
  const [plats, setPlats] = useState('')
  const [val, setVal] = useState<string | null>(null)
  const [allaVisas, setAllaVisas] = useState(false)
  const [tjanst, setTjanst] = useState('')
  const [arbetsgivare, setArbetsgivare] = useState('')
  const [sokt, setSokt] = useState('')
  const [fel, setFel] = useState<Fel>({})
  const [allmantFel, setAllmantFel] = useState<string | null>(null)
  const [sparar, setSparar] = useState(false)
  /** Tjänsten anrop 1 skapade. Hålls tills arket stängs, så att den aldrig skapas två gånger (9.5). */
  const [skapad, setSkapad] = useState<{ id: string; jobTitle: string; company: string } | null>(null)
  const [kvittens, setKvittens] = useState<string | null>(null)

  // Vid klientnavigering körs inte skriptet i IntervjuHubb: ön läser nyckeln själv.
  useEffect(() => {
    sattIhop(lasIhop())
  }, [])

  const harValbara = valbara.length > 0
  const nyTjanst = !harValbara || val === ANNAN
  const idag = idagSv()
  const fid = (n: string) => `${id}-${n}`

  const oppna = () => {
    setDag('')
    setTid('')
    setPlats('')
    setVal(null)
    setAllaVisas(false)
    setTjanst('')
    setArbetsgivare('')
    setSokt('')
    setFel({})
    setAllmantFel(null)
    setSkapad(null)
    setOppen(true)
    capture('tjanstfraga_val', { plats: 'intervju-hubb', val: 'oppnad' })
  }

  const stang = () => {
    setOppen(false)
    // En tjänst som skapades men fick ingen intervju syns nu bland valen.
    if (skapad) router.refresh()
    setSkapad(null)
  }

  const hoppa = () => {
    try {
      window.localStorage.setItem(IHOP_NYCKEL, '1')
    } catch {
      // Utan lagring gäller valet tills sidan laddas om.
    }
    sattIhop(true)
    radRef.current?.querySelector<HTMLElement>('button, a')?.focus()
    capture('tjanstfraga_val', { plats: 'intervju-hubb', val: 'hoppad' })
  }

  const rensa = (n: FelNyckel) => setFel((f) => (f[n] ? { ...f, [n]: undefined } : f))

  const fokuseraFel = (f: Fel) => {
    const forsta = FEL_ORDNING.find((n) => f[n])
    if (!forsta) return
    if (forsta === 'val') valRef.current?.querySelector<HTMLElement>('button')?.focus()
    else document.getElementById(fid(forsta))?.focus()
  }

  const spara = async () => {
    const f = valideraIntervjuFraga({ dag, tjanst, arbetsgivare, sokt, val }, harValbara)
    setFel(f)
    if (Object.keys(f).length > 0) {
      fokuseraFel(f)
      return
    }
    setSparar(true)
    setAllmantFel(null)

    let tjanstId: string | null = nyTjanst ? skapad?.id ?? null : val
    let ny = skapad
    if (!tjanstId) {
      try {
        const r = await anropa('/api/applications', 'POST', {
          job_title: tjanst.trim(),
          company: arbetsgivare.trim(),
          applied_at: sokt,
          application_channel: 'ad',
        })
        ny = { id: r.data.id as string, jobTitle: r.data.job_title as string, company: r.data.company as string }
        tjanstId = ny.id
        setSkapad(ny)
      } catch {
        setAllmantFel(T.gickInte)
        setSparar(false)
        return
      }
    }

    try {
      await anropa(`/api/applications/${tjanstId}/events`, 'POST', {
        event_type: 'interview_invited',
        intervju: { datum: dag, tid: tid || null, plats: plats.trim() || null },
        fran: 'intervju-hubb',
      })
    } catch {
      setAllmantFel(ny && nyTjanst ? T.tjanstSparad : T.gickInte)
      setSparar(false)
      return
    }

    setSparar(false)
    setOppen(false)
    setSkapad(null)
    try {
      window.localStorage.removeItem(IHOP_NYCKEL)
    } catch {
      // ingen lagring
    }
    sattIhop(false)
    if (ny && nyTjanst) {
      void logActivity('application_logged', `Loggade en sökt tjänst: ${ny.jobTitle} hos ${ny.company}`, {
        applicationId: ny.id,
        channel: 'ad',
        fran: 'intervju-hubb',
      })
    }
    setKvittens(tjanstId)
    router.refresh()
    void refreshSummering()
  }

  const visade = allaVisas ? valbara : valbara.slice(0, VISAS_FORST)

  return (
    <>
      {kvittens ? (
        <p className="j3-under" role="status">
          {T.kvittens}{' '}
          <TextLank href={tjanstHref(kvittens, 'forbered', 'intervju-hubb')}>{T.oppna}</TextLank>
        </p>
      ) : null}

      {tom ? (
        <div className="mt-[18px]">
          <div className="j3c-fraga-oppen">
            <TomtLage
              ikon={<IkonKalender />}
              rubrik={T.rubrik}
              text={T.text}
              handling={
                <div className="j3c-tomt-tva">
                  <LitenKnapp onClick={oppna}>{T.knapp}</LitenKnapp>
                  <TextLank onClick={hoppa}>{T.hoppa}</TextLank>
                </div>
              }
            />
          </div>
          <div className="j3c-fraga-ihop">
            <Kort className="j3c-ihop">
              <span className="j3-sido-ik" aria-hidden="true">
                <IkonKalender size={20} />
              </span>
              <div className="j3c-ihop-text">
                <b>{T.radRubrik}</b>
                <small>{T.radText}</small>
              </div>
              <span ref={radRef}>
                <LitenKnapp onClick={oppna}>{T.radKnapp}</LitenKnapp>
              </span>
            </Kort>
          </div>
        </div>
      ) : null}

      <Ark
        open={oppen}
        onClose={stang}
        rubrik={T.arkRubrik}
        text={harValbara ? T.arkTextVal : T.arkTextNy}
        bredd={520}
        fot={
          <>
            <StorKnapp bred onClick={spara} disabled={sparar}>
              {sparar ? T.sparar : T.spara}
            </StorKnapp>
            <p>{T.fot}</p>
          </>
        }
      >
        <div className="j3c-tva">
          <Falt
            id={fid('dag')}
            etikett={T.dag}
            typ="datum"
            value={dag}
            fel={fel.dag}
            onChange={(e) => {
              setDag(e.target.value)
              rensa('dag')
            }}
          />
          <Falt id={fid('tid')} etikett={T.tid} tillagg={T.valfritt} typ="tid" value={tid} onChange={(e) => setTid(e.target.value)} />
        </div>
        <Falt
          id={fid('plats')}
          etikett={T.plats}
          tillagg={T.valfritt}
          value={plats}
          maxLength={200}
          placeholder={T.platsHallare}
          onChange={(e) => setPlats(e.target.value)}
        />

        <GruppEtikett id={fid('vilken')}>{T.vilken}</GruppEtikett>
        {harValbara ? (
          <div ref={valRef} className="j3c-tjanstval">
            {/* En rad per tjänst i full bredd: titeln som huvudtext, arbetsgivaren under (9.4, efter klicktestet). */}
            <ValRad etikett={T.vilken}>
              {visade.map((t) => (
                <ValKnapp
                  key={t.id}
                  form="rad"
                  vald={val === t.id}
                  ikon={<Bricka kod={t.bokstaver} dator={44} />}
                  onClick={() => {
                    setVal(t.id)
                    rensa('val')
                  }}
                >
                  <span className="j3c-tjanstval-titel">{t.jobTitle}</span>
                  <span className="sr-only">, </span>
                  <span className="j3c-tjanstval-ag">{t.company}</span>
                </ValKnapp>
              ))}
              <ValKnapp
                form="rad"
                vald={val === ANNAN}
                ikon={<IkonPlus />}
                onClick={() => {
                  setVal(ANNAN)
                  rensa('val')
                }}
              >
                {T.annan}
              </ValKnapp>
            </ValRad>
            {valbara.length > VISAS_FORST && !allaVisas ? (
              <div className="j3c-visa-alla">
                <TextLank onClick={() => setAllaVisas(true)}>{T.visaAlla}</TextLank>
              </div>
            ) : null}
            {fel.val ? <p className="j3-falt-fel">{fel.val}</p> : null}
          </div>
        ) : null}

        {nyTjanst ? (
          <>
            <Falt
              id={fid('tjanst')}
              etikett={T.tjanst}
              value={tjanst}
              maxLength={200}
              placeholder={T.tjanstHallare}
              fel={fel.tjanst}
              onChange={(e) => {
                setTjanst(e.target.value)
                rensa('tjanst')
              }}
            />
            <Falt
              id={fid('arbetsgivare')}
              etikett={T.arbetsgivare}
              value={arbetsgivare}
              maxLength={200}
              placeholder={T.arbetsgivareHallare}
              fel={fel.arbetsgivare}
              onChange={(e) => {
                setArbetsgivare(e.target.value)
                rensa('arbetsgivare')
              }}
            />
            <Falt
              id={fid('sokt')}
              etikett={T.sokt}
              typ="datum"
              value={sokt}
              max={idag}
              hjalp={T.soktHjalp}
              fel={fel.sokt}
              onChange={(e) => {
                setSokt(e.target.value)
                rensa('sokt')
              }}
            />
          </>
        ) : null}

        {allmantFel ? (
          <p className="j3-falt-fel" role="alert">
            {allmantFel}
          </p>
        ) : null}
      </Ark>
    </>
  )
}
