/**
 * /verktyg/bli-upptackt — publik landningssida för kandidatfunktionen
 * "Bli upptäckt". Kandidatens perspektiv, orange/röd-DNA (indigo endast för
 * arbetsstil/personlighet). Sektioner: Hero → Vad är det här → Värdeprops →
 * Matchnings-demo (interaktiv) → Arbetsstil/test → Så funkar det → Trygghet →
 * Exempelprofil → FAQ → Final CTA. CTA leder till /register.
 */
import Breadcrumb from '@/components/Breadcrumb'
import BliUpptacktHero from './components/BliUpptacktHero'
import BliUpptacktIntro from './components/BliUpptacktIntro'
import BliUpptacktVardeprops from './components/BliUpptacktVardeprops'
import BliUpptacktMatchning from './components/BliUpptacktMatchning'
import BliUpptacktArbetsstil from './components/BliUpptacktArbetsstil'
import BliUpptacktSaFunkar from './components/BliUpptacktSaFunkar'
import BliUpptacktTrygghet from './components/BliUpptacktTrygghet'
import BliUpptacktExempel from './components/BliUpptacktExempel'
import BliUpptacktFAQ from './components/BliUpptacktFAQ'
import BliUpptacktCTABand from './components/BliUpptacktCTABand'
import { BLI_UPPTACKT_FAQ_ITEMS } from './components/bli-upptackt-faq-data'

export default function BliUpptacktSida() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Bli upptäckt av rekryterare på Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai/verktyg/bli-upptackt',
    description:
      'Skapa en anonym kandidatprofil så kan verifierade rekryterare som söker din kompetens hitta dig. Verifierade testresultat och arbetsstil matchar dig mot rätt jobb. Anonym tills du säger ja, gratis att synas.',
    serviceType: 'Karriärtjänst',
    areaServed: { '@type': 'Country', name: 'Sverige' },
    provider: {
      '@type': 'Organization',
      name: 'Jobbcoach.ai',
      url: 'https://www.jobbcoach.ai',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Gratis att synas för kandidater',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BLI_UPPTACKT_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="bg-[#FFFCF9] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'Bli upptäckt', href: '/verktyg/bli-upptackt' },
            ]}
          />
        </div>

        <BliUpptacktHero />
        <BliUpptacktIntro />
        <BliUpptacktVardeprops />
        <BliUpptacktMatchning />
        <BliUpptacktArbetsstil />
        <BliUpptacktSaFunkar />
        <BliUpptacktTrygghet />
        <BliUpptacktExempel />
        <BliUpptacktFAQ />
        <BliUpptacktCTABand />
      </main>
    </>
  )
}
