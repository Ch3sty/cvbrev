'use client'

import { HelpCircle, ArrowLeft, Search, MessageCircle, FileText, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HjälpcenterPage() {
  const helpCategories = [
    {
      icon: Zap,
      title: "Komma igång",
      description: "Första stegen med Jobbcoach.ai",
      topics: ["Skapa konto", "Första brevet", "Profilinställningar"]
    },
    {
      icon: FileText,
      title: "Personliga brev",
      description: "Allt om att skapa och redigera brev",
      topics: ["Skapa brev", "Redigering", "Export och format"]
    },
    {
      icon: MessageCircle,
      title: "Konto & Fakturering",
      description: "Hantera ditt konto och prenumeration",
      topics: ["Betalning", "Prenumerationer", "Kontoinställningar"]
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
              <HelpCircle className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Hjälpcenter
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Få hjälp med Jobbcoach.ai och optimera din karriärutveckling
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative max-w-md mx-auto mb-8"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Sök hjälpämnen..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              />
            </motion.div>
          </div>

          {/* Help Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <category.icon className="w-8 h-8 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.topics.map((topic) => (
                    <li key={topic} className="text-sm text-gray-500 hover:text-pink-600 cursor-pointer transition-colors">
                      • {topic}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200/50 p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Utbyggd hjälpsektion kommer snart</h2>
            <p className="text-gray-600 mb-6">
              Vi arbetar på att skapa en omfattande kunskapsbas med guider, FAQ och videotutorials
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                Kontakta support
              </Link>
              <Link
                href="/funktioner"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Se funktioner
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}