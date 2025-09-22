import Link from 'next/link'
import RegisterForm from '@/components/auth/register-form'
import { Suspense } from 'react'

interface PageProps {
  searchParams: {
    invite?: string
    email?: string
    name?: string
  }
}

export default function RegisterPage({ searchParams }: PageProps) {
  const isInvite = !!searchParams.invite

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            {isInvite ? 'Slutför din registrering' : 'Registrera dig'}
          </h2>
          <p className="mt-2 text-gray-400">
            {isInvite
              ? 'Skapa ett lösenord för att aktivera ditt Premium-konto'
              : 'Skapa ett nytt konto för att komma igång'}
          </p>
        </div>

        <Suspense fallback={<div>Laddar...</div>}>
          <RegisterForm
            inviteCode={searchParams.invite}
            defaultEmail={searchParams.email}
            defaultName={searchParams.name}
          />
        </Suspense>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Har du redan ett konto?{' '}
            <Link href="/login" className="text-pink-500 hover:text-pink-400">
              Logga in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}