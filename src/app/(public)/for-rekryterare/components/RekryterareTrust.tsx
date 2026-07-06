'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, EyeOff, Building2, FileX } from 'lucide-react'

/**
 * Trust-sektion: GDPR-designen som säljargument. Fyra punkter i vita kort
 * på en mjuk orange bakgrundsplatta.
 */
const TRUST_POINTS = [
  {
    Icon: ShieldCheck,
    title: 'Uttryckligt samtycke',
    body: 'Varje kandidat har aktivt valt att synas i poolen och kan dra tillbaka samtycket när som helst. Ingen skrapad data, inga överraskade kandidater.',
  },
  {
    Icon: EyeOff,
    title: 'Anonym tills kandidaten säger ja',
    body: 'Namn, foto och kontaktuppgifter är dolda tills kandidaten accepterat er kontakt. Det skyddar kandidaten och ger dig svar från folk som faktiskt är intresserade.',
  },
  {
    Icon: Building2,
    title: 'Verifierade rekryterare',
    body: 'Vi godkänner varje rekryterarkonto manuellt mot organisationsnummer innan det får tillgång till poolen. Kandidaterna vet att bara riktiga företag ser dem.',
  },
  {
    Icon: FileX,
    title: 'Inga rå-CV:n',
    body: 'Vi delar aldrig råa dokument. Du ser strukturerade, verifierade uppgifter som kandidaten godkänt för visning, varken mer eller mindre.',
  },
]

export default function RekryterareTrust() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-gradient-to-b from-orange-50/70 to-white border border-orange-100 p-6 sm:p-10 lg:p-14">
          {/* Sektion-header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
              Byggt GDPR-först
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
              Integriteten är inte ett hinder.
              <br className="hidden sm:block" />{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Den är produkten.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Kandidater som känner sig trygga vågar synas, och svarar när du
              hör av dig. Därför är hela flödet designat runt samtycke.
            </p>
          </motion.div>

          {/* Punkter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {TRUST_POINTS.map(({ Icon, title, body }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className="flex items-start gap-4 bg-white rounded-2xl border border-orange-100 p-5 sm:p-6"
                style={{
                  boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.2)',
                }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700">
                  <Icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 mb-1 leading-tight">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
