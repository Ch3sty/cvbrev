/**
 * /cv-mallar/word: CV-mallarna som finns som Word-fil (SEO-svepet 2026-11-17,
 * docs/plan-seo-cv-kluster-2026-11-17.md, B5). Tar emot 308:an från
 * /artiklar/cv-mall-word-gratis; innehållet om Words egna mallar är omskrivet
 * ur den artikeln. Sökintention: "cv mall word", "word mallar", "cv mall word
 * gratis". Talen ur katalogen, copy enligt sälj (S2, S3, punkt 4) och P4.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import StilSida from '../components/StilSida'
import { STIL_SIDOR } from '@/lib/seo/cv-kluster'
import { MALL_ANTAL, MALL_KATALOG, WORD_ANTAL } from '@/lib/cv/mallar/katalog'
import { TEMPLATE_COUNT, WORD_TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal'
import { SALD_PLAN, paketMedPris } from '@/lib/plans/plans'

const SIDA = STIL_SIDOR.word
const URL = `https://www.jobbcoach.ai${SIDA.path}`

const uppraknat = (n: string[], och = 'och') => (n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} ${och} ${n[n.length - 1]}`)
const GRATIS_NAMN = uppraknat(MALL_KATALOG.filter((m) => m.niva === 'gratis' && m.word).map((m) => m.namn))
const WORD_PREMIUM = MALL_KATALOG.filter((m) => m.niva === 'premium' && m.word).length
/**
 * Mallarna med flytande sidospalt i Word, där ett långt CV kan brytas om
 * (bc1eaca1, scripts/word-mallar-granska.ts). Lydelsen är saas-leads (P4).
 */
const SPALT_I_WORD = ['Kalksten', 'Granit', 'Sand', 'Ek']

export const metadata: Metadata = {
  title: SIDA.titel,
  description: SIDA.beskrivning,
  keywords: ['cv mall word', 'cv mall word gratis', 'modern cv mall word', 'word mallar', 'cv-mall i word', 'wordmall cv', 'cv word'],
  openGraph: { title: SIDA.titel, description: SIDA.beskrivning, type: 'website', locale: 'sv_SE', url: URL, siteName: 'Jobbcoach.ai' },
  twitter: { card: 'summary_large_image', title: SIDA.titel, description: SIDA.beskrivning },
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
}

// FAQ-svaren och schemat bär inget belopp: sidan CDN-cachas ett dygn och
// kampanjpriset får inte hamna i schemat. Priset står i Premium-raden under
// galleriet, som följer kampanjen (MedKampanjPris i StilSida).
const FAQ = [
  {
    q: 'Är CV-mallarna i Word gratis?',
    a: `Ja, i ${GRATIS_NAMN}. Du laddar ner Word-filen en gång per konto utan kort, precis som PDF:en. Word i de övriga ${talSomOrd(WORD_PREMIUM)} Word-mallarna ingår i Premium, tillsammans med alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak.`,
  },
  {
    // P4 (saas-lead): undantaget för långt CV i sidospaltsmallarna nämns här, inte i säljtexten.
    q: 'Ser Word-filen likadan ut som PDF:en?',
    a: `Ja, samma layout, typsnitt och sidantal. I mallarna med sidospalt (${uppraknat(SPALT_I_WORD)}) kan ett avsnitt hamna på nästa sida i Word när CV:t är långt.`,
  },
  {
    q: 'Läser rekryteringssystemen Word-filer?',
    a: 'Ja, de flesta rekryteringssystem läser både Word och PDF. Våra Word-filer har gått genom samma läsning som PDF:erna innan mallen kom med, med korta och långa CV: namnet kommer först, och rubrikerna och ordningen kommer ut rätt. Det som brukar ställa till det i Word är textrutor, tabeller för layout och text i sidhuvudet.',
  },
  {
    q: 'Kan jag ändra typsnitt och färg i Word-filen efteråt?',
    a: 'Ja. Filen är ett vanligt Word-dokument, så du ändrar text, typsnitt och färger i Word som i vilket dokument som helst. Vill du byta mall är det enklare att göra det hos oss innan du laddar ner, eftersom innehållet då följer med till den nya mallen.',
  },
  {
    q: 'Vilket filformat får jag när jag väljer Word?',
    a: 'En .docx-fil, det format Word sparar i som standard. Du väljer Word eller PDF när du laddar ner, och mallarna som inte finns i Word laddas ner som PDF.',
  },
]

export default function CvMallarWordSida() {
  return (
    <StilSida
      stil="word"
      kick={`${WORD_ANTAL} CV-mallar i Word`}
      ingress={
        <>
          Fyll i CV:t online, eller ladda upp det du har, och ladda ner en riktig Word-fil med dina uppgifter redan på plats.{' '}
          {WORD_ANTAL} av våra {MALL_ANTAL} mallar finns som .docx, och {GRATIS_NAMN} är gratis. Ladda upp ditt CV här så ser du det i
          Word-mallarna direkt.
        </>
      }
      galleriRubrik={`Alla ${WORD_ANTAL} CV-mallar som finns i Word`}
      galleriIngress="Mallar i en spalt, med sidospalt och med rubrikerna eller årtalen i marginalen. Tryck på en mall så ser du den med ett färdigt CV, eller ladda upp ditt eget högst upp."
      premiumRad={`${GRATIS_NAMN} är gratis, en nedladdning per konto som PDF eller Word. Word i alla ${WORD_TEMPLATE_COUNT} Word-mallar, alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak ingår i ${paketMedPris(SALD_PLAN)}. Säg upp när du vill.`}
      avsnitt={[
        {
          id: 'word-filen',
          kick: 'Filen',
          rubrik: 'Vad du får när du laddar ner som Word',
          innehall: (
            <>
              <p>
                Word-filen är ett riktigt Word-dokument som du öppnar och redigerar, inte en PDF med ett nytt filnamn. Dina uppgifter står redan
                på plats när filen öppnas: namn och kontaktuppgifter, profil, erfarenhet, utbildning, kompetenser och språk. Det är samma mall,
                samma rubriker och samma ordning som i PDF:en, så du behöver inte bygga om något för hand.
              </p>
              <p>
                Mallarna använder typsnitt som följer med Word, som Calibri, Arial, Georgia och Garamond, så CV:t ser rätt ut när du eller
                rekryteraren öppnar det. Rubrikerna du valt för din bransch följer också med, till exempel Klinisk erfarenhet i stället för
                Arbetslivserfarenhet.
              </p>
            </>
          ),
        },
        {
          id: 'word-eller-pdf',
          kick: 'Format',
          rubrik: 'När Word är rätt val och när PDF är bättre',
          innehall: (
            <>
              <p>
                Word är rätt när annonsen ber om ett redigerbart format. Bemanningsföretag och en del arbetsgivare i offentlig sektor vill ha
                Word för att kunna klistra in CV:t i sina egna system. Word är också rätt när du själv vill fortsätta ändra i filen, till exempel
                för att skriva om profiltexten inför varje ansökan i ett program du redan kan.
              </p>
              <p>
                PDF är bättre i alla andra lägen. En PDF ser likadan ut hos rekryteraren som hos dig, medan ett Word-dokument kan se lite
                annorlunda ut i en annan version av programmet. Står det inget om format i annonsen skickar du PDF. Du väljer format när du laddar
                ner, och i Premium hämtar du samma CV i båda. Mer om vad systemen läser finns i guiden om ett{' '}
                <Link href="/artiklar/ats-vanligt-cv" className="cvm-lank">
                  ATS-vänligt CV
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          id: 'sa-gor-du',
          kick: 'Steg för steg',
          rubrik: 'Så laddar du ner ditt CV som Word-fil',
          innehall: (
            <ol style={{ display: 'grid', gap: 10, paddingLeft: 22, listStyle: 'decimal' }}>
              <li>Ladda upp ditt CV högst upp på sidan, i PDF eller Word, så fyller vi i avsnitten. Du kan också skriva ditt namn och fylla i resten själv.</li>
              <li>Välj en av Word-mallarna, en av mallens fyra färger och rubrikerna för din bransch. Innehållet följer med när du byter.</li>
              <li>Välj Word när du laddar ner. Gratismallarna kräver ett konto men ingen kortuppgift.</li>
              <li>Öppna filen i Word och fortsätt ändra, eller spara den som PDF när du skickar.</li>
            </ol>
          ),
        },
        {
          id: 'egen-word-mall',
          kick: 'Själv i Word',
          rubrik: 'Vill du hellre börja i Word själv?',
          innehall: (
            <>
              <p>
                Words egna CV-mallar ligger under Arkiv och Nytt: sök på CV så får du upp Microsofts mallar, och fler finns på Microsoft Create
                i webbläsaren. De är gratis, men många av de designade bygger på tekniker som rekryteringssystemen läser fel.
              </p>
              <p>
                Kontrollera tre saker innan du fyller i en sådan mall: att texten inte ligger i textrutor, att layouten inte är byggd som en
                tabell och att namn och kontaktuppgifter inte står i sidhuvudet. Spara en kopia med ett nytt namn innan du börjar, byt ut all
                exempeltext, också i sidhuvud och sidfot, och håll samma typsnitt och storlek genom hela dokumentet. Hur luft, rubriker och
                typsnitt bör se ut går vi igenom i guiden om{' '}
                <Link href="/artiklar/hur-ska-ett-cv-se-ut" className="cvm-lank">
                  hur ett CV ska se ut
                </Link>
                .
              </p>
            </>
          ),
        },
      ]}
      lankar={[
        { href: '/cv-mallar', rubrik: `Alla ${MALL_ANTAL} CV-mallar`, text: 'Hela utbudet, också mallarna som bara finns som PDF.' },
        { href: '/cv-mallar/enkla', rubrik: STIL_SIDOR.enkla.kort, text: 'Lugna mallar i en spalt med standardrubriker.' },
        { href: '/cv-mallar/foto', rubrik: STIL_SIDOR.foto.kort, text: 'Mallarna med plats för foto.' },
        { href: '/artiklar/ats-vanligt-cv', rubrik: 'ATS-vänligt CV', text: 'Så bygger du ett CV som rekryteringssystemen läser rätt.' },
      ]}
      faqRubrik="Vanliga frågor om CV-mallar i Word"
      faq={FAQ}
      inloggadTill="/dashboard/cv-mallar"
    />
  )
}
