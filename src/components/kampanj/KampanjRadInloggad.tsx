'use client'

/**
 * Kampanjraden i inloggat (lib/kampanj). Samma rad som e-postraden: 44 px
 * överst i innehållskolumnen, och servern avgör om den finns, så att inget
 * skiftar när sidan ritas. Bara konton som aldrig haft Premium får den.
 *
 * "Nej tack" stänger raden för resten av kampanjen (cookien bär nyckeln, så
 * Cyber Monday visas igen för den som stängde Black Week). Står fliken öppen
 * över kampanjens slut tar raden bort sig själv.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { KAMPANJ_STANGD_COOKIE, type KampanjVisning } from '@/lib/kampanj/kampanj'

const TEMA = {
  svart: { bg: '#141210', text: '#E9DFD1', accent: '#E07A2F', mjuk: '#A39A8E' },
  indigo: { bg: '#1B2246', text: '#DDE1F6', accent: '#93A0EC', mjuk: '#AEB4DA' },
} as const

export default function KampanjRadInloggad({ kampanj }: { kampanj: KampanjVisning }) {
  const [stangd, setStangd] = useState(false)
  const t = TEMA[kampanj.tema]

  useEffect(() => {
    capture('kampanj_rad_visad', { kampanj: kampanj.nyckel, yta: 'inloggat' })
    const kvar = kampanj.slutMs - Date.now()
    if (kvar <= 0) {
      setStangd(true)
      return
    }
    // setTimeout tål högst ~24,8 dygn; kampanjerna är kortare än så.
    const id = window.setTimeout(() => setStangd(true), kvar)
    return () => window.clearTimeout(id)
  }, [kampanj.nyckel, kampanj.slutMs])

  if (stangd) return null

  const stang = () => {
    setStangd(true)
    capture('kampanj_rad_stangd', { kampanj: kampanj.nyckel })
    const sekunder = Math.max(60, Math.ceil((kampanj.slutMs - Date.now()) / 1000))
    document.cookie =
      `${KAMPANJ_STANGD_COOKIE}=${kampanj.nyckel};max-age=${sekunder};path=/;SameSite=Lax` +
      (location.protocol === 'https:' ? ';Secure' : '')
  }

  return (
    <div className="relative z-20 h-11" style={{ background: t.bg, color: t.text }}>
      <div className="mx-auto flex h-full max-w-[1120px] items-center gap-3 px-4 lg:box-content lg:px-10">
        <Link
          href={kopstegHref(SALD_PLAN, 'kampanjrad')}
          prefetch={false}
          onClick={() => capture('kampanj_rad_klickad', { kampanj: kampanj.nyckel, yta: 'inloggat' })}
          className="min-w-0 flex-1 truncate text-sm"
        >
          <b className="mr-2 font-display font-extrabold tracking-[0.04em]" style={{ color: t.accent }}>
            {kampanj.etikett}
          </b>
          <span className="hidden sm:inline">{kampanj.copy.kortRubrik.replace(/^[^:]+:\s*/, '')}. </span>
          <span className="underline underline-offset-4">{kampanj.copy.kortKnapp}</span>
        </Link>
        <button
          type="button"
          onClick={stang}
          className="-mr-2 inline-flex h-11 shrink-0 items-center rounded-[10px] px-2 text-sm"
          style={{ color: t.mjuk }}
        >
          {kampanj.copy.kortStang}
        </button>
      </div>
    </div>
  )
}
