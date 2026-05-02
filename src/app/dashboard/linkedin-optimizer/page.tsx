/**
 * Förbättra LinkedIn-profil — Dashboard Page
 * Live LinkedIn-makeover wizard med orange/röd-DNA.
 */
'use client'

import { Suspense } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LinkedInOptimizer from './components/LinkedInOptimizer'

const PageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
    <div className="animate-pulse p-8 max-w-6xl mx-auto">
      <div className="h-12 w-3/4 rounded-full bg-orange-100/50 mb-8" />
      <div className="h-64 rounded-3xl bg-orange-100/30" />
    </div>
  </div>
)

export default function LinkedInOptimizerPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <LinkedInOptimizer />
      </Suspense>
      <ToastContainer
        position="bottom-center"
        autoClose={2200}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme="light"
      />
    </>
  )
}
