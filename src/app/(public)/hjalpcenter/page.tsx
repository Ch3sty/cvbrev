/**
 * /hjalpcenter, publikt omgång 3: sidan utan egen skiss får grundens skal
 * (BYGGBRIEF beslut 10). Hjälten på väggen, de tre korten som länkkort i
 * grundens kortform och raden om den utbyggda hjälpen som tonad sektion.
 * Texterna, rubrikerna och länkarna är desamma som förut. Serverkomponent.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Sida, Hjalte, Sektion, SektionHuvud, Rutnat, Knapprad, Knapp, TextLank } from '@/components/publikt/v3'
import './hjalpcenter.css'

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
    <Sida farg="neutral">
      <main>
        <Hjalte
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Hjälpcenter', href: '/hjalpcenter' },
          ]}
          brodsmulorSchema={false}
          h1="Hjälpcenter"
          varde="Få hjälp med Jobbcoach.ai och optimera din karriärutveckling"
        />
        <Sektion>
          <Rutnat kolumner={3}>
            {KATEGORIER.map((k) => (
              <Link key={k.titel} href={k.href} className="p3-kort hc-kort">
                <h3 className="p3-h3">{k.titel} </h3>
                <p>{k.beskrivning} </p>
                <ul className="hc-amnen">
                  {k.amnen.map((a) => (
                    <li key={a}>{a} </li>
                  ))}
                </ul>
              </Link>
            ))}
          </Rutnat>
        </Sektion>
        <Sektion botten="ton">
          <SektionHuvud
            rubrik="Utbyggd hjälpsektion kommer snart"
            varde="Vi arbetar på att skapa en omfattande kunskapsbas med guider, FAQ och videotutorials"
          >
            <Knapprad>
              <Knapp href="/kontakt">Kontakta support</Knapp>
              <TextLank href="/funktioner">Se funktioner</TextLank>
            </Knapprad>
          </SektionHuvud>
        </Sektion>
      </main>
    </Sida>
  )
}
