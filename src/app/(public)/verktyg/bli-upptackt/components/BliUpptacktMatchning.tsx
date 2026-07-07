'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Check, EyeOff } from 'lucide-react'
import { GradText, SectionHead } from './shared'

/** Din profil (fast referens som sökningarna matchas mot). */
const YOU = {
  role: 'Redovisningsekonom',
  region: 'Stockholm',
  test: { label: 'Matrislogik', pct: 10 }, // topp 10 %
  skills: ['Koncernredovisning', 'Bokslut'],
  style: 'Strukturerad',
}

type Req = { role: string; region: string; min: number; skill: string; style: string }
const SEARCHES: { name: string; req: Req }[] = [
  { name: 'Ekonomi · Stockholm', req: { role: 'Redovisningsekonom', region: 'Stockholm', min: 20, skill: 'Koncernredovisning', style: 'Strukturerad' } },
  { name: 'Annan region', req: { role: 'Redovisningsekonom', region: 'Göteborg', min: 20, skill: 'Koncernredovisning', style: 'Strukturerad' } },
  { name: 'Högre testkrav', req: { role: 'Redovisningsekonom', region: 'Stockholm', min: 5, skill: 'Bokslut', style: 'Strukturerad' } },
  { name: 'Annan arbetsstil', req: { role: 'Redovisningsekonom', region: 'Stockholm', min: 20, skill: 'Koncernredovisning', style: 'Utåtriktad' } },
]

type Row = { key: string; you: string; req: string; ok: boolean; indigo: boolean }

function buildRows(req: Req): Row[] {
  return [
    { key: 'role', you: YOU.role, req: req.role, ok: req.role === YOU.role, indigo: false },
    { key: 'region', you: YOU.region, req: req.region, ok: req.region === YOU.region, indigo: false },
    { key: 'test', you: `${YOU.test.label} · topp ${YOU.test.pct} %`, req: `Minst topp ${req.min} %`, ok: YOU.test.pct <= req.min, indigo: false },
    { key: 'skill', you: YOU.skills.join(', '), req: req.skill, ok: YOU.skills.includes(req.skill), indigo: false },
    { key: 'style', you: YOU.style, req: req.style, ok: req.style === YOU.style, indigo: true },
  ]
}

function rowClasses(ok: boolean, indigo: boolean) {
  if (!ok) return 'opacity-40'
  return indigo
    ? 'bg-indigo-50 border-indigo-200'
    : 'bg-orange-50 border-[#FBCFA0]'
}
function textClasses(ok: boolean, indigo: boolean) {
  if (!ok) return 'text-slate-600 line-through'
  return indigo ? 'text-indigo-800' : 'text-orange-800'
}
function nodeClasses(ok: boolean, indigo: boolean) {
  if (!ok) return 'bg-slate-300'
  return indigo ? 'bg-indigo-600' : 'bg-orange-500'
}

export default function BliUpptacktMatchning() {
  const [sIdx, setSIdx] = useState(0)
  const rows = buildRows(SEARCHES[sIdx].req)
  const matched = rows.filter((r) => r.ok).length
  const allMatch = matched === rows.length

  const gridRef = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<string>('')
  const [viewBox, setViewBox] = useState('0 0 100 100')

  const drawBridge = useCallback(() => {
    const grid = gridRef.current
    if (!grid) return
    const gr = grid.getBoundingClientRect()
    if (window.matchMedia('(max-width: 820px)').matches) {
      setPaths('')
      return
    }
    setViewBox(`0 0 ${gr.width} ${gr.height}`)
    const nodeCenter = (side: 'p' | 'r', i: number) => {
      const el = grid.querySelector(`.bli-prow[data-side="${side}"][data-i="${i}"] .bli-node`)
      if (!el) return null
      const b = (el as HTMLElement).getBoundingClientRect()
      return { x: b.left + b.width / 2 - gr.left, y: b.top + b.height / 2 - gr.top }
    }
    let out = ''
    rows.forEach((r, i) => {
      const a = nodeCenter('p', i)
      const b = nodeCenter('r', i)
      if (!a || !b) return
      const col = r.ok ? (r.indigo ? '#4F46E5' : '#16A34A') : '#CBD5E1'
      const dash = r.ok ? '' : 'stroke-dasharray="3 5"'
      const mx = (a.x + b.x) / 2
      out += `<path d="M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}" stroke="${col}" stroke-width="${r.ok ? 2.4 : 1.4}" fill="none" ${dash} opacity="${r.ok ? 1 : 0.65}"/>`
      if (r.ok) {
        const my = (a.y + b.y) / 2
        out += `<circle cx="${mx}" cy="${my}" r="7" fill="#ECFDF5" stroke="#6EE7B7" stroke-width="1.5"/><path d="M${mx - 3} ${my}l2 2 4-4" stroke="#059669" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      }
    })
    setPaths(out)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sIdx])

  // Rita om efter varje render (positionerna beror på innehållet) + dubbel rAF
  useLayoutEffect(() => {
    drawBridge()
    const r1 = requestAnimationFrame(() => requestAnimationFrame(() => drawBridge()))
    return () => cancelAnimationFrame(r1)
  }, [drawBridge])

  // Rita om vid resize
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(() => drawBridge(), 120)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [drawBridge])

  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow={
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Så här matchas du
            </>
          }
          sub="När en rekryterare söker i kandidatpoolen jämförs din profil, dina testresultat och din arbetsstil mot vad de letar efter. Prova en sökning nedan så ser du att bara det som faktiskt stämmer lyser grönt."
        >
          Rekryteraren hittar dig <GradText>för att du faktiskt passar</GradText>
        </SectionHead>

        <div className="max-w-[1096px] mx-auto mb-5 rounded-[14px] border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-800">
          <b className="text-amber-900">Interaktivt:</b> klicka på en sökning nedan, se hur matchningen håller eller bryts.
        </div>

        <div
          className="rounded-[28px] border border-orange-100 p-5 sm:p-7"
          style={{ background: 'linear-gradient(180deg,#FFF7F0,#FFFCF9)' }}
        >
          {/* Sök-chips */}
          <div className="flex items-center gap-2 flex-wrap justify-center mb-5">
            <span className="text-xs font-bold text-slate-400">Prova en sökning:</span>
            {SEARCHES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setSIdx(i)}
                className={`text-[12.5px] font-bold rounded-full px-3.5 py-1.5 border-[1.5px] transition-all ${
                  i === sIdx
                    ? 'border-orange-500 bg-orange-50 text-orange-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Match-grid */}
          <div
            ref={gridRef}
            className="relative grid grid-cols-1 lg:grid-cols-[1fr_64px_1fr] items-start gap-4 lg:gap-0"
          >
            {/* Din profil */}
            <div className="bg-white border border-orange-100 rounded-[20px] p-5 relative">
              <div className="text-[10.5px] font-extrabold tracking-[0.1em] uppercase text-slate-400 mb-3.5">Din profil</div>
              {rows.map((r, i) => (
                <div
                  key={r.key}
                  data-side="p"
                  data-i={i}
                  className={`bli-prow flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-1.5 border border-transparent transition-all ${rowClasses(r.ok, r.indigo)}`}
                >
                  <span
                    className={`w-[18px] h-[18px] rounded-md grid place-items-center flex-shrink-0 ${
                      r.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {r.ok ? <Check className="w-3 h-3" strokeWidth={3} /> : <EyeOff className="w-3 h-3" strokeWidth={2} />}
                  </span>
                  <span className={`text-[13px] font-semibold flex-1 ${textClasses(r.ok, r.indigo)}`}>{r.you}</span>
                  <span className={`bli-node w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${nodeClasses(r.ok, r.indigo)}`} />
                </div>
              ))}
            </div>

            {/* Brygg-kolumn (tom på desktop, SVG ligger som overlay) */}
            <div className="hidden lg:block" aria-hidden="true" />

            {/* Rekryterarens sökning */}
            <div className="bg-white border border-orange-100 rounded-[20px] p-5 relative">
              <div className="text-[10.5px] font-extrabold tracking-[0.1em] uppercase text-slate-400 mb-3.5">En rekryterares sökning</div>
              {rows.map((r, i) => (
                <div
                  key={r.key}
                  data-side="r"
                  data-i={i}
                  className={`bli-prow flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-1.5 border border-transparent transition-all ${rowClasses(r.ok, r.indigo)}`}
                >
                  <span className={`bli-node w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${nodeClasses(r.ok, r.indigo)}`} />
                  <span className={`text-[13px] font-semibold flex-1 ${textClasses(r.ok, r.indigo)}`}>{r.req}</span>
                  <span
                    className={`w-[18px] h-[18px] rounded-md grid place-items-center flex-shrink-0 ${
                      r.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {r.ok ? <Check className="w-3 h-3" strokeWidth={3} /> : <EyeOff className="w-3 h-3" strokeWidth={2} />}
                  </span>
                </div>
              ))}
              <div className="text-center mt-3.5 text-[13px] font-bold">
                {allMatch ? (
                  <>
                    <span className="text-orange-500">Full träff</span> · din profil syns för den här rekryteraren
                  </>
                ) : (
                  <>
                    <span className="text-slate-400">
                      {matched} av {rows.length} matchar
                    </span>{' '}
                    · den här sökningen hittar dig inte
                  </>
                )}
              </div>
            </div>

            {/* SVG-brygga (endast desktop) */}
            <div className="absolute inset-0 pointer-events-none z-[1] hidden lg:block">
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ overflow: 'visible' }}
                viewBox={viewBox}
                preserveAspectRatio="none"
                dangerouslySetInnerHTML={{ __html: paths }}
              />
            </div>
          </div>

          <p className="text-center text-[12.5px] text-slate-400 mt-4">
            Bara rekryterare vars sökning matchar din profil ser dig. Ingen bläddrar bland alla.
          </p>
        </div>
      </div>
    </section>
  )
}
