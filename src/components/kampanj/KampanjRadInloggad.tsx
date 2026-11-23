'use client'

/**
 * Kampanjraden i inloggat (lib/kampanj). Överst i innehållskolumnen, 60 px i
 * telefon och 52 px från 1024 px (km-rad-inloggad i kampanj.css), och
 * servern avgör om den finns, så att inget skiftar när sidan ritas. Bara
 * konton som aldrig haft Premium får den. Sedan 2026-11-23 med
 * kampanjmärkets platta och nedräkning.
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
import { KAMPANJ_ORD, KAMPANJ_STANGD_COOKIE, type KampanjVisning } from '@/lib/kampanj/kampanj'
import { KampanjLiten } from './KampanjMarke'

export default function KampanjRadInloggad({ kampanj }: { kampanj: KampanjVisning }) {
  const [stangd, setStangd] = useState(false)

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
    <div className={`km-rad-inloggad km-tema-${kampanj.tema}`}>
      <div className="km-rad-in">
        <Link
          href={kopstegHref(SALD_PLAN, 'kampanjrad')}
          prefetch={false}
          onClick={() => capture('kampanj_rad_klickad', { kampanj: kampanj.nyckel, yta: 'inloggat' })}
        >
          <span className="km-platta km-platta-liten">{kampanj.namn}</span>
          <span className="km-rad-lang">{KAMPANJ_ORD.radInloggad(kampanj)}</span>
          <KampanjLiten k={kampanj} utanPlatta enheter={2} />
          <span className="km-rad-kop">{kampanj.copy.kortKnapp}</span>
        </Link>
        <button type="button" onClick={stang}>
          {kampanj.copy.kortStang}
        </button>
      </div>
    </div>
  )
}
