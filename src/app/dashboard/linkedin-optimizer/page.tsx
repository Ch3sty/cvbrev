/**
 * LinkedIn Profile Optimizer - Dashboard Page
 * Premium wizard experience for LinkedIn profile optimization
 */
'use client'

import { Suspense } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LinkedInWizard from './components/LinkedInWizard'

const PageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <div className="animate-pulse p-8">
      <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  </div>
)

export default function LinkedInOptimizerPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <LinkedInWizard />
      </Suspense>
      <ToastContainer />
    </>
  )
}
