'use client'

/**
 * Avsnittsarket (skissen yta 3): från ett tryck på ett avsnitt eller
 * "+ Lägg till". Fälten som byggaren har (titel, arbetsgivare, period,
 * punkter). Spara lägger ändringen i CV:t; ytan sparar vidare (utkastet på
 * provsidan, structured_data inloggat). Enskilda rader redigeras i helskärm
 * i nästa våg.
 *
 * "huvud" är namnet, titeln och kontaktraden överst på arket (ägaren
 * 2026-11-16). En ny titel följer med till PDF och Word, och rubrikerna
 * följer titelns yrkesområde (rubrikmodellen) utom där hon valt egna.
 */
import { useEffect, useRef, useState } from 'react'
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import type { CVLanguage, CVMetadata } from '@/lib/cv/cv-metadata'
import Ark from './Ark'
import type { HuvudFalt } from './matning'
import { AVSNITT, HUVUD } from './texter'

/** Det som går att redigera från arket: ett avsnitt eller huvudet. */
export type Redigerbart = Sektion | 'huvud'

export interface AvsnittArkProps {
  sektion: Redigerbart | null
  /** Fältet i huvudet som trycktes; får fokus när arket öppnas. */
  fokus?: HuvudFalt
  /** Rubriken avsnittet har på arket ("Klinisk erfarenhet"), annars standardnamnet. */
  rubrik?: string
  cv: CVMetadata
  onSpara: (cv: CVMetadata) => void
  onClose: () => void
}

const FALT = 'h-11 w-full rounded-[10px] border border-kant-stark bg-papper px-3 text-[15px] text-ink-1 outline-none focus:border-ink-1'
const YTA = 'min-h-24 w-full rounded-[10px] border border-kant-stark bg-papper px-3 py-2 text-[15px] leading-6 text-ink-1 outline-none focus:border-ink-1'

function Falt({ etikett, children }: { etikett: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[13px] font-medium text-ink-2">{etikett}</span>
      {children}
    </label>
  )
}

const rader = (t: string) =>
  t
    .split('\n')
    .map((r) => r.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

const lista = (t: string) =>
  t
    .split(/[,\n]/)
    .map((r) => r.trim())
    .filter(Boolean)

const NIVAER: CVLanguage['proficiency'][] = ['Modersmål', 'Flytande', 'Konversation', 'Nybörjare', 'Tvåspråkig']

export default function AvsnittArk({ sektion, fokus, rubrik, cv, onSpara, onClose }: AvsnittArkProps) {
  const [utkast, setUtkast] = useState<CVMetadata>(cv)
  const huvudRef = useRef<HTMLDivElement>(null)
  // Fältet hon tryckte på får fokus (efter arkets eget fokus på första fältet).
  useEffect(() => {
    if (sektion !== 'huvud' || !fokus) return
    const t = window.setTimeout(() => huvudRef.current?.querySelector<HTMLInputElement>(`[data-falt="${fokus}"]`)?.focus(), 60)
    return () => window.clearTimeout(t)
  }, [sektion, fokus])
  useEffect(() => {
    if (sektion) setUtkast(structuredClone(cv))
    // Bara när arket öppnas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sektion])

  if (!sektion) return null
  const satt = (f: (c: CVMetadata) => void) =>
    setUtkast((c) => {
      const ny = structuredClone(c)
      f(ny)
      return ny
    })

  const knappRad = (onLagg: () => void) => sektion === 'huvud' ? null : (
    <button
      type="button"
      onClick={onLagg}
      className="mt-1 inline-flex min-h-11 w-full items-center justify-center rounded-[10px] border border-dashed border-kant-stark text-sm font-semibold text-ink-2 hover:border-ink-1"
    >
      {AVSNITT.tomma[sektion]}
    </button>
  )
  const taBort = (onTa: () => void) => (
    <button type="button" onClick={onTa} className="inline-flex min-h-11 items-center text-sm font-medium text-fel underline underline-offset-4">
      {AVSNITT.taBort}
    </button>
  )

  let innehall: React.ReactNode = null
  switch (sektion) {
    case 'huvud': {
      const pi = utkast.personalInfo
      innehall = (
        <div ref={huvudRef} className="grid gap-3">
          <Falt etikett={HUVUD.namn}>
            <input className={FALT} data-falt="namn" autoComplete="name" value={pi.fullName ?? ''} onChange={(e) => satt((c) => void (c.personalInfo.fullName = e.target.value))} />
          </Falt>
          <Falt etikett={HUVUD.titel}>
            <input className={FALT} data-falt="titel" value={pi.title ?? ''} onChange={(e) => satt((c) => void (c.personalInfo.title = e.target.value))} />
          </Falt>
          <p className="-mt-1.5 text-meta text-ink-3">{HUVUD.titelUnder}</p>
          <div className="grid gap-3 min-[480px]:grid-cols-2">
            <Falt etikett={HUVUD.epost}>
              <input className={FALT} data-falt="kontakt" type="email" autoComplete="email" value={pi.email ?? ''} onChange={(e) => satt((c) => void (c.personalInfo.email = e.target.value))} />
            </Falt>
            <Falt etikett={HUVUD.telefon}>
              <input className={FALT} type="tel" autoComplete="tel" value={pi.phone ?? ''} onChange={(e) => satt((c) => void (c.personalInfo.phone = e.target.value))} />
            </Falt>
            <Falt etikett={HUVUD.ort}>
              <input
                className={FALT}
                autoComplete="address-level2"
                value={pi.address || pi.location || ''}
                onChange={(e) =>
                  satt((c) => {
                    c.personalInfo.address = e.target.value
                    c.personalInfo.location = e.target.value
                  })
                }
              />
            </Falt>
            <Falt etikett={HUVUD.linkedin}>
              <input
                className={FALT}
                inputMode="url"
                value={pi.linkedin || pi.linkedIn || ''}
                onChange={(e) =>
                  satt((c) => {
                    c.personalInfo.linkedin = e.target.value
                    c.personalInfo.linkedIn = e.target.value
                  })
                }
              />
            </Falt>
          </div>
        </div>
      )
      break
    }
    case 'profil':
      innehall = (
        <Falt etikett={AVSNITT.rubrik.profil}>
          <textarea className={YTA} rows={6} value={utkast.summary ?? ''} onChange={(e) => satt((c) => void (c.summary = e.target.value))} />
        </Falt>
      )
      break
    case 'erfarenhet':
      innehall = (
        <div className="grid gap-4">
          {utkast.experience.map((x, i) => (
            <fieldset key={i} className="grid gap-2 rounded-xl border border-kant p-3">
              <Falt etikett="Titel">
                <input className={FALT} value={x.position} onChange={(e) => satt((c) => void (c.experience[i].position = e.target.value))} />
              </Falt>
              <Falt etikett="Arbetsgivare">
                <input className={FALT} value={x.company} onChange={(e) => satt((c) => void (c.experience[i].company = e.target.value))} />
              </Falt>
              <div className="grid grid-cols-2 gap-2">
                <Falt etikett="Från">
                  <input className={FALT} value={x.startDate} onChange={(e) => satt((c) => void (c.experience[i].startDate = e.target.value))} />
                </Falt>
                <Falt etikett="Till">
                  <input className={FALT} value={x.endDate ?? ''} placeholder="Pågående" onChange={(e) => satt((c) => void (c.experience[i].endDate = e.target.value || undefined))} />
                </Falt>
              </div>
              <Falt etikett="Punkter, en per rad">
                <textarea
                  className={YTA}
                  rows={4}
                  value={x.description.join('\n')}
                  onChange={(e) => satt((c) => void (c.experience[i].description = e.target.value.split('\n')))}
                />
              </Falt>
              {taBort(() => satt((c) => void c.experience.splice(i, 1)))}
            </fieldset>
          ))}
          {knappRad(() => satt((c) => void c.experience.push({ position: '', company: '', startDate: '', description: [] })))}
        </div>
      )
      break
    case 'utbildning':
      innehall = (
        <div className="grid gap-4">
          {utkast.education.map((x, i) => (
            <fieldset key={i} className="grid gap-2 rounded-xl border border-kant p-3">
              <Falt etikett="Utbildning">
                <input className={FALT} value={x.degree} onChange={(e) => satt((c) => void (c.education[i].degree = e.target.value))} />
              </Falt>
              <Falt etikett="Skola">
                <input className={FALT} value={x.institution} onChange={(e) => satt((c) => void (c.education[i].institution = e.target.value))} />
              </Falt>
              <div className="grid grid-cols-2 gap-2">
                <Falt etikett="Från">
                  <input className={FALT} value={x.startDate ?? ''} onChange={(e) => satt((c) => void (c.education[i].startDate = e.target.value))} />
                </Falt>
                <Falt etikett="Till">
                  <input className={FALT} value={x.endDate ?? ''} onChange={(e) => satt((c) => void (c.education[i].endDate = e.target.value))} />
                </Falt>
              </div>
              {taBort(() => satt((c) => void c.education.splice(i, 1)))}
            </fieldset>
          ))}
          {knappRad(() => satt((c) => void c.education.push({ degree: '', institution: '' })))}
        </div>
      )
      break
    case 'kompetenser':
      innehall = (
        <div className="grid gap-3">
          {(utkast.skills.length ? utkast.skills : [{ category: '', skills: [] }]).map((g, i) => (
            <Falt key={i} etikett={g.category || AVSNITT.rubrik.kompetenser}>
              <textarea
                className={YTA}
                rows={3}
                value={g.skills.join(', ')}
                onChange={(e) =>
                  satt((c) => {
                    if (!c.skills[i]) c.skills[i] = { category: '', skills: [] }
                    c.skills[i].skills = lista(e.target.value)
                  })
                }
              />
            </Falt>
          ))}
        </div>
      )
      break
    case 'intyg':
      innehall = (
        <div className="grid gap-4">
          {(utkast.certifications ?? []).map((x, i) => (
            <fieldset key={i} className="grid gap-2 rounded-xl border border-kant p-3">
              <Falt etikett="Intyg">
                <input className={FALT} value={x.name} onChange={(e) => satt((c) => void (c.certifications![i].name = e.target.value))} />
              </Falt>
              <div className="grid grid-cols-2 gap-2">
                <Falt etikett="Utfärdare">
                  <input className={FALT} value={x.issuer} onChange={(e) => satt((c) => void (c.certifications![i].issuer = e.target.value))} />
                </Falt>
                <Falt etikett="År">
                  <input className={FALT} value={x.date ?? x.issueDate ?? ''} onChange={(e) => satt((c) => void (c.certifications![i].date = e.target.value))} />
                </Falt>
              </div>
              {taBort(() => satt((c) => void c.certifications!.splice(i, 1)))}
            </fieldset>
          ))}
          {knappRad(() => satt((c) => void (c.certifications = [...(c.certifications ?? []), { name: '', issuer: '' }])))}
        </div>
      )
      break
    case 'sprak':
      innehall = (
        <div className="grid gap-3">
          {(utkast.languages ?? []).map((x, i) => (
            <div key={i} className="grid grid-cols-[1fr_9rem_auto] items-end gap-2">
              <Falt etikett="Språk">
                <input className={FALT} value={x.language} onChange={(e) => satt((c) => void (c.languages![i].language = e.target.value))} />
              </Falt>
              <Falt etikett="Nivå">
                <select className={FALT} value={x.proficiency ?? ''} onChange={(e) => satt((c) => void (c.languages![i].proficiency = e.target.value as CVLanguage['proficiency']))}>
                  {NIVAER.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                  <option value="">{AVSNITT.ingenNiva}</option>
                </select>
              </Falt>
              {taBort(() => satt((c) => void c.languages!.splice(i, 1)))}
            </div>
          ))}
          {knappRad(() => satt((c) => void (c.languages = [...(c.languages ?? []), { language: '', proficiency: 'Flytande' }])))}
        </div>
      )
      break
    case 'intressen':
      innehall = (
        <Falt etikett={AVSNITT.rubrik.intressen}>
          <textarea className={YTA} rows={3} value={(utkast.interests ?? []).join(', ')} onChange={(e) => satt((c) => void (c.interests = lista(e.target.value)))} />
        </Falt>
      )
      break
    case 'referenser':
      innehall = (
        <Falt etikett={AVSNITT.rubrik.referenser}>
          <textarea className={YTA} rows={3} value={utkast.references ?? ''} onChange={(e) => satt((c) => void (c.references = e.target.value))} />
        </Falt>
      )
      break
    case 'projekt':
      innehall = (
        <div className="grid gap-4">
          {(utkast.projects ?? []).map((x, i) => (
            <fieldset key={i} className="grid gap-2 rounded-xl border border-kant p-3">
              <Falt etikett="Projekt">
                <input className={FALT} value={x.name} onChange={(e) => satt((c) => void (c.projects![i].name = e.target.value))} />
              </Falt>
              <Falt etikett="Beskrivning">
                <textarea className={YTA} rows={3} value={x.description} onChange={(e) => satt((c) => void (c.projects![i].description = e.target.value))} />
              </Falt>
              {taBort(() => satt((c) => void c.projects!.splice(i, 1)))}
            </fieldset>
          ))}
          {knappRad(() => satt((c) => void (c.projects = [...(c.projects ?? []), { name: '', description: '' }])))}
        </div>
      )
      break
  }

  const spara = () => {
    const ren = structuredClone(utkast)
    ren.experience = ren.experience
      .map((x) => ({ ...x, description: rader(x.description.join('\n')) }))
      .filter((x) => x.position.trim() || x.company.trim())
    ren.education = ren.education.filter((x) => x.degree.trim() || x.institution.trim())
    ren.skills = ren.skills.filter((s) => s.skills.length > 0)
    if (ren.certifications) ren.certifications = ren.certifications.filter((x) => x.name.trim())
    if (ren.languages) ren.languages = ren.languages.filter((x) => x.language.trim())
    if (ren.projects) ren.projects = ren.projects.filter((x) => x.name.trim())
    onSpara(ren)
    onClose()
  }

  return (
    <Ark
      open
      onClose={onClose}
      rubrik={sektion === 'huvud' ? HUVUD.rubrik : rubrik || AVSNITT.rubrik[sektion]}
      fot={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center rounded-xl border border-kant-stark px-4 text-sm font-semibold text-ink-1">
            {AVSNITT.avbryt}
          </button>
          <button type="button" onClick={spara} className="inline-flex h-11 items-center rounded-xl bg-ink-1 px-5 text-sm font-semibold text-papper">
            {AVSNITT.spara}
          </button>
        </div>
      }
    >
      {innehall}
    </Ark>
  )
}
