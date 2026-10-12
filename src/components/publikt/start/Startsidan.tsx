/**
 * Startsidan, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.1, skissen v4 flik #start). Ersätter StartSida.tsx; texterna är
 * flyttade, inte omskrivna, utom där skissen v4 rättat dem (testerna först,
 * gratisbrevet enligt koden: första brevet gratis, sedan ett i veckan).
 *
 * Ordning: hjälten på mark med banan, mediebevisen, tre verktyg med
 * rekryteringstesterna först och störst, brevet, Jobbcoachen, medierna,
 * resten av jobbsöket, Premium på bläck och frågorna. Alla tal ur koden.
 * Serverkomponent; klient-JS bara för FastKnapprad.
 *
 * SEO: h1, title och description oförändrade. Baslinjens h2 och h3 står kvar
 * med samma text och nivå. Ny h2: "Jobbcoachen svarar hela vägen". Nytt
 * JSON-LD: Organization, WebSite och FAQPage.
 */

import Link from 'next/link'
import Hjalte from '../Hjalte'
import Rum from '../Rum'
import Station from '../Station'
import LankLista, { type LankRad } from '../LankLista'
import PremiumBlock, { PremiumOrd } from '../PremiumBlock'
import Faq, { faqSchema } from '../Faq'
import FastKnapprad from '../FastKnapprad'
import SvavandeObjekt from '../SvavandeObjekt'
import { storForst, talOrd } from '../talord'
import SkarmBana from '../telefon/skarmar/SkarmBana'
import SkarmMatris from '../telefon/skarmar/SkarmMatris'
import SkarmPersonlighet from '../telefon/skarmar/SkarmPersonlighet'
import SkarmCvAnalys from '../telefon/skarmar/SkarmCvAnalys'
import SkarmMatchning from '../telefon/skarmar/SkarmMatchning'
import SkarmBrev from '../telefon/skarmar/SkarmBrev'
import SkarmCoach from '../telefon/skarmar/SkarmCoach'
import SkarmIntervjufragor from '../telefon/skarmar/SkarmIntervjufragor'
import { HELA_PAKETET_RADER, SALD_PLAN, kopKnapp, paketMedPris } from '@/lib/plans/plans'
import { FREE_CV_EXPORTS, FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT, FREE_LETTERS_PER_ACCOUNT } from '@/lib/quota/quotaService'

/** Gratisbrevet enligt koden (spec avsnitt 7, ägarens beslut 2). */
const GRATISBREV = 'Första brevet gratis, sedan ett i veckan'

const MEDIER = [
  {
    kalla: 'Kollega',
    rubrik: 'AI-rekrytering klassad som högriskverksamhet',
    text: '40 procent av Teamtailors över 10 000 arbetsgivare har slagit på AI i rekryteringen. EU klassar AI-rekrytering som högriskverksamhet.',
    url: 'https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju',
    domän: 'kollega.se',
  },
  {
    kalla: 'SVT Nyheter',
    rubrik: 'Knepen som gör att du inte sorteras bort',
    text: 'Hur sticker du ut när perfekta AI-skrivna CV:n blivit norm?',
    url: 'https://www.svt.se/nyheter/inrikes/ai-och-jobbsokande-har-ar-knepen-som-gor-att-du-inte-sorteras-bort',
    domän: 'svt.se',
  },
  {
    kalla: 'Sveriges Radio P1',
    rubrik: 'Så tar du dig förbi robotarna',
    text: 'Jesper Olsson på Trygghetsrådet TRR förklarar hur du undviker att bli bortsållad.',
    url: 'https://www.sverigesradio.se/artikel/ai-sallar-bort-ditt-cv-sa-har-tar-du-dig-forbi-robotarna',
    domän: 'sverigesradio.se',
  },
  {
    kalla: 'Dagens Nyheter',
    rubrik: 'Intervjuad av en robot',
    text: 'AI tar över allt fler steg i rekryteringen hos svenska företag.',
    url: 'https://www.dn.se/sverige/intervjuad-av-en-robot-sa-tar-ai-over-inom-rekrytering/',
    domän: 'dn.se',
  },
] as const

const RESTEN: LankRad[] = [
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev', text: 'Skrivet på annonsen, utifrån ditt CV, i den ton du väljer.', objekt: 'brev', rum: 'brev' },
  {
    href: '/verktyg/cv-mallar',
    rubrik: 'CV-mallar',
    text: `${TEMPLATE_COUNT} mallar som rekryteringssystemen läser, ${FREE_TEMPLATE_COUNT} gratis.`,
    objekt: 'mallar',
    rum: 'cv',
  },
  { href: '/verktyg/jobbcoachen', rubrik: 'Jobbcoachen', text: 'Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och ditt CV.', objekt: 'chat', rum: 'neu' },
  { href: '/verktyg/linkedin-optimering', rubrik: 'LinkedIn-profilen', text: 'Rubrik och sammanfattning som rekryterare hittar när de söker.', objekt: 'linkedin', rum: 'cv' },
  { href: '/verktyg/bli-upptackt', rubrik: 'Bli upptäckt', text: 'Rekryterare hittar dig, anonymt tills du själv svarar.', objekt: 'upptackt', rum: 'jobb' },
  { href: '/cv-exempel', rubrik: 'CV-exempel', text: 'Färdiga CV:n yrke för yrke, att utgå ifrån.', objekt: 'exempel', rum: 'cv' },
  { href: '/personligt-brev-exempel', rubrik: 'Personligt brev-exempel', text: 'Brev som fungerat, yrke för yrke.', objekt: 'exempel', rum: 'brev' },
  {
    href: '/funktioner#sokta-tjanster',
    rubrik: 'Sökta tjänster',
    text: 'Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Gratis för alla.',
    objekt: 'sokta',
    rum: 'jobb',
  },
]

export const START_FAQ = [
  {
    q: 'Vad är ATS, och varför ska mitt CV vara anpassat?',
    a: 'ATS (Applicant Tracking System) är de rekryteringssystem de flesta större svenska arbetsgivare använder för att sortera ansökningar automatiskt. Är ditt CV inte läsbart för systemet kan du sorteras bort innan en människa ens öppnar det. Alla våra CV-mallar är byggda för att systemen ska kunna läsa dem.',
  },
  {
    q: 'Hur mycket av jobbet gör ni åt mig?',
    a: 'Vi skriver utkastet utifrån ditt CV och jobbannonsen. Du läser igenom, justerar tonen där det behövs och skickar. Resultatet låter som du, bara mer genomarbetat än om du skrivit varje brev från noll.',
  },
  {
    q: 'Hur snabbt kan jag skapa ett personligt brev?',
    a: 'Runt 60 sekunder från att du klistrar in annonsen till ett färdigt utkast. Du sparar en kvart eller mer per ansökan jämfört med att skriva från grunden.',
  },
  {
    q: 'Är mina uppgifter säkra?',
    a: 'Ja. Vi följer GDPR och all data lagras i EU. Vi säljer aldrig din information vidare, och du kan radera ditt konto med ett klick. Då försvinner allt, även våra kopior.',
  },
  {
    q: 'Vad kostar det, och vad får jag utan att betala?',
    a: `Gratisnivån kräver inget kort: grundnivån i varje testtyp och personlighetstestet, ${FREE_TEMPLATE_COUNT} CV-mallar och ${talOrd(FREE_CV_EXPORTS)} nedladdning, en CV-analys med poäng och tyngsta fyndet, första personliga brevet och sedan ett i veckan, ${FREE_TIER_JOB_LIMIT} matchade jobb och ${FREE_CHAT_MESSAGES_PER_ACCOUNT} frågor till Jobbcoachen. Söker du på allvar ingår allt i ${paketMedPris(SALD_PLAN)}. Ingen bindningstid, och du säger upp i ditt konto.`,
  },
] as const

function startSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Jobbcoach.ai',
        url: 'https://www.jobbcoach.ai',
        logo: 'https://www.jobbcoach.ai/icon.png',
        email: 'info@jobbcoach.ai',
        sameAs: ['https://www.facebook.com/jobbcoach.ai', 'https://www.instagram.com/jobbcoach.ai'],
      },
      { '@type': 'WebSite', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai', inLanguage: 'sv-SE' },
      (() => {
        const { '@context': _c, ...faq } = faqSchema(START_FAQ)
        return faq
      })(),
    ],
  }
}

export default function Startsidan({ konton }: { konton: number | null }) {
  const tal = [
    ...(konton ? [{ tal: `${konton}+`, text: 'har skapat konto' }] : []),
    { tal: `${FREE_LETTERS_PER_ACCOUNT} brev`, text: 'gratis, sedan ett i veckan' },
    { tal: '60 sek', text: 'till första CV-poängen' },
  ]
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(startSchema()) }} />
      <div id="innehall">
        {/* 1. Hjälten på mark med banan */}
        <Hjalte
          id="hjalte"
          yta="mark"
          style={{ paddingTop: 'clamp(32px, 5vw, 72px)' }}
          kick="Bekräftat av SVT, SR, DN och Kollega"
          h1="Därför får du inte svar på dina ansökningar"
          ingress={
            <>
              Allt fler rekryterare låter rekryteringssystem sålla kandidater automatiskt, ofta utan att du vet om det.{' '}
              <b>Är ditt CV inte optimerat når det aldrig en människa.</b> Vi ser till att du tar dig förbi: träning inför
              urvalstestet, ett CV som rekryteringssystemen (ATS) läser och ett personligt brev som svarar på annonsen.
            </>
          }
          primar={{ text: 'Skapa konto gratis', href: '/register', dataCta: 'hero-primary' }}
          sekundar={{ text: 'Se hur det fungerar', href: '#tre-verktyg' }}
          tal={tal}
          bild={
            <>
              <SvavandeObjekt objekt="cv" rot={-8} plats={{ left: 0, top: 70 }} bredd={112} mobil={{ left: -8, top: 40, bredd: 96 }} />
              <SvavandeObjekt objekt="match" rot={6} plats={{ right: -6, top: 120 }} bredd={150} mobil={{ right: -14, top: 150, bredd: 132 }} />
              <SvavandeObjekt objekt="matris" rot={10} plats={{ left: 4, bottom: 118 }} bredd={116} mobil={{ left: -4, bottom: 90, bredd: 84 }} />
              <SvavandeObjekt objekt="brev" rot={-5} plats={{ right: 12, bottom: 70 }} bredd={92} doljPaMobil />
              <SvavandeObjekt objekt="chat" rot={4} plats={{ right: 40, top: -6 }} bredd={104} doljPaMobil />
              <SvavandeObjekt objekt="bock" plats={{ left: 70, top: -10 }} bredd={46} doljPaMobil />
              <SkarmBana />
            </>
          }
        />

        {/* 2. Mediebevisen, tyst */}
        <Rum yta="panel" storlek="tat" aria-label="Medier som skrivit om rekryteringssystemen">
          <div className="pub-wrap pub-media-rad">
            <small>Rekryteringssystemen beskrivna av</small>
            {MEDIER.map((m) => (
              <span key={m.kalla}>{m.kalla}</span>
            ))}
          </div>
        </Rum>

        {/* 3. Tre verktyg, intro */}
        <Rum yta="ton" rum="tran" id="tre-verktyg" style={{ paddingBottom: 'clamp(40px, 5vw, 64px)' }}>
          <div className="pub-wrap">
            <p className="pub-kick">Vägen till intervjun</p>
            <h2 className="pub-h2" style={{ maxWidth: '16ch' }}>
              Tre verktyg som gör ansökan starkare
            </h2>
            <p className="pub-ingress" style={{ marginTop: 18 }}>
              Först urvalstestet som avgör vem som får intervjun. Sedan ett CV som kommer igenom, och jobben du annars hade
              missat. Allt i samma konto.
            </p>
          </div>
        </Rum>

        {/* 4. Rekryteringstester, störst */}
        <Station
          id="tester"
          rum="tran"
          stor
          objekt="matris"
          kick="Inför urvalstestet"
          rubrik="Rekryteringstester"
          rubrikNiva="h3"
          ingress={
            <>
              <b>Känn igen uppgiften innan provdagen.</b> Logik, verbalt och numeriskt i tre nivåer med förklaring efter varje
              fråga, och personlighetstestet som visar vad rekryteraren läser ut av dig.
            </>
          }
          text="Samma format som de stora testleverantörerna använder. Nivåkollen visar var du står, dagens pass tränar det du tappar, och övningsprovet går mot klockan som det skarpa testet. Personlighetstestet ger din profil, hur den läses mot vanliga kravprofiler och frågorna du lär få på intervjun, med förslag på svar. Fem frågor provar du utan konto."
          knapp={{ text: 'Så fungerar det', href: '/verktyg/rekryteringstester' }}
          knappNot="Nivåkollen, första passet och personlighetstestet gratis"
          telefon={
            <div className="pub-duo">
              <SkarmMatris />
              <SkarmPersonlighet />
            </div>
          }
        />

        {/* 5. CV-analys */}
        <Station
          rum="cv"
          omvand
          objekt="cv"
          kick="Inför ansökan"
          rubrik="CV-analys"
          rubrikNiva="h3"
          ingress={
            <>
              <b>Vet exakt varför CV:t inte får svar.</b> Poäng per område, varje fynd med åtgärd och nyckelorden
              rekryteringssystemen letar efter.
            </>
          }
          text="Ladda upp som PDF eller Word. Inom en minut får du poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord, och en lista med fynd där varje fynd har en åtgärd. Rätta, kör om, se poängen röra sig."
          knapp={{ text: 'Så fungerar det', href: '/verktyg/cv-analys' }}
          knappNot="Poängen och tyngsta fyndet gratis"
          telefon={<SkarmCvAnalys />}
        />

        {/* 6. Jobbmatchning */}
        <Station
          rum="jobb"
          objekt="match"
          kick="Jobben du annars missar"
          rubrik="Jobbmatchning"
          rubrikNiva="h3"
          ingress={
            <>
              <b>Jobben du annars hade missat.</b> Din kompetens matchad mot alla annonser i Platsbanken, med skälen utskrivna.
            </>
          }
          text={`Den som söker på sin vanliga yrkestitel missar jobben som efterfrågar samma kompetens under ett annat namn. Vi utgår från det du kan och varje natt får du de ${JOB_MATCHES_PER_RUN} bästa träffarna: vilka krav du täcker och vad som saknas. Från en träff skriver du brevet med ett klick.`}
          knapp={{ text: 'Så fungerar det', href: '/verktyg/jobbmatchning' }}
          knappNot={`${storForst(talOrd(FREE_TIER_JOB_LIMIT))} träffar gratis`}
          telefon={<SkarmMatchning />}
        />

        {/* 7. Brevet */}
        <Station
          id="sa-jobbar-vi"
          rum="brev"
          omvand
          objekt="brev"
          kick="Så jobbar vi"
          rubrik="Vi matchar din erfarenhet mot tjänstens krav"
          rubrikNiva="h2"
          ingress="Klistra in en jobbannons, eller välj en träff. Vi läser ditt CV, identifierar vad tjänsten kräver och väver in din egen erfarenhet i ett personligt brev som faktiskt bevisar att du passar."
          knapp={{ text: 'Skriv ett brev gratis', href: '/skapa-brev/start' }}
          knappNot={GRATISBREV}
          telefon={<SkarmBrev />}
        />

        {/* 8. Jobbcoachen */}
        <Station
          rum="neu"
          objekt="chat"
          kick="Hela vägen"
          rubrik="Jobbcoachen svarar hela vägen"
          rubrikNiva="h2"
          ingress="Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och ditt CV. Inte från en amerikansk mall."
          text="Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Svaren känner till ditt CV, dina matchningar och hur testerna gått, så att rådet gäller just din ansökan."
          knapp={{ text: 'Ställ första frågan', href: '/verktyg/jobbcoachen' }}
          knappNot={`${storForst(talOrd(FREE_CHAT_MESSAGES_PER_ACCOUNT))} frågor gratis`}
          telefon={<SkarmCoach />}
        />

        {/* 9. Medierna */}
        <Rum yta="panel">
          <div className="pub-wrap">
            <p className="pub-kick">Bekräftat av medierna</p>
            <h2 className="pub-h2" style={{ maxWidth: '18ch' }}>
              Robotarna har redan läst ditt CV.
            </h2>
            <p className="pub-ingress" style={{ margin: '18px 0 36px' }}>
              Sveriges största redaktioner har samma slutsats: rekryteringen har förändrats i grunden. Den första som läser din
              ansökan är inte en människa.
            </p>
            <ul className="pub-citat">
              {MEDIER.map((m) => (
                <li key={m.kalla}>
                  <span className="pub-vem">{m.kalla}</span>
                  <div>
                    <b>{m.rubrik}</b>
                    <p>{m.text}</p>
                    <a className="pub-kalla" href={m.url} target="_blank" rel="noopener noreferrer">
                      {m.domän}, öppnas i ny flik
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 28 }}>
              <Link className="pub-lank" href="/priser">
                Så hjälper vi dig komma förbi
              </Link>
            </p>
          </div>
        </Rum>

        {/* 10. Resten av jobbsöket */}
        <Rum yta="mark">
          <div className="pub-wrap">
            <h2 className="pub-h2">Och resten av jobbsöket</h2>
            <div style={{ marginTop: 32 }}>
              <LankLista lankar={RESTEN} />
            </div>
          </div>
        </Rum>

        {/* 11. Premium på bläck */}
        <PremiumBlock
          id="premium"
          kick="Jobbcoach Premium"
          rubrik={
            <>
              Allt i <PremiumOrd />
            </>
          }
          text="Alla verktyg utan tak. Mindre än en lunch i månaden, säg upp med ett klick."
          punkter={HELA_PAKETET_RADER}
          pris
          knapp={{ text: kopKnapp(), href: '/priser' }}
          not="Kortbetalning via Stripe. Kvitto på mejl."
          vag="mark"
          bild={
            <>
              <SkarmIntervjufragor />
              <SkarmMatris />
              <SkarmCvAnalys />
            </>
          }
        />

        {/* 12. Frågorna */}
        <Rum yta="mark">
          <div className="pub-wrap" style={{ maxWidth: 820 }}>
            <Faq
              rubrik="Svaren på det du undrar"
              fragor={START_FAQ}
              efter={
                <p className="pub-liten" style={{ marginTop: 20 }}>
                  Fler frågor om priset?{' '}
                  <Link className="pub-lank" href="/priser">
                    Se priserna
                  </Link>
                </p>
              }
            />
          </div>
        </Rum>
      </div>
      <FastKnapprad text="Skapa konto gratis" href="/register" observera="hjalte" />
    </>
  )
}
