/**
 * /om-oss i linjen (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 5).
 * SEO: Organization och AboutPage med brödsmulor som JSON-LD, oförändrade.
 */
import OmOssSida from './OmOssSida'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const revalidate = 86400

/** Talen läses en gång per dygn. Går de inte att läsa faller de bort. */
async function talen(): Promise<{ konton: number | null; brev: number | null }> {
  try {
    const db = getSupabaseAdmin()
    const [k, b] = await Promise.all([
      db.from('profiles').select('*', { count: 'exact', head: true }),
      db.from('letters').select('*', { count: 'exact', head: true }),
    ])
    return { konton: k.count || null, brev: b.count || null }
  } catch {
    return { konton: null, brev: null }
  }
}

export default async function OmOssPage() {
  const { konton, brev } = await talen()
  // === Schema.org markup ===

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai',
    logo: 'https://www.jobbcoach.ai/logo.png',
    description:
      'Svenska jobbverktyg byggda för svensk arbetsmarknad. CV-byggare, jobbmatchning, karriärrådgivning, rekryteringstester och LinkedIn-optimering, allt med svenska källor.',
    foundingDate: '2023',
    email: 'info@jobbcoach.ai',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@jobbcoach.ai',
      contactType: 'customer support',
      availableLanguage: ['Swedish', 'English'],
      areaServed: 'SE',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sweden',
    },
    knowsAbout: [
      'CV-skrivning',
      'Personliga brev',
      'Jobbsökning',
      'Karriärrådgivning',
      'Rekryteringstester',
      'LinkedIn-optimering',
      'Svensk arbetsmarknad',
    ],
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Om Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai/om-oss',
    description:
      'Lär känna teamet och plattformen bakom Jobbcoach.ai. Vi bygger svenska jobbverktyg sedan 2023, från cvbrev.se till en komplett karriärplattform.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Hem',
          item: 'https://www.jobbcoach.ai',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Om oss',
          item: 'https://www.jobbcoach.ai/om-oss',
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <OmOssSida konton={konton} brev={brev} />
    </>
  )
}
