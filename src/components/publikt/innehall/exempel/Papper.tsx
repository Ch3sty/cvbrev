/**
 * Papperet på exempelsidorna (spec-publikt-v2 del B 3.3, ExempelArk): CV:t
 * och brevet serverrenderade ur exempeldatan, så att texten finns i HTML
 * och inte bara i RSC-datan som när förhandsvisningen hade ssr: false.
 *
 * Inga rubriker inne i papperet: sektionernas namn är p.ark-h, så att
 * sidans rubrikträd står kvar. Notnumren står vid sitt ankare.
 *
 * Utdragen i hjälten är aria-hidden: samma text står i papperet längre ner.
 */

import type { ReactNode } from 'react'
import type { Ankare } from './exempel-data'
import { brevStycken } from './exempel-data'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ExempelCV = any
export type ExempelBrev = any

function Nr({ nr }: { nr?: number[] }) {
  if (!nr?.length) return null
  return (
    <>
      {nr.map((n) => (
        <span key={n} className="ark-m" aria-label={`Not ${n}`}>
          {n}
        </span>
      ))}
    </>
  )
}

function Sektion({ namn, nr, children }: { namn: string; nr?: number[]; children: ReactNode }) {
  return (
    <>
      <p className="ark-h">
        {namn}
        <Nr nr={nr} />
      </p>
      {children}
    </>
  )
}

function lista(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []
}

export function CvPapper({ cv, nummer }: { cv: ExempelCV; nummer: Map<Ankare, number[]> }) {
  const k = cv.kontakt ?? {}
  const erfarenhet: any[] = Array.isArray(cv.erfarenhet) ? cv.erfarenhet : []
  const utbildning: any[] = Array.isArray(cv.utbildning) ? cv.utbildning : []
  const kompetenser = [...lista(cv.kompetenser?.tekniska), ...lista(cv.kompetenser?.personliga)]
  const cert = lista(cv.certifieringar)
  const sprak: any[] = Array.isArray(cv.sprak) ? cv.sprak : []
  const projekt: any[] = Array.isArray(cv.projekt) ? cv.projekt : []
  return (
    <>
      <p className="ark-namn">{cv.namn}</p>
      {cv.titel ? <p className="ark-titel">{cv.titel}</p> : null}
      <p className="ark-kontakt">
        {[k.telefon, k.epost, k.plats, k.linkedin, k.github].filter(Boolean).map((v: string) => (
          <span key={v}>{v}</span>
        ))}
      </p>
      {cv.profil ? (
        <Sektion namn="Profil" nr={nummer.get('profil')}>
          <p className="ark-p">{cv.profil}</p>
        </Sektion>
      ) : null}
      {cert.length ? (
        <Sektion namn="Certifieringar" nr={nummer.get('certifieringar')}>
          <ul className="ark-kol">
            {cert.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Sektion>
      ) : null}
      {erfarenhet.length ? (
        <Sektion namn="Erfarenhet" nr={nummer.get('erfarenhet')}>
          {erfarenhet.map((e, i) => (
            <div key={i}>
              <p className="ark-rad">
                <b>{e.titel}</b>
                {e.period ? <span>{e.period}</span> : null}
              </p>
              {e.arbetsgivare ? <p className="ark-ag">{e.arbetsgivare}</p> : null}
              {lista(e.beskrivning).length ? (
                <ul className="ark-ul">
                  {lista(e.beskrivning).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </Sektion>
      ) : null}
      {projekt.length ? (
        <Sektion namn="Projekt">
          {projekt.map((p, i) => (
            <div key={i}>
              <p className="ark-rad">
                <b>{p.titel}</b>
              </p>
              {p.beskrivning ? <p className="ark-p">{p.beskrivning}</p> : null}
            </div>
          ))}
        </Sektion>
      ) : null}
      {kompetenser.length ? (
        <Sektion namn="Kompetenser" nr={nummer.get('kompetenser')}>
          <ul className="ark-kol">
            {kompetenser.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Sektion>
      ) : null}
      {utbildning.length ? (
        <Sektion namn="Utbildning" nr={nummer.get('utbildning')}>
          {utbildning.map((u, i) => (
            <div key={i}>
              <p className="ark-rad">
                <b>{u.titel}</b>
                {u.period ? <span>{u.period}</span> : null}
              </p>
              {u.skola ? <p className="ark-ag">{u.skola}</p> : null}
              {u.beskrivning ? <p className="ark-p">{u.beskrivning}</p> : null}
            </div>
          ))}
        </Sektion>
      ) : null}
      {lista(cv.publikationer).length ? (
        <Sektion namn="Publikationer">
          <ul className="ark-ul">
            {lista(cv.publikationer).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Sektion>
      ) : null}
      {sprak.length ? (
        <Sektion namn="Språk">
          <ul className="ark-kol">
            {sprak.map((s, i) => (
              <li key={i}>
                {s.sprak}
                {s.niva ? `, ${s.niva}` : ''}
              </li>
            ))}
          </ul>
        </Sektion>
      ) : null}
      {lista(cv.ovrigt).length ? (
        <Sektion namn="Övrigt">
          <ul className="ark-ul">
            {lista(cv.ovrigt).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Sektion>
      ) : null}
    </>
  )
}

export function brevFalt(b: ExempelBrev) {
  return {
    namn: b.namn as string,
    adress: (b.adress ?? b.stad ?? '') as string,
    telefon: (b.telefon ?? '') as string,
    epost: (b.epost ?? '') as string,
    arbetsgivare: (b.arbetsgivare ?? b.foretag ?? '') as string,
    roll: (b.roll ?? '') as string,
    datum: (b.datum ?? '') as string,
    brevText: (b.brevText ?? '') as string,
  }
}

export function BrevPapper({ brev, nummer }: { brev: ExempelBrev; nummer: Map<Ankare, number[]> }) {
  const f = brevFalt(brev)
  const { halsning, stycken, avslut } = brevStycken(f.brevText)
  return (
    <div className="ark-brev">
      <div className="ark-topp">
        <div>
          <b>{f.namn}</b>
          {[f.adress, f.telefon, f.epost].filter(Boolean).map((v) => (
            <span key={v} style={{ display: 'block' }}>
              {v}
            </span>
          ))}
        </div>
        <div>
          {[f.arbetsgivare, f.roll, f.datum].filter(Boolean).map((v) => (
            <span key={v} style={{ display: 'block' }}>
              {v}
            </span>
          ))}
        </div>
      </div>
      {halsning ? <p>{halsning}</p> : null}
      {stycken.map((s, i) => (
        <p key={i}>
          {s}
          <Nr nr={nummer.get(`stycke-${i + 1}` as Ankare)} />
        </p>
      ))}
      {avslut ? <p>{avslut}</p> : null}
    </div>
  )
}

/** Utdraget i hjälten: namn, titel, första jobbet med två punkter och två certifieringar. */
export function CvUtdrag({ cv }: { cv: ExempelCV }) {
  const e = Array.isArray(cv.erfarenhet) ? cv.erfarenhet[0] : undefined
  const cert = lista(cv.certifieringar).slice(0, 2)
  const kompetenser = lista(cv.kompetenser?.tekniska).slice(0, 2)
  return (
    <div className="ib-ex-ark">
      <p className="ark-namn">{cv.namn}</p>
      {cv.titel ? <p className="ark-titel">{cv.titel}</p> : null}
      {e ? (
        <>
          <p className="ark-h">Erfarenhet</p>
          <p className="ark-rad">
            <b>{e.titel}</b>
            {e.period ? <span>{e.period}</span> : null}
          </p>
          <ul className="ark-ul">
            {lista(e.beskrivning)
              .slice(0, 2)
              .map((b, i) => (
                <li key={i}>{b}</li>
              ))}
          </ul>
        </>
      ) : null}
      {cert.length || kompetenser.length ? (
        <>
          <p className="ark-h">{cert.length ? 'Certifieringar' : 'Kompetenser'}</p>
          <ul className="ark-kol">
            {(cert.length ? cert : kompetenser).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

export function BrevUtdrag({ brev }: { brev: ExempelBrev }) {
  const { halsning, stycken } = brevStycken(brevFalt(brev).brevText)
  return (
    <div className="ib-ex-ark ark-brev">
      {halsning ? (
        <p>
          <b>{halsning}</b>
        </p>
      ) : null}
      {stycken.slice(0, 2).map((s, i) => (
        <p key={i}>{s}</p>
      ))}
    </div>
  )
}
