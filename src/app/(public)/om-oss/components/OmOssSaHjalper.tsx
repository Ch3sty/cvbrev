'use client'

import { motion } from 'framer-motion'
import { useGlobalCounters } from '@/contexts/GlobalCountersContext'
import {
  IconAnsokning,
  IconHittaJobb,
  IconKarriarSvar,
  IconRekryteringstester,
  IconLinkedin,
} from './illustrations/OmOssIcons'

const HJALPER = [
  {
    Icon: IconAnsokning,
    title: 'Skapa starka ansökningar',
    body:
      'CV-byggare med svenska mallar, personligt brev som inte låter som ChatGPT, ATS-analys som visar exakt vad som saknas innan rekryteraren ser ditt CV.',
  },
  {
    Icon: IconHittaJobb,
    title: 'Hitta jobben som passar',
    body:
      'Jobbmatchning mot Arbetsförmedlingens öppna API, sortering på relevans och matchnings-procent per annons så du ser direkt vilka tjänster som är värda en ansökan.',
  },
  {
    Icon: IconKarriarSvar,
    title: 'Få svar när du behöver dem',
    body:
      'Karriärguiden svarar på frågor om lön, arbetsrätt, intervju och karriärbyte med klickbara källhänvisningar till SCB, Arbetsförmedlingen och fackförbund.',
  },
  {
    Icon: IconRekryteringstester,
    title: 'Träna på rekryteringstester',
    body:
      'Matrislogik, verbalt och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder. Score och rapport direkt efter varje pass.',
  },
  {
    Icon: IconLinkedin,
    title: 'Optimera din LinkedIn',
    body:
      'Fem profil-sektioner optimeras samtidigt mot rekryterar-sökningar. Du copy-pastar in din text och tillbaka, vi loggar aldrig in på din LinkedIn.',
  },
]

export default function OmOssSaHjalper() {
  const { counters } = useGlobalCounters()
  const showStats =
    counters.totalUsers > 0 || counters.totalLetters > 0

  return (
    <section className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Plattformen
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Så hjälper plattformen{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              dig
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Fem områden där vi gör jobbsökningen mindre tung. Du väljer vilka
            verktyg du behöver, vi har dem alla i samma plattform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {HJALPER.map(({ Icon, title, body }, idx) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
              }}
            >
              <Icon className="w-14 h-14 mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.article>
          ))}
        </div>

        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-10 sm:mt-12"
          >
            <div className="rounded-3xl border border-orange-100 bg-white p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {counters.totalUsers > 0 && (
                  <div>
                    <div
                      className="text-3xl sm:text-4xl font-black mb-1"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {counters.totalUsers.toLocaleString('sv-SE')}+
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      användare har skapat konto
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      sedan vi startade som cvbrev.se 2023
                    </div>
                  </div>
                )}
                {counters.totalLetters > 0 && (
                  <div>
                    <div
                      className="text-3xl sm:text-4xl font-black mb-1"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {counters.totalLetters.toLocaleString('sv-SE')}+
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      personliga brev genererade
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      siffrorna uppdateras från databasen
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
