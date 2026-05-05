'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import {
  IconVard,
  IconTech,
  IconEkonomi,
  IconService,
  IconUtbildning,
  IconOffentlig,
} from './illustrations/ExempelIcons'
import { KATEGORIER, type Kategori } from './exempel-data'

const ICON_MAP: Record<
  Kategori['iconKey'],
  ({ className }: { className?: string }) => React.ReactElement
> = {
  vard: IconVard,
  tech: IconTech,
  ekonomi: IconEkonomi,
  service: IconService,
  utbildning: IconUtbildning,
  offentlig: IconOffentlig,
}

export default function ExempelKategoriHub() {
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
            Bläddra efter bransch
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Sex stora{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              branscher
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Hitta exempel filtrerade efter ditt yrkesområde. Varje bransch har
            egna intro-tips och mallar anpassade efter hur rekryterare där
            faktiskt sållar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {KATEGORIER.map((kat, idx) => {
            const Icon = ICON_MAP[kat.iconKey]
            const totalYrken = kat.yrken.length
            return (
              <motion.div
                key={kat.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/cv-exempel/kategori/${kat.slug}`}
                  className="group block bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 h-full hover:border-orange-200 transition-colors"
                  style={{
                    boxShadow:
                      '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-14 h-14" />
                    <span className="text-[10px] font-black uppercase tracking-wide text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                      {totalYrken} yrken
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 leading-tight">
                    {kat.namn}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {kat.kortBeskrivning}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-orange-700 font-bold text-sm group-hover:gap-2.5 transition-all">
                    Se {kat.namn.toLowerCase()}
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
