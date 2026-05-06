'use client'

import { motion } from 'framer-motion'
import OmOssTeamCard, { type TeamMember } from './OmOssTeamCard'

const TEAM: TeamMember[] = [
  {
    name: 'Helena Andersson',
    title: 'Grundare & VD',
    image: '/images/jobbcoach/Helena.webp',
    bio:
      'Med över tio års erfarenhet inom HR och rekrytering driver Helena visionen om att göra karriärmöjligheter mer tillgängliga för svenska jobbsökare.',
    expertise: ['Karriärstrategi', 'HR-ledarskap', 'Användarupplevelse', 'Produktvision'],
  },
  {
    name: 'Johan Eriksson',
    title: 'Tech Lead',
    image: '/images/jobbcoach/Johan.webp',
    bio:
      'Johan leder den tekniska utvecklingen och säkerställer att verktygen levererar konkret värde åt användarna utan onödig komplexitet under huven.',
    expertise: ['Backend-utveckling', 'Data', 'Systemarkitektur', 'Plattform'],
  },
  {
    name: 'Linda Svensson',
    title: 'UX-designer & Produktstrateg',
    image: '/images/jobbcoach/Linda.webp',
    bio:
      'Linda ansvarar för att avancerad teknik blir enkel att använda. Hennes fokus är att hitta den svenska användarupplevelsen som faktiskt fungerar i vardagen.',
    expertise: ['UX-design', 'Produktstrategi', 'Användarforskning', 'Designsystem'],
  },
]

export default function OmOssTeam() {
  return (
    <section
      id="vart-team"
      className="relative py-16 sm:py-24 bg-orange-50/30 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Vårt team
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Människorna bakom{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Jobbcoach.ai
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Ett litet team med stor passion för svensk arbetsmarknad och
            verktyg som faktiskt fungerar i vardagen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {TEAM.map((member, idx) => (
            <OmOssTeamCard key={member.name} member={member} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
