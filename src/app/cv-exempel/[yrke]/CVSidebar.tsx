'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lightbulb, CheckCircle, Zap, FileText, Sparkles } from 'lucide-react'

interface CVSidebarProps {
  yrke: string
  viktigtAttTankaPa: string[]
}

export default function CVSidebar({ yrke, viktigtAttTankaPa }: CVSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Box 1: Viktigt att tänka på */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-2xl p-6 border border-cyan-100"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-slate-900">Viktigt att tänka på</h3>
        </div>
        <ul className="space-y-3">
          {viktigtAttTankaPa.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Box 2: Statistik */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      >
        <h3 className="font-bold text-slate-900 mb-4">Statistik</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">ATS-kompatibilitet</span>
              <span className="text-sm font-bold text-green-600">95%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: '95%' }}
                transition={{ delay: 0.5, duration: 1 }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Läsbarhet</span>
              <span className="text-sm font-bold text-blue-600">92%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                transition={{ delay: 0.6, duration: 1 }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Nyckelordsoptimering</span>
              <span className="text-sm font-bold text-purple-600">88%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ delay: 0.7, duration: 1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Box 3: CTA */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="font-bold mb-2">Skapa ditt CV</h3>
        <p className="text-white/90 text-sm mb-4">
          Ladda ner professionella CV-mallar eller skapa ditt CV med AI på några minuter.
        </p>
        <div className="space-y-2">
          <Link href="/dashboard/cv-mallar">
            <button className="w-full px-4 py-3 bg-white text-cyan-600 font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Ladda ner CV-mallar
            </button>
          </Link>
          <Link href="/dashboard/skapa-cv">
            <button className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Skapa med AI
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
