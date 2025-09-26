'use client'

import { Puzzle, ArrowLeft, Linkedin, Briefcase, Mail, Users } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function IntegrationsPage() {
  const futureIntegrations = [
    {
      icon: Linkedin,
      name: "LinkedIn",
      description: "Importera profil och optimera för jobbsökning",
      status: "Planerad Q2 2025"
    },
    {
      icon: Briefcase,
      name: "Arbetsförmedlingen",
      description: "Sök jobb direkt från plattformen",
      status: "Under utveckling"
    },
    {
      icon: Mail,
      name: "Gmail & Outlook",
      description: "Skicka personliga brev direkt från din e-post",
      status: "Planerad Q3 2025"
    },
    {
      icon: Users,
      name: "ATS-system",
      description: "Integration med Applicant Tracking Systems",
      status: "Enterprise-funktion"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      {/* Navbar placeholder */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">Jobbcoach</span>
            <span className="text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-md px-1.5 py-0.5 ml-1 leading-tight shadow-sm">.ai</span>
          </Link>
          <Link href="/" className="text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till startsidan
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Puzzle className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Integrationer
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Koppla samman Jobbcoach.ai med de verktyg du redan använder
            </motion.p>
          </div>

          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 mb-12 shadow-sm text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Integrationer under utveckling</h2>
            <p className="text-gray-600 leading-relaxed">
              Vi arbetar på att skapa sömlösa kopplingar till de mest populära verktygen för jobbsökning och karriärutveckling i Sverige
            </p>
          </motion.div>

          {/* Future Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            {futureIntegrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <integration.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{integration.description}</p>
                    <span className="inline-block bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full font-medium">
                      {integration.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Integration Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Snabbare arbetsflöde</h3>
              <p className="text-gray-600 text-sm">Importera data automatiskt och spara tid</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bättre matchning</h3>
              <p className="text-gray-600 text-sm">AI anpassar innehåll baserat på jobbdata</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">📈</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mät resultat</h3>
              <p className="text-gray-600 text-sm">Följ upp ansökningar och optimera strategi</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200/50 p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vill du föreslå en integration?</h2>
            <p className="text-gray-600 mb-6">
              Berätta vilket verktyg du använder så prioriterar vi utvecklingen
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Föreslå integration
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}