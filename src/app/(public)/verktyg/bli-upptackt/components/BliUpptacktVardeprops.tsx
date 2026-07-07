import { Target, EyeOff, Award, Users } from 'lucide-react'
import { GradText, GRAD_O, SectionHead } from './shared'

const PROPS: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  body: string
}[] = [
  {
    icon: Target,
    title: 'Rätt rekryterare, inte alla',
    body: 'Bara rekryterare som söker precis din typ av kompetens hör av sig. Du slipper drunkna i fel förfrågningar.',
  },
  {
    icon: EyeOff,
    title: 'Du bestämmer när du syns',
    body: 'Slå på och av synligheten när du vill. Namn och kontakt delas först när du själv tackar ja.',
  },
  {
    icon: Award,
    title: 'Bevis, inte påståenden',
    body: 'Testresultat visar svart på vitt vad du kan, i stället för att du bara skriver det i ett brev.',
  },
  {
    icon: Users,
    title: 'Så du passar teamet',
    body: 'Din arbetsstil visar hur du samarbetar och jobbar, så rekryteraren ser om du trivs hos dem.',
  },
]

export default function BliUpptacktVardeprops() {
  return (
    <section className="py-14 sm:py-16 bg-white border-y border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Därför funkar det">
          Rätt synlighet, <GradText>inte mer synlighet</GradText>
        </SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROPS.map((p) => (
            <div key={p.title} className="bg-[#FFFCF9] border border-slate-100 rounded-[20px] p-5">
              <div
                className="w-[46px] h-[46px] rounded-[14px] text-white grid place-items-center mb-3.5"
                style={{ background: GRAD_O }}
              >
                <p.icon className="w-[23px] h-[23px]" strokeWidth={2} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">{p.title}</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
