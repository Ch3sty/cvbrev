// src/app/auth/forgot-password/page.tsx
'use client'

import ForgotPasswordForm from '@/components/auth/forgot-password-form'
import AuthShell from '@/components/auth/AuthShell'
import { ToolBrevIllustration } from '@/components/funktioner/illustrations/ToolIllustrations'

const FORGOT_QUOTES = [
  'Vi har alla glömt något — det här är inte ditt jobb.',
  'Vi fixar detta. Du fokuserar på nästa intervju.',
  'En länk är allt som står mellan dig och inkorgen.',
]

const FORGOT_STATS = [
  { value: '< 1 min', label: 'tills du är inne' },
  { value: '24 h', label: 'länken giltig' },
  { value: '100%', label: 'krypterat' },
  { value: 'Säkert', label: 'via e-post' },
]

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      illustration={<ToolBrevIllustration className="w-full h-full" />}
      quotes={FORGOT_QUOTES}
      stats={FORGOT_STATS}
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
