/**
 * /cv-mallar/enkla: CV-mallarna i en spalt (SEO-svepet 2026-11-17,
 * docs/plan-seo-cv-kluster-2026-11-17.md, B5). Sökintention: "enkel cv mall",
 * "cv mall enkel", "enkelt cv". Urvalet är familjen en-spalt i katalogen,
 * talen och typsnitten räknas därifrån.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import StilSida from '../components/StilSida'
import { ANTAL_EN_SPALT, STIL_SIDOR, stilMallar } from '@/lib/seo/cv-kluster'
import { MALL_ANTAL } from '@/lib/cv/mallar/katalog'
import { TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal'
import { SALD_PLAN, paketMedPris } from '@/lib/plans/plans'

const SIDA = STIL_SIDOR.enkla
const URL = `https://www.jobbcoach.ai${SIDA.path}`

const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const uppraknat = (n: string[], och = 'och') => (n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} ${och} ${n[n.length - 1]}`)
const EN_SPALT = stilMallar('enkla')
const GRATIS = uppraknat(EN_SPALT.filter((m) => m.niva === 'gratis').map((m) => m.namn))
const GRATIS_ELLER = uppraknat(EN_SPALT.filter((m) => m.niva === 'gratis').map((m) => m.namn), 'eller')
const MED_WORD = EN_SPALT.filter((m) => m.word).length
const MED_FOTO = EN_SPALT.filter((m) => m.foto).length

/** Typsnittens namn som de heter i Word, i den ordning de först förekommer bland mallarna. */
const TYPSNITT_NAMN: Record<string, string> = {
  calibri: 'Calibri',
  arial: 'Arial',
  times: 'Times New Roman',
  verdana: 'Verdana',
  garamond: 'Garamond',
  georgia: 'Georgia',
}
const TYPSNITT = uppraknat([...new Set(EN_SPALT.map((m) => TYPSNITT_NAMN[m.typsnitt ?? 'calibri'] ?? m.typsnitt ?? ''))].filter(Boolean), 'eller')

export const metadata: Metadata = {
  title: SIDA.titel,
  description: SIDA.beskrivning,
  keywords: ['enkel cv mall', 'cv mall enkel', 'enkel cv-mall', 'enkelt cv', 'enkla cv-mallar', 'cv mall en spalt', 'enkel cv mall gratis'],
  openGraph: { title: SIDA.titel, description: SIDA.beskrivning, type: 'website', locale: 'sv_SE', url: URL, siteName: 'Jobbcoach.ai' },
  twitter: { card: 'summary_large_image', title: SIDA.titel, description: SIDA.beskrivning },
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
}

const FAQ = [
  {
    q: 'Vilka enkla CV-mallar är gratis?',
    a: `${GRATIS} är gratis, båda i en spalt. Du laddar ner en fil per konto som PDF eller Word, utan kortuppgift och utan vattenstämpel. De övriga ${talSomOrd(EN_SPALT.filter((m) => m.niva === 'premium').length)} mallarna i en spalt ingår i Premium.`,
  },
  {
    q: 'Är en enkel CV-mall sämre än en designad?',
    a: 'Nej. Rekryteraren läser innehållet, och en spalt gör det lätt att hitta det viktigaste. Rekryteringssystemen läser också en spalt i rätt ordning, uppifrån och ner. En designad mall kan ge ett starkare första intryck i kreativa yrken, men i de flesta ansökningar är det tydligheten som avgör.',
  },
  {
    q: 'Hur får jag en enkel CV-mall att sticka ut?',
    a: 'Med innehållet först och detaljerna sedan. Välj en av mallens fyra färger, byt typsnitt för brödtexten om du vill och ge avsnitten rubriker för din bransch. En profil på tre meningar som säger vad du kan och vad du söker gör mer än någon grafik.',
  },
  {
    q: 'Får ett långt CV plats i en mall med en spalt?',
    a: 'Ja, CV:t fortsätter på nästa sida med samma rubriker. Ligger du strax över en sida drar valet Få plats på en sida ihop marginaler och text i samma mall. Har du mycket att få med, till exempel många uppdrag, rymmer en mall med sidospalt mer på samma yta.',
  },
  {
    q: 'Vilka typsnitt har de enkla mallarna?',
    a: `Brödtexten är ${TYPSNITT}, beroende på mall, och du kan byta typsnitt för brödtexten själv. Namnet och rubrikerna behåller mallens typsnitt, så formen håller.`,
  },
]

export default function CvMallarEnklaSida() {
  return (
    <StilSida
      stil="enkla"
      kick={`${ANTAL_EN_SPALT} enkla CV-mallar`}
      ingress={
        <>
          Lugna mallar i en spalt med standardrubriker, som rekryteraren skummar på sekunder och rekryteringssystemen läser i rätt ordning.{' '}
          {ANTAL_EN_SPALT} av våra {MALL_ANTAL} mallar är byggda så, och {GRATIS} är gratis. Ladda upp ditt CV här så ser du det i dem direkt.
        </>
      }
      galleriRubrik={`Alla ${ANTAL_EN_SPALT} enkla CV-mallar i en spalt`}
      galleriIngress={`${versal(talSomOrd(MED_WORD))} av dem finns också som Word-fil och ${talSomOrd(MED_FOTO)} har plats för foto. Tryck på en mall så ser du den med ett färdigt CV, eller ladda upp ditt eget högst upp.`}
      premiumRad={`${GRATIS} är gratis, en nedladdning per konto som PDF eller Word. Alla ${ANTAL_EN_SPALT} mallar i en spalt, alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak ingår i ${paketMedPris(SALD_PLAN)}. Säg upp när du vill.`}
      avsnitt={[
        {
          id: 'varfor-en-spalt',
          kick: 'En spalt',
          rubrik: 'Därför fungerar en enkel mall i en spalt',
          innehall: (
            <>
              <p>
                En mall i en spalt läses uppifrån och ner, precis som rekryteraren läser. Namnet står först, sedan profilen, erfarenheten och
                utbildningen under rubriker som alla känner igen. Ingenting konkurrerar om blicken, så det du har gjort hamnar i fokus.
              </p>
              <p>
                Rekryteringssystemen läser på samma sätt. Det finns inga spalter som kan blandas ihop och ingen text i rutor som hoppas över, så
                rubriker, datum och arbetsgivare kommer ut i rätt ordning. Alla våra mallar är testade mot rekryteringssystem, men i en spalt är
                marginalen störst.
              </p>
              <p>
                Därför väljer många en enkel mall när de söker i offentlig sektor, vården, banker och på advokatbyråer, där arbetsgivaren
                förväntar sig ordning före form. Mer om luft, typsnitt och rubriker finns i guiden om{' '}
                <Link href="/artiklar/hur-ska-ett-cv-se-ut" className="cvm-lank">
                  hur ett CV ska se ut
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          id: 'nar-enkelt-ar-fel',
          kick: 'Fel val',
          rubrik: 'När en enkel mall inte räcker',
          innehall: (
            <>
              <p>
                Har du lång erfarenhet, många uppdrag eller en lång lista med system och certifikat blir en spalt snabbt två eller tre sidor. Då
                rymmer en mall med sidospalt mer på samma yta, eftersom kompetenser, språk och kontaktuppgifter får en egen smal spalt bredvid
                erfarenheten. Ligger du bara strax över en sida räcker ofta valet Få plats på en sida, som drar ihop marginaler och text i samma
                mall.
              </p>
              <p>
                Söker du i ett kreativt yrke, som design, kommunikation eller marknadsföring, kan en mall med mer form säga något om dig redan
                innan rekryteraren läst en rad. Det du skriver byter du inte, bara formen: innehållet följer med när du byter mall.
              </p>
            </>
          ),
        },
        {
          id: 'gor-den-personlig',
          kick: 'Din egen',
          rubrik: 'Så gör du en enkel mall personlig utan att tappa läsbarheten',
          innehall: (
            <>
              <p>
                Varje mall har fyra färger, och accentfärgen syns i rubriker och linjer utan att störa texten. Välj en dämpad färg till vården och
                offentlig sektor och en varmare till service och försäljning. Typsnittet för brödtexten kan du byta själv, medan namnet och
                rubrikerna behåller mallens typsnitt så att formen håller.
              </p>
              <p>
                Rubrikerna gör mest skillnad. Skriv vilket jobb du söker så får avsnitten rubriker för din bransch, till exempel Klinisk
                erfarenhet i stället för Arbetslivserfarenhet, och passar ingen av dem skriver du en egen. Lägg sedan tid på profilen överst:
                tre meningar om vad du kan och vad du söker gör mer för intrycket än någon grafik.
              </p>
            </>
          ),
        },
        {
          id: 'lite-erfarenhet',
          kick: 'Första jobbet',
          rubrik: 'Utbildningen först när erfarenheten är kort',
          innehall: (
            <>
              <p>
                Har du lite arbetslivserfarenhet är en enkel mall det bästa valet, eftersom den inte lämnar tomma ytor att fylla. Välj ordningen
                med utbildningen först, så kommer examen, kurser och projekt före extrajobben, och lyft praktik och ideella uppdrag som riktig
                erfarenhet. {GRATIS_ELLER} räcker långt för första ansökan.
              </p>
              <p>
                Hur du skriver ett starkt CV när erfarenheten är kort går vi igenom i guiden om{' '}
                <Link href="/artiklar/cv-utan-erfarenhet" className="cvm-lank">
                  CV utan erfarenhet
                </Link>
                , och för dig som precis har tagit examen finns ett{' '}
                <Link href="/artiklar/cv-exempel-student-nyexaminerad" className="cvm-lank">
                  CV-exempel för student och nyexaminerad
                </Link>
                .
              </p>
            </>
          ),
        },
      ]}
      lankar={[
        { href: '/cv-mallar', rubrik: `Alla ${MALL_ANTAL} CV-mallar`, text: 'Hela utbudet, också mallarna med sidospalt.' },
        { href: '/cv-mallar/word', rubrik: STIL_SIDOR.word.kort, text: 'Mallarna du laddar ner som Word-fil.' },
        { href: '/cv-mallar/foto', rubrik: STIL_SIDOR.foto.kort, text: 'Mallarna med plats för foto.' },
        { href: '/artiklar/cv-utan-erfarenhet', rubrik: 'CV utan erfarenhet', text: 'Så skriver du CV:t när arbetslivet är kort.' },
      ]}
      faqRubrik="Vanliga frågor om enkla CV-mallar"
      faq={FAQ}
      inloggadTill="/dashboard/cv-mallar"
    />
  )
}
