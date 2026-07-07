import { GradText, GRAD_O, SectionHead } from './shared'

const SKILLS = ['Bokslut', 'Koncernredovisning', 'Fortnox']

/**
 * Demonstrativ, avidentifierad exempelprofil: exakt vad en rekryterare ser,
 * inte mer. Speglar StaticCandidateCard men i lättviktig egen markup.
 */
export default function BliUpptacktExempel() {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Demonstration"
          sub="De ser din yrkesroll, region, kompetenser, dina testresultat och din arbetsstil. De ser inte ditt namn, ditt foto, dina kontaktuppgifter, ditt CV-dokument eller vilket företag du jobbar på idag."
        >
          Det här ser en rekryterare <GradText>av din profil</GradText>
        </SectionHead>

        <div
          className="max-w-[440px] mx-auto bg-white border border-orange-100 rounded-[20px] p-5"
          style={{ boxShadow: '0 12px 34px -18px rgba(2,6,23,.2)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-[14px] text-white font-extrabold text-lg grid place-items-center"
              style={{ background: GRAD_O }}
            >
              R
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-slate-900">Redovisningsekonom</div>
              <div className="text-[12.5px] text-slate-400">Stockholm · Anonym</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-2.5">
            <b className="text-slate-900">8 års erfarenhet</b> · Senast: Redovisningsansvarig (4 år) · Civilekonom
          </p>
          <p className="text-[12.5px] italic text-slate-600 leading-relaxed mb-2.5">
            &ldquo;Redovisningsekonom med åtta år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp.&rdquo;
          </p>

          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-[11px] font-bold rounded-full px-2.5 py-1.5 bg-orange-50 border border-[#FBCFA0] text-orange-800">
              Matrislogik · topp 10 %
            </span>
            <span className="text-[11px] font-bold rounded-full px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800">
              Strukturerad
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map((s) => (
              <span key={s} className="text-[11px] font-semibold border border-slate-100 bg-[#FCFCFD] text-slate-600 rounded-full px-2.5 py-1.5">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
