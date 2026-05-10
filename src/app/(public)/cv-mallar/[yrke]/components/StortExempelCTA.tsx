'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, BookOpen, Eye } from 'lucide-react'

type Variant = 'cv-exempel' | 'personligt-brev'

interface StortExempelCTAProps {
  variant: Variant
  yrkesNamn: string
  namnBestamd: string
  slug: string
}

const VARIANTS: Record<
  Variant,
  {
    rubrik: (n: string) => string
    text: (n: string) => string
    cta: string
    icon: typeof FileText
    href: (slug: string) => string
    gradient: string
    accentBg: string
    accentText: string
  }
> = {
  'cv-exempel': {
    rubrik: (n) => `Se ett färdigt ${n}-CV`,
    text: (n) =>
      `Vi har skrivit ett komplett CV-exempel för ${n} med konkret innehåll, branschspecifika formuleringar och rätt struktur. Använd det som mall för ditt eget.`,
    cta: 'Öppna CV-exempel',
    icon: Eye,
    href: (slug) => `/cv-exempel/${slug}`,
    gradient: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-700',
  },
  'personligt-brev': {
    rubrik: (n) => `Skriv ett starkt personligt brev`,
    text: (n) =>
      `Ett välskrivet personligt brev kompletterar ditt CV och förklarar varför du söker rollen. Vi har ett konkret brev-exempel för ${n} med rätt ton för svenska rekryterare.`,
    cta: 'Öppna brev-exempel',
    icon: BookOpen,
    href: (slug) => `/personligt-brev-exempel/${slug}`,
    gradient: 'linear-gradient(135deg, #DC2626 0%, #BE185D 100%)',
    accentBg: 'bg-rose-50',
    accentText: 'text-rose-700',
  },
}

export default function StortExempelCTA({
  variant,
  yrkesNamn,
  namnBestamd,
  slug,
}: StortExempelCTAProps) {
  void yrkesNamn
  const v = VARIANTS[variant]
  const Icon = v.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={v.href(slug)}
        className="group block relative overflow-hidden rounded-3xl bg-white border-2 border-orange-200 p-6 sm:p-8 transition-all hover:border-orange-300"
        style={{ boxShadow: '0 16px 48px -16px rgba(249, 115, 22, 0.32)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 sm:gap-8 items-center">
          <div className="flex items-start gap-4 min-w-0">
            <span
              className="flex-shrink-0 inline-flex w-14 h-14 sm:w-16 sm:h-16 rounded-2xl items-center justify-center text-white"
              style={{ background: v.gradient }}
            >
              <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.4} />
            </span>
            <div className="flex-1 min-w-0">
              <div className={`inline-block text-[10px] font-bold uppercase tracking-[0.16em] ${v.accentText} mb-1.5`}>
                {variant === 'cv-exempel' ? 'Färdigt CV-exempel' : 'Personligt brev'}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2">
                {v.rubrik(namnBestamd)}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {v.text(namnBestamd)}
              </p>
            </div>
          </div>
          <div className="flex sm:justify-end">
            <span
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm transition-all group-hover:gap-3"
              style={{ background: v.gradient }}
            >
              {v.cta}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
