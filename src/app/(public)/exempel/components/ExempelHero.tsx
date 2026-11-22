/**
 * Hjälten på /exempel, publikt omgång 3: grundens vägg (BYGGBRIEF beslut
 * 10) i stället för den vita ytan med orange gradient. Brödsmulan står i
 * hjälten (BreadcrumbList skriver page.tsx själv). Rubriken, ingressen med
 * länken till CV-mallarna, de tre knapparna och raden med de tre löftena
 * är desamma som förut. Serverkomponent, utan framer-motion.
 */
import { FileText, LayoutGrid, Mail } from 'lucide-react'
import { Hjalte, Knapp, TextLank, Ikon } from '@/components/publikt/v3'
import { ExempelHeroIcon } from './illustrations/ExempelIcons'
import { TOTAL_CV_YRKEN, TOTAL_BREV_YRKEN, KATEGORIER } from './exempel-data'
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'

const TRUST = ['Helt gratis', 'ATS-optimerade', 'Uppdaterade 2026']

export default function ExempelHero() {
  return (
    <Hjalte
      brodsmulor={[
        { name: 'Hem', href: '/' },
        { name: 'Exempel', href: '/exempel' },
      ]}
      brodsmulorSchema={false}
      etikett="Inspiration"
      h1={
        <>
          Exempel för din jobbansökan: <span className="ex-h1-led">CV, personligt brev och mallar.</span>
        </>
      }
      varde={
        <>
          Vi har {TOTAL_CV_YRKEN} CV-exempel och {TOTAL_BREV_YRKEN} exempel på personligt brev fördelade över {KATEGORIER.length} kategorier.
          Behöver du en färdig design i stället finns {TEMPLATE_COUNT}{' '}
          <TextLank href="/cv-mallar" className="ex-inlank">
            CV-mallar
          </TextLank>{' '}
          att välja mellan.
        </>
      }
      knappar={
        <>
          <Knapp href="/cv-exempel" pil>
            <FileText className="ex-knappikon" strokeWidth={2.5} aria-hidden="true" />
            Se CV-exempel
          </Knapp>
          <Knapp href="/cv-mallar" variant="glas">
            <LayoutGrid className="ex-knappikon" strokeWidth={2.5} aria-hidden="true" />
            Bläddra CV-mallar
          </Knapp>
          <Knapp href="/personligt-brev-exempel" variant="glas">
            <Mail className="ex-knappikon" strokeWidth={2.5} aria-hidden="true" />
            Personligt brev-exempel
          </Knapp>
        </>
      }
      bild={<ExempelHeroIcon className="ex-hjaltebild" />}
    >
      <ul className="ex-trust">
        {TRUST.map((t) => (
          <li key={t}>
            <Ikon namn="bock" />
            {t}
          </li>
        ))}
      </ul>
    </Hjalte>
  )
}
