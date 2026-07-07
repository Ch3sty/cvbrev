import { ShieldCheck, EyeOff } from 'lucide-react'
import { GradText, SectionHead } from './shared'

const CARDS: { title: string; body: string }[] = [
  {
    title: 'Du är anonym tills du säger ja',
    body: 'Rekryteraren ser din roll, region, kompetenser och testresultat, men inte ditt namn eller dina kontaktuppgifter förrän du tackat ja till en förfrågan.',
  },
  {
    title: 'Din nuvarande chef kan inte hitta dig',
    body: 'Vi döljer vilket företag du jobbar på idag, så din arbetsgivare kan surfa runt i kandidatpoolen utan att känna igen dig.',
  },
  {
    title: 'Bara riktiga företag får söka',
    body: 'Vi kontrollerar att varje rekryterare hör till ett verkligt företag innan de släpps in, så du slipper oseriösa förfrågningar.',
  },
]

export default function BliUpptacktTrygghet() {
  return (
    <section className="py-14 sm:py-16 bg-white border-y border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow={
            <>
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} /> Din trygghet
            </>
          }
          sub="Det är du som bestämmer vem som får se vem du är, och när."
        >
          Du har full kontroll <GradText>hela vägen</GradText>
        </SectionHead>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map((c) => (
            <div key={c.title} className="bg-[#FFFCF9] border border-slate-100 rounded-[20px] p-5">
              <div className="w-[42px] h-[42px] rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center mb-3">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-900 mb-1.5">{c.title}</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <span className="inline-flex items-center gap-2 text-[12.5px] text-slate-600 bg-white border border-slate-100 rounded-xl px-4 py-3">
            <EyeOff className="w-[15px] h-[15px] text-slate-400 flex-shrink-0" strokeWidth={2} />
            Ditt namn, dina kontaktuppgifter, ditt CV-dokument och din arbetsgivare visas aldrig förrän du själv tackat ja.
          </span>
        </div>
      </div>
    </section>
  )
}
