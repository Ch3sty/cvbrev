import { FileText, Award, EyeOff, MessageSquare } from 'lucide-react'
import { GradText, SectionHead } from './shared'

const STEPS: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  body: string
}[] = [
  {
    icon: FileText,
    title: 'Skapa din profil',
    body: 'Lägg in ditt CV, så fyller vi i din yrkesroll, dina kompetenser och din erfarenhet automatiskt. Du kan ändra allt själv.',
  },
  {
    icon: Award,
    title: 'Gör testerna, om du vill',
    body: 'Personlighetstestet och kunskapstesterna är frivilliga. Gör du dem får din profil starkare bevis för vad du kan och hur du jobbar.',
  },
  {
    icon: EyeOff,
    title: 'Slå på synlighet',
    body: 'När du är redo aktiverar du synlighet. Din profil blir sökbar för verifierade rekryterare, men helt anonymt. De ser inte vem du är.',
  },
  {
    icon: MessageSquare,
    title: 'En rekryterare hör av sig, du väljer',
    body: 'Gillar en rekryterare det de ser skickar de en kontaktförfrågan. Tackar du ja delas namn och kontakt, och ni chattar i appen.',
  },
]

export default function BliUpptacktSaFunkar() {
  return (
    <section id="sa-funkar-det" className="py-14 sm:py-16 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Så funkar det">
          Fyra steg, <GradText>du styr i varje</GradText>
        </SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-white border border-slate-100 rounded-[20px] p-5 relative">
              <span className="absolute top-[18px] right-5 text-xs font-black text-[#FBCFA0]">0{i + 1}</span>
              <div className="w-11 h-11 rounded-[13px] bg-orange-50 text-orange-700 grid place-items-center mb-3.5">
                <s.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-[15.5px] font-extrabold text-slate-900 mb-1.5">{s.title}</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
