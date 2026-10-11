import { Metadata } from 'next'
import { PRISER_META } from './components/priser-data'

/**
 * Metadata för /priser (reference_onpage_seo_standard: title högst 60 tecken,
 * description mellan 110 och 158). Strängarna och talen bor i
 * priser-data.ts och läser PLANS, så ett prisbyte når titeln också.
 *
 * Title: 58 tecken. Description: 148 tecken (copy-premium avsnitt 3).
 */
export const metadata: Metadata = {
  title: PRISER_META.title,
  description: PRISER_META.description,
  keywords: PRISER_META.keywords,
  openGraph: {
    title: PRISER_META.ogTitle,
    description: PRISER_META.description,
    type: 'website',
    locale: 'sv_SE',
    url: PRISER_META.url,
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: PRISER_META.ogTitle,
    description: PRISER_META.description,
  },
  alternates: {
    canonical: PRISER_META.url,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PriserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
