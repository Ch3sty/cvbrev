import { SectionHead } from './shared'
import { BLI_UPPTACKT_FAQ_ITEMS } from './bli-upptackt-faq-data'

export default function BliUpptacktFAQ() {
  return (
    <section className="py-14 sm:py-16 bg-white border-y border-orange-100">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Vanliga frågor">Det du undrar</SectionHead>
        <div className="space-y-2.5">
          {BLI_UPPTACKT_FAQ_ITEMS.map((f) => (
            <details key={f.q} className="group border border-slate-100 rounded-2xl px-4 py-4 open:bg-[#FFFCF9]">
              <summary className="text-[14.5px] font-extrabold text-slate-900 cursor-pointer list-none flex items-center justify-between gap-3">
                {f.q}
                <span className="text-orange-500 transition-transform group-open:rotate-45 text-xl leading-none font-normal">+</span>
              </summary>
              <p className="text-[13px] text-slate-600 leading-relaxed mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
