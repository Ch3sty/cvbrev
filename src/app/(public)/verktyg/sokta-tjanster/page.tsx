/**
 * /verktyg/sokta-tjanster, ny i publikt omgång 3 (skissen sokta-tjanster,
 * docs/design/publikt-omgang3/sidor/sokta-tjanster.html).
 *
 * Texten är copys godkända lydelse (docs/publikt-omgang3/nytt-innehall.md,
 * avsnittet sokta-tjanster) och dispositionen SEO:s (seo-besked-skisser.md,
 * Den nya sidan): elva H2 i beskedets ordning, HowTo-stegen som H3, åtta
 * FAQ-frågor. Frågan "Vem kan se mina sökta tjänster?" står inte (ägarens).
 *
 * Schema: WebApplication, HowTo, FAQPage och BreadcrumbList, byggda ur samma
 * listor som syns. Alla exempel (Sara Lindström, arbetsgivarna, datumen,
 * talen i tratten och på bladet) är påhittade och märkta Exempel.
 * Serverkomponent; klient-JS bara för FastKnapprad.
 */
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { PLAN_BY_KEY, SALD_PLAN, paketKort, paketNamn } from '@/lib/plans/plans'
import { NO_RESPONSE_NUDGE_DAYS, STATUS_META, type ApplicationEventType } from '@/lib/applications/status'
import { APPLICATION_SHARE_TTL_DAYS } from '@/lib/applications/shareTtl'
import { JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { VECKANS_MAL_FORVAL, VECKANS_MAL_MAX, VECKANS_MAL_MIN, UPPFOLJNING_GRATIS_UTKAST } from '@/lib/jobbsok/typer'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import LoggaArkPublik from './LoggaArkPublik'
import { SOKT_KONTO_HREF } from '@/lib/jobbsok/provaSokt'
import { storForst, talOrd } from '@/components/publikt/talord'
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  Kort,
  Rutnat,
  VagSteg,
  Faq,
  LankBricka,
  O,
  Bocklista,
  Chip,
  Knapp,
  Knapprad,
  TextLank,
  Ikon,
  Stig,
  IntervjuKort,
} from '@/components/publikt/v3'
import {
  AF_KALLA,
  AF_LAST,
  BESKED_DAGAR,
  BESKRIVNING,
  FEATURE_LIST,
  FRAGOR,
  H1,
  PREMIUM_MED_PRIS,
  STEG,
  TYST_DAGAR,
  URL,
} from './sokta-tjanster-data'
// Den fasta knappraden (pub-botten) är stylad i publikt.css.
import '@/components/publikt/publikt.css'
import './sokta-tjanster.css'

// K1 (saas-lead, SEO JA): kontot landar i Sökta tjänster med arket Logga sökt tjänst öppet.
const REGISTRERA = SOKT_KONTO_HREF
const PLAN = PLAN_BY_KEY[SALD_PLAN]

/** Händelserna man kan logga, i kontots ordning, etiketterna ur STATUS_META. */
const HANDELSER: ApplicationEventType[] = [
  'applied',
  'test_invited',
  'interview_invited',
  'interview_completed',
  'trial_work_completed',
  'offer_received',
  'accepted',
  'declined',
  'rejected',
]

const GRATIS_LISTA = [
  'Logga så många sökta tjänster du vill',
  'Listan, läget och statistiken, från sökt till erbjudande',
  'Ska sökas med sista ansökningsdag',
  'Veckans mål',
  'Det första utkastet till ett uppföljningsmejl',
  'Månadsrapportens antal, och en delningslänk som visar dem',
  'Ett intervjuprov med bedömning om dagen',
]

const PREMIUM_LISTA = [
  'Utkast till uppföljningsmejl till varje sökt tjänst, efter en ansökan eller en intervju',
  'Månadsrapporten med alla rader, att skriva ut eller kopiera',
  'Delningslänk med listan över företag, tjänst och datum',
  'Intervjuprovet utan dagsgräns',
  `Matchade jobb med de ${JOB_MATCHES_PER_RUN} bästa träffarna, och Jobbcoachen så mycket du vill`,
]

const VIDARE = [
  { href: '/verktyg/rekryteringstester', rubrik: 'Rekryteringstester', text: `${STATUS_META.test_invited.label}? Träna på samma sorts uppgifter först.`, farg: 'tran' as const },
  { href: '/verktyg/jobbmatchning', rubrik: 'Jobbmatchning', text: 'Annonser som passar ditt CV, att spara till Ska sökas.', farg: 'jobb' as const },
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev', text: 'Skrivet mot annonsen du sparade, utifrån ditt CV.', farg: 'brev' as const },
  { href: '/verktyg/jobbcoachen', rubrik: 'Jobbcoachen', text: 'Föreslår frågor utifrån läget i dina sökta tjänster.', farg: 'jobb' as const },
  { href: '/artiklar/soka-jobb-via-mail', rubrik: 'Söka jobb via mejl', text: 'Artikel: så skriver du ansökan och påminnelsen.', farg: 'jobb' as const },
  { href: '/artiklar/uppfoljning-efter-intervju', rubrik: 'Uppföljning efter intervju', text: 'Artikel: när och hur du frågar om besked.', farg: 'jobb' as const },
]

function Br({ typ, liten, children }: { typ?: 'tom' | 'tyst' | 'int' | 'av'; liten?: boolean; children: string }) {
  return <span className={['st-br', typ ? `st-${typ}` : '', liten ? 'st-liten' : ''].filter(Boolean).join(' ')}>{children}</span>
}

export default function SoktaTjansterSida() {
  // Inloggade hör hemma i Sökta tjänster i kontot, inte på säljsidan (C2).

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Sökta tjänster',
    url: URL,
    description: BESKRIVNING,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
    },
    featureList: FEATURE_LIST.join(', '),
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så håller du koll på dina sökta jobb',
    step: STEG.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.rubrik,
      text: s.text,
    })),
  }

  // Stegens bilder, aria-hidden i VagSteg. Exempel.
  const stegBilder = [
    <div key="1" className="st-mini-rad">
      <Br typ="tom">IL</Br>
      <span className="st-mini-chip st-k">Sista dag onsdag</span>
    </div>,
    <div key="2" className="st-mini-rad">
      <Br typ="tom">IL</Br>
      <i className="st-mini-pil" />
      <Br>IL</Br>
      <span className="st-mini-chip">Sökt 22 nov</span>
    </div>,
    <div key="3" className="st-mini-rad">
      <span className="st-mini-chip">{STATUS_META.test_invited.label}</span>
      <span className="st-mini-chip">Intervju</span>
      <span className="st-mini-chip">Erbjudande</span>
    </div>,
    <div key="4" className="st-mini-rad">
      <Br typ="tyst">DA</Br>
      <span className="st-mini-chip st-k">tyst i {NO_RESPONSE_NUDGE_DAYS} dagar</span>
    </div>,
  ]

  return (
    <>
      <RedirectLoggedIn to="/dashboard/sokta-tjanster" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <Sida farg="jobb" id="innehall">
        {/* 1. Hjälten: vägen från Ska sökas till Erbjudande */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'Sökta tjänster', href: '/verktyg/sokta-tjanster' },
          ]}
          etikett="Sökta tjänster"
          h1={H1}
          varde={
            <>
              Spara annonsen du ska söka, logga jobbet du har sökt och se när det är dags att höra av sig. Dagarna räknar vi åt dig.{' '}
              <b>{`Efter ${TYST_DAGAR} tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet.`}</b>
            </>
          }
          knappar={
            <>
              <Knapp href={REGISTRERA} pil data-cta="hero-primary">
                Börja logga gratis
              </Knapp>
              <TextLank href="#sa-funkar-det">Så fungerar det</TextLank>
            </>
          }
          brickor={[
            { tal: '0 kr', text: 'för lista och statistik' },
            { tal: String(NO_RESPONSE_NUDGE_DAYS), text: 'tysta dagar, sedan utkastet' },
            { tal: '1 blad', text: 'per månad, som underlag' },
          ]}
          bild={
            <div className="st-sparvy">
              <Stig
                tyst={`tyst i ${NO_RESPONSE_NUDGE_DAYS} dagar`}
                ariaLabel={`Exempel: Saras sökta tjänster, från Ska sökas till Erbjudande. En har varit tyst i ${TYST_DAGAR} dagar och en intervju är bokad.`}
              />
              <p aria-hidden="true">
                <span className="st-malrad">
                  <i className="st-k" />
                  <i className="st-k" />
                  <i />
                  Veckans mål: 2 av 3 sökta
                </span>
              </p>
            </div>
          }
          lyft
        />

        {/* 2. Första handlingen: arket */}
        <Lyft id="logga">
          <div className="st-tva st-smal-v">
            <LoggaArkPublik />
            <div>
              <p className="p3-ey">Börja här</p>
              <h2 className="p3-h2" style={{ marginTop: 10 }}>
                Logga ett jobb du har sökt
              </h2>
              <p className="p3-varde" style={{ marginTop: 12 }}>
                Tjänst, arbetsgivare och datum räcker. Sedan behöver du inget kalkylark över dina sökta jobb. Har du inte sökt än väljer du Jag ska söka
                och lägger till sista ansökningsdag.
              </p>
              <Bocklista
                paPapper
                className="st-mt"
                punkter={[
                  'Varje sökt tjänst får en bricka som följer med från Sökt till Erbjudande.',
                  'Vi räknar dagarna sedan du senast hörde något. Tystnaden loggar du aldrig själv.',
                  'Det du loggar samlas månad för månad, som underlag till din aktivitetsrapport.',
                ]}
              />
              <p className="p3-liten" style={{ marginTop: 18 }}>
                Kommer du från Matchade jobb är tjänsten, arbetsgivaren och sista ansökningsdag redan ifyllda.
              </p>
            </div>
          </div>
        </Lyft>

        {/* 3. Så fungerar det (HowTo) */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud rubrik="Så fungerar det" varde="Fyra steg, från sparad annons till månadens underlag." />
          <VagSteg steg={STEG.map((s, i) => ({ rubrik: s.rubrik, text: s.text, bild: stegBilder[i], koppar: i === 3 }))} />
        </Sektion>

        {/* 4. Läget: de fyra facken */}
        <Sektion luft="utan-topp">
          <O farg="jobb" ikon="jobb" etikett="Läget i ett ögonkast" rubrik="Från Ska sökas till erbjudande" rubrikNiva="h2"
            varde="Varje sökt tjänst är en bricka med arbetsgivarens två första bokstäver. Du ser var den står, vilken som har varit tyst för länge och vilken intervju som kommer härnäst."
          >
            <div
              className="st-fack st-mork"
              role="img"
              aria-label={`Exempel: en annons under Ska sökas, tre sökta tjänster varav en har varit tyst i ${TYST_DAGAR} dagar, en intervju på tisdag och inget erbjudande än`}
            >
              <div>
                <b>Ska sökas</b>
                <span className="st-tal">1</span>
                <small>Närmast: onsdag</small>
                <div className="st-brickor2">
                  <Br typ="tom">IL</Br>
                </div>
              </div>
              <div>
                <b>Sökt</b>
                <span className="st-tal">3</span>
                <small>Väntar svar</small>
                <div className="st-brickor2">
                  <span className="st-tagg">
                    <em>{NO_RESPONSE_NUDGE_DAYS} dagar</em>
                    <Br typ="tyst">DA</Br>
                  </span>
                  <Br>CO</Br>
                  <Br>HE</Br>
                </div>
              </div>
              <div>
                <b>Intervju</b>
                <span className="st-tal">1</span>
                <small>Bokad tisdag</small>
                <div className="st-brickor2">
                  <span className="st-tagg">
                    <em>tis 10.00</em>
                    <Br typ="int">PO</Br>
                  </span>
                </div>
              </div>
              <div className="st-mal">
                <b>Erbjudande</b>
                <span className="st-tal">0</span>
                <small>Hit ska en bricka</small>
                <div className="st-brickor2" />
              </div>
            </div>
            <ul className="st-statusar" aria-label="Händelser du kan logga på en sökt tjänst">
              {HANDELSER.map((h) => (
                <li key={h}>{STATUS_META[h].label}</li>
              ))}
            </ul>
            <p className="p3-liten">Ett avslag räknas som ett svar och flyttar tjänsten till Avslutade, längst ned. Den ligger kvar i din historik.</p>
          </O>
        </Sektion>

        {/* 5. Ska sökas */}
        <Sektion botten="ton" id="ska-sokas">
          <div className="st-tva">
            <div className="p3-sekt-huvud">
              <p className="p3-ey">Ska sökas</p>
              <h2 className="p3-h2">Spara annonsen med sista ansökningsdag</h2>
              <p className="p3-varde">
                Hittar du en annons på måndagen men hinner skriva först på torsdagen? Lägg den under Ska sökas. Den står kvar med sin sista
                ansökningsdag, och när dagen närmar sig lyfter vi fram den.
              </p>
              <p className="p3-text">
                En sparad annons räknas inte som sökt förrän du har sökt. Från raden skriver du det personliga brevet, och när ansökan är skickad
                markerar du den som sökt.
              </p>
              <p>
                <Chip typ="gratis">Gratis för alla med konto</Chip>
              </p>
            </div>
            <div role="group" aria-label="Exempel: två sparade annonser under Ska sökas">
              <div className="st-spar">
                <Br typ="tom">IL</Br>
                <div>
                  <b>Projektledare, logistik</b>
                  <small>Isberg Logistik, Göteborg</small>
                </div>
                <span className="st-sista">Sista dag onsdag 25 nov, 3 dagar kvar</span>
                <div className="st-gor" aria-hidden="true">
                  <span className="st-kn">Skriv brev</span>
                  <span className="st-tl">Markera som sökt</span>
                  <span className="st-tl st-svag">Ta bort</span>
                </div>
              </div>
              <div className="st-spar">
                <Br typ="tom">NB</Br>
                <div>
                  <b>Byggprojektledare</b>
                  <small>Nordhaga Bygg, Mölndal</small>
                </div>
                <span className="st-sista st-lugn">Sista dag torsdag 3 dec, 11 dagar kvar</span>
                <div className="st-gor" aria-hidden="true">
                  <span className="st-kn">Skriv brev</span>
                  <span className="st-tl">Markera som sökt</span>
                  <span className="st-tl st-svag">Ta bort</span>
                </div>
              </div>
            </div>
          </div>
          <Kort className="st-malkort">
            <div className="st-malbild" role="img" aria-label="Exempel: veckans mål, två av tre sökta">
              <i className="st-k">CO</i>
              <i className="st-k">HE</i>
              <i>3</i>
              <b>
                2 av 3<small>sökta den här veckan</small>
              </b>
            </div>
            <div>
              <h3 className="p3-h3">Veckans mål håller farten uppe</h3>
              <p style={{ marginTop: 8 }}>
                {`Förvalet är ${talOrd(VECKANS_MAL_FORVAL)} sökta tjänster i veckan. Du ändrar det själv, från ${talOrd(VECKANS_MAL_MIN)} till ${talOrd(VECKANS_MAL_MAX)}, och veckan börjar om varje måndag. Fattas en ansökan visar vi vägen till annonser som passar ditt CV.`}
              </p>
            </div>
          </Kort>
        </Sektion>

        {/* 6. Statistiken */}
        <Sektion botten="papper" id="statistik">
          <SektionHuvud
            etikett="Statistik"
            rubrik="Se var ansökningarna tar stopp"
            varde="Får du inga svar alls, eller tar det stopp efter intervjun? Statistiken ritar vägen från sökt till erbjudande, med en bricka per tjänst."
          >
            <p>
              <Chip typ="gratis">Gratis för alla med konto</Chip>
            </p>
          </SektionHuvud>
          <div className="st-tratt" role="img" aria-label="Exempel: åtta sökta jobb. Fem har fått svar. Två har lett till intervju. Inget erbjudande än.">
            <div className="st-led">
              <span className="st-tal">8</span>
              <b>Sökta</b>
              <small>Sedan 14 oktober</small>
              <div className="st-matt">
                <i style={{ width: '100%' }} />
              </div>
              <div className="st-brickrad">
                {['DA', 'CO', 'HE'].map((b) => (
                  <Br key={b} liten>
                    {b}
                  </Br>
                ))}
                {['PO', 'VK'].map((b) => (
                  <Br key={b} liten typ="int">
                    {b}
                  </Br>
                ))}
                {['SB', 'TR', 'ÖH'].map((b) => (
                  <Br key={b} liten typ="av">
                    {b}
                  </Br>
                ))}
              </div>
            </div>
            <span className="st-mellan">
              5 av 8 <Ikon namn="pil" />
            </span>
            <div className="st-led">
              <span className="st-tal">5</span>
              <b>Fått svar</b>
              <small>2 kallelser, 3 avslag</small>
              <div className="st-matt">
                <i style={{ width: '62%' }} />
              </div>
              <div className="st-brickrad">
                {['PO', 'VK'].map((b) => (
                  <Br key={b} liten typ="int">
                    {b}
                  </Br>
                ))}
                {['SB', 'TR', 'ÖH'].map((b) => (
                  <Br key={b} liten typ="av">
                    {b}
                  </Br>
                ))}
              </div>
            </div>
            <span className="st-mellan">
              2 av 5 <Ikon namn="pil" />
            </span>
            <div className="st-led">
              <span className="st-tal">2</span>
              <b>Intervju</b>
              <small>1 genomförd, 1 bokad</small>
              <div className="st-matt">
                <i style={{ width: '25%' }} />
              </div>
              <div className="st-brickrad">
                {['PO', 'VK'].map((b) => (
                  <Br key={b} liten typ="int">
                    {b}
                  </Br>
                ))}
              </div>
            </div>
            <span className="st-mellan">
              väntar <Ikon namn="pil" />
            </span>
            <div className="st-led st-mal">
              <span className="st-tal">0</span>
              <b>Erbjudande</b>
              <small>Inget än</small>
              <div className="st-brickrad" />
            </div>
          </div>
          <Rutnat kolumner={3}>
            <Kort>
              <h3 className="p3-h3">Aktivitet per vecka</h3>
              <p>Hur många jobb du har sökt, vecka för vecka eller månad för månad.</p>
              <div className="st-ministaplar" role="img" aria-label="Exempel: sökta jobb per vecka under sex veckor">
                {[34, 66, 34, 100, 34, 66].map((h, i) => (
                  <i key={i} className={i === 5 ? 'st-nu' : undefined} style={{ height: `${h}%` }} />
                ))}
              </div>
            </Kort>
            <Kort>
              <h3 className="p3-h3">Hur du sökte</h3>
              <p>Svar på annons, spontanansökan eller via kontakt. Du ser hur dina ansökningar fördelar sig.</p>
              <div className="st-delning" role="img" aria-label="Exempel: fem på annons, två spontana, en via kontakt">
                <i style={{ flex: 5 }} />
                <i style={{ flex: 2 }} />
                <i style={{ flex: 1 }} />
              </div>
              <div className="st-forkl" aria-hidden="true">
                <span>5 annons</span>
                <span>2 spontana</span>
                <span>1 via kontakt</span>
              </div>
            </Kort>
            <Kort>
              <h3 className="p3-h3">Svar per CV</h3>
              <p>Skickar du olika CV:n ser du hur många av de sökta tjänsterna med varje CV som har fått svar.</p>
              <div role="img" aria-label="Exempel: CV för projektledning fick svar på 4 av 5, CV för logistik på 1 av 3">
                <div className="st-cvrad">
                  <span>CV, projektledning</span>
                  <span>4 av 5</span>
                  <div className="st-stapel">
                    <i style={{ width: '80%' }} />
                  </div>
                </div>
                <div className="st-cvrad">
                  <span>CV, logistik</span>
                  <span>1 av 3</span>
                  <div className="st-stapel">
                    <i style={{ width: '33%' }} />
                  </div>
                </div>
              </div>
            </Kort>
          </Rutnat>
        </Sektion>

        {/* 7. Uppföljningsmejlet */}
        <Sektion id="uppfoljning">
          <O
            farg="jobb"
            ikon="jobb"
            vand
            etikett="Följ upp"
            rubrik={`Uppföljningsmejlet efter ${TYST_DAGAR} tysta dagar`}
            rubrikNiva="h2"
            varde={
              <>
                Att påminna om en ansökan tar emot, så det blir sällan av.{' '}
                <b>Vi skriver utkastet utifrån din ansökan, och du ändrar det du vill direkt i texten.</b>
              </>
            }
            bild={
              <div className="st-mejl" role="group" aria-label="Exempel: utkast till uppföljningsmejl">
                <div className="st-mejl-huvud">
                  <div>
                    <span>Till</span>
                    <b>
                      <em>Mottagarens adress, står oftast under Kontakt i annonsen</em>
                    </b>
                  </div>
                  <div>
                    <span>Ämne</span>
                    <b>Min ansökan till tjänsten som projektledare</b>
                  </div>
                </div>
                <div className="st-mejl-kropp">
                  <p>Hej,</p>
                  <p>Jag sökte tjänsten som projektledare hos er den 10 november och undrar hur långt ni har kommit i rekryteringen.</p>
                  <p>Jag är fortfarande intresserad. Det jag gör i dag, projektledning, budgetansvar och upphandling, ligger nära det ni beskriver i annonsen.</p>
                  <p>Hör gärna av er om ni vill ha något mer från mig. Jag svarar på det här mejlet eller i telefon.</p>
                  <p>
                    Vänliga hälsningar
                    <br />
                    Sara Lindström
                  </p>
                </div>
                <div className="st-mejl-fot" aria-hidden="true">
                  <span>Öppna i e-post</span>
                  <span>Kopiera mejlet</span>
                  <span>Skriv om kortare</span>
                </div>
                <div className="st-mejl-fraga" aria-hidden="true">
                  <b>Skickade du mejlet?</b>
                  <span>Ja, det är skickat</span>
                </div>
              </div>
            }
          >
            <ol className="st-sedan">
              <li>
                <i>1</i>
                <span>
                  <b>Du skickar från din egen e-post.</b> Utkastet öppnas i ditt mejlprogram, eller så kopierar du texten. Vi skickar aldrig något åt dig.
                </span>
              </li>
              <li>
                <i>2</i>
                <span>
                  <b>Påminnelsen flyttas fram.</b> {`Tjänsten lämnar Följ upp, och ingen ny påminnelse kommer på ${TYST_DAGAR} dagar.`}
                </span>
              </li>
              <li>
                <i>3</i>
                <span>
                  <b>Är det fortfarande tyst säger vi till.</b> Då väljer du själv om du vill fråga en gång till.
                </span>
              </li>
            </ol>
            <p className="st-o-lank">
              {`Har du varit på intervju frågar mejlet i stället om besked, och då räcker ${BESKED_DAGAR} dagar utan svar. Vill du skriva själv finns råden i artiklarna om att `}
              <TextLank href="/artiklar/soka-jobb-via-mail">söka jobb via mejl</TextLank> och om{' '}
              <TextLank href="/artiklar/uppfoljning-efter-intervju">uppföljning efter intervju</TextLank>.
            </p>
            <p className="st-chiprad">
              <Chip typ="vagg">{UPPFOLJNING_GRATIS_UTKAST === 1 ? 'Första utkastet gratis' : `${storForst(talOrd(UPPFOLJNING_GRATIS_UTKAST, true))} utkast gratis`}</Chip>
              <Chip typ="premium">{`Fler utkast i ${paketKort()}`}</Chip>
            </p>
          </O>
        </Sektion>

        {/* 8. Intervjun */}
        <Sektion luft="utan-topp" id="intervjun">
          <div className="st-tva">
            <div>
              {/* Grundens bild för Inför intervjun (P5a), frågorna ur intervjuprovets bank. */}
              <IntervjuKort />
              <div className="st-hurgick">
                <b>Hur gick intervjun?</b>
                <p>Dagen efter frågar vi. Svara med ett tryck, så hamnar det rätt bland händelserna.</p>
                <div aria-hidden="true">
                  <span>Den är genomförd</span>
                  <span>Den blev flyttad</span>
                  <span>Den blev inställd</span>
                </div>
              </div>
            </div>
            <div className="p3-sekt-huvud">
              <p className="p3-ey">Inför intervjun</p>
              <h2 className="p3-h2">Intervjun hör till tjänsten du sökte</h2>
              <p className="p3-varde">När du blir kallad sätter du dag, tid och plats på den sökta tjänsten. Sedan vet vi vad du förbereder dig för.</p>
              <p className="p3-text">
                {`Frågorna du övar på hör ihop med just den tjänsten, och annonsens krav ligger bredvid. Efter intervjun frågar vi hur det gick. Har du inte fått besked på ${BESKED_DAGAR} dagar föreslår vi ett kort mejl som tackar för intervjun och frågar när du kan vänta det.`}
              </p>
              <p className="st-chiprad">
                <Chip typ="gratis">Ett intervjuprov om dagen gratis</Chip>
                <Chip typ="premium">{`Utan dagsgräns i ${paketKort()}`}</Chip>
              </p>
            </div>
          </div>
        </Sektion>

        {/* 9. Månadsrapporten */}
        <Sektion botten="ton" id="manadsrapporten">
          <div className="st-tva st-smal-v st-topp">
            <div className="p3-sekt-huvud">
              <p className="p3-ey">Månadsrapporten</p>
              <h2 className="p3-h2">Underlag till din aktivitetsrapport</h2>
              <p className="p3-varde">
                Lämnar du aktivitetsrapport till Arbetsförmedlingen? Det du har loggat under månaden står samlat på ett blad: sökta annonserade jobb,
                intresseanmälningar och spontanansökningar, intervjuer och provjobb, med datum.
              </p>
              <p className="p3-text">
                <b>Du lämnar in rapporten själv.</b> Vi skickar ingenting till Arbetsförmedlingen, och ingen där ser ditt konto.
              </p>
              <Kort ton className="st-regel">
                <p>
                  Enligt Arbetsförmedlingen lämnar du aktivitetsrapporten mellan den 1:a och den 14:e varje månad, för månaden innan, och alla jobb du har
                  sökt ska med, annonserade eller inte. Källa:{' '}
                  <a className="p3-lank" href={AF_KALLA} rel="noopener">
                    Aktivitetsrapportera, arbetsformedlingen.se
                  </a>
                  , läst {AF_LAST}.
                </p>
              </Kort>
              <p className="p3-text">{`På gratisnivån ser du antalen per månad. Raderna, utskriften och kopieringen ingår i ${PREMIUM_MED_PRIS}.`}</p>
              <p className="p3-text">
                Vad som ska med och hur du för listan går vi igenom i artikeln om{' '}
                <TextLank href="/artiklar/aktivitetsrapport-arbetsformedlingen">vad som ska med i aktivitetsrapporten</TextLank>.
              </p>
              <div className="st-manval-lista" role="group" aria-label="Exempel: månaderna att välja bland">
                <div className="st-manval st-vald">
                  <i>nov</i>
                  <b>November 2026</b>
                  <span>6 sökta jobb, 1 intervju</span>
                </div>
                <div className="st-manval">
                  <i>okt</i>
                  <b>Oktober 2026</b>
                  <span>2 sökta jobb</span>
                </div>
              </div>
              <ul className="st-uttag">
                <li>
                  <i aria-hidden="true">
                    <Ikon namn="ner" />
                  </i>
                  <div>
                    Skriv ut eller spara som PDF <Chip typ="premium">{paketKort()}</Chip>
                  </div>
                  <span>Bladet som det ser ut här bredvid.</span>
                </li>
                <li>
                  <i aria-hidden="true">
                    <Ikon namn="cv" />
                  </i>
                  <div>
                    Kopiera som text <Chip typ="premium">{paketKort()}</Chip>
                  </div>
                  <span>Rad för rad, att klistra in där du rapporterar.</span>
                </li>
                <li>
                  <i aria-hidden="true">
                    <Ikon namn="pil" />
                  </i>
                  <div>
                    Dela med en länk <Chip typ="gratis">Antalen gratis</Chip>
                  </div>
                  <span>{`Länken gäller i ${APPLICATION_SHARE_TTL_DAYS} dagar. Listan med företag, tjänst och datum ingår i ${paketKort()}.`}</span>
                </li>
              </ul>
            </div>
            <div className="st-blad" role="group" aria-label="Exempel: månadsrapporten för november">
              <p className="st-namn">Sara Lindström</p>
              <p className="st-period">November 2026, 6 sökta jobb och 1 intervju under perioden</p>
              <p className="st-avsnitt">
                1. Sökta annonserade jobb <span>5</span>
              </p>
              {[
                ['3 nov', 'Projektledare, Västkajen Fastigheter, Göteborg'],
                ['10 nov', 'Projektledare, Dalvik Anläggning, Göteborg'],
                ['12 nov', 'Projektledare, Polhem Ombyggnad, Göteborg'],
                ['17 nov', 'Uppdragsledare, Corvent, Mölndal'],
                ['19 nov', 'Projektledare, Hedlunda Entreprenad, Kungälv'],
              ].map(([d, t]) => (
                <div key={d} className="st-rr">
                  <span>{d}</span>
                  <div>{t}</div>
                </div>
              ))}
              <p className="st-avsnitt">
                2. Intresseanmälningar och spontanansökningar <span>1</span>
              </p>
              <div className="st-rr">
                <span>6 nov</span>
                <div>Projektledare, Trossö Rör, Göteborg</div>
              </div>
              <p className="st-avsnitt">
                3. Intervjuer och provjobb <span>1</span>
              </p>
              <div className="st-rr">
                <span>18 nov</span>
                <div>Intervju, projektledare, Västkajen Fastigheter</div>
              </div>
              <div className="st-siffror">
                <div>
                  <b>8</b>Sökta totalt
                </div>
                <div>
                  <b>5</b>Fått svar
                </div>
                <div>
                  <b>2</b>Intervjuer
                </div>
                <div>
                  <b>0</b>Erbjudanden
                </div>
              </div>
              <p className="st-bfot">Genererad via jobbcoach.ai, 22 november 2026</p>
            </div>
          </div>
        </Sektion>

        {/* 10. Gratis och Premium */}
        <Sektion id="gratis-och-premium">
          <div className="p3-premium">
            <div className="st-premium-huvud">
              <p className="p3-ey">Gratis och Premium</p>
              <h2 className="p3-h2">Gratis att logga. Premium när du vill ta ut mer.</h2>
              <p style={{ fontSize: 17, maxWidth: '60ch' }}>Allt du lägger in är gratis och ligger kvar. Premium lägger till det vi skriver och sammanställer åt dig.</p>
            </div>
            <div className="st-prem-rad">
              <div className="st-gratiskort p3-papper">
                <h3 className="p3-h3">Gratis för alla med konto</h3>
                <Bocklista paPapper punkter={GRATIS_LISTA} />
                <p style={{ fontSize: 14.5 }}>Inget kort behövs. Du skapar kontot med Google eller med din e-postadress.</p>
              </div>
              <div className="st-premkort">
                <h3 className="p3-h3">{paketNamn(SALD_PLAN)}</h3>
                <p className="p3-pris">
                  {PLAN.amount} kr<small>{PLAN.suffix}</small>
                </p>
                <p style={{ fontSize: 14.5 }}>Säg upp när du vill.</p>
                <Bocklista punkter={PREMIUM_LISTA} />
                <div className="p3-knapprad">
                  <Knapp href={REGISTRERA}>Börja gratis</Knapp>
                  <TextLank href="/priser">Se allt i Premium</TextLank>
                </div>
              </div>
            </div>
          </div>
        </Sektion>

        {/* 11. Länkar vidare */}
        <Sektion luft="utan-topp">
          <SektionHuvud etikett="Före och efter ansökan" rubrik="Resten av jobbsöket ligger ett tryck bort" />
          <Rutnat kolumner={3}>
            {VIDARE.map((l) => (
              <LankBricka key={l.href} href={l.href} rubrik={l.rubrik} text={l.text} farg={l.farg} />
            ))}
          </Rutnat>
        </Sektion>

        {/* 12. Frågorna */}
        <Sektion id="fragor" luft="utan-topp">
          <Faq
            rubrik="Frågor om Sökta tjänster"
            ingress={
              <>
                Hittar du inte svaret? Mejla{' '}
                <a className="p3-lank" href="mailto:support@jobbcoach.ai">
                  support@jobbcoach.ai
                </a>
                .
              </>
            }
            fragor={FRAGOR}
            schema
            efter={
              <Knapprad>
                <Knapp href={REGISTRERA} pil>
                  Börja logga gratis
                </Knapp>
                <TextLank href="/priser">Se priserna</TextLank>
              </Knapprad>
            }
          />
        </Sektion>
      </Sida>
      <FastKnapprad text="Börja logga gratis" href={REGISTRERA} observera="hjalte" />
    </>
  )
}
