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
  IconHantverk,
  IconIndustri,
  IconLogistik,
  IconStudent,
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
  hantverk: IconHantverk,
  industri: IconIndustri,
  logistik: IconLogistik,
  student: IconStudent,
}

export default function ExempelKategoriHub() {
  return (
    <section className="relative py-16 sm:py-20 bg-[var(--papper)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-[var(--ton)] text-[var(--koppar-ink)] border border-[var(--kant)] mb-4">
            Bläddra efter bransch
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--ink-1)] leading-[1.05] tracking-tight mb-3">
            Sex stora{' '}
            <span
              style={{
                background:
                  'var(--vagg)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              branscher
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--ink-2)] max-w-2xl mx-auto">
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
                  className="group block bg-[var(--papper)] rounded-3xl border border-[var(--kant)] p-5 sm:p-6 h-full hover:border-[var(--kant)] transition-colors"
                  style={{
                    boxShadow: '0 4px 0 var(--kant)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-14 h-14" />
                    <span className="text-[10px] font-black uppercase tracking-wide text-[var(--koppar-ink)] bg-[var(--ton)] px-2 py-0.5 rounded-full border border-[var(--kant)]">
                      {totalYrken} yrken
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--ink-1)] mb-2 leading-tight">
                    {kat.namn}
                  </h3>
                  <p className="text-sm text-[var(--ink-2)] leading-relaxed mb-4">
                    {kat.kortBeskrivning}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[var(--koppar-ink)] font-bold text-sm group-hover:gap-2.5 transition-all">
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
