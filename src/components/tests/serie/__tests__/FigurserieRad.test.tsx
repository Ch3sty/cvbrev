/**
 * S3, S5 och S10 i figurserier-spec.md avsnitt 11, på vyernas riktiga utdata:
 * en .serie med sex .ruta och luckan sist, inga remsomslag, bokstäver och
 * role="radio" bara i "bryter", och ingen grå fyllning i en duo-cell.
 */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { FigurserieAlternativ, FigurserieBryter, FigurserieRad } from '../FigurserieRad'
import { cellSvg } from '@/lib/logicTestV7/svgMatt'
import grund from '@/lib/figurserierV1/kandidater/grund.json'
import expert from '@/lib/figurserierV1/kandidater/expert.json'
import type { V7Cell } from '@/lib/logicTestV7/types.v7'

const q = grund[0] as unknown as { rad: V7Cell[]; options: V7Cell[]; correctAnswer: number }
const doc = (html: string) => new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')

describe('figurseriens markup (S5, S10)', () => {
  it('härnäst: en .serie med sex .ruta, luckan sist, inga bokstäver och inga remsomslag', () => {
    const d = doc(renderToStaticMarkup(<FigurserieRad rad={q.rad} />))
    const serier = d.querySelectorAll('.serie')
    expect(serier).toHaveLength(1)
    const rutor = serier[0].querySelectorAll(':scope > .ruta')
    expect(rutor).toHaveLength(6)
    expect(rutor[5].classList.contains('lucka')).toBe(true)
    expect(d.querySelectorAll('.remsa')).toHaveLength(0)
    expect(d.querySelectorAll('[role="radio"]')).toHaveLength(0)
    expect(serier[0].getAttribute('role')).toBe('img')
    expect(serier[0].getAttribute('aria-label')).toBe('Raden med fem figurer och en lucka sist')
  })

  it('efter svaret fylls luckan med facit i koppar-bläck, utan att rutorna blir fler', () => {
    const d = doc(renderToStaticMarkup(<FigurserieRad rad={q.rad} facit={q.options[q.correctAnswer]} />))
    const rutor = d.querySelectorAll('.serie > .ruta')
    expect(rutor).toHaveLength(6)
    expect(rutor[5].querySelector('.ratt-fylld')).not.toBeNull()
  })

  it('bryter: sex rutor som radioknappar med bokstav A till F', () => {
    const d = doc(renderToStaticMarkup(<FigurserieBryter rad={[...q.rad, q.options[0]]} vald={2} />))
    const rutor = d.querySelectorAll('.serie > .ruta[role="radio"]')
    expect(rutor).toHaveLength(6)
    expect([...rutor].map((r) => r.textContent)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
    expect(rutor[2].classList.contains('vald')).toBe(true)
    expect(d.querySelector('[role="radiogroup"]')).not.toBeNull()
  })

  it('alternativen: sex radioknappar, rätt med punkt och övriga tonade efter svaret', () => {
    const d = doc(renderToStaticMarkup(<FigurserieAlternativ options={q.options} valt={0} ratt={1} disabled />))
    const alt = d.querySelectorAll('[role="radio"]')
    expect(alt).toHaveLength(6)
    expect(alt[1].getAttribute('aria-label')).toBe('Svarsalternativ B, rätt svar')
    expect(alt[2].className).toMatch(/opacity-\[\.38\]/)
  })
})

describe('duo (S3)', () => {
  it('ingen kärna fylls grå i någon kandidat', () => {
    const duo = (expert as unknown as { rad: V7Cell[]; options: V7Cell[] }[]).flatMap((x) => [...x.rad, ...x.options]).filter((c) => c.kind === 'duo')
    expect(duo.length).toBeGreaterThan(0)
    for (const c of duo) expect(cellSvg(c)).not.toContain('#CBD5E1')
  })
})
