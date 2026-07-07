import React from 'react'

export const GRAD = 'linear-gradient(135deg, #F97316 0%, #DC2626 55%, #BE185D 100%)'
export const GRAD_O = 'linear-gradient(135deg, #F97316, #DC2626)'

/** Gradient-text för nyckelord i rubriker. */
export function GradText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: GRAD,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  )
}

/** Centrerad sektionsrubrik: eyebrow + h2 + valfri ingress. */
export function SectionHead({
  eyebrow,
  eyebrowIndigo = false,
  children,
  sub,
}: {
  eyebrow: React.ReactNode
  eyebrowIndigo?: boolean
  children: React.ReactNode
  sub?: React.ReactNode
}) {
  return (
    <div className="text-center max-w-[660px] mx-auto mb-11">
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] border ${
          eyebrowIndigo
            ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
            : 'text-orange-700 bg-orange-50 border-orange-200'
        }`}
      >
        {eyebrow}
      </span>
      <h2 className="text-[26px] sm:text-3xl lg:text-[40px] font-black text-slate-900 tracking-tight mt-3.5 leading-[1.08]">
        {children}
      </h2>
      {sub && <p className="text-base text-slate-600 mt-3 leading-relaxed">{sub}</p>}
    </div>
  )
}
