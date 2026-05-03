'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Target,
  Compass,
  Lock,
  FileText,
  Edit3,
  Upload,
} from 'lucide-react'
import Link from 'next/link'
import LinkedInProfileMockup from '../LinkedInProfileMockup'
import CvSelectorList from '../CvSelectorList'

export type OptimizationMode = 'stand_out' | 'target_role'
export type Language = 'sv' | 'en'
export type SourceMode = 'cv' | 'manual'

interface Props {
  mode: OptimizationMode
  targetRole: string
  language: Language
  sourceMode: SourceMode
  selectedCvId: string | null
  hasCvs: boolean
  onModeChange: (mode: OptimizationMode) => void
  onTargetRoleChange: (role: string) => void
  onLanguageChange: (lang: Language) => void
  onSourceModeChange: (mode: SourceMode) => void
  onCvSelect: (cvId: string) => void
  onNext: () => void
}

const SOURCE_OPTIONS = [
  {
    id: 'cv' as const,
    icon: FileText,
    title: 'Skapa från mitt CV',
    desc: 'Vi använder ditt sparade CV och skapar en LinkedIn-profil som matchar. Du kan redigera fritt innan vi optimerar.',
    bullets: [
      'Snabbast — autoifyllt på sekunden',
      'Inga uppfunna fakta',
      'Du redigerar innan optimering',
    ],
  },
  {
    id: 'manual' as const,
    icon: Edit3,
    title: 'Förbättra befintlig LinkedIn',
    desc: 'Klistra in dina nuvarande LinkedIn-sektioner. Vi förbättrar formuleringar och struktur utan att hitta på något.',
    bullets: [
      'Behåll din röst',
      'Före/efter-jämförelse',
      'Optimerar för ATS och rekryterare',
    ],
  },
]

const MODES = [
  {
    id: 'stand_out' as const,
    icon: Compass,
    title: 'Stå ut i mängden',
    desc: 'Vi optimerar din profil för att fånga rekryterares blick generellt — bredd, tydlighet och slagkraft.',
    bullets: [
      'Säljer din unika styrka',
      'Funkar för flera roller',
      'Tar bort buzzwords',
    ],
  },
  {
    id: 'target_role' as const,
    icon: Target,
    title: 'Sikta på en specifik roll',
    desc: 'Vi anpassar varje sektion mot rollen du har i sikte — nyckelord, ton och prioriteringar.',
    bullets: [
      'Skräddarsyr för rollen',
      'Optimerar nyckelord',
      'Ökar matchningsgrad',
    ],
  },
]

export default function Step1Mode({
  mode,
  targetRole,
  language,
  sourceMode,
  selectedCvId,
  hasCvs,
  onModeChange,
  onTargetRoleChange,
  onLanguageChange,
  onSourceModeChange,
  onCvSelect,
  onNext,
}: Props) {
  const trimmedRole = targetRole.trim()
  const cvOk = sourceMode !== 'cv' || !!selectedCvId
  const canProceed =
    cvOk &&
    (mode === 'stand_out' || (mode === 'target_role' && trimmedRole.length >= 3))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start">
      {/* Vänster: val */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            Steg 1 av 4
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Hur vill du börja?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Välj utgångspunkt — vi anpassar resten av flödet efter ditt val.
          </p>
        </div>

        {/* Source-kort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
          {SOURCE_OPTIONS.map((s) => {
            const isActive = sourceMode === s.id
            const Icon = s.icon
            const isDisabled = s.id === 'cv' && !hasCvs
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => !isDisabled && onSourceModeChange(s.id)}
                disabled={isDisabled}
                className={`relative text-left p-4 sm:p-5 rounded-2xl border-2 transition-all min-h-[180px] ${
                  isDisabled
                    ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                    : isActive
                    ? 'border-orange-300 bg-orange-50/60'
                    : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                }`}
                style={
                  isActive && !isDisabled
                    ? {
                        boxShadow:
                          '0 12px 28px -10px rgba(249, 115, 22, 0.30)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                        : '#F1F5F9',
                    }}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                      strokeWidth={2.2}
                    />
                  </div>
                  {isActive && !isDisabled && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.16em] text-white"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                      }}
                    >
                      Vald
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 leading-snug mb-1">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                  {s.desc}
                </p>
                <ul className="space-y-1">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-[11px] text-slate-700 flex items-start gap-1.5"
                    >
                      <span
                        className="mt-1 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                {isDisabled && (
                  <p className="mt-3 text-[11px] font-semibold text-slate-500">
                    Du har inget CV uppladdat ännu.
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* CV-väljare när source = cv */}
        <AnimatePresence>
          {sourceMode === 'cv' && hasCvs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-1 h-3 rounded-sm"
                    style={{
                      background:
                        'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
                    }}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                    Välj CV att utgå ifrån
                  </span>
                </div>
                <CvSelectorList
                  selectedCvId={selectedCvId}
                  onSelect={onCvSelect}
                />
              </div>
            </motion.div>
          )}

          {sourceMode === 'cv' && !hasCvs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 sm:p-5 flex items-start gap-3">
                <Upload
                  className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5"
                  strokeWidth={2.2}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    Du har inget CV uppladdat ännu
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Ladda upp ditt CV först så fyller vi i LinkedIn-fälten åt dig.
                  </p>
                  <Link
                    href="/dashboard/profil/cv"
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors"
                  >
                    Ladda upp CV
                    <ArrowRight className="w-3 h-3" strokeWidth={2.4} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optimeringsmål */}
        <div className="mb-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
            Optimeringsmål
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {MODES.map((m) => {
              const isActive = mode === m.id
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModeChange(m.id)}
                  className={`relative text-left p-4 sm:p-5 rounded-2xl border-2 transition-all min-h-[180px] ${
                    isActive
                      ? 'border-orange-300 bg-orange-50/60'
                      : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow:
                            '0 12px 28px -10px rgba(249, 115, 22, 0.30)',
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                          : '#F1F5F9',
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-slate-500'
                        }`}
                        strokeWidth={2.2}
                      />
                    </div>
                    {isActive && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.16em] text-white"
                        style={{
                          background:
                            'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        }}
                      >
                        Vald
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 leading-snug mb-1">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                    {m.desc}
                  </p>
                  <ul className="space-y-1">
                    {m.bullets.map((b) => (
                      <li
                        key={b}
                        className="text-[11px] text-slate-700 flex items-start gap-1.5"
                      >
                        <span
                          className="mt-1 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>
        </div>

        {/* Target role-input */}
        {mode === 'target_role' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <label
              htmlFor="targetRole"
              className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5"
            >
              Vilken roll siktar du på?
            </label>
            <input
              id="targetRole"
              type="text"
              value={targetRole}
              onChange={(e) => onTargetRoleChange(e.target.value)}
              placeholder="t.ex. Senior Product Manager"
              className="block w-full min-h-[44px] px-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 transition-all hover:border-orange-200 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
            {trimmedRole.length > 0 && trimmedRole.length < 3 && (
              <p className="mt-1.5 text-xs text-orange-700">
                Skriv minst 3 tecken så vi kan optimera mot rätt roll.
              </p>
            )}
          </motion.div>
        )}

        {/* Språkväljare */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">
            Språk
          </div>
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {(['sv', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  language === lang
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {lang === 'sv' ? 'Svenska' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Nästa-knapp */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
          }}
        >
          <span>Fortsätt till profil</span>
          <ArrowRight className="w-5 h-5" strokeWidth={2.4} />
        </button>

        {sourceMode === 'cv' && hasCvs && !selectedCvId && (
          <p className="mt-2 text-xs text-slate-500">
            Välj ett CV ovan för att fortsätta.
          </p>
        )}
      </motion.div>

      {/* Höger: skeleton-mockup */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="hidden lg:block lg:sticky lg:top-32"
      >
        <div className="mb-3 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.2} />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Förhandsvisning · skapas i nästa steg
          </span>
        </div>
        <LinkedInProfileMockup
          data={{}}
          variant="skeleton"
          showGlow={false}
          className="opacity-90"
        />
      </motion.div>

      {/* Mobil-hint istället för mockup */}
      <div className="lg:hidden -mt-2 mb-2">
        <div className="rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            👀
          </span>
          <p className="text-xs text-slate-700 leading-snug">
            Du kommer se din LinkedIn-profil byggas upp <strong>live</strong>{' '}
            medan du fyller i nästa steg.
          </p>
        </div>
      </div>
    </div>
  )
}
