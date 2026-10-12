'use client'

/**
 * En länk som skickar en händelse till mätningen vid klick. Bara där en
 * befintlig händelse ska behållas när en klientkomponent blivit
 * serverkomponent (rekryteringstesternas prova-kort, startsidans hjälte).
 * Allt annat på de publika sidorna är serverrenderat.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { capture, type AnalyticsEventName, type AnalyticsEvents } from '@/lib/analytics/events'

export default function MattLank<E extends AnalyticsEventName>({
  href,
  className,
  handelse,
  egenskaper,
  dataCta,
  dataPrimar,
  children,
}: {
  href: string
  className?: string
  handelse: E
  egenskaper: AnalyticsEvents[E]
  dataCta?: string
  dataPrimar?: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={className}
      data-cta={dataCta}
      data-primar={dataPrimar ? '' : undefined}
      onClick={() => capture(handelse, egenskaper)}
    >
      {children}
    </Link>
  )
}
