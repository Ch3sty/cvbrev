'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, Mail } from 'lucide-react'
import {
  IconVard,
  IconTech,
  IconEkonomi,
  IconService,
  IconUtbildning,
  IconOffentlig,
} from './illustrations/ExempelIcons'
import { POPULARA_YRKEN, type PopulartYrke } from './exempel-data'

const ICON_MAP: Record<
  PopulartYrke['iconKey'],
  ({ className }: { className?: string }) => React.ReactElement
> = {
  vard: IconVard,
  tech: IconTech,
  ekonomi: IconEkonomi,
  service: IconService,
  utbildning: IconUtbildning,
  offentlig: IconOffentlig,
}

export default function ExempelPopulara() {
  return (
    <section className="relative py-16 sm:py-20 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Populära just nu
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Mest sökta yrkena{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              i Sverige
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Tolv yrken som tusentals söker jobb inom varje månad. Klicka för CV
            eller personligt brev.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {POPULARA_YRKEN.map((yrke, idx) => {
            const Icon = ICON_MAP[yrke.iconKey]
            return (
              <motion.article
                key={yrke.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5 hover:border-orange-200 transition-colors flex flex-col"
                style={{
                  boxShadow:
                    '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
                }}
              >
                <Icon className="w-12 h-12 sm:w-14 sm:h-14 mb-3" />

                <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-1">
                  {yrke.kategoriNamn}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 leading-tight">
                  {yrke.namn}
                </h3>

                <div className="mt-auto flex flex-col gap-1.5">
                  {yrke.hasCV && (
                    <Link
                      href={`/cv-exempel/${yrke.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors min-h-[36px]"
                    >
                      <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Se CV
                    </Link>
                  )}
                  {yrke.hasBrev && (
                    <Link
                      href={`/personligt-brev-exempel/${yrke.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-white font-bold text-xs transition-all min-h-[36px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                      }}
                    >
                      <Mail className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Se brev
                    </Link>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
