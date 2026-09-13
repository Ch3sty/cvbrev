'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SkillsMakeover from './SkillsMakeover'

interface Props {
  sectionKey: string
  title: string
  optimizedText: string
  scoreBefore: number
  scoreAfter: number
  improvements: string[]
}

/**
 * En sektions resultat: panel med sektionsetikett, kortrubrik, poäng före
 * och efter i meta, 2 px mätare i ink-1, den optimerade texten och listan
 * över vad vi ändrade.
 */
export default function SectionDetail({
  sectionKey,
  title,
  optimizedText,
  scoreBefore,
  scoreAfter,
  improvements,
}: Props) {
  const [copied, setCopied] = useState(false)
  const delta = scoreAfter - scoreBefore

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const isSkills = sectionKey === 'skills'
  const clampedAfter = Math.max(0, Math.min(100, scoreAfter))

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5" aria-label={title}>
      <p className="text-sm font-medium text-ink-3">Optimerad sektion</p>

      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-kort text-ink-1">{title}</h3>
          <p className="mt-0.5 text-meta tabular-nums text-ink-3">
            {scoreBefore} till {scoreAfter}
            <span className={`ml-2 ${delta >= 0 ? 'text-positiv' : 'text-varning'}`}>
              {delta >= 0 ? '+' : ''}
              {delta}
            </span>
          </p>
        </div>

        {!isSkills && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            {copied ? 'Kopierat' : 'Kopiera'}
          </button>
        )}
      </div>

      <div
        className="mt-3 h-0.5 w-full bg-kant"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedAfter}
        aria-label={`${title}, poäng ${scoreAfter} av 100`}
      >
        <div
          className="h-full bg-ink-1 transition-[width] duration-[240ms] ease-out motion-reduce:transition-none"
          style={{ width: `${clampedAfter}%` }}
        />
      </div>

      <div className="mt-4">
        {isSkills ? (
          <SkillsMakeover rawJson={optimizedText} />
        ) : (
          <div className="max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 text-sm leading-[22px] text-ink-2 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-ink-1">{children}</strong>
                ),
                h1: ({ children }) => (
                  <p className="mb-2 text-sm font-medium text-ink-1">{children}</p>
                ),
                h2: ({ children }) => (
                  <p className="mb-2 text-sm font-medium text-ink-1">{children}</p>
                ),
                h3: ({ children }) => (
                  <p className="mb-2 text-sm font-medium text-ink-1">{children}</p>
                ),
                ul: ({ children }) => <ul className="my-3 space-y-1.5">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 space-y-1.5">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-ink-3"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-[22px] text-ink-2">{children}</span>
                  </li>
                ),
              }}
            >
              {optimizedText}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {improvements && improvements.length > 0 && (
        <div className="mt-4 border-t border-kant pt-4">
          <p className="text-sm font-medium text-ink-3">Vad vi ändrade</p>
          <ul className="mt-2 space-y-2">
            {improvements.map((improvement, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-positiv"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-sm leading-[22px] text-ink-2">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
