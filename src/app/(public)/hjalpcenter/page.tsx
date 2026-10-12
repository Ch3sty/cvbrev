/**
 * /hjalpcenter, publikt v2 (docs/design/spec-publikt-v2-del-b-2026-10-12.md
 * avsnitt 3.9): textmallen med de tre korten som länkkort. Texterna är
 * desamma som förut. Sidan hade startsidans title och description och får
 * egna (ägarbeslut 10 i del B). Serverkomponent.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import PubliktSida from '@/components/publikt/PubliktSida'
import Textmall from '@/components/publikt/innehall/Textmall'

export const metadata: Metadata = {
  title: 'Hjälpcenter | Jobbcoach.ai',
  description:
    'Hjälp med Jobbcoach.ai: kom igång med kontot, skapa och redigera personliga brev, hantera betalning och prenumeration. Hittar du inte svaret, kontakta oss.',
  alternates: { canonical: 'https://www.jobbcoach.ai/hjalpcenter' },
}

const KATEGORIER = [
  {
    titel: 'Komma igång',
    beskrivning: 'Första stegen med Jobbcoach.ai',
    amnen: ['Skapa konto', 'Första brevet', 'Profilinställningar'],
    href: '/funktioner',
  },
  {
    titel: 'Personliga brev',
    beskrivning: 'Allt om att skapa och redigera brev',
    amnen: ['Skapa brev', 'Redigering', 'Export och format'],
    href: '/verktyg/personligt-brev',
  },
  {
    titel: 'Konto & Fakturering',
    beskrivning: 'Hantera ditt konto och prenumeration',
    amnen: ['Betalning', 'Prenumerationer', 'Kontoinställningar'],
    href: '/priser',
  },
]

export default function HjalpcenterPage() {
  return (
    <PubliktSida>
      <Textmall titel="Hjälpcenter" smula="Hjälpcenter">
        <p className="pub-ingress">Få hjälp med Jobbcoach.ai och optimera din karriärutveckling</p>
        <div className="if-hjalpkort">
          {KATEGORIER.map((k) => (
            <Link key={k.titel} href={k.href}>
              <h3>{k.titel} </h3>
              <p>{k.beskrivning} </p>
              <ul>
                {k.amnen.map((a) => (
                  <li key={a}>{a} </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
        <div className="if-hjalp-mer">
          <h2>Utbyggd hjälpsektion kommer snart</h2>
          <p>Vi arbetar på att skapa en omfattande kunskapsbas med guider, FAQ och videotutorials</p>
          <div className="pub-handling">
            <Link className="pub-lank" href="/kontakt">
              Kontakta support
            </Link>
            <Link className="pub-lank" href="/funktioner">
              Se funktioner
            </Link>
          </div>
        </div>
      </Textmall>
    </PubliktSida>
  )
}
