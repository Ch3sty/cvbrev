/**
 * LinkedIn-optimering Landing Page
 * Premium landing page för LinkedIn-profiloptimering
 */
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Linkedin, ArrowRight, CheckCircle, Star, Users, TrendingUp,
  Target, Sparkles, Shield, Eye, Search, Award
} from 'lucide-react'
import PremiumNavbar from '@/components/PremiumNavbar'

export default function LinkedInOptimeringSida() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <PremiumNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30" />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Nytt verktyg</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              LinkedIn-profil som{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                lockar rekryterare
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              80% av rekryterare söker kandidater via LinkedIn. Om din profil inte är optimerad för AI-drivna sökningar syns du inte – även om du är perfekt för jobbet.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link
                href="/dashboard/linkedin-optimizer"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Optimera min LinkedIn-profil
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/artikel/ai-rekrytering-sverige"
                className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Läs om AI-rekrytering
              </Link>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-6 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-slate-600">Gratis att testa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-slate-600">AI-optimerad</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-slate-600">Klart på 5 min</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Därför syns du inte i rekryterarnas sökningar
              </h2>
              <p className="text-lg text-slate-600">
                Även med rätt kompetens kan en icke-optimerad LinkedIn-profil göra dig osynlig
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Search,
                  title: 'Saknar rätt nyckelord',
                  description: 'Rekryterare söker på specifika termer. Om din profil inte innehåller dessa hittas du inte – oavsett kompetens.'
                },
                {
                  icon: Eye,
                  title: 'Svag Headline',
                  description: 'Headline är det första rekryterare ser i sökresultat. En generisk headline (t.ex. bara din titel) gör att du missas.'
                },
                {
                  icon: TrendingUp,
                  title: 'Låg aktivitet',
                  description: 'LinkedIns algoritm prioriterar aktiva profiler. Ingen aktivitet = lägre synlighet i sökningar.'
                }
              ].map((problem, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <problem.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-slate-600 text-sm">{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Så hjälper vi dig synas
              </h2>
              <p className="text-xl text-slate-600">
                AI-driven optimering för maximal synlighet hos rekryterare
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Target,
                  title: 'Keyword-optimering',
                  description: 'Analyserar din bransch och målroll, föreslår de 15-20 viktigaste nyckelorden som rekryterare söker på.',
                  badge: 'AI-driven'
                },
                {
                  icon: Sparkles,
                  title: 'Headline-generator',
                  description: 'Skapar en kraftfull Headline som innehåller din roll + nyckelkompetenser. Max 220 tecken optimerade för LinkedIn-sökning.',
                  badge: 'Automatisk'
                },
                {
                  icon: Award,
                  title: 'About-sektion som konverterar',
                  description: 'Omskriver din About-sektion för att balansera nyckelord med engagerande storytelling som lockar rekryterare att kontakta dig.',
                  badge: 'Premium'
                },
                {
                  icon: TrendingUp,
                  title: 'Skills-prioritering',
                  description: 'Visar vilka skills du ska "pin" högst upp och vilka som är mindre viktiga. Rekryterare ser bara dina Top 3 skills i sökresultat.',
                  badge: 'Smart'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-900/5 border border-slate-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">{feature.title}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {feature.badge}
                        </span>
                      </div>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-blue-50 border-y border-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { number: '80%', label: 'av rekryterare använder LinkedIn för att hitta kandidater' },
                { number: '3x', label: 'fler synligheter med optimerad profil' },
                { number: '5 min', label: 'så lång tid tar det att optimera din profil' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <p className="text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Så fungerar det
              </h2>
              <p className="text-lg text-slate-600">
                Från genomsnittlig profil till rekryteringsmagnet på 5 minuter
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Kopiera din nuvarande LinkedIn-profil',
                  description: 'Klistra in text från din Headline, About-sektion, och Experience. Ange din målroll (t.ex. "Product Manager").'
                },
                {
                  step: '2',
                  title: 'AI analyserar och optimerar',
                  description: 'Vårt AI-verktyg analyserar din profil, identifierar saknade nyckelord och genererar optimerade versioner av varje sektion.'
                },
                {
                  step: '3',
                  title: 'Kopiera och uppdatera LinkedIn',
                  description: 'Få färdiga texter att kopiera in på LinkedIn. Följ våra tips för skills-prioritering och aktivitet.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-6 items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Börja synas i rekryterarnas sökningar idag
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Gratis att testa. Klart på 5 minuter. Ingen registrering krävs för att se förhandsgranskning.
            </p>
            <Link
              href="/dashboard/linkedin-optimizer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-300"
            >
              Optimera min LinkedIn-profil nu
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-blue-100">
                <Shield className="w-5 h-5" />
                <span className="text-sm">GDPR-säker</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Users className="w-5 h-5" />
                <span className="text-sm">2,000+ användare</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm">4.9/5 betyg</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
