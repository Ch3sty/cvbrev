'use client'

/**
 * Mini-CV-analys utan konto (docs/plan-konvertering.md, C8).
 *
 * Ersätter den scriptade CVAnalysLiveDemo med en riktig uppladdning. Vi visar
 * poängen och den viktigaste förbättringen. De två andra räknas men skickas
 * aldrig hit: de är vad kontot låser upp.
 *
 * Formen i publikt omgång 3 (skissen cv-analys): grundens klasser (p3-*) och
 * sidans egna (cva-*, ../cv-analys.css). Funktionen är oförändrad.
 */

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Ikon } from '@/components/publikt/v3/Ikon'
import { capture } from '@/lib/analytics/events'

interface MiniResult {
  score: number
  summary?: string
  visibleImprovement: string | null
  lockedImprovementCount: number
}

const ACCEPT = '.pdf,.docx,.txt'

/** Det kontot visar, som fast lista (textbeslut CVA-12, B-2). */
const I_KONTOT = [
  'Poängen del för del, i alla sju delar',
  'Vad som saknas i varje del, utmärkt på ditt CV',
  'Jobbcoachens förslag på nya formuleringar',
] as const

export default function CVAnalysMini() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerHref, setRegisterHref] = useState<string | null>(null)
  const [result, setResult] = useState<MiniResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [over, setOver] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)
    setError(null)
    setRegisterHref(null)
    setFileName(file.name)
    capture('sample_started', { kind: 'cv_analysis', cluster: 'cv' })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/public/quick-score', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Kunde inte analysera filen.')
        if (typeof data.registerHref === 'string') setRegisterHref(data.registerHref)
        return
      }

      setResult(data as MiniResult)
      capture('sample_completed', { kind: 'cv_analysis', cluster: 'cv' })
      capture('signup_gate_shown', { kind: 'cv_analysis', cluster: 'cv' })
    } catch {
      setError('Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div id="mini-analys" className="cva-mini">
        <div className="cva-resultat">
          <div className="cva-poang">
            <b>{result.score}</b>
            <span>av 100</span>
          </div>

          {result.summary ? <p className="p3-text">{result.summary}</p> : null}

          <div className="cva-del">
            <h3>Det viktigaste att ändra först</h3>
            {result.visibleImprovement ? (
              <p className="p3-text">{result.visibleImprovement}</p>
            ) : (
              <p className="p3-text">Vi hittade inget akut att ändra. Genomgången i kontot visar varje del för sig.</p>
            )}
          </div>

          {/* En fast lista över det kontot visar, i stället för numrerade
              förbättringar som kontot aldrig visar (textbeslut CVA-12). */}
          <div className="cva-del">
            <h3>I kontot ser du</h3>
            <ul>
              {I_KONTOT.map((rad) => (
                <li key={rad}>{rad}</li>
              ))}
            </ul>
          </div>

          <div className="cva-del">
            <h3>Se hela genomgången, del för del</h3>
            <p className="p3-text">
              Skapa ett gratiskonto, så går vi igenom hela CV:t i sju delar. Du ser
              läsbarhetspoängen, vad som saknas i varje del och hur du når 100.
              Jobbcoachens förslag hämtar du en gång gratis.
            </p>
            <Link
              href="/register?borja=cv"
              data-cta="mini-analys-gate"
              onClick={() =>
                capture('signup_started', {
                  cluster: 'cv',
                  source_page: '/verktyg/cv-analys',
                })
              }
              className="p3-knapp"
            >
              Se hela genomgången
              <Ikon namn="pil" />
            </Link>
            <p className="p3-liten">Inget kreditkort. Avsluta när du vill.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="mini-analys" className="cva-mini">
      <p className="p3-ey">Prova utan konto</p>
      <h2 className="p3-h2">Analysera ditt CV direkt</h2>
      <p className="p3-varde">
        Ladda upp ditt CV som PDF eller Word, så får du din läsbarhetspoäng och det viktigaste
        du bör ändra. Inget konto behövs, och vi sparar varken filen eller texten.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          // Tömt efter valet, så att samma eller en ny fil kan väljas direkt efter ett besked.
          e.target.value = ''
          if (file) void handleFile(file)
        }}
      />

      {/* Dra och släpp (skissen cv-analys): samma handleFile som knappen. */}
      <div
        className="cva-yta"
        data-over={over ? 'true' : undefined}
        onDragOver={(e) => {
          if (loading) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          if (!over) setOver(true)
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
          setOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          if (loading) return
          const file = e.dataTransfer.files?.[0]
          if (file) void handleFile(file)
        }}
      >
        <span className="cva-fil" aria-hidden="true">
          <Ikon namn="upp" />
        </span>
        <b className="cva-slapp-text">Släpp din CV-fil här</b>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          data-cta="mini-analys-upload"
          className="p3-knapp"
        >
          {loading ? 'Läser ditt CV' : 'Välj din CV-fil'}
        </button>
        {fileName && !loading ? <span className="p3-liten">{fileName}</span> : null}
        <span className="p3-liten">PDF, Word eller ren text. Max 5 MB.</span>
      </div>

      {error && registerHref ? (
        // Ett besked med en väg vidare (inskannad PDF, dygnsgränsen,
        // budgettaket): ingen röd text, en vit knapp med kant. Uppladdnings-
        // knappen ovanför står kvar för en Word-fil.
        <div role="alert" data-mini-besked className="cva-besked">
          <p className="p3-text">{error}</p>
          <Link
            href={registerHref}
            data-cta="mini-analys-besked"
            onClick={() =>
              capture('signup_started', {
                cluster: 'cv',
                source_page: '/verktyg/cv-analys',
              })
            }
            className="p3-knapp p3-knapp-vit"
          >
            Skapa gratiskonto
          </Link>
        </div>
      ) : error ? (
        <div className="cva-besked">
          <p className="cva-fel">{error}</p>
        </div>
      ) : null}
    </div>
  )
}
