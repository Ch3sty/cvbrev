'use client'

/**
 * Nytt intervjuprov i rummets form (skissen Intervju-svar). Samma två steg,
 * samma API och samma mätning som dagens flöde (NyttProvFlow med
 * Intervjuprov i flödesläge), nu i väggen och panelen:
 *
 *   steg 1  ?steg=fraga  de sju frågorna som valrader, "Fortsätt"
 *   steg 2  ?steg=svar   väggen med frågan och STAR-delarna, det linjerade
 *                        papperet, räknaren och "Bedöm mitt svar"
 *
 * Väntan, för kort, för långt, irrelevant, serverfel, nätfel och kvoten
 * (429/503) har alla kvar sina texter ur intervjuprov-copy.ts. Resultatet
 * landar på /dashboard/intervju/{token} och ersätter stegen i historiken.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Topprad from '@/components/rum/Topprad'
import {
  Felruta,
  GlasKnapp,
  Golv,
  IkonBock,
  IkonKlocka,
  IkonNed,
  JobbVagg,
  Kort,
  LinjeratSvar,
  LyftPanel,
  Notis,
  PanelHuvud,
  Prickar,
  Punkter,
  Spalter,
  StarBrickor,
  StorKnapp,
  TextLank,
  VaggHero,
  VaggText,
} from '@/components/jobb3/kit'
import { FRAGA_ORDNING, FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { COPY, MAX_TECKEN, MIN_TECKEN } from '@/components/artiklar/intervjuprov/intervjuprov-copy'
import { capture } from '@/lib/analytics/events'
import { avslutaFlodet } from '@/lib/flow/flodeshistorik'
import { useFlodeshistorik } from '@/lib/flow/useFlodeshistorik'
import { useBetalvaggVisad } from '@/hooks/useBetalvaggVisad'
import { INFOR_INTERVJUN_HREF } from '@/lib/intervju/lankar'
import { dagEtikett, saknadesFras } from '@/lib/intervju/nasta'
import { NY } from '@/app/dashboard/intervju/infor-intervjun-copy'
import { DELAR, STARKT_STAR, SVAR, VAL, fragaNr, nivaOrd, saknadDel, starForklaring, storBokstav } from './text'

export interface ForraSvaret {
  level: number
  missingKind: string
  createdAt: string
  /** "Det som saknas" ur förra bedömningen. */
  missing: string | null
}

type FelTyp = 'server' | 'natverk' | 'irrelevant'

interface Kvot {
  text: string
  upgradeHref?: string
}

const tal = (n: number) => n.toLocaleString('sv-SE')
const TILLBAKA = { href: INFOR_INTERVJUN_HREF, text: 'Inför intervjun' }

/** Stegraden i väggens topp (dator): Välj fråga, Ditt svar. */
function Stegrad({ steg }: { steg: 1 | 2 }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 hidden h-12 -translate-x-1/2 items-center xl:flex" aria-label={`Steg ${steg} av 2`}>
      <span className="j3c-steg">
        {steg === 2 ? (
          <i className="klar" aria-hidden="true">
            <IkonBock size={14} bredd={2.6} />
          </i>
        ) : (
          <i className="nu" aria-hidden="true">
            1
          </i>
        )}
        {steg === 1 ? <b>{NY.steg1}</b> : NY.steg1}
        <svg width="28" height="4" viewBox="0 0 28 4" aria-hidden="true">
          <path d="M2 2h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
        </svg>
        <i className={steg === 2 ? 'nu' : ''} aria-hidden="true" style={steg === 1 ? { boxShadow: 'inset 0 0 0 2px currentColor' } : undefined}>
          2
        </i>
        {steg === 2 ? <b>{NY.steg2}</b> : NY.steg2}
      </span>
    </div>
  )
}

export default function SvarFlode({
  rekommenderad,
  forvald,
  antal,
  basta,
  senaste,
  forra,
  intervju,
}: {
  rekommenderad: FragaId
  forvald: FragaId | null
  antal: Partial<Record<FragaId, number>>
  basta: Partial<Record<FragaId, number>>
  senaste: Record<string, number>
  forra: ForraSvaret | null
  intervju: { company: string; nar: string } | null
}) {
  const router = useRouter()
  const params = useSearchParams()
  const urlFraga = params.get('fraga')
  const giltigFraga = urlFraga && (FRAGA_ORDNING as string[]).includes(urlFraga) ? (urlFraga as FragaId) : null
  const urlSteg: 1 | 2 = params.get('steg') === 'fraga' ? 1 : params.get('steg') === 'svar' || giltigFraga ? 2 : 1
  const stillaSteg = useRef(urlSteg)
  const { fore, stilla } = useFlodeshistorik(params.toString(), () => true)
  if (!stilla) stillaSteg.current = urlSteg
  const steg = stilla ? stillaSteg.current : urlSteg

  const [vald, setVald] = useState<FragaId>(forvald ?? rekommenderad)
  const fraga: FragaId = giltigFraga ?? vald

  const gaTill = useCallback(
    (s: 'fraga' | 'svar', f: FragaId) => {
      const q = new URLSearchParams(params.toString())
      q.set('steg', s)
      q.set('fraga', f)
      fore('push')
      router.push(`/dashboard/intervju/ny?${q.toString()}`)
    },
    [params, router, fore]
  )

  if (steg === 1) {
    return (
      <>
        <JobbVagg hojd={330} hojdMobil={300} flik={false} tillbaka={TILLBAKA} atgarder={<Topprad bara="atgarder" />}>
          <Stegrad steg={1} />
          <div className="mt-6 xl:mt-[30px]">
            <VaggText ogon={VAL.ogon} rubrik={VAL.rubrik} ingress={VAL.ingress} bredIngress />
          </div>
        </JobbVagg>
        <Golv>
          <LyftPanel tat etikett={NY.fraga}>
            <div role="radiogroup" aria-label={NY.fraga}>
              {FRAGA_ORDNING.map((id, i) => {
                const rek = id === rekommenderad
                const n = senaste[id]
                return (
                  <button key={id} type="button" role="radio" aria-checked={vald === id} className="j3c-val" onClick={() => setVald(id)}>
                    <span className="j3c-val-nr" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <b>{FRAGOR[id].text.replace(/\.$/, '')}</b>
                      <small>{FRAGOR[id].beskrivning}</small>
                      <span className="j3c-val-meta">
                        {rek ? <span className="j3c-val-rek">{NY.rekommenderas}</span> : null}
                        {n ? <Prickar antal={n} variant="mini" etikett={`Senast ${n} av 5`} /> : null}
                        <span>{NY.meta(antal[id] ?? 0, basta[id])}</span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end border-t-2 border-[var(--j3-linje)] p-4 xl:px-6 xl:py-5">
              <StorKnapp golv storlek="mellan" onClick={() => gaTill('svar', vald)}>
                {NY.fortsatt}
              </StorKnapp>
            </div>
          </LyftPanel>
        </Golv>
      </>
    )
  }

  return <SvarSteg key={fraga} fraga={fraga} forra={forvald === fraga ? forra : null} intervju={intervju} onByt={() => gaTill('fraga', fraga)} />
}

function SvarSteg({ fraga, forra, intervju, onByt }: { fraga: FragaId; forra: ForraSvaret | null; intervju: { company: string; nar: string } | null; onByt: () => void }) {
  const router = useRouter()
  const f = FRAGOR[fraga]
  const [text, setText] = useState('')
  const [laddar, setLaddar] = useState(false)
  const [langVantan, setLangVantan] = useState(false)
  const [felKort, setFelKort] = useState(false)
  const [felLangt, setFelLangt] = useState(false)
  const [fel, setFel] = useState<FelTyp | null>(null)
  const [kvot, setKvot] = useState<Kvot | null>(null)
  const faltRef = useRef<HTMLTextAreaElement>(null)
  const felRef = useRef<HTMLDivElement>(null)
  const startadRef = useRef(false)
  useBetalvaggVisad('intervjuprov', Boolean(kvot?.upgradeHref))

  const langd = text.trim().length
  const saknas = forra && forra.level < 5 ? saknadDel(forra.missingKind) : null

  useEffect(() => {
    if (!laddar) {
      setLangVantan(false)
      return
    }
    const t = setTimeout(() => setLangVantan(true), 20_000)
    return () => clearTimeout(t)
  }, [laddar])

  useEffect(() => {
    if (fel) felRef.current?.focus()
  }, [fel])

  function onInput(v: string) {
    if (!startadRef.current && v.length > 0) {
      startadRef.current = true
      capture('interview_practice_started', { question: fraga, surface: 'dashboard' })
    }
    setText(v)
    if (felKort && v.trim().length >= MIN_TECKEN) setFelKort(false)
    if (felLangt && v.trim().length <= MAX_TECKEN) setFelLangt(false)
    if (fel) setFel(null)
  }

  async function bedom() {
    if (laddar) return
    if (langd < MIN_TECKEN) {
      setFelKort(true)
      faltRef.current?.focus()
      return
    }
    setFel(null)
    setFelKort(false)
    setFelLangt(false)
    setLaddar(true)
    try {
      const res = await fetch('/api/public/intervjuprov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: fraga, answer: text, slug: 'dashboard/intervju/ny' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && typeof data.href === 'string') {
        capture('interview_practice_completed', { question: fraga, level: data.level, surface: 'dashboard' })
        avslutaFlodet(router, data.href)
        return
      }
      setLaddar(false)
      if (data.error === 'too_short') {
        setFelKort(true)
        faltRef.current?.focus()
      } else if (data.error === 'too_long') {
        setFelLangt(true)
        faltRef.current?.focus()
      } else if (data.error === 'irrelevant') {
        setFel('irrelevant')
      } else if (res.status === 429 || res.status === 503) {
        setKvot({
          text: typeof data.message === 'string' ? data.message : COPY.kvot.inloggad,
          upgradeHref: typeof data.upgradeHref === 'string' ? data.upgradeHref : undefined,
        })
      } else {
        setFel('server')
      }
    } catch {
      setLaddar(false)
      setFel('natverk')
    }
  }

  const hjalp = felKort ? COPY.fel.kort(fraga) : felLangt ? COPY.fel.langt : null
  const felCopy = fel === 'irrelevant' ? COPY.fel.irrelevant : fel === 'natverk' ? COPY.fel.natverk : COPY.fel.server
  // Långa frågor kortas i väggen ("Berätta om ett problem du löste"); hela frågan står i ingressen.
  const kortRubrik = f.text.length > 40 ? `Berätta om ${f.bestamd}` : f.text.replace(/\.$/, '')
  const ogonDel = intervju ? ` · inför ${intervju.company} ${intervju.nar}` : ''

  const lyssnar = (
    <div className="mt-5 w-full xl:mt-0 xl:w-[520px]">
      <p className="j3-vaggtext-rad">{SVAR.lyssnar}</p>
      {f.starChips ? (
        <div className="j3c-utan-bock mt-6 xl:mt-[26px]">
          <StarBrickor pa="vagg" delar={starForklaring(saknas)} marke={SVAR.saknadesSist} />
        </div>
      ) : (
        <Punkter vagg punkter={(DELAR[fraga] ?? []).map((d, i) => ({ ikon: <b>{i + 1}</b>, text: d }))} />
      )}
    </div>
  )

  return (
    <>
      <JobbVagg hojd={444} hojdMobil={400} flik={false} tillbaka={TILLBAKA} handling={<GlasKnapp onClick={onByt}>{SVAR.bytFraga}</GlasKnapp>} atgarder={<Topprad bara="atgarder" />}>
        <Stegrad steg={2} />
        <VaggHero spalt={520} glapp={40} topp={30} bild={lyssnar}>
          <VaggText
            ogon={`Fråga ${fragaNr(fraga)} av 7${ogonDel}`}
            rubrik={kortRubrik}
            ingress={kortRubrik !== f.text.replace(/\.$/, '') ? `${f.text} Skriv ditt svar som du skulle säga det.` : `${f.beskrivning} Skriv ditt svar som du skulle säga det.`}
            ingressMobil="Skriv ditt svar som du skulle säga det."
          />
        </VaggHero>
      </JobbVagg>

      <Golv>
        <Spalter sido={360} tat>
          <LyftPanel rubrikId="svar-rubrik" luft="24px 28px 28px">
            <PanelHuvud ogon={SVAR.ogon} rubrik={<label htmlFor="j3c-svar" className="whitespace-nowrap">{SVAR.rubrik}</label>} rubrikId="svar-rubrik" hoger={<span className="j3-text">{SVAR.hoger}</span>} />
            {kvot ? (
              <div className="mt-[18px]">
                <Notis ikon={<IkonKlocka size={20} />} rubrik={kvot.text} text={kvot.upgradeHref ? <TextLank href={kvot.upgradeHref}>{COPY.kvot.inloggadLank}</TextLank> : undefined} />
              </div>
            ) : null}
            <div className="mt-[18px]">
              <LinjeratSvar>
                <textarea
                  id="j3c-svar"
                  ref={faltRef}
                  value={text}
                  onChange={(e) => onInput(e.target.value)}
                  readOnly={laddar}
                  maxLength={MAX_TECKEN}
                  placeholder={f.platshallare}
                  aria-invalid={felKort || felLangt || undefined}
                  aria-describedby="j3c-svar-hjalp"
                />
              </LinjeratSvar>
            </div>
            <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between xl:gap-7">
              <div className="j3c-raknare">
                <div className="j3c-raknare-bar" aria-hidden="true">
                  <span className="j3c-raknare-fyll" style={{ width: `${Math.min(100, (langd / MAX_TECKEN) * 100)}%` }} />
                  <span className="j3c-raknare-min" style={{ left: `${(MIN_TECKEN / MAX_TECKEN) * 100}%` }} />
                </div>
                {hjalp ? (
                  <p id="j3c-svar-hjalp" role="alert" className="fel">
                    {hjalp}
                  </p>
                ) : (
                  <p id="j3c-svar-hjalp">
                    <b>{`${tal(langd)} av ${tal(MAX_TECKEN)} tecken.`}</b> {SVAR.strecket(MIN_TECKEN)}
                  </p>
                )}
                <span className="sr-only" aria-live="polite">
                  {langd >= 50 ? `${tal(Math.floor(langd / 50) * 50)} tecken` : ''}
                </span>
              </div>
              {kvot ? null : (
                <StorKnapp golv onClick={bedom} disabled={laddar}>
                  {laddar ? NY.busy : NY.bedom}
                </StorKnapp>
              )}
            </div>
            {laddar ? (
              <p className="mt-3 mb-0" role="status">
                <span className="j3-text">
                  <b>{COPY.laddar.rubrik}.</b> {langVantan ? COPY.laddar.lang : COPY.laddar.meta}
                </span>
              </p>
            ) : null}
            {fel ? (
              <div ref={felRef} tabIndex={-1} className="mt-4 focus:outline-none">
                <Felruta text={`${felCopy.rubrik}. ${felCopy.text}`} onForsok={fel === 'irrelevant' ? () => faltRef.current?.focus() : () => void bedom()} />
              </div>
            ) : null}
          </LyftPanel>

          <aside className="mt-[30px] flex flex-col gap-4 xl:mt-7" aria-label="Stöd för svaret">
            {forra ? (
              <Kort luft>
                <details className="j3c-forra">
                  <summary>
                    <span>
                      <b className="block text-[15px] leading-5">{SVAR.forra(forra.level)}</b>
                      <span className="mt-1 flex items-center gap-2">
                        <Prickar antal={forra.level} etikett={`${forra.level} av 5`} />
                        <span className="j3-fin">{`${nivaOrd(forra.level)}, ${dagEtikett(forra.createdAt).toLocaleLowerCase('sv-SE')}`}</span>
                      </span>
                    </span>
                    <IkonNed size={22} />
                  </summary>
                  <p className="j3c-forra-text">
                    {forra.missing ? `${forra.missing} ` : ''}
                    {forra.level < 5 && forra.missingKind ? `${storBokstav(saknadesFras(forra.missingKind, fraga))} saknades.` : ''}
                  </p>
                </details>
              </Kort>
            ) : null}
            <Kort luft>
              <b className="j3c-kortrubrik">{SVAR.starkt}</b>
              {f.starChips ? (
                <ol className="j3c-tips">
                  {STARKT_STAR.map((t, i) => (
                    <li key={t}>
                      <i aria-hidden="true">{i + 1}</i>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-3">
                  <p className="j3-text">{f.tips}</p>
                </div>
              )}
            </Kort>
            <div className="px-1"><p className="j3-fin">{SVAR.fot}</p></div>
          </aside>
        </Spalter>
      </Golv>
    </>
  )
}
