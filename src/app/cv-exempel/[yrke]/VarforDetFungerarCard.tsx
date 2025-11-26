'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface VarforDetFungerarCardProps {
  rubrik: string
  text: string
  icon: LucideIcon
  index: number
}

export default function VarforDetFungerarCard({
  rubrik,
  text,
  icon: Icon,
  index
}: VarforDetFungerarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md hover:border-cyan-200 transition-all"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">
        {rubrik}
      </h3>
      <div className="text-slate-600 leading-relaxed text-[15px] space-y-3">
        {text.split('\n\n').map((paragraph, pIdx) => {
          const trimmed = paragraph.trim()

          // Stilad underrubrik för "Varför detta fungerar:"
          if (trimmed.startsWith('Varför detta fungerar:')) {
            const rest = trimmed.replace('Varför detta fungerar:', '')
            return (
              <p key={pIdx}>
                <strong className="text-slate-800">Varför detta fungerar:</strong>
                {rest}
              </p>
            )
          }

          // Enkel fetstil-parsing för **text**
          const parts = trimmed.split(/(\*\*[^*]+\*\*)/)
          return (
            <p key={pIdx}>
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>
                }
                return part
              })}
            </p>
          )
        })}
      </div>
    </motion.div>
  )
}
