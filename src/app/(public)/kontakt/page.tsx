/**
 * /kontakt, publikt omgång 3: sidan utan egen skiss får grundens skal
 * (BYGGBRIEF beslut 10). Hjälten på väggen utan knapp: handlingen är
 * formuläret, som ligger i grundens lyfta kort över väggens kant med sidans
 * enda h2 (i formuläret). De tre kontaktvägarna är h3. Texterna och
 * länkarna är desamma som förut.
 *
 * Serverkomponent; bara formuläret är en klientö. Formuläret har kvar sina
 * egna klasser (pub-kort, if-form), därför laddar PubliktSida publikt.css
 * och foretag.css som förut.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import PubliktSida from '@/components/publikt/PubliktSida'
import '@/components/publikt/innehall/foretag.css'
import { Sida, Hjalte, Lyft } from '@/components/publikt/v3'
import KontaktFormPublik from '@/components/kontakt/KontaktFormPublik'
import './kontakt.css'

export const metadata: Metadata = {
  title: 'Kontakta oss | Jobbcoach.ai',
  description:
    'Har du en fråga om ditt konto, en funktion eller ett samarbete? Skicka ett meddelande här eller mejla oss, så svarar vi inom ett par vardagar.',
  alternates: { canonical: 'https://www.jobbcoach.ai/kontakt' },
}

export default function KontaktPage() {
  return (
    <Sida farg="neutral">
      <PubliktSida>
        <main>
          <Hjalte
            id="hjalte"
            brodsmulor={[
              { name: 'Hem', href: '/' },
              { name: 'Kontakt', href: '/kontakt' },
            ]}
            brodsmulorSchema={false}
            etikett="Kontakta oss"
            h1="Vi svarar på dina frågor"
            varde="Skicka ett meddelande eller välj rätt e-post nedan. Vi läser allt och svarar inom ett par vardagar."
            lyft
          />
          <Lyft id="kontakt-form" className="kt-lyft">
            <div className="if-kontakt">
              <KontaktFormPublik />
              <ul className="kt-vagar">
                <li data-p3-farg="brev">
                  <h3 className="p3-h3">Allmänna frågor</h3>
                  <p>
                    Frågor om funktioner, samarbeten eller feedback? Maila{' '}
                    <a href="mailto:info@jobbcoach.ai">info@jobbcoach.ai</a>
                  </p>
                </li>
                <li data-p3-farg="cv">
                  <h3 className="p3-h3">Konto och support</h3>
                  <p>
                    Problem med inloggning, betalning eller din prenumeration? Kontakta{' '}
                    <a href="mailto:support@jobbcoach.ai">support@jobbcoach.ai</a>
                  </p>
                </li>
                <li data-p3-farg="jobb">
                  <h3 className="p3-h3">Vanliga frågor</h3>
                  <p>
                    Hitta svar direkt bland våra vanliga frågor om funktioner, priser och användning.{' '}
                    <Link href="/#faq">Gå till vanliga frågor</Link> eller till <Link href="/hjalpcenter">hjälpcentret</Link>.
                  </p>
                </li>
              </ul>
            </div>
          </Lyft>
          <div className="kt-golv" aria-hidden="true" />
        </main>
      </PubliktSida>
    </Sida>
  )
}
