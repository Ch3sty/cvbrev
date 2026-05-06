'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Crown } from 'lucide-react'
import {
  SIMPLE_TEMPLATES,
  type SimpleTemplate,
} from '@/lib/cv/simple-templates'
import {
  IconKategoriAlla,
  IconKategoriModern,
  IconKategoriTraditionell,
  IconKategoriKreativ,
} from './illustrations/CVMallarIcons'

type Filter = 'all' | SimpleTemplate['category']

const FILTERS: Array<{
  id: Filter
  label: string
  Icon: ({ className }: { className?: string }) => React.ReactElement
}> = [
  { id: 'all', label: 'Alla', Icon: IconKategoriAlla },
  { id: 'modern', label: 'Modern', Icon: IconKategoriModern },
  { id: 'traditional', label: 'Traditionell', Icon: IconKategoriTraditionell },
  { id: 'creative', label: 'Kreativ', Icon: IconKategoriKreativ },
]

const CATEGORY_LABEL: Record<SimpleTemplate['category'], string> = {
  modern: 'Modern',
  traditional: 'Traditionell',
  creative: 'Kreativ',
}

export default function CVMallarGalleri() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')

  const visibleTemplates = useMemo(() => {
    if (activeFilter === 'all') return SIMPLE_TEMPLATES
    return SIMPLE_TEMPLATES.filter((t) => t.category === activeFilter)
  }, [activeFilter])

  return (
    <section
      id="mall-galleri"
      className="relative py-16 sm:py-24 bg-orange-50/30"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Mall-galleri
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Alla våra mallar.{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              På ett ställe.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Bläddra bland alla mallar och filtrera efter stil. Du kan byta mall
            efter att du fyllt i ditt CV utan att förlora datan.
          </p>
        </motion.div>

        {/* Filter-pills */}
        <div
          role="tablist"
          aria-label="Filtrera mallar efter stil"
          className="
            flex gap-2 overflow-x-auto snap-x snap-mandatory
            -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center
            pb-2 mb-8 scrollbar-hide
          "
          style={{ scrollbarWidth: 'none' }}
        >
          {FILTERS.map(({ id, label, Icon }) => {
            const aktiv = activeFilter === id
            const count =
              id === 'all'
                ? SIMPLE_TEMPLATES.length
                : SIMPLE_TEMPLATES.filter((t) => t.category === id).length
            return (
              <button
                key={id}
                role="tab"
                aria-selected={aktiv}
                onClick={() => setActiveFilter(id)}
                className={`
                  flex-shrink-0 snap-start inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl
                  text-sm font-bold transition-all min-h-[44px] whitespace-nowrap
                  ${
                    aktiv
                      ? 'text-white shadow-md'
                      : 'bg-white text-slate-700 border border-orange-100 hover:border-orange-300'
                  }
                `}
                style={
                  aktiv
                    ? {
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                        boxShadow:
                          '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
                      }
                    : undefined
                }
              >
                <Icon className={`w-4 h-4 ${aktiv ? 'text-white' : 'text-orange-600'}`} />
                <span>{label}</span>
                <span
                  className={`text-[11px] font-black ${
                    aktiv ? 'text-white/85' : 'text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Mall-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visibleTemplates.map((tpl, idx) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.35,
                delay: Math.min(idx * 0.04, 0.3),
              }}
            >
              <Link
                href="/dashboard/skapa-cv"
                className="group block bg-white rounded-3xl border border-orange-100 overflow-hidden hover:border-orange-200 transition-all"
                style={{
                  boxShadow:
                    '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
                }}
                aria-label={`Bygg CV med mallen ${tpl.name}`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[5/7] bg-orange-50/40 overflow-hidden">
                  <Image
                    src={tpl.imagePath}
                    alt={`${tpl.name}-mall`}
                    fill
                    className="object-contain p-5 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Premium-badge */}
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

                  {/* Kategori-badge */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wide text-orange-700 border border-orange-100">
                    {CATEGORY_LABEL[tpl.category]}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 leading-tight">
                    {tpl.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {tpl.description}
                  </p>

                  {/* Features (om finns) */}
                  {tpl.features && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tpl.features.supportsPhoto && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                          Foto
                        </span>
                      )}
                      {tpl.features.supportsLinkedIn && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                          LinkedIn
                        </span>
                      )}
                      {tpl.features.columns === 2 && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                          Två kolumner
                        </span>
                      )}
                    </div>
                  )}

                  <span className="inline-flex items-center gap-1.5 text-orange-700 font-bold text-sm group-hover:gap-2.5 transition-all">
                    Använd den här mallen
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
