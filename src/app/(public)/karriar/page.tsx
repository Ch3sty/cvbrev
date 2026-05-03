'use client'

import { Briefcase, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function KarriärPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Briefcase className="w-10 h-10 text-white" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Karriärmöjligheter
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Kommer snart
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 mb-8 leading-relaxed"
          >
            Vi bygger ett fantastiskt team för att revolutionera karriärvägledning i Sverige.
            Håll utkik efter spännande roller inom AI, UX-design och produktutveckling.
          </motion.p>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-10"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
              <Sparkles className="w-8 h-8 text-pink-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">Arbeta med cutting-edge AI-teknologi för karriärutveckling</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
              <Heart className="w-8 h-8 text-pink-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Påverkan</h3>
              <p className="text-gray-600 text-sm">Hjälp tusentals svenskar att nå sina karriärmål</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Kontakta oss för framtida möjligheter
            </Link>
            <p className="text-sm text-gray-500">
              Följ oss på LinkedIn för uppdateringar om lediga tjänster
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}