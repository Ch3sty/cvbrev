/**
 * Exemplet före och efter på /verktyg/linkedin-optimering (publikt omgång 3,
 * skissen linkedin). Ersätter den rörliga demon med Anna Lindberg: ett stilla
 * exempel med Sara Lindström, exempelpersonen i omgången, och påhittade
 * arbetsgivare (byggbriefen, Exempel och påhittat). Poängen är exempeltal och
 * står i aria-hidden ytor, märkta "Exempel". Serverkomponent.
 *
 * Profilytan (Profil) är sidans egen, grunden har ingen LinkedIn-profil.
 */

import type { ReactNode } from 'react'
import { Chip, Knapp } from '@/components/publikt/v3'

const RUBRIK_MAX = 220

/** Saras rubrik i dag och efter, och orden en rekryterare kan söka på. */
export const SARA_RUBRIK_FORE = 'Projektledare på Nordanvind Energi'
const EFTER_DELAR: { text: string; ord?: boolean }[] = [
  { text: 'Projektledare', ord: true },
  { text: ' inom ' },
  { text: 'energi', ord: true },
  { text: ' och ' },
  { text: 'bygg', ord: true },
  { text: ' | ' },
  { text: 'Offentlig upphandling', ord: true },
  { text: ' enligt ' },
  { text: 'LOU', ord: true },
  { text: ', ' },
  { text: 'budgetansvar', ord: true },
  { text: ', tidplan | Leder ombyggnader från förfrågan till överlämning' },
]
export const SARA_RUBRIK_EFTER = EFTER_DELAR.map((d) => d.text).join('')
const ORD_FORE = ['projektledare']
const ORD_EFTER = EFTER_DELAR.filter((d) => d.ord).map((d) => d.text.toLowerCase().replace('lou', 'LOU'))

/** Exempeltalen (aria-hidden). */
export const POANG_RUBRIK = { fore: 32, efter: 87 }

/** Rubriken med sökorden utmärkta. */
export function RubrikEfter() {
  return (
    <>
      {EFTER_DELAR.map((d, i) => (d.ord ? <mark key={i}>{d.text}</mark> : <span key={i}>{d.text}</span>))}
    </>
  )
}

/** Profilytan: banderoll, initialer, namn, rubrik, ort och Om. */
export function Profil({ rubrik, om, gra }: { rubrik: ReactNode; om?: ReactNode; gra?: boolean }) {
  return (
    <div className="lnk-prof">
      <div className={`lnk-prof-ban ${gra ? 'lnk-gra' : ''}`.trim()} />
      <div className="lnk-prof-kropp">
        <div className={`lnk-prof-bild ${gra ? 'lnk-gra-bild' : ''}`.trim()} aria-hidden="true">
          SL
        </div>
        <p className="lnk-prof-namn">Sara Lindström</p>
        <p className="lnk-prof-rub">{rubrik}</p>
        <p className="lnk-prof-ort">Göteborg, Västra Götalands län</p>
        {om ? (
          <div className="lnk-prof-om">
            <b>Om</b>
            {om}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Tecken({ rubrik, ord, efter }: { rubrik: string; ord: readonly string[]; efter?: boolean }) {
  const andel = Math.round((rubrik.length / RUBRIK_MAX) * 1000) / 10
  return (
    <div className="lnk-tecken">
      <b>
        Rubrikens längd{' '}
        <span>
          {rubrik.length} av {RUBRIK_MAX} tecken
        </span>
      </b>
      <div className={`p3-stapel ${efter ? 'p3-koppar' : 'lnk-gra-stapel'}`} aria-hidden="true">
        <i style={{ width: `${andel}%` }} />
      </div>
      <p>Ord en rekryterare kan söka på:</p>
      <div className="lnk-ordrad">
        {ord.map((o) => (
          <span key={o} className="lnk-pa">
            {o}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LinkedinOptimeringLiveDemo() {
  return (
    <div>
      <div className="lnk-fe-topp">
        <div>
          <p className="p3-ey">Exempel, Sara Lindström</p>
          <p className="p3-h2">Rubriken och Om mig, före och efter</p>
          <p className="p3-varde">
            Så ser de två första raderna ut på en profil, där rekryteraren läser dem. Erfarenhet, utbildning och kompetenser skrivs om i samma pass.
          </p>
        </div>
        <div aria-hidden="true">
          <div className="lnk-fe-tal">
            <s>{POANG_RUBRIK.fore}</s>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <b>{POANG_RUBRIK.efter}</b>
          </div>
          <p className="p3-liten">Exempel: profilpoäng för rubriken, av 100</p>
        </div>
      </div>

      <div className="lnk-fe">
        <div className="lnk-fe-kol">
          <div className="lnk-fe-etk">
            <Chip>I dag</Chip>
            <span className="p3-liten">Det Sara klistrar in</span>
          </div>
          <Profil
            gra
            rubrik={SARA_RUBRIK_FORE}
            om={<p>Jag är en driven och engagerad projektledare som trivs med många bollar i luften och tycker om att arbeta med människor.</p>}
          />
          <Tecken rubrik={SARA_RUBRIK_FORE} ord={ORD_FORE} />
        </div>
        <div className="lnk-fe-kol">
          <div className="lnk-fe-etk">
            <Chip typ="koppar">Efter</Chip>
            <span className="p3-liten">Det Sara får tillbaka</span>
          </div>
          <Profil
            rubrik={<RubrikEfter />}
            om={
              <>
                <p>
                  Jag leder ombyggnads- och energiprojekt åt offentliga beställare, från förfrågningsunderlag till överlämning. De senaste tre åren har jag drivit fyra
                  upphandlingar enligt LOU och hållit ihop tidplan, budget och underentreprenörer i projekt på upp till 42 miljoner kronor.
                </p>
                <p>Jag började som biträdande projektledare inom logistik och tog med mig vanan att räkna på flöden. I dag är det den som gör att mina projekt blir klara före plan.</p>
                <span className="lnk-mer">Fortsätter: vart Sara är på väg.</span>
              </>
            }
          />
          <Tecken rubrik={SARA_RUBRIK_EFTER} ord={ORD_EFTER} efter />
        </div>
      </div>

      <div className="lnk-fe-fot">
        <ul className="lnk-plus">
          <li>+ Branschens sökord</li>
          <li>+ Tydlig specialisering</li>
          <li>+ Resultat i siffror</li>
        </ul>
        <Chip typ="premium">Ingår i Premium</Chip>
        <Knapp href="/register" variant="vit" liten>
          Optimera min profil
        </Knapp>
      </div>
    </div>
  )
}
