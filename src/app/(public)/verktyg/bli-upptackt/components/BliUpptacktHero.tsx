'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

const GRAD = 'linear-gradient(135deg, #F97316 0%, #DC2626 55%, #BE185D 100%)'

/**
 * Profilkapsel i orange värld (grön verifierat-bock eller grått lås = anonym).
 * Porterad ur mockupens capsule()-SVG.
 */
function Capsule({ anon = true }: { anon?: boolean }) {
  return (
    <g transform="translate(240,250) scale(1.15)">
      <rect x="-52" y="-64" width="104" height="128" rx="20" fill="#fff" stroke="#FFE4CC" strokeWidth="1.5" />
      <circle cx="-30" cy="-38" r="15" fill="#FFF5EC" stroke="#F97316" strokeWidth="1.5" />
      <path d="M-30 -38a5 5 0 100-10 5 5 0 000 10zM-38 -28a8 6 0 0116 0z" fill={anon ? '#FBCFA0' : '#EA580C'} />
      <rect x="-9" y="-46" width="42" height="6" rx="3" fill={anon ? '#E2E8F0' : '#334155'} />
      <rect x="-9" y="-35" width="28" height="5" rx="2.5" fill="#94A3B8" />
      <rect x="-38" y="-14" width="70" height="5" rx="2.5" fill="#F1E7DD" />
      <rect x="-38" y="-4" width="54" height="5" rx="2.5" fill="#F1E7DD" />
      <rect x="-38" y="14" width="30" height="11" rx="5.5" fill="#FFF5EC" stroke="#FBCFA0" />
      <rect x="-4" y="14" width="20" height="11" rx="5.5" fill="#EEF0FF" stroke="#C7CCFB" />
      <rect x="-38" y="32" width="40" height="9" rx="4.5" fill="#FDBA74" />
      <rect x="6" y="32" width="26" height="9" rx="4.5" fill="#FED7AA" />
      {anon ? (
        <g transform="translate(34,-58)">
          <circle r="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
          <g transform="scale(.55) translate(-12,-12)" stroke="#64748B" strokeWidth="2" fill="none" strokeLinecap="round">
            <rect x="6" y="11" width="12" height="9" rx="2" />
            <path d="M8.5 11V8a3.5 3.5 0 017 0v3" />
          </g>
        </g>
      ) : (
        <g transform="translate(34,-58)">
          <circle r="12" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
          <path d="M-5 0l3 3 6-6" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}
    </g>
  )
}

const DOTS: [number, number, number][] = [
  [110, 120, 7],
  [380, 150, 6],
  [95, 360, 6],
  [400, 330, 7],
  [250, 80, 5],
]

function HeroArt() {
  return (
    <div className="relative aspect-square rounded-[32px] overflow-hidden border border-orange-100"
      style={{ background: 'radial-gradient(circle at 50% 42%, #FFF1E6 0%, #FFE7D6 52%, #fff 100%)' }}
    >
      {/* flytande notis */}
      <div className="bli-float absolute left-1/2 -translate-x-1/2 top-[11%] z-[3] flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-3 py-2 text-xs font-bold max-w-[220px]"
        style={{ boxShadow: '0 12px 28px -12px rgba(2,6,23,.25)' }}
      >
        <span className="w-[7px] h-[7px] rounded-full bg-emerald-500 flex-shrink-0" style={{ boxShadow: '0 0 0 3px #D1FAE5' }} />
        <span className="leading-snug">3 företag har visat intresse för din profil</span>
      </div>

      <svg viewBox="0 0 480 480" className="absolute inset-0 w-full h-full" role="img" aria-label="Din profil hittas av rätt rekryterare">
        <defs>
          <linearGradient id="bli-hog" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
          <radialGradient id="bli-hsw" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(240 250) scale(210)">
            <stop stopColor="#FDBA74" stopOpacity="0.5" />
            <stop offset="1" stopColor="#FDBA74" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="240" cy="250" r="200" stroke="#F97316" strokeWidth="1.2" opacity=".1" />
        <circle cx="240" cy="250" r="150" stroke="#F97316" strokeWidth="1.2" opacity=".16" strokeDasharray="4 6" />
        <circle cx="240" cy="250" r="100" stroke="#F97316" strokeWidth="1.2" opacity=".22" />
        <path className="bli-sweep" d="M240 250 L240 40 A210 210 0 0 1 420 145 Z" fill="url(#bli-hsw)" />
        {/* ledlinjer */}
        {DOTS.map((d, i) => (
          <path key={`l${i}`} d={`M240 250 L${d[0]} ${d[1]}`} stroke="#F97316" strokeWidth="1" strokeDasharray="2 5" opacity=".3" />
        ))}
        {/* rekryterarprickar med halo på de två första */}
        {DOTS.map((d, i) => (
          <g key={`d${i}`}>
            {i < 2 && (
              <circle className={`bli-halo${i ? ' bli-halo2' : ''}`} cx={d[0]} cy={d[1]} r={d[2]} fill="none" stroke="#F97316" strokeWidth="2" />
            )}
            <circle cx={d[0]} cy={d[1]} r={d[2]} fill="url(#bli-hog)" />
          </g>
        ))}
        <Capsule anon />
      </svg>
    </div>
  )
}

export default function BliUpptacktHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 62%)' }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }} />
              Bli upptäckt · Tidig åtkomst
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[55px] font-black text-slate-900 leading-[1.03] tracking-tight mb-5">
              Bli hittad av rekryterare,{' '}
              <span
                style={{
                  background: GRAD,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                utan att jaga jobb själv.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Skapa en profil på jobbcoach.ai så kan rekryterare som söker efter någon med din bakgrund hitta dig. Du bestämmer själv om du vill synas, och du väljer alltid om du vill svara när någon hör av sig.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg w-full sm:w-auto min-h-[52px] hover:shadow-xl active:scale-[0.98] transition-all"
                style={{ background: GRAD, boxShadow: '0 12px 32px -10px rgba(220,38,38,0.45)' }}
              >
                Skapa min profil
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </Link>
              <Link href="#sa-funkar-det" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-orange-700 font-bold text-sm hover:text-orange-800 transition-colors">
                Se hur det funkar (4 steg)
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} /> Anonym tills du tackar ja</span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} /> Gratis att synas</span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} /> Stäng av när du vill</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="relative max-w-[420px] mx-auto w-full lg:max-w-none"
          >
            <HeroArt />
          </motion.div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (prefers-reduced-motion: no-preference) {
          .bli-sweep { transform-origin: 240px 250px; animation: bli-spin 14s linear infinite; }
          @keyframes bli-spin { to { transform: rotate(360deg); } }
          .bli-halo { transform-origin: center; transform-box: fill-box; animation: bli-halo 2.6s ease-out infinite; }
          .bli-halo2 { animation-delay: -1.3s; }
          @keyframes bli-halo { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.2); opacity: 0; } }
          .bli-float { animation: bli-bob 4s ease-in-out infinite; }
          @keyframes bli-bob { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }
        }
      `,
        }}
      />
    </section>
  )
}
