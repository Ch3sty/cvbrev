'use client'

/**
 * Lyftets handling på /verktyg/jobbmatchning (publikt omgång 3, "inga
 * genvägar"): besökaren lägger in sitt CV redan här. Filen tolkas av samma
 * rutt som CV-mallarnas provsida (/api/public/cv/tolka, med samma spärrar
 * och Turnstile), och hon ser direkt vad matchningen läser ur CV:t. "Se mina
 * träffar" leder genom registreringen; valkommen-sidan hämtar hem CV:t till
 * kontot och skickar henne till Matchade jobb, där sökningen utgår från det.
 *
 * Inget sparas på servern före kontot: utkastet ligger i webbläsaren
 * (lib/jobmatching/provaCv.ts). Klasserna jm- står i jobbmatchning.css.
 */

import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/auth/TurnstileWidget'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { JOBBMATCHNING_KONTO, lastUrCv, sparaJobbCv } from '@/lib/jobmatching/provaCv'

const MAX = 5 * 1024 * 1024
const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

type Lage =
  | { lage: 'tom' }
  | { lage: 'laddar'; filnamn: string }
  | { lage: 'klar'; filnamn: string; cv: CVMetadata }
  | { lage: 'fel'; text: string }

const FELTEXT: Record<string, string> = {
  for_stor: 'Filen är större än 5 MB. Spara den som PDF och försök igen.',
  fel_typ: 'Vi läser PDF och Word (docx). Spara CV:t i något av dem.',
  bild_pdf: 'PDF:en är en bild, så det finns ingen text att läsa. Ladda upp CV:t som Word eller som en PDF med text.',
  tom: 'Vi hittade ingen text i filen.',
  robot: 'Kontrollen att du är en människa gick inte igenom. Försök igen.',
  kvot: 'Du har lagt in många CV:n i dag. Skapa ett konto och lägg in det där i stället.',
  tak: 'Inläsningen är fullbelagd just nu. Skapa ett konto och lägg in CV:t där.',
}

export default function CvProvaJobb() {
  const router = useRouter()
  const [lage, setLage] = useState<Lage>({ lage: 'tom' })
  const [robot, setRobot] = useState(false)
  const token = useRef<string | null>(null)
  const vantare = useRef<((t: string | null) => void) | null>(null)
  const fil = useRef<HTMLInputElement>(null)

  const vantaPaToken = (): Promise<string | null> => {
    if (!TURNSTILE_SITE_KEY) return Promise.resolve(null)
    if (token.current) return Promise.resolve(token.current)
    setRobot(true)
    return new Promise((resolve) => {
      vantare.current = resolve
      window.setTimeout(() => {
        if (vantare.current === resolve) {
          vantare.current = null
          resolve(null)
        }
      }, 8000)
    })
  }

  const setToken = useCallback((t: string | null) => {
    token.current = t
    if (t && vantare.current) {
      vantare.current(t)
      vantare.current = null
    }
  }, [])

  async function valj(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > MAX) return setLage({ lage: 'fel', text: FELTEXT.for_stor })
    if (!/\.(pdf|docx)$/i.test(f.name)) return setLage({ lage: 'fel', text: FELTEXT.fel_typ })
    setLage({ lage: 'laddar', filnamn: f.name })
    try {
      const t = await vantaPaToken()
      const data = new FormData()
      data.append('file', f)
      if (t) data.append('turnstile', t)
      const res = await fetch('/api/public/cv/tolka', { method: 'POST', body: data })
      token.current = null
      const j = (await res.json().catch(() => ({}))) as { kod?: string; cv?: CVMetadata }
      if (!res.ok || !j.cv) {
        setLage({ lage: 'fel', text: FELTEXT[j.kod ?? ''] ?? 'Något gick fel när vi läste filen. Försök igen.' })
        return
      }
      sparaJobbCv(j.cv, f.name)
      setLage({ lage: 'klar', filnamn: f.name, cv: j.cv })
    } catch {
      setLage({ lage: 'fel', text: 'Något gick fel när vi läste filen. Försök igen.' })
    }
  }

  const last = lage.lage === 'klar' ? lastUrCv(lage.cv) : null

  return (
    <div className="jm-prova" aria-live="polite">
      <input ref={fil} id="jm-cv-fil" type="file" accept={ACCEPT} className="sr-only" onChange={valj} />
      {lage.lage === 'klar' && last ? (
        <div className="jm-prova-klar">
          <p className="jm-prova-rubrik">Det här läste vi ur ditt CV</p>
          <dl className="jm-prova-last">
            {last.roller.length ? (
              <div>
                <dt>Yrkesroller</dt>
                <dd>{last.roller.join(', ')}</dd>
              </div>
            ) : null}
            {last.kompetenser.length ? (
              <div>
                <dt>Kompetenser</dt>
                <dd>{last.kompetenser.join(', ')}</dd>
              </div>
            ) : null}
            {last.utbildning ? (
              <div>
                <dt>Utbildning</dt>
                <dd>{last.utbildning}</dd>
              </div>
            ) : null}
            {last.ort ? (
              <div>
                <dt>Plats</dt>
                <dd>{last.ort}</dd>
              </div>
            ) : null}
          </dl>
          <button
            type="button"
            className="p3-knapp p3-knapp-bred"
            onClick={() => router.push(`/register?redirect=${encodeURIComponent(JOBBMATCHNING_KONTO)}`)}
          >
            Se mina träffar
          </button>
          <p className="jm-prova-not">
            Du skapar ett gratis konto, så följer CV:t med och vi söker bland annonserna direkt. Fel fil?{' '}
            <button type="button" className="jm-textknapp" onClick={() => fil.current?.click()}>
              Välj en annan
            </button>
          </p>
        </div>
      ) : (
        <div className="jm-prova-tom">
          <label htmlFor="jm-cv-fil" className="jm-prova-yta">
            <b>{lage.lage === 'laddar' ? `Läser ${lage.filnamn} ...` : 'Lägg in ditt CV'}</b>
            <span>PDF eller Word, högst 5 MB. Vi visar vad matchningen läser ur det innan du skapar kontot.</span>
          </label>
          {lage.lage === 'fel' ? (
            <p className="jm-prova-fel" role="alert">
              {lage.text}
            </p>
          ) : null}
          {robot && TURNSTILE_SITE_KEY ? <TurnstileWidget onToken={setToken} /> : null}
        </div>
      )}
    </div>
  )
}
