'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Crown } from 'lucide-react'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

/**
 * Kort sektion som visar 3 utvalda mallar och lankar till /verktyg/cv-mallar.
 * Drives av SIMPLE_TEMPLATES.slice(0, 3) sa nya mallar pa langre sikt
 * automatiskt kan rotera in.
 */

const FEATURED_TEMPLATES = SIMPLE_TEMPLATES.slice(0, 3)

const CATEGORY_LABEL: Record<string, string> = {
  modern: 'Modern',
  traditional: 'Traditionell',
  creative: 'Kreativ',
}

export default function SkapaCvMallar() {
  return (
    <section className="relative py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Mallar att välja på
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Designer som{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              passar din bransch
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Modern, traditionell och kreativ stil. Du kan byta mall efteråt
            utan att förlora datan du fyllt i.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-10">
          {FEATURED_TEMPLATES.map((tpl, idx) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link
                href="/verktyg/cv-mallar"
                className="group block bg-white rounded-3xl border border-orange-100 overflow-hidden hover:border-orange-200 transition-all"
                style={{
                  boxShadow:
                    '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
                }}
                aria-label={`Se mallen ${tpl.name}`}
              >
                <div className="relative aspect-[5/7] bg-orange-50/40 overflow-hidden">
                  <Image
                    src={tpl.imagePath}
                    alt={`${tpl.name}-mall`}
                    fill
                    className="object-contain p-5 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {tpl.tier === 'premium' && (
                    <div
                      className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md"
                      style={{
                        background:
                          'linear-gradient(135deg, #DC2626, #BE185D)',
                      }}
                    >
                      <Crown className="w-3 h-3" strokeWidth={2.5} />
                      Premium
                    </div>
                  )}

                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wide text-orange-700 border border-orange-100">
                    {CATEGORY_LABEL[tpl.category]}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-black text-slate-900 mb-1.5 leading-tight">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/verktyg/cv-mallar"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-base transition-colors min-h-[52px] border border-orange-200"
          >
            Se alla mallar
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
