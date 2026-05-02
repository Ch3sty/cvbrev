// src/app/auth/reset-password/page.tsx
'use client'

import { Suspense } from 'react'
import ResetPasswordForm from '@/components/auth/reset-password-form'
import AuthShell from '@/components/auth/AuthShell'
import { ToolJobbcoachenIllustration } from '@/components/funktioner/illustrations/ToolIllustrations'

const RESET_QUOTES = [
  'Nästan inne — välj något du faktiskt kommer ihåg.',
  'Ett starkt lösenord är ett tryggt lösenord.',
  'Sista steget innan du är tillbaka i jakten.',
]

const RESET_STATS = [
  { value: 'Kryptering', label: 'AES-256' },
  { value: 'Aldrig', label: 'lagrat i klartext' },
  { value: '8+', label: 'tecken min' },
  { value: 'Säkert', label: 'via Supabase' },
]

export default function ResetPasswordPage() {
  return (
    <AuthShell
      illustration={
        <ToolJobbcoachenIllustration className="w-full h-full" />
      }
      quotes={RESET_QUOTES}
      stats={RESET_STATS}
    >
      <Suspense
        fallback={
          <div className="text-center text-slate-500 py-12">Laddar...</div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
