'use client'

import { Newspaper, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
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
              <Newspaper className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Pressrum
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Pressmeddelanden, logotyper och information för journalister
            </motion.p>
          </div>

          {/* Quick Facts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 mb-12 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Snabbfakta om Jobbcoach.ai</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Grundat</h3>
                <p className="text-gray-600">2024</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Marknad</h3>
                <p className="text-gray-600">Sverige</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fokus</h3>
                <p className="text-gray-600">Karriärvägledning som gör skillnad</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pris</h3>
                <p className="text-gray-600">149 SEK/månad</p>
              </div>
            </div>
          </motion.div>

          {/* Press Kit Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
              <Download className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Presskit</h3>
              <p className="text-gray-600 mb-4">Ladda ner logotyper, produktbilder och företagsinformation</p>
              <button className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-2">
                Kommer snart <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
              <Newspaper className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Pressmeddelanden</h3>
              <p className="text-gray-600 mb-4">Senaste nyheterna och uppdateringar från Jobbcoach.ai</p>
              <button className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-2">
                Kommer snart <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Contact for Press */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200/50 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Presskontakt</h2>
            <p className="text-gray-600 mb-6">
              För intervjuer, kommentarer eller ytterligare information
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Kontakta oss
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}