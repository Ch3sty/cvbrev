/**
 * /funktioner, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.6, skissen v4 flik #funktioner).
 *
 * Hjälten på mark med ankarraden (testerna först och fyllda) och tre
 * telefoner i solfjäder, rekryteringstesterna störst, personliga brev,
 * CV-analysen, skapa CV och mallarna, det som bara finns i Premium på bläck
 * med två telefoner, LinkedIn, alla verktyg samlade och frågorna.
 *
 * Texterna för testerna, breven, CV-analysen, matchningen och coachen är
 * prissidans (FUNKTIONER i paket-copy.ts). Metadata och h1 oförändrade.
 * FAQPage ur samma fem frågor som syns (ägarens beslut 8). Ny h2: "Alla
 * verktyg, samlade". Serverkomponent; klient-JS bara för FastKnapprad.
 */

import Link from 'next/link'
import { FUNKTIONER } from '@/components/pricing/paket-copy'
import { SALD_PLAN, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { FREE_CV_EXPORTS, FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, WORD_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { GRATIS_CHATTFRAGOR, GRUNDNIVAN_ALLA_DAG } from '@/lib/plans/gratis-copy'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { SLUGGAR as RAKNA_UT_SLUGGAR } from '@/lib/rakna/delning'
import Rum from '@/components/publikt/Rum'
import Station from '@/components/publikt/Station'
import Steg from '@/components/publikt/Steg'
import Objekt from '@/components/publikt/Objekt'
import LankLista, { type LankRad } from '@/components/publikt/LankLista'
import Faq from '@/components/publikt/Faq'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import { PremiumOrd } from '@/components/publikt/PremiumBlock'
import { mallBild } from '@/lib/cv/mallar/katalog'
import { TESTTAL, PROV_MINUTER } from '@/components/publikt/testtal'
import { storForst, talOrd } from '@/components/publikt/talord'
import SkarmMatris from '@/components/publikt/telefon/skarmar/SkarmMatris'
import SkarmPersonlighet from '@/components/publikt/telefon/skarmar/SkarmPersonlighet'
import SkarmCvAnalys from '@/components/publikt/telefon/skarmar/SkarmCvAnalys'
import SkarmMatchning from '@/components/publikt/telefon/skarmar/SkarmMatchning'
import SkarmBrev from '@/components/publikt/telefon/skarmar/SkarmBrev'
import SkarmCoach from '@/components/publikt/telefon/skarmar/SkarmCoach'

const PREMIUM = paketKort()

/** Dekoren i CV-avsnittet: tre CV-mallar ur katalogen (stora bilden, 300 x 424). */
const DEKOR_MALLAR = ['linne', 'bjork', 'koppar'] as const

const kort = (id: string) => {
  const k = FUNKTIONER.kort.find((x) => x.id === id)
  if (!k) throw new Error(`FUNKTIONER saknar ${id}`)
  return k
}

/** Ankarraden: testerna först och fyllda. */
const ANKARE = [
  { text: 'Rekryteringstester', href: '#tester' },
  { text: 'Personligt brev', href: '#brev' },
  { text: 'CV-analys', href: '#cv-analys' },
  { text: 'Skapa CV och mallar', href: '#cv-skapa-mallar' },
  { text: 'Jobbmatchning', href: '#jobbmatchning' },
  { text: 'Sökta tjänster', href: '#sokta-tjanster' },
  { text: 'Jobbcoachen', href: '#jobbcoachen' },
  { text: 'LinkedIn-profilen', href: '#linkedin' },
] as const

const ALLA: LankRad[] = [
  { href: '/verktyg/rekryteringstester', rubrik: 'Rekryteringstester', text: 'Matrislogik, figurserier, deduktivt, verbalt, numeriskt, talserier, spatial förmåga och ordförråd i tre nivåer, övningsprov mot klockan och inför I-provet.', objekt: 'matris', rum: 'tran' },
  { href: '/verktyg/personlighetstest', rubrik: 'Personlighetstest', text: 'Big Five-profilen rekryteraren jämför med, och frågorna du lär få.', objekt: 'person', rum: 'tran' },
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev', text: 'Skrivet på annonsen, utifrån ditt CV, i den ton du väljer.', objekt: 'brev', rum: 'brev' },
  { href: '/verktyg/cv-analys', rubrik: 'CV-analys', text: 'Läsbarhetspoäng i sju delar, och vad som saknas i varje del.', objekt: 'cv', rum: 'cv' },
  { href: '/verktyg/skapa-cv', rubrik: 'Skapa CV', text: 'Skriv direkt på arket, med exempeltext i varje avsnitt.', objekt: 'mallar', rum: 'cv' },
  { href: '/cv-mallar', rubrik: 'CV-mallar', text: `${TEMPLATE_COUNT} mallar som rekryteringssystemen läser, ${FREE_TEMPLATE_COUNT} gratis.`, objekt: 'mallar', rum: 'cv' },
  { href: '/verktyg/linkedin-optimering', rubrik: 'LinkedIn-profilen', text: 'Rubrik och sammanfattning som rekryterare hittar när de söker.', objekt: 'linkedin', rum: 'cv' },
  { href: '/verktyg/jobbmatchning', rubrik: 'Jobbmatchning', text: 'Din kompetens mot alla annonser i Platsbanken, med skälen.', objekt: 'match', rum: 'jobb' },
  { href: '/verktyg/bli-upptackt', rubrik: 'Bli upptäckt', text: 'Rekryterare hittar dig, anonymt tills du själv svarar.', objekt: 'upptackt', rum: 'jobb' },
  { href: '/verktyg/jobbcoachen', rubrik: 'Jobbcoachen', text: 'Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källor du kan kolla själv.', objekt: 'chat', rum: 'neu' },
  { href: '/rakna-ut', rubrik: 'Räkna ut lön och skatt', text: `${storForst(talOrd(RAKNA_UT_SLUGGAR.length))} kalkylatorer på Skatteverkets tabeller.`, objekt: 'klocka', rum: 'neu' },
]

export const FUNKTIONER_FAQ = [
  {
    q: 'Hur skiljer sig era verktyg från ChatGPT?',
    a: 'ChatGPT är ett allmänt språkverktyg utan kunskap om svensk arbetsmarknad, rekryteringssystemen eller hur rekryterare faktiskt sållar ansökningar. Vi är byggda för just det: vi läser ditt CV, matchar mot annonsens krav och formaterar för de system svenska arbetsgivare använder. Du behöver inte skriva någon instruktion för att få ett bra resultat.',
  },
  {
    q: 'Är det säkert att lämna mitt CV till er?',
    a: 'Ja. Vi följer GDPR, all data lagras i EU, vi säljer aldrig dina uppgifter vidare och tränar inga egna modeller på ditt CV. Du raderar kontot själv under Inställningar, och då tas allt ditt bort: profil, CV, brev, testresultat och uppladdade filer. Det enda som blir kvar är kvitton hos Stripe, som bokföringslagen kräver.',
  },
  {
    q: 'Hur ofta uppdateras jobbmatchningen?',
    a: `Vi hämtar annonserna från Arbetsförmedlingen och JobTech tre gånger per dygn, så nya annonser kommer med inom några timmar. Du söker om med ett tryck när du vill se de senaste, och mellan sökningarna ligger dina träffar kvar som de var. Gratis ser du dina ${FREE_TIER_JOB_LIMIT} bästa träffar, i ${PREMIUM} de ${JOB_MATCHES_PER_RUN} bästa, med skälen utskrivna.`,
  },
  {
    q: 'Vad händer om jag säger upp prenumerationen?',
    a: 'Kontot går tillbaka till gratisnivån när perioden är slut. Allt du skrivit och analyserat finns kvar att läsa och kopiera, men nya uttag följer gratisnivåns gränser. Du kan köpa ' + PREMIUM + ' igen när du vill.',
  },
  {
    q: 'Hur kommer jag igång gratis?',
    a: `Skapa konto, så är gratisnivån igång direkt: i testerna ${GRUNDNIVAN_ALLA_DAG}, ${FREE_TEMPLATE_COUNT} CV-mallar och ${talOrd(FREE_CV_EXPORTS)} nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, första personliga brevet och sedan ett var sjunde dag, ${talOrd(FREE_TIER_JOB_LIMIT)} matchade jobb och Sökta tjänster med det första uppföljningsmejlet. Vill du ha mer ingår allt i ${PREMIUM}, ${prisPeriod(SALD_PLAN)}.`,
  },
] as const

export default function FunktionerSida() {
  const analys = kort('cv-analys')
  const brev = kort('personliga-brev')
  const tester = kort('rekryteringstester')
  const match = kort('matchade-jobb')
  const coach = kort('jobbcoachen')

  return (
    <>
      <div id="innehall">
        {/* 1. Hjälten på mark med ankarraden */}
        <Rum yta="mark" id="hjalte" style={{ paddingTop: 'clamp(32px, 5vw, 72px)' }}>
          <div className="pub-wrap pub-tva">
            <div className="pub-tva-text">
              <p className="pub-kick">Alla verktyg, en plattform</p>
              <h1 className="pub-h1">Allt du behöver för att landa nästa jobb</h1>
              <p className="pub-ingress" style={{ marginTop: 22 }}>
                Rekryteringstester, personliga brev, CV, jobbmatchning, jobbcoach och en LinkedIn-profil som hittas.{' '}
                <b>Byggt för svensk arbetsmarknad och för hur en rekryterare läser.</b>
              </p>
              <div className="pub-handling">
                <Link className="pub-knapp" href="/register" data-primar="">
                  Skapa konto gratis
                </Link>
                <Link className="pub-lank" href="/priser">
                  Se priset
                </Link>
              </div>
              <nav className="pub-ankarrad" aria-label="Funktionerna på sidan">
                {ANKARE.map((a, i) => (
                  <a key={a.href} href={a.href} className={i === 0 ? 'pub-forst' : undefined}>
                    {a.text}
                  </a>
                ))}
              </nav>
            </div>
            <div className="pub-solfjader pub-solfjader-hjalte">
              <SkarmCvAnalys />
              <SkarmMatris />
              <SkarmMatchning />
            </div>
          </div>
        </Rum>

        {/* 2. Rekryteringstester, störst */}
        <Station
          id="tester"
          rum="tran"
          stor
          objekt="matris"
          kick="Rekryteringstester"
          rubrik={tester.rubrik}
          rubrikNiva="h2"
          gratisRad={tester.sub}
          text={tester.text.replace(/\d+ till \d+ minuter/, `${PROV_MINUTER.min} till ${PROV_MINUTER.max} minuter`)}
          steg={tester.steg?.map((s) => ({ text: s }))}
          knapp={{ text: 'Så fungerar det', href: '/verktyg/rekryteringstester' }}
          lank={{ text: `Personlighetstestet, ${TESTTAL.personlighetProv} påståenden utan konto`, href: '/verktyg/personlighetstest' }}
          telefon={
            <div className="pub-duo pub-duo-mobil-bara-andra">
              <SkarmMatris />
              <SkarmPersonlighet />
            </div>
          }
        />

        {/* 3. Personliga brev */}
        <Station
          id="brev"
          rum="brev"
          omvand
          objekt="brev"
          kick="Personligt brev"
          rubrik={brev.rubrik}
          rubrikNiva="h2"
          gratisRad={`Ingår i ${PREMIUM}. Gratis: första brevet, sedan ett i veckan, att läsa och kopiera. De två senaste går att ändra. Nedladdning ingår inte.`}
          text={brev.text}
          steg={brev.steg?.map((s) => ({ text: s }))}
          knapp={{ text: 'Så fungerar det', href: '/verktyg/personligt-brev' }}
          lank={{ text: 'Se personligt brev-exempel', href: '/personligt-brev-exempel' }}
          telefon={<SkarmBrev />}
        />

        {/* 4. CV-analysen */}
        <Station
          id="cv-analys"
          rum="cv"
          objekt="cv"
          kick="CV-analys"
          rubrik={analys.rubrik}
          rubrikNiva="h2"
          gratisRad={analys.sub}
          text={analys.text}
          steg={analys.steg?.map((s) => ({ text: s }))}
          knapp={{ text: 'Så fungerar det', href: '/verktyg/cv-analys' }}
          lank={{ text: 'Se CV-exempel', href: '/cv-exempel' }}
          telefon={<SkarmCvAnalys />}
        />

        {/* 5. Skapa CV och mallar */}
        <Rum yta="ton" rum="cv" id="cv-skapa-mallar">
          <div className="pub-wrap pub-tva pub-omv">
            <div className="pub-tva-text">
              <p className="pub-kick">Skapa CV och CV-mallar</p>
              <h2 className="pub-h2">Ett CV som både systemet och rekryteraren läser</h2>
              <div style={{ marginTop: 28 }}>
                <Steg
                  kolumner={2}
                  rader={[
                    { rubrik: 'Skriv CV:t direkt på arket', text: 'Kontaktuppgifter, personbeskrivning, erfarenhet, utbildning, kompetenser och språk. Tryck på ett avsnitt och fyll i, med exempeltext för varje del.' },
                    { rubrik: `${TEMPLATE_COUNT} mallar, ${FREE_TEMPLATE_COUNT} gratis`, text: 'Ren struktur som rekryteringssystemen tolkar rätt. Byt mall med ett klick, innehållet följer med.' },
                    { rubrik: 'Foto och LinkedIn där mallen stöder det', text: 'Välj själv om bilden och profillänken ska med. Standard i Sverige är utan bild.' },
                    { rubrik: 'Ladda ner som PDF eller Word', text: `Word finns i ${WORD_TEMPLATE_COUNT} av mallarna, gratismallarna inräknade. Utan tak i ${PREMIUM}, ${talOrd(FREE_CV_EXPORTS)} nedladdning på gratisnivån.` },
                  ]}
                />
              </div>
              <div className="pub-handling">
                <Link className="pub-knapp" href="/verktyg/skapa-cv">
                  Skapa CV
                </Link>
                <Link className="pub-lank" href="/cv-mallar">
                  Välj en mall
                </Link>
              </div>
            </div>
            <div className="pub-mitt" aria-hidden="true">
              {/* Avsnittet handlar om CV: CV-katalogens egna bilder (UX 2026-11-21). Bredderna i procent
                  med dagens mått som tak, så att de tre arken ryms i spalten på 375 px. */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: 374,
                  filter: 'drop-shadow(0 18px 28px rgba(20,16,10,.18))',
                }}
              >
                {DEKOR_MALLAR.map((id, i) => (
                  <div
                    key={id}
                    style={
                      i === 1
                        ? { width: '34%', maxWidth: 130, position: 'relative', zIndex: 1 }
                        : { transform: `rotate(${i === 0 ? -6 : 6}deg)`, width: '28%', maxWidth: 110 }
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mallBild(id).stor}
                      alt=""
                      width={300}
                      height={424}
                      loading="lazy"
                      decoding="async"
                      style={{ display: 'block', width: '100%', height: 'auto', background: '#fff', borderRadius: 3 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Rum>

        {/* 6. Bara i Premium, två telefoner med varsin h2 */}
        <Rum yta="premium" id="premium-funktioner" vag="panel">
          <div className="pub-wrap">
            <div style={{ maxWidth: 760 }}>
              <p className="pub-kick">
                Mer i Jobbcoach <PremiumOrd />, {prisPeriod(SALD_PLAN)}
              </p>
              <h2 className="pub-h2">Jobben hittar dig, och du går förberedd in i intervjun.</h2>
              <p className="pub-ingress" style={{ marginTop: 16 }}>
                {storForst(talOrd(FREE_TIER_JOB_LIMIT))} träffar, {talOrd(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen och ett intervjuprov om dagen är
                gratis. {PREMIUM} ger de {JOB_MATCHES_PER_RUN} bästa träffarna, Jobbcoachen så mycket du vill och intervjuprovet utan
                dagsgräns, plus alla rekryteringstester, alla CV-mallar, CV-analysens alla förslag och personliga brev utan tak.
              </p>
            </div>
            <div className="pub-duo-premium">
              <div id="jobbmatchning">
                <SkarmMatchning />
                <h2 className="pub-h3">{match.rubrik}</h2>
                <p className="pub-sub">{match.sub}</p>
                <p className="pub-brod">{match.text}</p>
                <Link className="pub-lank" href="/verktyg/jobbmatchning">
                  Så fungerar jobbmatchningen
                </Link>
              </div>
              <div id="jobbcoachen">
                <SkarmCoach />
                <h2 className="pub-h3">{coach.rubrik}</h2>
                <p className="pub-sub">{coach.sub}</p>
                <p className="pub-brod">{coach.text}</p>
                <Link className="pub-lank" href="/verktyg/jobbcoachen">
                  Så fungerar Jobbcoachen
                </Link>
              </div>
            </div>
            <div className="pub-handling" style={{ marginTop: 40 }}>
              <Link className="pub-knapp" href="/priser">
                Se vad som ingår
              </Link>
            </div>
          </div>
        </Rum>

        {/* 7. LinkedIn */}
        <Rum yta="panel" rum="cv" id="linkedin">
          <div className="pub-wrap pub-tva">
            <div className="pub-tva-text">
              <Objekt typ="linkedin" />
              <p className="pub-kick" style={{ marginTop: 20 }}>
                LinkedIn-profilen
              </p>
              <h2 className="pub-h2">Bli hittad på LinkedIn</h2>
              <p className="pub-liten" style={{ marginTop: 8 }}>
                LinkedIn-optimeringen ingår i {paketNamn(SALD_PLAN)}.
              </p>
              <p className="pub-brod" style={{ marginTop: 16 }}>
                Rekryterare söker på kompetenser, inte på titlar. Vi skriver om rubrik och sammanfattning så att du hittas när de
                söker på det du kan, och visar vilka kompetenser som saknas i profilen.
              </p>
              <div className="pub-handling">
                <Link className="pub-knapp" href="/verktyg/linkedin-optimering">
                  Så fungerar det
                </Link>
              </div>
            </div>
            <div className="pub-lk" aria-hidden="true">
              <div className="pub-kort">
                <p className="pub-lk-rub">Rubriken i dag</p>
                <div className="pub-lk-rad">
                  <span className="pub-lk-av" />
                  <div>
                    <b>Projektledare på NCC</b>
                    <span>Hittas när någon söker på: NCC</span>
                  </div>
                </div>
              </div>
              <div className="pub-kort pub-lk-efter">
                <p className="pub-lk-rub">Rubriken efter omskrivningen</p>
                <div className="pub-lk-rad">
                  <span className="pub-lk-av" />
                  <div>
                    <b>Projektledare bygg, offentlig upphandling enligt LOU, budgetansvar 40 miljoner</b>
                    <span>Sammanfattningen omskriven på samma sätt</span>
                  </div>
                </div>
                <p className="pub-liten" style={{ marginTop: 12 }}>
                  Saknas i profilen, enligt annonserna i din bransch: BAS-P.
                </p>
              </div>
            </div>
          </div>
        </Rum>

        {/* 8. Alla verktyg, samlade */}
        <Rum yta="mark" id="alla-verktyg">
          <div className="pub-wrap">
            <h2 className="pub-h2">Alla verktyg, samlade</h2>
            <div style={{ marginTop: 32 }}>
              <LankLista lankar={ALLA} />
            </div>
            <div id="sokta-tjanster" className="pub-kort pub-rum-jobb" style={{ marginTop: 24, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <Objekt typ="sokta" storlek={52} />
              <div style={{ flex: '1 1 280px' }}>
                <b className="pub-h4">Sökta tjänster</b>
                <p className="pub-brod" style={{ marginTop: 4 }}>
                  Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Spara annonsen du ska söka under Ska
                  sökas, sätt veckans mål och låt oss skriva utkastet till uppföljningsmejlet när det har varit tyst i tolv dagar.
                  Gratis för alla med konto, med det första uppföljningsmejlet. Fler utkast och rapporten till
                  Arbetsförmedlingen att skriva ut ingår i {PREMIUM}. Ett personligt brev hamnar här när du trycker Markera som
                  sökt.
                </p>
              </div>
              <Link className="pub-lank" href="/register">
                Skapa konto gratis
              </Link>
            </div>
          </div>
        </Rum>

        {/* 9. Frågorna, med FAQPage */}
        <Rum yta="panel" id="fragor">
          <div className="pub-wrap" style={{ maxWidth: 820 }}>
            <Faq rubrik="Vanliga frågor" fragor={FUNKTIONER_FAQ} schema />
          </div>
        </Rum>
      </div>
      <FastKnapprad text="Skapa konto gratis" href="/register" observera="hjalte" />
    </>
  )
}
