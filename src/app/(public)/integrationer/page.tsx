/**
 * /integrationer, publikt omgång 3. Utseendegranskning 2 (2026-11-22): sidan
 * stod på golvet utan vägg, med ikoner i små rutor och emoji som bilder.
 * Nu har den grundens form: hjälten på väggen med en kopplingsbild, läget
 * som lyft kort, de fyra integrationerna som kort i var sin färg, de tre
 * vinsterna som numrerade kort och förslaget som en ö. Rubrikerna (h1, två
 * h2, sju h3), texterna och länken till /kontakt är desamma som förut, ord
 * för ord. Serverkomponent, utan framer-motion och utan emoji.
 */
import { Briefcase, Linkedin, Mail, Users } from 'lucide-react'
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

const FUTURE_INTEGRATIONS: Integration[] = [
  { icon: Linkedin, name: 'LinkedIn', description: 'Importera profil och optimera för jobbsökning', status: 'Planerad Q2 2026', farg: 'cv' },
  { icon: Briefcase, name: 'Arbetsförmedlingen', description: 'Sök jobb direkt från plattformen', status: 'Under utveckling', farg: 'jobb' },
  { icon: Mail, name: 'Gmail & Outlook', description: 'Skicka personliga brev direkt från din e-post', status: 'Planerad Q3 2026', farg: 'brev' },
  { icon: Users, name: 'ATS-system', description: 'Integration med Applicant Tracking Systems', status: 'Enterprise-funktion', farg: 'tran' },
]

const VINSTER = [
  { rubrik: 'Snabbare arbetsflöde', text: 'Importera data automatiskt och spara tid' },
  { rubrik: 'Bättre matchning', text: 'Vi anpassar innehållet efter jobbannonsen' },
  { rubrik: 'Mät resultat', text: 'Följ upp ansökningar och optimera strategi' },
]

/** Kopplingsbilden i hjälten: Jobbcoach i mitten, de fyra verktygen runt om. Dekor. */
function Kopplingar() {
  return (
    <div className="ig-bild" aria-hidden="true">
      <svg className="ig-linjer" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none">
        <path d="M200 150 L66 62 M200 150 L334 62 M200 150 L66 238 M200 150 L334 238" stroke="currentColor" strokeWidth="3" strokeDasharray="1 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {FUTURE_INTEGRATIONS.map((i, n) => (
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
        <Hjalte h1="Integrationer" varde="Koppla samman Jobbcoach.ai med de verktyg du redan använder" bild={<Kopplingar />} lyft />

        <Lyft className="ig-lage">
          <h2 className="p3-h2">Integrationer under utveckling</h2>
          <p className="p3-varde">
            Vi arbetar på att skapa sömlösa kopplingar till de mest populära verktygen för jobbsökning och karriärutveckling i Sverige
          </p>
        </Lyft>

        <Sektion>
          <Rutnat kolumner={2}>
            {FUTURE_INTEGRATIONS.map((integration) => (
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
            varde="Berätta vilket verktyg du använder så prioriterar vi utvecklingen"
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
