/**
 * Bladets utkast går till arbetsläget medan hon skriver (useUtkast i
 * blad/Ram.tsx). Slutkontrollen 2026-11-21 såg "Maximum update depth
 * exceeded" (React #185) i Erfarenhet när en rollpunkts [antal] fylldes i.
 *
 * Mekanismen: ett tangenttryck renderas i sync-lane, effekterna efter den
 * commiten körs direkt, och utkastet lade då en uppdatering hos arbetsläget
 * i default-lane. Hinner nästa tangenttryck före den uppdateringen räknar
 * React varje commit som nästlad, och efter femtio i rad kastas #185. Här
 * skrivs tecknen med bara mikrouppgifter emellan, alltså snabbare än
 * default-lane hinner, som när en testare eller inklistring skriver fort.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCallback, useState } from 'react'
import { cleanup, render } from '@testing-library/react'
import type { ByggCv } from '@/lib/cv/bygg/modell'
import Blad from '../blad/Blad'
import { ArbetsKontext, type Arbete } from '../blad/Ram'

const CV: ByggCv = {
  personalInfo: { fullName: 'Test Testsson', email: 'test@example.com' },
  summary: '',
  experience: [
    {
      position: 'Säljare',
      company: 'Exempel AB',
      startDate: '2020-01',
      description: ['Ökade försäljningen med [antal] procent', 'Ansvarade för [antal] kunder'],
    },
  ],
  education: [],
  skills: [],
  languages: [],
} as unknown as ByggCv

function Arbetslaget() {
  const [utkast, setUtkast] = useState<ByggCv | null>(null)
  const registrera = useCallback(() => undefined, [])
  const arbete: Arbete = {
    dator: true,
    lage: 'redigera',
    fallt: false,
    setFallt: () => undefined,
    avsnittsrad: null,
    ovan: null,
    nasta: null,
    fotText: '',
    onAvbryt: null,
    registrera,
    onUtkast: setUtkast,
  }
  return (
    <ArbetsKontext.Provider value={arbete}>
      <output data-utkast>{utkast?.experience[0]?.description?.join('|') ?? ''}</output>
      <Blad ark={{ typ: 'post', sektion: 'erfarenhet', index: 0 }} cv={CV} onSpara={() => undefined} onTaBort={() => undefined} onOppna={() => undefined} />
    </ArbetsKontext.Provider>
  )
}

/** Ett tangenttryck som webbläsarens, inte inslaget i act() som testbibliotekets fireEvent. */
function skriv(el: HTMLTextAreaElement, varde: string) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(el, varde)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

const mikro = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}
const makro = () => new Promise((r) => setTimeout(r, 0))

describe('arbetslägets utkast medan hon skriver', () => {
  const fel: unknown[] = []
  const fanga = (e: ErrorEvent) => {
    fel.push(e.error ?? e.message)
    e.preventDefault()
  }
  let forraAct: unknown

  beforeEach(() => {
    // Som i webbläsaren: React schemalägger själv, utan act().
    forraAct = (globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown }).IS_REACT_ACT_ENVIRONMENT
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown }).IS_REACT_ACT_ENVIRONMENT = false
    // jsdom saknar rullning; Ram rullar bladets kropp till toppen.
    if (!HTMLElement.prototype.scrollTo) HTMLElement.prototype.scrollTo = () => undefined
    fel.length = 0
    window.addEventListener('error', fanga)
  })
  afterEach(() => {
    window.removeEventListener('error', fanga)
    cleanup()
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown }).IS_REACT_ACT_ENVIRONMENT = forraAct
  })

  it('snabb inmatning i rollpunkterna ger inget #185 och utkastet når arbetsläget', async () => {
    // Utvecklingsläget varnar i konsolen för samma slinga i effekterna (passiva uppdateringar).
    const konsol = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { container } = render(<Arbetslaget />)
    await makro()
    const yta = container.querySelector<HTMLTextAreaElement>('#e-punkter')
    expect(yta).not.toBeNull()
    let text = yta!.value
    const tal = '1234567890'.repeat(8)
    for (const t of tal) {
      text = text.replace('[antal]', `${t}[antal]`)
      skriv(yta!, text)
      await mikro()
    }
    await makro()
    await makro()

    expect(fel.map(String).filter((e) => /Maximum update depth|#185/.test(e))).toEqual([])
    expect(konsol.mock.calls.map((a) => String(a[0])).filter((e) => /Maximum update depth/.test(e))).toEqual([])
    konsol.mockRestore()
    expect(container.querySelector('[data-utkast]')?.textContent).toContain(tal)
  })
})
