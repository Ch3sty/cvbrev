// src/app/login/page.tsx
'use client'

import { Suspense } from 'react'
import LoginForm from '@/components/auth/login-form'
import AuthShell from '@/components/auth/AuthShell'
import { ToolCvAnalysIllustration } from '@/components/funktioner/illustrations/ToolIllustrations'

const LOGIN_QUOTES = [
  'Tillbaka för att jaga ditt nästa jobb.',
  'Var inte ödmjuk — du har stora drömmar.',
  'En vana att fortsätta söka. En coach som hjälper.',
]

const LOGIN_STATS = [
  { value: '12 487', label: 'CV:n skapade' },
  { value: '94%', label: 'når intervju' },
  { value: '8', label: 'AI-verktyg' },
  { value: '2 min', label: 'till färdigt CV' },
]

export default function LoginPage() {
  return (
    <AuthShell
      illustration={<ToolCvAnalysIllustration className="w-full h-full" />}
      quotes={LOGIN_QUOTES}
      stats={LOGIN_STATS}
    >
      <Suspense
        fallback={
          <div className="text-center text-slate-500 py-12">Laddar...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
