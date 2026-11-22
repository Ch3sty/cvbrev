/**
 * notFound() från en publik sida (en artikel eller ett yrke som inte finns).
 * Menyn kommer från (public)/layout.tsx.
 */
import type { Metadata } from 'next'
import SidanFinnsInte from '@/components/publikt/SidanFinnsInte'

export const metadata: Metadata = { title: 'Sidan finns inte | Jobbcoach.ai' }

export default function NotFound() {
  return <SidanFinnsInte />
}
