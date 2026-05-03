'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, Plus } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'
import { formatCVDate } from '@/lib/utils/date-formatter'

/**
 * Custom SVG-ikon för CV i LinkedIn-flödet — orange/röd-DNA, matchar
 * resten av plattformens illustrationer.
 */
function CvDocIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="cv-doc-warm"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient
          id="cv-doc-soft"
          x1="0"
          y1="0"
          x2="0"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFEDD5" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
      </defs>
      {/* Bakgrund-blob */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="6"
        fill="url(#cv-doc-soft)"
        opacity="0.7"
      />
      {/* Pappersark med vikt hörn */}
      <path
        d="M 9 6 L 19 6 L 24 11 L 24 25 Q 24 26 23 26 L 9 26 Q 8 26 8 25 L 8 7 Q 8 6 9 6 Z"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.2"
      />
      {/* Topplist orange */}
      <rect x="8" y="6" width="16" height="2.5" rx="1" fill="url(#cv-doc-warm)" />
      {/* Vikt hörn (fold) */}
      <path
        d="M 19 6 L 24 11 L 19 11 Z"
        fill="#FED7AA"
      />
      <path
        d="M 19 6 L 24 11 L 19 11 Z"
        fill="none"
        stroke="#FB923C"
        strokeWidth="1"
      />
      {/* Avatar-cirkel */}
      <circle cx="12" cy="14" r="2" fill="#FED7AA" />
      {/* Textrader */}
      <line
        x1="15"
        y1="13"
        x2="22"
        y2="13"
        stroke="#94A3B8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="15.5"
        x2="20"
        y2="15.5"
        stroke="#CBD5E1"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="19"
        x2="22"
        y2="19"
        stroke="#CBD5E1"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="21.5"
        x2="20"
        y2="21.5"
        stroke="#CBD5E1"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface Props {
  selectedCvId: string | null
  onSelect: (cvId: string) => void
}

export default function CvSelectorList({ selectedCvId, onSelect }: Props) {
  const { cvs, isLoading } = useCVStore()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-[68px] rounded-xl bg-orange-50/40 border border-orange-100 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (cvs.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {cvs.map((cv, i) => {
        const isSelected = selectedCvId === cv.id
        const ageLabel = formatCVDate(cv.created_at)

        return (
          <motion.button
            key={cv.id}
            type="button"
            onClick={() => onSelect(cv.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className={`group relative w-full text-left rounded-xl bg-white transition-all overflow-hidden ${
              isSelected
                ? 'border-2 border-orange-300'
                : 'border border-slate-200 hover:border-orange-200'
            }`}
            style={
              isSelected
                ? {
                    boxShadow:
                      '0 8px 20px -8px rgba(249, 115, 22, 0.30)',
                  }
                : { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }
            }
          >
            {/* Orange topplist när vald */}
            {isSelected && (
              <div
                className="absolute top-0 inset-x-0 h-0.5"
                style={{
                  background:
                    'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
                aria-hidden="true"
              />
            )}

            <div className="flex items-center gap-3 px-3.5 py-3">
              {/* Custom SVG-ikon */}
              <div className="flex-shrink-0">
                <CvDocIcon className="w-10 h-10" />
              </div>

              {/* Innehåll */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${
                    isSelected ? 'text-slate-900' : 'text-slate-800'
                  }`}
                >
                  {cv.file_name}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3" strokeWidth={2.2} />
                  <span>{ageLabel}</span>
                </div>
              </div>

              {/* Vald-indikator */}
              {isSelected && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.16em] text-white flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  }}
                >
                  Vald
                </span>
              )}
            </div>
          </motion.button>
        )
      })}

      {/* Ladda upp nytt CV-länk */}
      <Link
        href="/dashboard/profil/cv"
        className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-orange-200 bg-orange-50/30 hover:bg-orange-50/60 hover:border-orange-300 transition-colors"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-orange-200 group-hover:border-orange-300 transition-colors"
        >
          <Plus
            className="w-4 h-4 text-orange-700"
            strokeWidth={2.4}
          />
        </div>
        <span className="text-xs font-bold text-orange-700 group-hover:text-orange-800 transition-colors">
          Ladda upp ett nytt CV
        </span>
      </Link>
    </div>
  )
}
