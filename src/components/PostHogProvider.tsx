'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Identifierar inloggade användare i PostHog.
 * PostHog initieras via instrumentation-client.ts — pageviews och autocapture hanteras automatiskt.
 */
export default function PostHogIdentify() {
  const { user } = useAuth()

  useEffect(() => {
    if (!posthog.__loaded) return

    if (user) {
      posthog.identify(user.id, {
        email: user.email,
      })
    } else {
      posthog.reset()
    }
  }, [user])

  return null
}
