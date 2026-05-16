'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  BookOpen,
} from 'lucide-react'
import Logo from '@/components/Logo'

interface GuideLink {
  title: string
  href: string
}

const POPULARA_GUIDER: GuideLink[] = [
  {
    title: 'Styrkor och svagheter på intervjun',
    href: '/artiklar/styrkor-svagheter-intervju',
  },
  {
    title: 'Bild på CV i Sverige – ja eller nej?',
    href: '/artiklar/bild-i-cv-ja-eller-nej',
  },
  {
    title: 'STAR-metoden vid intervju',
    href: '/artiklar/kompetensbaserad-intervju-star-metoden',
  },
  {
    title: 'Personligt brev på engelska',
    href: '/artiklar/personligt-brev-pa-engelska',
  },
  {
    title: 'Hur ska ett CV se ut?',
    href: '/artiklar/hur-ska-ett-cv-se-ut',
  },
  {
    title: 'Skriva personligt brev – komplett guide',
    href: '/artiklar/skriva-personligt-brev-guide',
  },
  {
    title: 'Cover letter på svenska',
    href: '/artiklar/cover-letter-sverige',
  },
  {
    title: 'Avsluta personligt brev',
    href: '/artiklar/hur-avslutar-man-personligt-brev',
  },
]

const VERKTYG_LANKAR = [
  { label: 'Skapa CV', href: '/verktyg/skapa-cv' },
  { label: 'Personligt brev', href: '/verktyg/personligt-brev' },
  { label: 'CV-analys', href: '/verktyg/cv-analys' },
  { label: 'CV-mallar', href: '/verktyg/cv-mallar' },
  { label: 'Jobbmatchning', href: '/verktyg/jobbmatchning' },
  { label: 'LinkedIn-optimering', href: '/verktyg/linkedin-optimering' },
  { label: 'Rekryteringstester', href: '/verktyg/rekryteringstester' },
  { label: 'Jobbcoachen', href: '/verktyg/jobbcoachen' },
]

const INSPIRATION_LANKAR = [
  { label: 'CV-exempel', href: '/cv-exempel' },
  { label: 'Personligt brev-exempel', href: '/personligt-brev-exempel' },
  { label: 'Alla artiklar', href: '/artiklar' },
  { label: 'Inspirationsgalleri', href: '/exempel' },
]

const FORETAG_LANKAR = [
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Priser', href: '/priser' },
  { label: 'Hjälpcenter', href: '/hjalpcenter' },
]

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t border-orange-100/70 bg-white"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Sidfot
      </h2>

      {/* Subtil orange-glöd högst upp */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[260px] -z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(249, 115, 22, 0.10) 0%, transparent 70%)',
        }}
      />

      {/* Dot-pattern för djup */}
      <FooterDotPattern />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Sektion 1: Populära guider === */}
        <PopularGuidesSection />

        {/* === Decorative wave divider === */}
        <WaveDivider />

        {/* === Sektion 2: Brand + 4-kolumns navigation === */}
        <NavigationGrid />

        {/* === Sektion 3: Bottom-bar === */}
        <BottomBar />
      </div>
    </footer>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sektion 1: Populära guider                                                 */
/* -------------------------------------------------------------------------- */

function PopularGuidesSection() {
  return (
    <section className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      {/* Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-3">
            <BookOpen className="w-3 h-3" strokeWidth={2.5} />
            Populära guider
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Det här hjälpte tusentals andra
          </h3>
        </div>
        <Link
          href="/artiklar"
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800 transition-colors self-start sm:self-end"
        >
          Se alla artiklar
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        </Link>
      </div>

      {/* Guide-kort i grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {POPULARA_GUIDER.map((guide, i) => (
          <motion.li
            key={guide.href}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.32) }}
          >
            <Link
              href={guide.href}
              className="group flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:-translate-y-0.5 transition-all min-h-[64px]"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            >
              <span
                aria-hidden="true"
                className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                }}
              />
              <span className="flex-1 text-sm font-semibold text-slate-800 leading-snug group-hover:text-slate-900">
                {guide.title}
              </span>
              <ArrowRight
                className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Decorative wave divider mellan sektion 1 och 2                             */
/* -------------------------------------------------------------------------- */

function WaveDivider() {
  return (
    <div
      className="relative h-px w-full"
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 12"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-3 -translate-y-1.5"
      >
        <defs>
          <linearGradient id="footer-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FDBA74" stopOpacity="0" />
            <stop offset="0.3" stopColor="#FB923C" stopOpacity="0.6" />
            <stop offset="0.7" stopColor="#DC2626" stopOpacity="0.6" />
            <stop offset="1" stopColor="#BE185D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 6 Q 300 0, 600 6 T 1200 6"
          stroke="url(#footer-wave)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sektion 2: Brand + 4-kolumns navigation                                    */
/* -------------------------------------------------------------------------- */

function NavigationGrid() {
  return (
    <section className="pt-12 sm:pt-16 pb-10 sm:pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-10">
        {/* Brand-kolumn */}
        <div className="md:col-span-12 lg:col-span-4">
          <div className="mb-5">
            <Logo href="/" variant="default-tag" height={52} />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-6">
            Vi hjälper jobbsökare i Sverige att skriva CV, personliga brev och
            hitta rätt nästa steg — med riktiga exempel och AI som faktiskt
            förstår svensk arbetsmarknad.
          </p>
          <SocialIcons />
        </div>

        {/* Verktyg */}
        <FooterColumn
          title="Verktyg"
          links={VERKTYG_LANKAR}
          className="md:col-span-4 lg:col-span-3"
        />

        {/* Inspiration */}
        <FooterColumn
          title="Inspiration"
          links={INSPIRATION_LANKAR}
          className="md:col-span-4 lg:col-span-2"
        />

        {/* Företag */}
        <FooterColumn
          title="Jobbcoach.ai"
          links={FORETAG_LANKAR}
          className="md:col-span-4 lg:col-span-3"
        />
      </div>
    </section>
  )
}

function FooterColumn({
  title,
  links,
  className = '',
}: {
  title: string
  links: { label: string; href: string }[]
  className?: string
}) {
  return (
    <div className={className}>
      <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-orange-700 transition-colors"
            >
              <span className="border-b border-transparent group-hover:border-orange-300/70 transition-colors">
                {link.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcons() {
  const items = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/jobbcoachai',
      Icon: Facebook,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/jobbcoach.ai/',
      Icon: Instagram,
    },
    {
      label: 'E-post',
      href: 'mailto:info@jobbcoach.ai',
      Icon: Mail,
    },
  ]

  return (
    <div className="flex items-center gap-2.5">
      {items.map(({ label, href, Icon }) => {
        const isExternal = href.startsWith('http')
        const linkProps = isExternal
          ? { target: '_blank', rel: 'noopener noreferrer' as const }
          : {}
        return (
          <a
            key={label}
            href={href}
            aria-label={label}
            {...linkProps}
            className="group relative w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 hover:text-white transition-all hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Hover gradient-fill */}
            <span
              aria-hidden="true"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            />
            <Icon
              className="relative w-[18px] h-[18px]"
              strokeWidth={2.25}
            />
          </a>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sektion 3: Bottom-bar                                                      */
/* -------------------------------------------------------------------------- */

function BottomBar() {
  const year = new Date().getFullYear()
  return (
    <div className="border-t border-orange-100/70 py-6 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-[13px] text-slate-500">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 order-2 sm:order-1">
        <span>© {year} Jobbcoach.ai</span>
        <Link
          href="/integritetspolicy"
          className="hover:text-orange-700 transition-colors"
        >
          Integritetspolicy
        </Link>
        <Link
          href="/anvandarvillkor"
          className="hover:text-orange-700 transition-colors"
        >
          Användarvillkor
        </Link>
        <Link
          href="/integritetspolicy#cookies"
          className="hover:text-orange-700 transition-colors"
        >
          Cookies
        </Link>
      </div>
      <div className="flex items-center gap-2 font-semibold text-slate-600 order-1 sm:order-2">
        <span>Byggt i Sverige</span>
        <SwedenFlag />
      </div>
    </div>
  )
}

function SwedenFlag() {
  return (
    <svg
      width="20"
      height="13"
      viewBox="0 0 20 13"
      fill="none"
      aria-hidden="true"
      className="rounded-sm overflow-hidden"
    >
      <rect width="20" height="13" fill="#005293" />
      <rect x="6" y="0" width="2" height="13" fill="#FECC00" />
      <rect x="0" y="5.5" width="20" height="2" fill="#FECC00" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Dot-pattern bakgrund                                                       */
/* -------------------------------------------------------------------------- */

function FooterDotPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none -z-0"
    >
      <defs>
        <pattern
          id="footer-dots"
          x="0"
          y="0"
          width="36"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="18" cy="18" r="1" fill="#FB923C" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#footer-dots)" />
    </svg>
  )
}
