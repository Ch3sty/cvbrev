/**
 * /funktioner, publikt omgång 3 (skissen docs/design/publikt-omgang3/sidor/
 * funktioner.html, noten noter/funktioner.md, SEO-beskedet avsnitt 3).
 *
 * Hjälten på väggen med ankarraden som fyra dörrar (tester först och
 * bredast), rekryteringstesterna som stor ö med testramen och två kort,
 * personliga brev med brevet mot annonsen, CV-analysen med CV-arket, Skapa CV
 * med mallväggen, Jobbsöket på grön vägg (Matchade jobb, Sökta tjänster,
 * Jobbcoachen, Inför intervjun och Bli upptäckt), LinkedIn, alla verktyg
 * samlade, Premium och frågorna.
 *
 * Texterna för testerna, breven, CV-analysen, matchningen, Sökta tjänster,
 * Inför intervjun och coachen är prissidans (FUNKTIONER i paket-copy.ts).
 * Sidans text står ordagrant som förut, flyttad till skissens platser.
 * Metadata och h1 oförändrade. FAQPage ur samma fem frågor som syns.
 * Serverkomponent; klient-JS bara för FastKnapprad.
 */

import Link from 'next/link'
import { FUNKTIONER, PAKET_KORT } from '@/components/pricing/paket-copy'
import PriserKopKnapp from '@/app/(public)/priser/components/PriserKopKnapp'
import { KampanjVarianter } from '@/components/kampanj/Kampanj'
import { HELA_PAKETET_RADER, SALD_PLAN, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { FREE_CV_EXPORTS, FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, WORD_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { GRATIS_CHATTFRAGOR, GRATIS_INTERVJUPROV_PER_DAG, GRATIS_PASTAENDEN, GRUNDNIVAN_ALLA_DAG, TESTTYPER_ORD } from '@/lib/plans/gratis-copy'
import { BREV_MALL_ANTAL } from '@/components/publikt/brevmallar'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { SLUGGAR as RAKNA_UT_SLUGGAR } from '@/lib/rakna/delning'
import { GRATIS_MALL_IDS, MALL_KATALOG, getMallKort } from '@/lib/cv/mallar/katalog'
import { KATEGORIER } from '@/lib/cv/poang/modell'
import { TESTTAL, PROV_MINUTER } from '@/components/publikt/testtal'
import { storForst, talOrd } from '@/components/publikt/talord'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import {
  Sida,
  Hjalte,
  Sektion,
  SektionHuvud,
  O,
  Kort,
  Chip,
  Nr,
  Talbrickor,
  LankBricka,
  Knapp,
  knappKlass,
  TextLank,
  Ikon,
  Dorr,
  Faq,
  PremiumO,
  CvArk,
  Testram,
  Brevpar,
  MatchadeJobb,
  SARA_FLER_TRAFFAR,
  Stig,
  Samtal,
  MallMiniatyr,
  type Farg,
  type IkonNamn,
} from '@/components/publikt/v3'
// Den fasta knappraden (pub-botten) är stylad i publikt.css.
import '@/components/publikt/publikt.css'
import './funktioner.css'

const PREMIUM = paketKort()
/** Köpknappens text som på /priser: kopKnapp() via PAKET_KORT, kampanjpriset följer med (K7). */
const KOP_KNAPP = <KampanjVarianter ord={PAKET_KORT.allt.knapp} kampanj={(k) => k.copy.prisKnapp} />

/** Mallväggen: åtta riktiga CV-mallar ur katalogen, gratismallarna först. */
const MALLVAGG = ['linne', 'bjork', 'koppar', 'ritning', 'kalksten', 'terrakotta', 'tidning', 'siluett'] as const
const FOTO_ANTAL = MALL_KATALOG.filter((m) => m.foto).length
const GRATIS_MALL_NAMN = GRATIS_MALL_IDS.map((id) => getMallKort(id)?.namn ?? id)

/** Tonerna i brevmotorn (TONER i brev3/arbete/texter.ts, inloggat, importeras inte). */
const TONER = ['Professionell', 'Entusiastisk', 'Kreativ', 'Självsäker', 'Balanserad'] as const

/** Testtyperna, samma ordning som i testkortets text. */
const TESTTYPER = ['Matrislogik', 'Figurserier', 'Deduktiv slutledning', 'Verbalt resonemang', 'Numeriskt resonemang', 'Talserier', 'Spatial förmåga', 'Ordförråd'] as const

/** Delarna där exemplets CV tappar (CV-arket visar 93 av 100). */
const TAPPAR = new Set(['erfarenhet', 'sprak'])

const funktion = (id: string) => {
  const k = FUNKTIONER.kort.find((x) => x.id === id)
  if (!k) throw new Error(`FUNKTIONER saknar ${id}`)
  return k
}

/** "Ingår i Premium. Gratis: tre träffar." blir "Tre träffar." (raden Gratis). */
const gratisDel = (sub: string) => storForst(sub.replace(/^Ingår i [^.]+\. Gratis: /, ''))

/** Första meningen (värdemeningen, i fetstil) och resten (stycket). Orden är kortets, oförändrade. */
function dela(text: string): [string, string] {
  const i = text.indexOf('. ')
  return i < 0 ? [text, ''] : [text.slice(0, i + 1), text.slice(i + 2)]
}

/** Raderna Gratis och Premium, gratis först (skissen, .niv). */
function Niv({ gratis, premium }: { gratis: string; premium: string }) {
  return (
    <div className="fn-niv">
      <div>
        <Chip typ="gratis">Gratis</Chip>
        <span>{gratis}</span>
      </div>
      <div>
        <Chip typ="premium">Premium</Chip>
        <span>{premium}</span>
      </div>
    </div>
  )
}

function StegLista({ steg }: { steg?: readonly string[] }) {
  if (!steg?.length) return null
  return (
    <ol className="fn-steg">
      {steg.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
  )
}

/* ---------------------------------------------------------- dörrarna */

const A = (href: string, text: string) => ({ href, text })

const DORRAR: {
  farg: Farg
  namn: string
  sak: string
  stor?: boolean
  smal?: boolean
  bild: 'matris' | 'blad' | 'tal' | 'stig'
  ankare: { href: string; text: string; nyhet?: boolean }[]
}[] = [
  {
    farg: 'tran',
    namn: 'Rekryteringstester',
    sak: `${storForst(TESTTYPER_ORD)} testtyper i tre nivåer. Grundnivån är gratis.`,
    stor: true,
    smal: true,
    bild: 'matris',
    ankare: [A('#tester', 'Rekryteringstester'), A('#tester', 'Personlighetstestet')],
  },
  { farg: 'brev', namn: 'Personliga brev', sak: 'Skrivna mot kraven i annonsen.', bild: 'blad', ankare: [A('#brev', 'Personligt brev')] },
  {
    farg: 'cv',
    namn: 'CV',
    sak: `Läsbarhetspoäng av 100, och ${TEMPLATE_COUNT} mallar.`,
    bild: 'tal',
    ankare: [A('#cv-analys', 'CV-analys'), A('#cv-skapa-mallar', 'Skapa CV och mallar'), A('#linkedin', 'LinkedIn-profilen')],
  },
  {
    farg: 'jobb',
    namn: 'Jobbsöket',
    sak: 'Annonserna som passar dig, och koll på varje sökt tjänst.',
    stor: true,
    bild: 'stig',
    ankare: [A('#jobbmatchning', 'Jobbmatchning'), { ...A('#sokta-tjanster', 'Sökta tjänster'), nyhet: true }, A('#jobbcoachen', 'Jobbcoachen')],
  },
]

const FIG = { fill: 'none', stroke: 'currentColor', strokeWidth: 3.5, strokeLinejoin: 'round' } as const

function DorrBild({ bild }: { bild: (typeof DORRAR)[number]['bild'] }) {
  if (bild === 'matris') {
    return (
      <div className="fn-dr-matris" aria-hidden="true">
        <span>
          <svg viewBox="0 0 40 40">
            <path d="M20 6l15 27H5z" {...FIG} />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="14" {...FIG} />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 40 40">
            <rect x="6" y="6" width="28" height="28" rx="3" {...FIG} />
          </svg>
        </span>
        <span className="fn-tom">?</span>
      </div>
    )
  }
  if (bild === 'blad') {
    return (
      <div className="fn-dr-blad" aria-hidden="true">
        <i />
        <i />
        <i className="fn-m" />
        <i />
        <i className="fn-m" style={{ width: '52%' }} />
        <i style={{ width: '80%' }} />
      </div>
    )
  }
  if (bild === 'tal') {
    return (
      <div className="fn-dr-tal" aria-hidden="true">
        93<small>av 100</small>
      </div>
    )
  }
  return (
    <svg className="fn-ministig" viewBox="0 0 220 96" fill="none" aria-hidden="true">
      <path d="M12 84C50 84 54 60 88 56s42-12 64-24 36-16 50-22" stroke="currentColor" strokeOpacity=".55" strokeWidth="3" strokeDasharray="1 8" strokeLinecap="round" />
      <circle cx="12" cy="84" r="6" fill="var(--vagg-2)" stroke="currentColor" strokeWidth="3" />
      <circle cx="88" cy="56" r="8" fill="var(--koppar)" stroke="currentColor" strokeWidth="3" />
      <circle cx="152" cy="32" r="6" fill="var(--vagg-2)" stroke="currentColor" strokeWidth="3" />
      <path d="M202 10V-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M202-14l18 6-18 7z" fill="var(--koppar)" />
      <circle cx="202" cy="10" r="5" fill="currentColor" />
    </svg>
  )
}

function Dorrar() {
  return (
    <nav className="fn-dorrar" aria-label="Funktionerna på sidan">
      {DORRAR.map((d) => (
        <div key={d.farg} className={`fn-dr ${d.stor ? 'fn-stor' : ''}`.trim()} data-p3-farg={d.farg}>
          <div className={`fn-dr-topp ${d.smal ? 'fn-smal' : ''}`.trim()}>
            <div>
              <p className="fn-dr-namn">
                <Dorr ikon={d.farg} />
                {d.namn}
              </p>
              <p className="fn-dr-sak">{d.sak}</p>
            </div>
            <DorrBild bild={d.bild} />
          </div>
          <div className="fn-dr-ank">
            {d.ankare.map((a) => (
              <span key={a.text} className="fn-dr-lank">
                <a href={a.href}>
                  {a.text}
                  {a.nyhet ? null : <Ikon namn="ner" />}
                </a>
                {/* Märket står bredvid länken, inte i ankartexten (SEO-beskedet). */}
                {a.nyhet ? <span className="fn-nyhet">Nyhet</span> : null}
              </span>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

/* ---------------------------------------------------- alla verktyg */

type VerktygRad = { href: string; rubrik: string; text: string; farg: Farg; ikon?: IkonNamn; klass?: string }

const ALLA: VerktygRad[] = [
  { href: '/verktyg/rekryteringstester', rubrik: 'Rekryteringstester', text: 'Matrislogik, figurserier, deduktivt, verbalt, numeriskt, talserier, spatial förmåga och ordförråd i tre nivåer, övningsprov mot klockan och inför I-provet.', farg: 'tran', klass: 'fn-forst' },
  { href: '/verktyg/personlighetstest', rubrik: 'Personlighetstest', text: 'Femfaktormodellen (Big Five): profilen rekryteraren jämför med, och frågorna du lär få.', farg: 'tran' },
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev', text: 'Skrivet på annonsen, utifrån ditt CV, i den ton du väljer.', farg: 'brev' },
  { href: '/verktyg/cv-analys', rubrik: 'CV-analys', text: 'Läsbarhetspoäng i sju delar, och vad som saknas i varje del.', farg: 'cv' },
  { href: '/verktyg/skapa-cv', rubrik: 'Skapa CV', text: 'Skriv direkt på arket, med exempeltext i varje avsnitt.', farg: 'cv' },
  { href: '/cv-mallar', rubrik: 'CV-mallar', text: `${TEMPLATE_COUNT} mallar som rekryteringssystemen läser, ${FREE_TEMPLATE_COUNT} gratis.`, farg: 'cv' },
  { href: '/verktyg/linkedin-optimering', rubrik: 'LinkedIn-profilen', text: 'Rubrik och sammanfattning som rekryterare hittar när de söker.', farg: 'cv' },
  { href: '/verktyg/jobbmatchning', rubrik: 'Jobbmatchning', text: 'Din kompetens mot annonserna i Platsbanken, med skälen.', farg: 'jobb' },
  { href: '/verktyg/sokta-tjanster', rubrik: 'Sökta tjänster', text: 'Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Gratis för alla med konto.', farg: 'jobb', klass: 'fn-ny' },
  { href: '/verktyg/bli-upptackt', rubrik: 'Bli upptäckt', text: 'Rekryterare hittar dig, anonymt tills du själv tackar ja.', farg: 'jobb' },
  { href: '/verktyg/jobbcoachen', rubrik: 'Jobbcoachen', text: 'Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källor du kan kolla själv.', farg: 'jobb' },
  { href: '/rakna-ut', rubrik: 'Räkna ut lön och skatt', text: `${storForst(talOrd(RAKNA_UT_SLUGGAR.length))} kalkylatorer på Skatteverkets tabeller.`, farg: 'jobb', klass: 'fn-sist' },
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
  const analys = funktion('cv-analys')
  const brev = funktion('personliga-brev')
  const tester = funktion('rekryteringstester')
  const match = funktion('matchade-jobb')
  const sokta = funktion('sokta-tjanster')
  const intervju = funktion('infor-intervjun')
  const coach = funktion('jobbcoachen')

  const testText = tester.text.replace(/\d+ till \d+ minuter/, `${PROV_MINUTER.min} till ${PROV_MINUTER.max} minuter`)
  // "Gratis för alla med konto. I Premium: uppföljningsmejl ..." i två rader.
  const [soktaGratis, soktaPremium = ''] = sokta.sub.split(/ I [^:]+: /)
  const sjuLabel = `Sju delar: ${KATEGORIER.map((k) => `${k.namn} ${k.max}`).join(', ')}`

  return (
    <Sida farg="tran" id="innehall">
      {/* 1. Hjälten: ankarraden är fyra dörrar */}
      <Hjalte
        id="hjalte"
        etikett="Alla verktyg, en plattform"
        h1="Allt du behöver för att landa nästa jobb"
        varde={
          <>
            Rekryteringstester, personliga brev, CV, jobbmatchning, jobbcoach och en LinkedIn-profil som hittas.{' '}
            <b>Byggt för svensk arbetsmarknad och för hur en rekryterare läser.</b>
          </>
        }
        knappar={
          <>
            <Knapp href="/register" pil data-primar="">
              Skapa konto gratis
            </Knapp>
            <TextLank href="/priser">Se priset</TextLank>
          </>
        }
        bild={<Dorrar />}
      />

      {/* 2. Rekryteringstester, störst */}
      <Sektion id="tester">
        <O
          farg="tran"
          etikett="Inför urvalstestet"
          rubrik={tester.rubrik}
          rubrikNiva="h2"
          varde={<b>{dela(testText)[0]}</b>}
          knappar={
            <>
              <Knapp href="/verktyg/rekryteringstester" variant="vit">
                Så fungerar det
              </Knapp>
              <TextLank href="/verktyg/personlighetstest">{`Personlighetstestet, ${TESTTAL.personlighetProv} påståenden utan konto`}</TextLank>
            </>
          }
          bild={<Testram ariaLabel="Exempel: en uppgift i matrislogik som den ser ut i testet" />}
          // De två pappren ligger inne i ön, som i skissen (utseendegranskningen 2026-11-22).
          efter={
            <div className="fn-tunder">
              <Kort>
                <p className="p3-ey">Det här ingår</p>
                <h3 className="p3-h3">{`${storForst(TESTTYPER_ORD)} testtyper, tre nivåer`}</h3>
                <div className="fn-typer">
                  {TESTTYPER.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="fn-trappa" role="img" aria-label={`Tre nivåer: grundnivån är gratis, avancerad nivå och expertnivå ingår i ${PREMIUM}`}>
                  <div className="fn-g">
                    <em>Gratis</em>
                    <b>Grund&shy;nivå</b>ett test om dagen
                  </div>
                  <div className="fn-a">
                    <em>{PREMIUM}</em>
                    <b>Avan&shy;cerad nivå</b>träna så ofta du vill
                  </div>
                  <div className="fn-e">
                    <em>{PREMIUM}</em>
                    <b>Expert&shy;nivå</b>och övnings&shy;prov mot klockan
                  </div>
                </div>
              </Kort>
              <Kort>
                <p className="p3-ey">Efter testet</p>
                <h3 className="p3-h3">Resultatet, uppgift för uppgift</h3>
                <p>Du ser varje uppgift med rätt svar, regeln bakom och var du gick fel.</p>
                <div>
                  <div className="fn-res-tal" aria-hidden="true">
                    <b>12</b>
                    <span>av 15 rätt på grundnivån</span>
                  </div>
                  <div className="fn-res-lista" role="img" aria-label="Exempel: uppgiftslistan med tolv rätt och tre fel" style={{ marginTop: 14 }}>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                      <i key={n} className={[4, 9, 13].includes(n) ? 'fn-m' : undefined}>
                        {n}
                      </i>
                    ))}
                  </div>
                </div>
              </Kort>
            </div>
          }
        >
          <Niv
            gratis={`${gratisDel(tester.sub)} Personlighetstestet med ${GRATIS_PASTAENDEN} påståenden.`}
            premium="Avancerad nivå och expertnivå, övningsprov mot klockan, det fördjupade personlighetstestet och hela din testhistorik."
          />
          <p>{dela(testText)[1]}</p>
          <StegLista steg={tester.steg} />
        </O>
      </Sektion>

      {/* 3. Personliga brev */}
      <Sektion id="brev" luft="utan-topp">
        <O
          farg="brev"
          vand
          etikett="Personligt brev"
          rubrik={brev.rubrik}
          rubrikNiva="h2"
          varde={<b>{dela(brev.text)[0]}</b>}
          knappar={
            <>
              <Knapp href="/verktyg/personligt-brev" variant="vit">
                Så fungerar det
              </Knapp>
              <TextLank href="/personligt-brev-exempel">Se personligt brev-exempel</TextLank>
            </>
          }
          bild={<Brevpar ariaLabel="Exempel: en annons och det personliga brevet som svarar på dess krav" />}
        >
          <Niv
            gratis="Första brevet, sedan ett i veckan, att läsa och kopiera. De två senaste går att ändra. Nedladdning ingår inte."
            premium={`Personliga brev utan tak, alla ${BREV_MALL_ANTAL} mallar, nedladdning som PDF eller Word och tonen vald åt dig efter annonsen.`}
          />
          <p>{dela(brev.text)[1]}</p>
          <StegLista steg={brev.steg} />
          <div className="fn-toner" role="list" aria-label={`${storForst(talOrd(TONER.length))} toner`}>
            {TONER.map((t, i) => (
              <span key={t} role="listitem" className={i === 0 ? 'fn-v' : undefined}>
                {t}
              </span>
            ))}
          </div>
        </O>
      </Sektion>

      {/* 4. CV-analysen */}
      <Sektion id="cv-analys" luft="utan-topp">
        <O
          farg="cv"
          etikett="CV-analys"
          rubrik={analys.rubrik}
          rubrikNiva="h2"
          varde={<b>{dela(analys.text)[0]}</b>}
          knappar={
            <>
              <Knapp href="/verktyg/cv-analys" variant="vit">
                Så fungerar det
              </Knapp>
              <TextLank href="/cv-exempel">Se CV-exempel</TextLank>
            </>
          }
          bild={
            <div className="fn-cvbild">
              <CvArk poang={{ tal: 93, text: 'av 100 i dag' }} ariaLabel="Exempel: Sara Lindströms CV med analysens sju delar utmärkta" />
            </div>
          }
        >
          <Niv gratis={gratisDel(analys.sub)} premium="Alla Jobbcoachens förslag, nya förslag när du har ändrat och Ersätt mitt nuvarande CV." />
          <p>{dela(analys.text)[1]}</p>
          <div className="fn-sju" role="img" aria-label={sjuLabel} style={{ marginTop: 20 }}>
            {KATEGORIER.map((k) => (
              <i key={k.id} className={TAPPAR.has(k.id) ? 'fn-t' : undefined} style={{ flex: k.max }} />
            ))}
          </div>
          <p className="fn-sju-text" aria-hidden="true">
            Sju delar, hundra poäng. I exemplet tappar Sara sju poäng, i två delar.
          </p>
          <StegLista steg={analys.steg} />
        </O>
      </Sektion>

      {/* 5. Skapa CV och mallarna */}
      <Sektion id="cv-skapa-mallar" botten="ton" farg="cv">
        <div className="fn-tva">
          <div>
            <SektionHuvud etikett="Skapa CV och CV-mallar" rubrik="Ett CV som både systemet och rekryteraren läser" />
            <div className="fn-fyra">
              {[
                {
                  rubrik: 'Skriv CV:t direkt på arket',
                  text: 'Kontaktuppgifter, personbeskrivning, erfarenhet, utbildning, kompetenser och språk. Tryck på ett avsnitt och fyll i, med exempeltext för varje del.',
                },
                {
                  rubrik: `${TEMPLATE_COUNT} mallar, ${FREE_TEMPLATE_COUNT} gratis`,
                  text: `Ren struktur som rekryteringssystemen tolkar rätt. Byt mall med ett klick, innehållet följer med. ${GRATIS_MALL_NAMN.join(' och ')} är gratis.`,
                },
                {
                  rubrik: 'Foto och LinkedIn där mallen stöder det',
                  text: `Välj själv om bilden och profillänken ska med. Standard i Sverige är utan bild. ${FOTO_ANTAL} av mallarna har plats för foto.`,
                },
                {
                  rubrik: 'Ladda ner som PDF eller Word',
                  text: `Word finns i ${WORD_TEMPLATE_COUNT} av mallarna, gratismallarna inräknade. Utan tak i ${PREMIUM}, ${talOrd(FREE_CV_EXPORTS)} nedladdning på gratisnivån.`,
                },
              ].map((s, i) => (
                <Kort key={s.rubrik}>
                  <Nr>{i + 1}</Nr>
                  <h3 className="p3-h3">{s.rubrik}</h3>
                  <p>{s.text}</p>
                </Kort>
              ))}
            </div>
            <div className="p3-knapprad" style={{ marginTop: 28 }}>
              <Knapp href="/verktyg/skapa-cv">Skapa CV</Knapp>
              <TextLank href="/cv-mallar">Välj en mall</TextLank>
            </div>
          </div>
          <div className="fn-mallvagg" role="group" aria-label={`${storForst(talOrd(MALLVAGG.length))} av de ${TEMPLATE_COUNT} CV-mallarna`}>
            <p className="fn-mallvagg-stor" aria-hidden="true">
              {TEMPLATE_COUNT}
              <small>{BREV_MALL_ANTAL === TEMPLATE_COUNT ? 'mallar för CV och personliga brev' : 'CV-mallar'}</small>
            </p>
            <div className="fn-mallar">
              {MALLVAGG.map((id) => (
                <MallMiniatyr key={id} id={id} chip={GRATIS_MALL_IDS.includes(id)} />
              ))}
            </div>
            <Talbrickor
              brickor={[
                { tal: String(FREE_TEMPLATE_COUNT), text: `gratis: ${GRATIS_MALL_NAMN.join(' och ')}` },
                { tal: String(WORD_TEMPLATE_COUNT), text: 'finns som Word' },
                { tal: String(FOTO_ANTAL), text: 'har plats för foto' },
              ]}
            />
          </div>
        </div>
      </Sektion>

      {/* 6. Jobbsöket: gratis först, sedan Premium */}
      <Sektion id="premium-funktioner" botten="vagg" farg="jobb">
        <SektionHuvud
          etikett={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              <Dorr ikon="jobb" />
              {`Mer i ${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}`}
            </span>
          }
          rubrik="Jobben hittar dig, och du går förberedd in i intervjun."
          varde={
            <>
              <b>
                {storForst(talOrd(FREE_TIER_JOB_LIMIT))} träffar, {talOrd(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen och ett intervjuprov om dagen är
                gratis.
              </b>{' '}
              {PREMIUM} ger de {JOB_MATCHES_PER_RUN} bästa träffarna, Jobbcoachen så mycket du vill och intervjuprovet utan dagsgräns, plus alla
              rekryteringstester, alla CV-mallar, CV-analysens alla förslag och personliga brev utan tak.
            </>
          }
        />

        <div className="fn-jrad" id="jobbmatchning">
          <div className="fn-jrad-text">
            <h2 className="p3-h2">{match.rubrik}</h2>
            <Niv gratis={`${gratisDel(match.sub).replace(/\.$/, '')}, med skälen utskrivna.`} premium={`De ${JOB_MATCHES_PER_RUN} bästa träffarna, med skälen utskrivna.`} />
            <p className="p3-text">{match.text}</p>
            <div className="p3-knapprad">
              <Knapp href="/verktyg/jobbmatchning" variant="vit">
                Så fungerar jobbmatchningen
              </Knapp>
            </div>
          </div>
          <div>
            <MatchadeJobb fler={SARA_FLER_TRAFFAR.slice(0, 1)} ariaLabel="Exempel: två träffar i Matchade jobb" />
          </div>
        </div>

        <div className="fn-jrad fn-vand" id="sokta-tjanster">
          <div className="fn-jrad-text">
            <h2 className="p3-h2">{sokta.rubrik}</h2>
            <Niv gratis={soktaGratis} premium={storForst(soktaPremium)} />
            <p className="p3-text">{sokta.text}</p>
            <p aria-hidden="true">
              <span className="fn-veckomal">
                <i className="fn-k" />
                <i className="fn-k" />
                <i />
                Veckans mål: 2 av 3 sökta
              </span>
            </p>
            <div className="p3-knapprad">
              <Knapp href={sokta.lank?.href ?? '/verktyg/sokta-tjanster'} variant="vit">
                {sokta.lank?.text ?? 'Så fungerar Sökta tjänster'}
              </Knapp>
            </div>
          </div>
          <div className="fn-stigplats">
            <Stig ariaLabel={`Exempel: ${sokta.scenAlt}`} />
          </div>
        </div>

        <div className="fn-jrad" id="jobbcoachen">
          <div className="fn-jrad-text">
            <h2 className="p3-h2">{coach.rubrik}</h2>
            <Niv gratis={gratisDel(coach.sub)} premium="Fråga så mycket du vill." />
            <p className="p3-text">{coach.text}</p>
            <div className="p3-knapprad">
              <Knapp href="/verktyg/jobbcoachen" variant="vit">
                Så fungerar Jobbcoachen
              </Knapp>
            </div>
          </div>
          <div className="fn-panel">
            <Samtal />
          </div>
        </div>

        <div className="fn-jmer">
          <div>
            <Dorr ikon="jobb" />
            <h3 className="p3-h3">{intervju.rubrik}</h3>
            <p className="fn-jmer-sub">{`Gratis: ${GRATIS_INTERVJUPROV_PER_DAG === 1 ? 'ett' : GRATIS_INTERVJUPROV_PER_DAG} intervjuprov om dagen. ${PREMIUM}: utan dagsgräns.`}</p>
            <p>{intervju.text}</p>
          </div>
          <div>
            <Dorr ikon="jobb" />
            <h3 className="p3-h3">
              <Link href="/verktyg/bli-upptackt">Bli upptäckt</Link>
            </h3>
            <p>Låt rekryterare hitta dig. Du är anonym tills du själv tackar ja.</p>
          </div>
        </div>
      </Sektion>

      {/* 7. LinkedIn */}
      <Sektion id="linkedin" botten="papper" farg="cv">
        <div className="fn-tva">
          <SektionHuvud
            etikett="LinkedIn-profilen"
            rubrik="Bli hittad på LinkedIn"
            varde="Rekryterare söker på kompetenser, inte på titlar. Vi skriver om rubrik och sammanfattning så att du hittas när de söker på det du kan, och visar vilka kompetenser som saknas i profilen."
          >
            <p className="fn-chiprad">
              <Chip typ="premium">{PREMIUM}</Chip>
              <span className="p3-liten">LinkedIn-optimeringen ingår i {paketNamn(SALD_PLAN)}.</span>
            </p>
            <div className="p3-knapprad" style={{ marginTop: 24 }}>
              <Knapp href="/verktyg/linkedin-optimering" variant="vit">
                Så fungerar det
              </Knapp>
            </div>
          </SektionHuvud>
          <Kort className="fn-lk">
            <div role="img" aria-label="Exempel: rubriken på Saras LinkedIn-profil före och efter">
              <div className="fn-lk-topp">
                <span className="fn-lk-av">SL</span>
                <div>
                  <b>Sara Lindström</b>
                  <span>Göteborg</span>
                </div>
              </div>
              <div className="fn-lk-ruta fn-fore">
                <small>Rubriken i dag</small>
                <p>Projektledare på Nordanvind Energi</p>
                <div className="fn-lk-sok">
                  <span className="fn-tom">Hittas på: Nordanvind Energi</span>
                </div>
              </div>
              <div className="fn-lk-pil">
                <Ikon namn="pil" />
              </div>
              <div className="fn-lk-ruta fn-efter">
                <small>Rubriken efter omskrivningen</small>
                <p>Projektledare bygg, offentlig upphandling enligt LOU, budgetansvar</p>
                <div className="fn-lk-sok">
                  <small>Hittas på:</small>
                  <span>projektledare bygg</span>
                  <span>LOU</span>
                  <span>budgetansvar</span>
                  <span className="fn-tom">Saknas: BAS-P</span>
                </div>
              </div>
              <p className="p3-liten" style={{ marginTop: 14 }}>
                Sammanfattningen skrivs om på samma sätt. Det som saknas hämtas ur annonserna i din bransch.
              </p>
            </div>
          </Kort>
        </div>
      </Sektion>

      {/* 8. Alla verktyg, samlade */}
      <Sektion id="alla-verktyg">
        <SektionHuvud rubrik="Alla verktyg, samlade" />
        <div className="fn-alla">
          {ALLA.map((r) => (
            <LankBricka key={r.href} href={r.href} rubrik={r.rubrik} text={r.text} farg={r.farg} ikon={r.ikon} className={r.klass} />
          ))}
        </div>
      </Sektion>

      {/* Premium */}
      <Sektion luft="utan-topp">
        <PremiumO
          rubrik="Alla verktyg, alla nivåer, alla mallar."
          rubrikNiva="p"
          uppsagning
          knapp={
            /* K7 (saas-lead, SEO JA): köpknappen med prissidans beteende, och
               "Se vad som ingår" kvar som textlänk till /priser med samma ankartext. */
            <>
              <PriserKopKnapp cta="secondary" etikett={KOP_KNAPP} klass={knappKlass({})} yta="public_features" plats="funktioner" />
              <TextLank href="/priser">Se vad som ingår</TextLank>
            </>
          }
          punkter={HELA_PAKETET_RADER}
        />
      </Sektion>

      {/* 9. Frågorna, med FAQPage */}
      <Sektion id="fragor" luft="utan-topp">
        <Faq
          rubrik="Vanliga frågor"
          fragor={FUNKTIONER_FAQ}
          schema
          efter={
            <div className="p3-knapprad">
              <Knapp href="/register" pil>
                Skapa konto gratis
              </Knapp>
            </div>
          }
        />
      </Sektion>

      <FastKnapprad text="Skapa konto gratis" href="/register" observera="hjalte" />
    </Sida>
  )
}
