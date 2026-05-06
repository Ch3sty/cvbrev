'use client'

import { motion } from 'framer-motion'
import { Compass, Target } from 'lucide-react'

const LAGEN = [
  {
    Icon: Compass,
    label: 'Stå ut i mängden',
    when: 'Välj när du är öppen för flera typer av roller i din bransch.',
    body:
      'Vi bygger en bred profil som rankar i flera olika rekryterar-sökningar. Ingen specifik roll låser ner profilen, men keywords håller dig synlig för flera arbetsgivare och nischer.',
    bullets: ['Bred branschtäckning', 'Funkar för aktiva och passiva sökanden', 'Behåller flexibilitet'],
  },
  {
    Icon: Target,
    label: 'Sikta på en specifik roll',
    when: 'Välj när du vet exakt vilken nästa titel du går efter.',
    body:
      'Du fyller i målrollen, till exempel "Senior Backend Engineer" eller "Marknadschef B2B SaaS". Vi anpassar headline, om-mig och erfarenhet så de matchar precis det språk rekryterare använder för den tjänsten.',
    bullets: ['Skarp keyword-träffyta', 'Anpassad ton mot rollens senioritet', 'Kan göras om mot annan roll senare'],
  },
]

export default function LinkedinOptimeringTvaLagen() {
  return (
    <section className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Två lägen
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Bred eller{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              skarp inriktning
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Du väljer i steg ett, och kan göra om optimeringen i andra läget
            när som helst om du byter strategi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {LAGEN.map(({ Icon, label, when, body, bullets }, idx) => (
            <motion.article
              key={label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 10px 36px -16px rgba(249, 115, 22, 0.2)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5"
                style={{
                  background:
                    idx === 0
                      ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                      : 'linear-gradient(135deg, #DC2626 0%, #BE185D 100%)',
                }}
              >
                <Icon className="w-7 h-7" strokeWidth={2.2} />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">
                {label}
              </h3>
              <p className="text-sm font-bold text-orange-700 mb-3">
                {when}
              </p>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5">
                {body}
              </p>

              <ul className="space-y-2">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span
                      className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                      }}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
