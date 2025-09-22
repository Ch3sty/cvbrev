import Link from 'next/link'
import RegisterForm from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Registrera dig</h2>
          <p className="mt-2 text-gray-400">
            Skapa ett nytt konto för att komma igång
          </p>
        </div>

        <RegisterForm />

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