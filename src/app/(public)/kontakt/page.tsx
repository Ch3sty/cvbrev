/**
 * /kontakt, publikt v2 (docs/design/spec-publikt-v2-del-b-2026-10-12.md
 * avsnitt 3.8, skissen flik #foretag). Hjälten på vägg brev utan knapp:
 * handlingen är formuläret, som ligger som ett lyft kort över väggens kant
 * med sidans enda h2. De tre kontaktvägarna är h3.
 *
 * Serverkomponent; bara formuläret är en klientö. Sidan hade startsidans
 * title och description och får egna (ägarbeslut 10 i del B).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import PubliktSida from '@/components/publikt/PubliktSida'
import '@/components/publikt/innehall/foretag.css'
import Rum from '@/components/publikt/Rum'
import Smula from '@/components/publikt/innehall/Smula'
import KontaktFormPublik from '@/components/kontakt/KontaktFormPublik'

export const metadata: Metadata = {
  title: 'Kontakta oss | Jobbcoach.ai',
  description:
    'Har du en fråga om ditt konto, en funktion eller ett samarbete? Skicka ett meddelande här eller mejla oss, så svarar vi inom ett par vardagar.',
  alternates: { canonical: 'https://www.jobbcoach.ai/kontakt' },
}

export default function KontaktPage() {
  return (
    <PubliktSida>
      <main>
        <Rum rum="brev" yta="vagg" id="hjalte" className="ib-hjalte if-kontakt-hjalte">
          <div className="pub-wrap">
            <Smula steg={[{ namn: 'Hem', href: '/' }, { namn: 'Kontakt' }]} />
            <p className="pub-kick">Kontakta oss</p>
            <h1 className="pub-h1 ib-h1-stor">Vi svarar på dina frågor</h1>
            <p className="pub-ingress">
              Skicka ett meddelande eller välj rätt e-post nedan. Vi läser allt och svarar inom ett par vardagar.
            </p>
          </div>
        </Rum>
        <Rum yta="mark" id="kontakt-form" className="if-lyft-sek">
          <div className="pub-wrap if-kontakt if-lyft">
            <KontaktFormPublik />
            <ul className="if-infokort">
              <li className="pub-rum-brev">
                <h3>Allmänna frågor</h3>
                <p>
                  Frågor om funktioner, samarbeten eller feedback? Maila{' '}
                  <a href="mailto:info@jobbcoach.ai">info@jobbcoach.ai</a>
                </p>
              </li>
              <li className="pub-rum-cv">
                <h3>Konto och support</h3>
                <p>
                  Problem med inloggning, betalning eller din prenumeration? Kontakta{' '}
                  <a href="mailto:support@jobbcoach.ai">support@jobbcoach.ai</a>
                </p>
              </li>
              <li className="pub-rum-jobb">
                <h3>Vanliga frågor</h3>
                <p>
                  Hitta svar direkt bland våra vanliga frågor om funktioner, priser och användning.{' '}
                  <Link href="/#faq">Gå till vanliga frågor</Link> eller till <Link href="/hjalpcenter">hjälpcentret</Link>.
                </p>
              </li>
            </ul>
          </div>
        </Rum>
      </main>
    </PubliktSida>
  )
}
