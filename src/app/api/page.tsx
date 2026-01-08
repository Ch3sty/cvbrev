'use client'

import { Code, ArrowLeft, Key, Book, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function APIPage() {
  const apiFeatures = [
    {
      icon: Zap,
      title: "AI-genererade brev",
      description: "Integrera vår AI för att skapa personliga brev programmatiskt"
    },
    {
      icon: Book,
      title: "CV-analys",
      description: "Analysera CV:n och få feedback via vårt REST API"
    },
    {
      icon: Key,
      title: "Säker autentisering",
      description: "OAuth 2.0 och API-nycklar för säker åtkomst"
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
              <Code className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Jobbcoach.ai API
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Integrera AI-driven karriärvägledning i dina applikationer
            </motion.p>
          </div>

          {/* API Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {apiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <feature.icon className="w-8 h-8 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-gray-900 rounded-2xl p-6 mb-12 shadow-lg"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Exempel: Skapa personligt brev
            </h3>
            <pre className="text-green-400 text-sm overflow-x-auto">
{`fetch('https://api.jobbcoach.ai/v1/letters', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobTitle: 'Frontend-utvecklare',
    company: 'Spotify',
    userProfile: {...}
  })
})`}
            </pre>
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200/50 p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">API lanseras Q2 2026</h2>
            <p className="text-gray-600 mb-6">
              Vi förbereder en kraftfull och användarvänlig API för utvecklare och företag
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Intresseanmälan</h4>
                <p className="text-sm text-gray-600 mb-3">Få early access och specialpriser</p>
                <input
                  type="email"
                  placeholder="din@email.se"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
              </div>

              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Kontakta oss för mer info
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}