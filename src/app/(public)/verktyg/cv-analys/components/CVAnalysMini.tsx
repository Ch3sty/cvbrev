'use client'

/**
 * Mini-CV-analys utan konto (docs/plan-konvertering.md, C8).
 *
 * Ersätter den scriptade CVAnalysLiveDemo med en riktig uppladdning. Vi visar
 * poängen och den viktigaste förbättringen. De två andra räknas men skickas
 * aldrig hit: de är vad kontot låser upp.
 */

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Upload } from 'lucide-react'
import { capture } from '@/lib/analytics/events'

interface MiniResult {
  score: number
  summary?: string
  visibleImprovement: string | null
  lockedImprovementCount: number
}

const ACCEPT = '.pdf,.docx,.txt'

export default function CVAnalysMini() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerHref, setRegisterHref] = useState<string | null>(null)
  const [result, setResult] = useState<MiniResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

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
      <div id="mini-analys" className="scroll-mt-24">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {result.score}
            </span>
            <span className="text-sm text-neutral-500">av 100</span>
          </div>

          {result.summary ? (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">{result.summary}</p>
          ) : null}

          <div className="mt-6 border-t border-neutral-200 pt-6">
            <h3 className="text-sm font-semibold text-neutral-900">
              Det här bör du fixa först
            </h3>
            {result.visibleImprovement ? (
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {result.visibleImprovement}
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Vi hittade inget akut att ändra. Den fullständiga analysen går djupare.
              </p>
            )}
          </div>

          {result.lockedImprovementCount > 0 ? (
            <ul className="mt-6 space-y-3 border-t border-neutral-200 pt-6">
              {Array.from({ length: result.lockedImprovementCount }).map((_, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full bg-neutral-200"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-neutral-500">
                    Förbättring {i + 2} av {result.lockedImprovementCount + 1}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h3 className="text-base font-semibold text-neutral-900">
            Vi hittade mer i ditt CV
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Skapa ett gratiskonto så kör vi en full analys av hela CV:t. Du får
            läsbarhetspoängen, hur många fynd vi hittade och det tyngsta fyndet
            i klartext med åtgärd.
          </p>
          <Link
            href="/register"
            data-cta="mini-analys-gate"
            onClick={() =>
              capture('signup_started', {
                cluster: 'cv',
                source_page: '/verktyg/cv-analys',
              })
            }
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:w-auto"
          >
            Se hela analysen
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-xs text-neutral-500">
            Inget kreditkort · Avsluta när du vill
          </p>
        </div>
      </div>
    )
  }

  return (
    <div id="mini-analys" className="scroll-mt-24">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="text-base font-semibold text-neutral-900">
          Analysera ditt CV direkt
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Ladda upp ditt CV som PDF eller Word, så får du en ATS-poäng och det viktigaste
          du bör ändra. Inget konto behövs, och vi sparar varken filen eller texten.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          data-cta="mini-analys-upload"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:bg-neutral-300 sm:w-auto"
        >
          {loading ? (
            'Läser ditt CV'
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Välj din CV-fil
            </>
          )}
        </button>

        {fileName && !loading ? (
          <p className="mt-3 text-xs text-neutral-500">{fileName}</p>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
            {registerHref ? (
              <Link
                href={registerHref}
                className="mt-2 inline-block text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
              >
                Skapa ett gratiskonto
              </Link>
            ) : null}
          </div>
        ) : null}

        <p className="mt-4 text-xs text-neutral-500">
          PDF, Word eller ren text. Max 5 MB.
        </p>
      </div>
    </div>
  )
}
