'use client'

/**
 * Fem matrislogikfrågor utan konto (docs/plan-konvertering.md, C9).
 *
 * Frågorna kommer från samma V7-pool som det inloggade grundtestet. Facit
 * finns aldrig i klienten: rättningen sker på servern, och vilka frågor som
 * var fel plus förklaringarna kommer först efter registrering.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SvgLayeredCell } from '@/lib/logicTestV7/layered.v7'
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7'
import { capture } from '@/lib/analytics/events'
import { storePendingTestSession } from '@/lib/letters/claim-draft-client'
import { IlluTestResultat } from '@/components/illustrations/StartFlowIllustrations'

interface PublicQuestion {
  id: string
  title: string
  rule: string
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

interface StartResponse {
  token: string
  questions: PublicQuestion[]
  total: number
}

interface ResultResponse {
  score: number
  total: number
  percentile: number
}

type Phase = 'intro' | 'running' | 'result'

export default function ProvaFlow() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [session, setSession] = useState<StartResponse | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<ResultResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerHref, setRegisterHref] = useState<string | null>(null)

  async function start() {
    setLoading(true)
    setError(null)
    setRegisterHref(null)
    try {
      const res = await fetch('/api/public/test-session', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Kunde inte starta provet.')
        if (typeof data.registerHref === 'string') setRegisterHref(data.registerHref)
        return
      }
      const started = data as StartResponse
      setSession(started)
      setAnswers(new Array(started.questions.length).fill(-1))
      setIndex(0)
      setPhase('running')
      capture('sample_started', { kind: 'test', cluster: 'test' })
    } catch {
      setError('Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  async function submit(finalAnswers: number[], token: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/public/test-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers: finalAnswers }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Kunde inte rätta provet.')
        return
      }
      setResult(data as ResultResponse)
      setPhase('result')
    } catch {
      setError('Vi nådde inte servern. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  function choose(optionIndex: number) {
    if (!session) return
    const next = [...answers]
    next[index] = optionIndex
    setAnswers(next)

    if (index + 1 < session.questions.length) {
      setIndex(index + 1)
    } else {
      void submit(next, session.token)
    }
  }

  useEffect(() => {
    if (phase === 'result' && result) {
      capture('sample_completed', { kind: 'test', cluster: 'test' })
      capture('signup_gate_shown', { kind: 'test', cluster: 'test' })
    }
  }, [phase, result])

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h2 className="text-base font-semibold text-neutral-900">
            Fem frågor, ingen inloggning
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Du får fem matrislogikfrågor av samma typ som i skarpa
            rekryteringstester. Ingen tidspress, och du ser resultatet direkt.
          </p>

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

          <button
            type="button"
            onClick={start}
            disabled={loading}
            data-cta="prova-start"
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:bg-neutral-300 sm:w-auto"
          >
            {loading ? 'Startar provet' : 'Starta provet'}
            {loading ? null : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'running' && session) {
    const question = session.questions[index]
    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-neutral-500 tabular-nums">
            Fråga {index + 1} av {session.questions.length}
          </p>
          <div className="flex gap-1" aria-hidden="true">
            {session.questions.map((q, i) => (
              <span
                key={q.id}
                className={`h-1 w-6 rounded-full ${
                  i <= index ? 'bg-orange-600' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h2 className="text-base font-semibold text-neutral-900">{question.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{question.rule}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {question.grid.flat().map((cell, i) => (
              <div
                key={i}
                className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border ${
                  cell
                    ? 'border-neutral-200 bg-white'
                    : 'border-dashed border-neutral-300 bg-neutral-50'
                }`}
              >
                {cell ? (
                  <svg viewBox="0 0 100 100" className="h-full w-full p-1">
                    <SvgLayeredCell cell={cell} />
                  </svg>
                ) : (
                  <span className="text-lg font-semibold text-neutral-400">?</span>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm font-medium text-neutral-900">Vilken figur saknas?</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={loading}
                aria-label={`Svarsalternativ ${String.fromCharCode(65 + i)}`}
                className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white transition-colors hover:border-orange-400 disabled:opacity-60"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full p-1">
                  <SvgLayeredCell cell={option} />
                </svg>
              </button>
            ))}
          </div>

          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    )
  }

  if (phase === 'result' && result && session) {
    return <ResultGate result={result} token={session.token} />
  }

  return null
}

/**
 * Resultatgaten. Antal rätt och grov percentil är synliga. Vilka frågor som
 * var fel, förklaringarna och normjämförelsen ligger kvar på servern och
 * skickas aldrig hit före registrering.
 */
function ResultGate({ result, token }: { result: ResultResponse; token: string }) {
  const registerHref = `/register?test=${encodeURIComponent(token)}`

  useEffect(() => {
    storePendingTestSession(token)
  }, [token])

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col items-center text-center">
          <IlluTestResultat
            size={160}
            className="text-neutral-700"
            position={result.percentile / 100}
          />
          <p className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">
            {result.score} av {result.total} rätt
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Det placerar dig ungefär bland de{' '}
            <span className="tabular-nums">{result.percentile}</span> procent som löser
            flest av den här typen av frågor.
          </p>
        </div>

        <ul className="mt-6 space-y-3 border-t border-neutral-200 pt-6">
          {[
            'Vilka frågor du missade',
            'Förklaring till varje svar',
            'Jämförelse mot normgruppen',
          ].map((label) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full bg-neutral-200"
                aria-hidden="true"
              />
              <span className="text-sm text-neutral-500">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="text-base font-semibold text-neutral-900">
          Du fick {result.score} av {result.total} rätt
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Skapa ett gratiskonto för att se vilka du missade, läsa förklaringarna och göra
          fler tester.
        </p>
        <Link
          href={registerHref}
          data-cta="prova-gate"
          onClick={() =>
            capture('signup_started', {
              cluster: 'test',
              source_page: '/verktyg/rekryteringstester/prova',
            })
          }
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:w-auto"
        >
          Se vad jag missade
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-3 text-xs text-neutral-500">
          Inget kreditkort · Avsluta när du vill
        </p>
      </div>
    </div>
  )
}
