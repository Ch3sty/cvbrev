'use client'

/**
 * Tonen och språket, i Skriv brev och i Brevets flik Ton och språk. Fem
 * toner och "Vi väljer ton åt dig", som ingår i Premium: för gratis öppnar
 * trycket ingen spärr utan visar raden om Premium med länk till /priser,
 * som i dagens tonsteg.
 */
import Link from 'next/link'
import { useState } from 'react'
import { IkonLas } from '@/components/brev3/kit'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { PRISER_HREF } from '@/lib/onboarding/steps'
import { TONER, TON_AUTO, type TonId } from './texter'

export function SprakVal({ sprak, onSprak, disabled }: { sprak: 'sv' | 'en'; onSprak: (s: 'sv' | 'en') => void; disabled?: boolean }) {
  return (
    <div className="b3-seg" role="group" aria-label="Brevets språk">
      <button type="button" aria-pressed={sprak === 'sv'} onClick={() => onSprak('sv')} disabled={disabled}>
        Svenska
      </button>
      <button type="button" aria-pressed={sprak === 'en'} onClick={() => onSprak('en')} disabled={disabled}>
        English
      </button>
    </div>
  )
}

export function TonKnappar({
  ton,
  onTon,
  harBetalt,
  disabled,
}: {
  ton: TonId
  onTon: (t: TonId) => void
  harBetalt: boolean
  disabled?: boolean
}) {
  const [visaLas, setVisaLas] = useState(false)
  return (
    <>
      <div className="b3-ton" role="group" aria-label="Brevets ton">
        {TONER.map((t) => (
          <button key={t.id} type="button" aria-pressed={ton === t.id} onClick={() => onTon(t.id)} disabled={disabled}>
            <b>{t.namn}</b>
            <small>{t.rad}</small>
          </button>
        ))}
        {harBetalt ? (
          <button type="button" aria-pressed={ton === 'auto'} onClick={() => onTon('auto')} disabled={disabled}>
            <b>{TON_AUTO.namn}</b>
            <small>{TON_AUTO.radPremium}</small>
          </button>
        ) : (
          <button
            type="button"
            data-las=""
            aria-pressed={false}
            aria-describedby={visaLas ? 'ton-las-rad' : undefined}
            onClick={() => setVisaLas(true)}
            disabled={disabled}
          >
            <span className="inline-flex items-center gap-1.5 xl:hidden" aria-hidden="true">
              <IkonLas size={12} />
            </span>
            <b>{TON_AUTO.namn}</b>
            <small>
              <IkonLas size={11} />
              {PAKETRADER.ingar}
            </small>
          </button>
        )}
      </div>
      {visaLas && !harBetalt ? (
        <p id="ton-las-rad" className="m-0 mt-2 text-[13px] leading-[18px] text-[color:var(--b3-prem-text)]" role="status">
          {TON_AUTO.lasRad(PAKETRADER.bricka)}{' '}
          <Link href={PRISER_HREF} className="font-semibold text-[color:var(--b3-ink)] underline underline-offset-[3px]">
            {TON_AUTO.lasLank}
          </Link>
        </p>
      ) : null}
    </>
  )
}
