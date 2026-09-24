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
  fragor,
  utanTid = false,
  allaOppna = false,
}: {
  slug: string
  sessionId: string
  answers: MatrixSavedAnswer[]
  /**
   * Frågorna, när urvalet inte följer slugen. Logiktestprovet utan konto har
   * fem frågor seedade på sin token (src/lib/tests/prov-rad.ts).
   */
  fragor?: LayeredQuestion[]
  /** Utan tidsraden: provet utan konto mätte ingen tid per fråga. */
  utanTid?: boolean
  /** Alla förklaringar öppna från start, för en kort genomgång. */
  allaOppna?: boolean
}) {
  const [oppna, setOppna] = useState<ReadonlySet<number>>(() =>
    allaOppna && fragor ? new Set(fragor.map((_, i) => i)) : new Set()
  )
  const vaxla = (i: number) =>
    setOppna((fore) => {
      const nya = new Set(fore)
      if (nya.has(i)) nya.delete(i)
      else nya.add(i)
      return nya
    })

  // Samma seedade urval som testvyn gav, alltså exakt hennes frågor.
  const questions = useMemo(() => {
    if (fragor) return fragor
    const select = SELECTORS[slug]
    return select ? select(sessionId) : []
  }, [fragor, slug, sessionId])

  // Sessioner från en äldre frågebank matchar inte dagens urval. Då finns
  // ingen genomgång att visa, och vi säger det i stället för att visa fel.
  const isLegacy =
    answers.length > 0 && !answers.some((a) => questions.some((q) => q.id === a.q_id))

  if (questions.length === 0) return null

  if (isLegacy) {
    return (
      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <h2 className="text-kort text-ink-1">
          Genomgången saknas för det här försöket
        </h2>
        <p className="mt-2 text-sm leading-[22px] text-ink-2">
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
        <section aria-label="Så gick det per mönstertyp">
          <h2 className="mb-2 text-sm font-medium text-ink-3">Så gick det per mönstertyp</h2>
          <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
            {categories.map(([cat, s]) => (
              <li
                key={cat}
                className="flex min-h-11 items-center justify-between gap-3 px-4 py-2"
              >
                <span className="text-sm text-ink-1">{cat}</span>
                <span
                  className={`text-sm font-medium tabular-nums ${
                    s.correct === s.total ? 'text-positiv' : 'text-ink-3'
                  }`}
                >
                  {s.correct} av {s.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Fråga för fråga">
        <h2 className="mb-2 text-sm font-medium text-ink-3">Fråga för fråga</h2>
        <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
          {questions.map((q, i) => {
            const answer = answers.find((a) => a.q_id === q.id)
            const isOpen = oppna.has(i)

            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => vaxla(i)}
                  aria-expanded={isOpen}
                  className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-insunken"
                >
                  <span className="w-6 shrink-0 text-meta tabular-nums text-ink-3">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-1">
                      {q.title.replace(/^FRÅGA\s+\d+\s*[-]\s*/i, '')}
                    </span>
                    <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
                      {!answer
                        ? 'Inte besvarad'
                        : utanTid
                          ? `Svårighet ${q.difficulty} av 3`
                          : `${formatShort(answer.time_spent)} · svårighet ${q.difficulty} av 3`}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-meta font-medium ${
                      !answer
                        ? 'text-ink-3'
                        : answer.correct
                          ? 'text-positiv'
                          : 'text-fel'
                    }`}
                  >
                    {!answer ? 'Hoppad' : answer.correct ? 'Rätt' : 'Fel'}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className={`h-5 w-5 shrink-0 text-ink-3 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen ? (
                  <div className="space-y-4 px-4 pb-6">
                    <p className="rounded-lg border border-kant bg-insunken p-3 text-sm leading-[22px] text-ink-2">
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
    <div className="rounded-lg border border-kant bg-insunken p-3">
      <p className={`text-meta font-medium ${wrong ? 'text-fel' : 'text-positiv'}`}>
        {label}
      </p>
      <div className="mx-auto mt-2 aspect-square w-full max-w-[96px] rounded-lg border border-kant bg-panel p-2">
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
