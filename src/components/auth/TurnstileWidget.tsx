'use client'

/**
 * Cloudflare Turnstile på registreringsformuläret (docs/plan-konvertering.md, B1).
 *
 * Renderas bara när NEXT_PUBLIC_TURNSTILE_SITE_KEY är satt. Saknas nyckeln
 * finns ingen widget, och serververifieringen hoppas över på samma grund, så
 * registreringen fungerar oförändrat i lokala miljöer.
 */

import { useEffect, useRef } from 'react'

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          action?: string
        }
      ) => string
      remove: (widgetId: string) => void
      reset: (widgetId?: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
  if (existing) {
    return new Promise((resolve) => existing.addEventListener('load', () => resolve(), { once: true }))
  }

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(), { once: true })
    document.head.appendChild(script)
  })
}

interface TurnstileWidgetProps {
  /** Får en färsk token varje gång widgeten löser utmaningen. */
  onToken: (token: string | null) => void
  className?: string
}

export default function TurnstileWidget({ onToken, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    let cancelled = false

    loadScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: 'register',
        theme: 'light',
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': () => onTokenRef.current(null),
      })
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* widgeten kan redan vara borttagen vid snabb navigering */
        }
      }
    }
  }, [])

  if (!TURNSTILE_SITE_KEY) return null

  return <div ref={containerRef} className={className} />
}
