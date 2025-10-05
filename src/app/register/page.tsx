'use client'

import Link from 'next/link'
import RegisterForm from '@/components/auth/register-form'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/30 overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -75, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <RegisterForm />

          {/* Länk för att logga in */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Har du redan ett konto?{' '}
              <Link href="/login" className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all">
                Logga in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}