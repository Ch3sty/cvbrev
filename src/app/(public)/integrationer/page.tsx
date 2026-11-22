/**
 * /integrationer, publikt omgång 3. Sidan har grundens form: hjälten på väggen
 * med en kopplingsbild, läget som lyft kort, kopplingarna som kort i var sin
 * färg, de tre vinsterna som numrerade kort och förslaget som en ö.
 *
 * Ägarens besked 2026-11-22 (docs/publikt-omgang3/beslut-agarpunkter.md,
 * punkt 1): sidan har fyra kopplingar som finns i produkten i dag, LinkedIn,
 * Arbetsförmedlingen, din e-post och Google-inloggningen. De två korten för
 * funktioner som inte fanns (Gmail och Outlook, rekryteringssystem) är
 * strukna. Egen metadata och canonical. Serverkomponent, utan emoji.
 */
import type { Metadata } from 'next'
import { Briefcase, Linkedin, LogIn, Mail } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Sida, Hjalte, Lyft, Sektion, Rutnat, Kort, Chip, Nr, O, Knapp, Ikon, type Farg } from '@/components/publikt/v3'
import './integrationer.css'

type Integration = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  name: string
  description: string
  status: string
  farg: Farg
}

const INTEGRATIONER: Integration[] = [
  {
    icon: Linkedin,
    name: 'LinkedIn',
    description:
      'Spara din LinkedIn-profil som PDF och ladda upp den, så fyller vi i avsnitten i ditt CV. LinkedIn-optimeringen skriver om rubriken och om mig-texten utifrån ditt CV, och du klistrar in dem själv. Vi loggar aldrig in på LinkedIn.',
    status: 'PDF gratis, optimeringen i Premium',
    farg: 'cv',
  },
  {
    icon: Briefcase,
    name: 'Arbetsförmedlingen',
    description:
      'Matchade jobb hämtar annonserna ur Arbetsförmedlingens öppna API och visar dem som passar ditt CV. Månadsrapporten i Sökta tjänster är underlag till din aktivitetsrapport, som du lämnar in själv.',
    status: 'I Matchade jobb och Sökta tjänster',
    farg: 'jobb',
  },
  {
    icon: Mail,
    name: 'Din e-post',
    description:
      'Uppföljningsmejlet till en sökt tjänst öppnas i ditt e-postprogram med ämne och text ifyllda, eller så kopierar du det. Du skickar det själv, från din egen adress.',
    status: 'I Sökta tjänster',
    farg: 'brev',
  },
  {
    icon: LogIn,
    name: 'Google',
    description:
      'Skapa kontot och logga in med ditt Google-konto. Vi får ditt namn och din e-postadress från Google, aldrig ditt lösenord.',
    status: 'Vid inloggningen',
    farg: 'tran',
  },
]

const VINSTER = [
  {
    rubrik: 'Snabbare arbetsflöde',
    text: 'Din LinkedIn-PDF fyller i CV:t, och från en träff i Matchade jobb följer annonsen med in i det personliga brevet.',
  },
  {
    rubrik: 'Bättre matchning',
    text: 'Det personliga brevet skrivs mot annonsens krav, och träffarna i Matchade jobb visar varför de passar ditt CV.',
  },
  {
    rubrik: 'Mät resultat',
    text: 'Sökta tjänster visar var varje ansökan står, från sökt till erbjudande, och statistiken för hela sökandet.',
  },
]

const TITEL = 'Integrationer med LinkedIn och Arbetsförmedlingen'
const BESKRIVNING =
  'Så hänger Jobbcoach.ai ihop med LinkedIn, Arbetsförmedlingen, din e-post och ditt Google-konto: fyra kopplingar som finns i kontot i dag.'
const ADRESS = 'https://www.jobbcoach.ai/integrationer'

export const metadata: Metadata = {
  title: TITEL,
  description: BESKRIVNING,
  alternates: { canonical: ADRESS },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITEL,
    description: BESKRIVNING,
    url: ADRESS,
    siteName: 'Jobbcoach.ai',
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITEL,
    description: BESKRIVNING,
  },
}

/** Kopplingsbilden i hjälten: Jobbcoach i mitten, de fyra verktygen runt om. Dekor. */
function Kopplingar() {
  return (
    <div className="ig-bild" aria-hidden="true">
      <svg className="ig-linjer" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none">
        <path d="M200 150 L66 62 M200 150 L334 62 M200 150 L66 238 M200 150 L334 238" stroke="currentColor" strokeWidth="3" strokeDasharray="1 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {INTEGRATIONER.map((i, n) => (
        <span key={i.name} className={`ig-nod ig-nod-${n + 1}`} data-p3-farg={i.farg}>
          <i.icon />
        </span>
      ))}
      <span className="ig-mitt">
        <i>J</i>
      </span>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <Sida>
      <main>
        <Hjalte h1="Integrationer" varde="LinkedIn, Arbetsförmedlingen, din e-post och ditt Google-konto. Så hänger de ihop med Jobbcoach.ai." bild={<Kopplingar />} lyft />

        <Lyft className="ig-lage">
          <h2 className="p3-h2">Kopplingar som finns i dag</h2>
          <p className="p3-varde">
            Fyra kopplingar som finns i kontot nu. Vi läser aldrig din inkorg, loggar aldrig in åt dig och skickar inga ansökningar i ditt namn.
          </p>
        </Lyft>

        <Sektion>
          <Rutnat kolumner={2}>
            {INTEGRATIONER.map((integration) => (
              <Kort key={integration.name} farg={integration.farg} className="ig-kort">
                <span className="ig-ikon" aria-hidden="true">
                  <integration.icon />
                </span>
                <div>
                  <h3 className="p3-h3">{integration.name}</h3>
                  <p>{integration.description}</p>
                  <Chip>{integration.status}</Chip>
                </div>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        <Sektion botten="papper">
          <Rutnat kolumner={3}>
            {VINSTER.map((v, n) => (
              <Kort key={v.rubrik} ton className="ig-vinst">
                <Nr typ="koppar">{n + 1}</Nr>
                <h3 className="p3-h3">{v.rubrik}</h3>
                <p>{v.text}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        <Sektion>
          <O
            farg="jobb"
            className="ig-o"
            ikon={false}
            som="div"
            rubrikNiva="h2"
            rubrik="Vill du föreslå en integration?"
            varde="Berätta vilket verktyg du använder och vad kopplingen skulle göra åt dig."
            knappar={
              <Knapp href="/kontakt" pil>
                Föreslå integration
              </Knapp>
            }
            bild={
              <div className="ig-forslag" aria-hidden="true">
                <span>
                  <Ikon namn="upp" />
                </span>
                <b />
                <b />
                <b />
              </div>
            }
          />
        </Sektion>
      </main>
    </Sida>
  )
}
