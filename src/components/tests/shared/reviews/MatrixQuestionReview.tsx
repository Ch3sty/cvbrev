'use client'

/**
 * Genomgången fråga för fråga i matrislogik och logikprovet.
 *
 * Ersätter tre resultatsidor som var samma kod med olika kategorinamn. Vilket
 * frågeurval och vilken kategoriindelning som gäller kommer ur slugen.
 */

import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  selectQuestionsForSession,
  selectAvanceradQuestionsForSession,
  selectExpertQuestionsForSession,
} from '@/lib/logicTestV7/selectQuestions.v7'
import { selectProvQuestionsForSession } from '@/lib/logicTestV7/selectProv.v7'
import { SvgLayeredCell } from '@/lib/logicTestV7/layered.v7'
import type { LayeredCell, LayeredQuestion } from '@/lib/logicTestV7/layered.v7'

export interface MatrixSavedAnswer {
  q_id: string
  selected: number
  correct: boolean
  time_spent: number
}

const SELECTORS: Record<string, (id: string) => LayeredQuestion[]> = {
  'matrislogik-grund': selectQuestionsForSession,
  'matrislogik-avancerad': selectAvanceradQuestionsForSession,
  'matrislogik-expert': selectExpertQuestionsForSession,
  'matrislogik-prov': selectProvQuestionsForSession,
}

/** Avancerad har namngivna kategorier per fråga, övriga härleds ur id:t. */
const AVANCERAD_CATEGORIES: Record<string, string> = {
  'v7-q1-glyph-grid': 'Attribut-grid',
  'v7-q2-ring-progression': 'Räkning och summa',
  'v7-q3-tally-orientation': 'Räkning och summa',
  'v7-q4-vector-rotation': 'Rotation och spegling',
  'v7-q5-lattice-xor': 'Set-operationer',
  'v7-q6-orbital-rotation': 'Rotation och spegling',
  'v7-q7-rays-to-tally': 'Räkning och summa',
  'v7-q8-stack-latin': 'Attribut-grid',
  'v7-q9-poly-progression': 'Räkning och summa',
  'v7-q10-fibonacci-tally': 'Räkning och summa',
  'v7-q11-ring-xor': 'Set-operationer',
  'v7-q12-triple-stack': 'Attribut-grid',
  'v7-q13-tile-mirror': 'Rotation och spegling',
  'v7-q14-double-progression': 'Räkning och summa',
  'v7-q15-tile-xor': 'Set-operationer',
}

function categoryFor(slug: string, id: string): string {
  if (slug === 'matrislogik-avancerad') {
    return AVANCERAD_CATEGORIES[id] ?? 'Övrigt'
  }
  if (/latin/.test(id)) return 'Latin squares'
  if (/walk|rotate|rotation|ccw|cycle/.test(id)) return 'Rörelse och rotation'
  if (/add|union/.test(id)) return 'Set-operationer'
  if (/progression|count|fill/.test(id)) return 'Progressioner och attribut'
  return 'Övrigt'
}

function formatShort(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function MatrixQuestionReview({
  slug,
  sessionId,
  answers,
}: {
  slug: string
  sessionId: string
  answers: MatrixSavedAnswer[]
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Samma seedade urval som testvyn gav, alltså exakt hennes frågor.
  const questions = useMemo(() => {
    const select = SELECTORS[slug]
    return select ? select(sessionId) : []
  }, [slug, sessionId])

  // Sessioner från en äldre frågebank matchar inte dagens urval. Då finns
  // ingen genomgång att visa, och vi säger det i stället för att visa fel.
  const isLegacy =
    answers.length > 0 && !answers.some((a) => questions.some((q) => q.id === a.q_id))

  if (questions.length === 0) return null

  if (isLegacy) {
    return (
      <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="text-base font-semibold text-neutral-900">
          Genomgången saknas för det här försöket
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Resultatet kommer från en tidigare version av frågebanken. Poängen
          står kvar, men vi kan inte visa vilka frågor du fick. Gör om testet så
          får du full återkoppling.
        </p>
      </section>
    )
  }

  /* Styrkor och svagheter per kategori. */
  const byCategory: Record<string, { correct: number; total: number }> = {}
  questions.forEach((q) => {
    const cat = categoryFor(slug, q.id)
    byCategory[cat] ??= { correct: 0, total: 0 }
    byCategory[cat].total += 1
    if (answers.find((a) => a.q_id === q.id)?.correct) byCategory[cat].correct += 1
  })
  const categories = Object.entries(byCategory).sort(
    (a, b) => b[1].correct / b[1].total - a[1].correct / a[1].total
  )

  return (
    <>
      {categories.length > 0 ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h2 className="text-base font-semibold text-neutral-900">
            Så gick det per mönstertyp
          </h2>
          <ul className="mt-4 divide-y divide-neutral-200">
            {categories.map(([cat, s]) => (
              <li
                key={cat}
                className="flex min-h-11 items-center justify-between gap-3 py-2"
              >
                <span className="text-sm text-neutral-900">{cat}</span>
                <span
                  className={`text-sm font-medium tabular-nums ${
                    s.correct === s.total ? 'text-emerald-700' : 'text-neutral-600'
                  }`}
                >
                  {s.correct} av {s.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-neutral-200 bg-white">
        <h2 className="border-b border-neutral-200 px-4 py-3 text-base font-semibold text-neutral-900 sm:px-6">
          Fråga för fråga
        </h2>
        <ul className="divide-y divide-neutral-200">
          {questions.map((q, i) => {
            const answer = answers.find((a) => a.q_id === q.id)
            const isOpen = openIndex === i

            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 sm:px-6"
                >
                  <span className="w-6 shrink-0 text-sm tabular-nums text-neutral-500">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-900">
                      {q.title.replace(/^FRÅGA\s+\d+\s*[-]\s*/i, '')}
                    </span>
                    <span className="mt-1 block text-xs tabular-nums text-neutral-500">
                      {answer
                        ? `${formatShort(answer.time_spent)} · svårighet ${q.difficulty} av 3`
                        : 'Inte besvarad'}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      !answer
                        ? 'text-neutral-500'
                        : answer.correct
                          ? 'text-emerald-700'
                          : 'text-red-700'
                    }`}
                  >
                    {!answer ? 'Hoppad' : answer.correct ? 'Rätt' : 'Fel'}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen ? (
                  <div className="space-y-4 px-4 pb-6 sm:px-6">
                    <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700">
                      {q.rule}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {answer && !answer.correct ? (
                        <ReviewCell
                          label={`Ditt svar (${String.fromCharCode(65 + answer.selected)})`}
                          cell={q.options[answer.selected]}
                          wrong
                        />
                      ) : null}
                      <ReviewCell
                        label={`Rätt svar (${String.fromCharCode(65 + q.correctAnswer)})`}
                        cell={q.options[q.correctAnswer]}
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

function ReviewCell({
  label,
  cell,
  wrong,
}: {
  label: string
  cell: LayeredCell
  wrong?: boolean
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <p
        className={`text-xs font-medium ${wrong ? 'text-red-700' : 'text-emerald-700'}`}
      >
        {label}
      </p>
      <div className="mx-auto mt-2 aspect-square w-full max-w-[96px] rounded-lg border border-neutral-200 bg-white p-2">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          shapeRendering="geometricPrecision"
          aria-hidden="true"
          focusable="false"
        >
          <SvgLayeredCell cell={cell} />
        </svg>
      </div>
    </div>
  )
}
