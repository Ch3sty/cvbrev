import { SlidersHorizontal, Award } from 'lucide-react'
import { GRAD_O, SectionHead } from './shared'

type Spec = { a: string; b: string; pct: number }
const CARDS: { title: string; specs: Spec[]; quote: string }[] = [
  {
    title: 'Så arbetar du',
    specs: [{ a: 'Improviserar', b: 'Planerar och strukturerar', pct: 82 }],
    quote: 'Du bygger struktur där den saknas och håller deadlines utan påminnelser.',
  },
  {
    title: 'Så samarbetar du',
    specs: [{ a: 'Eget fokusarbete', b: 'Samarbete i grupp', pct: 30 }],
    quote: 'Du ställer upp utan att bli tillfrågad. Kollegors framgång väger tungt i din motivation.',
  },
  {
    title: 'Så drivs du',
    specs: [{ a: 'Lyssnande och underlag', b: 'Kommandot i rummet', pct: 22 }],
    quote: 'Stark tilltro till egen förmåga utan behov av rampljus. Du leder genom expertis.',
  },
]

export default function BliUpptacktArbetsstil() {
  return (
    <section className="py-14 sm:py-16 bg-white border-y border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Frivilligt personlighetstest"
          eyebrowIndigo
          sub="Rekrytering handlar inte bara om vilka kompetenser du har på pappret, utan om hur du samarbetar, fattar beslut och driver dig själv framåt. Därför kan du göra ett personlighetstest på jobbcoach.ai. Det tar en stund, men det gör stor skillnad, och du väljer själv om det ska synas."
        >
          Visa hur du jobbar, <span style={{ color: '#4F46E5' }}>inte bara vad du kan</span>
        </SectionHead>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map((c) => (
            <div key={c.title} className="bg-white border border-indigo-200 rounded-[20px] p-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center mb-3.5">
                <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-900 mb-3.5">{c.title}</h3>
              {c.specs.map((s, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-[11.5px] mb-1.5">
                    <span className={s.pct < 50 ? 'font-bold text-indigo-800' : 'text-slate-400'}>{s.a}</span>
                    <span className={s.pct >= 50 ? 'font-bold text-indigo-800' : 'text-slate-400'}>{s.b}</span>
                  </div>
                  <div className="h-1 bg-indigo-50 rounded-full relative">
                    <i
                      className="absolute top-1/2 w-[13px] h-[13px] rounded-full bg-indigo-600 border-2 border-white -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${s.pct}%`, boxShadow: '0 2px 6px rgba(79,70,229,.4)' }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[12.5px] text-slate-600 leading-relaxed mt-2.5">{c.quote}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[12.5px] text-slate-400 mt-6">
          Testet ger dig en rapport i ord om hur du fungerar, så rekryteraren ser om du skulle trivas i just deras team. Du ser exakt samma rapport som de gör, och du väljer om den ska visas.
        </p>

        {/* Kunskapstester */}
        <div className="max-w-[820px] mx-auto mt-8 bg-white border border-orange-100 rounded-[20px] p-6 flex gap-4 items-start">
          <div
            className="w-[46px] h-[46px] rounded-[14px] text-white grid place-items-center flex-shrink-0"
            style={{ background: GRAD_O }}
          >
            <Award className="w-[23px] h-[23px]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1.5">Bevisa vad du kan med kunskapstester</h3>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Du kan också göra korta tester i logik, verbalt och numeriskt tänkande. Resultatet visar var du ligger jämfört med andra som gjort samma test, till exempel bland de 10 procent som presterade bäst. Det blir ett riktigt bevis på din förmåga, i stället för att du bara påstår att du är analytisk. Också helt frivilligt.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
