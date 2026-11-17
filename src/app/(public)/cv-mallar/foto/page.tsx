/**
 * /cv-mallar/foto: CV-mallarna med plats för bild (SEO-svepet 2026-11-17,
 * docs/plan-seo-cv-kluster-2026-11-17.md, B5). Sökintention: "cv mall med
 * bild", "cv-mall med foto". Frågan om man ska ha bild ägs av
 * /artiklar/bild-i-cv-ja-eller-nej och utförandet av /artiklar/cv-bild-guide;
 * sidan svarar inte på dem utan länkar dit. Fotoplatsens form och läge ur
 * mallarnas definitioner (foto.form, foto.plats), talen ur katalogen.
 * Inloggade landar på dashboardgalleriet med den gratis fotomallen (P5).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import StilSida from '../components/StilSida'
import { ANTAL_FOTO, ANTAL_FOTO_MED_WORD, STIL_SIDOR, stilMallar } from '@/lib/seo/cv-kluster'
import { MALL_ANTAL } from '@/lib/cv/mallar/katalog'
import { TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal'
import { SALD_PLAN, paketMedPris } from '@/lib/plans/plans'

const SIDA = STIL_SIDOR.foto
const URL = `https://www.jobbcoach.ai${SIDA.path}`

const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const uppraknat = (n: string[], och = 'och') => (n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} ${och} ${n[n.length - 1]}`)
const FOTO = stilMallar('foto')
const GRATIS_FOTO = uppraknat(FOTO.filter((m) => m.niva === 'gratis').map((m) => m.namn))
const FORSTA_GRATIS_FOTO = FOTO.find((m) => m.niva === 'gratis')?.id ?? 'bjork'

export const metadata: Metadata = {
  title: SIDA.titel,
  description: SIDA.beskrivning,
  keywords: ['cv mall med bild', 'cv-mall med foto', 'cv med bild mall', 'cv mall bild', 'cv med foto', 'cv-mall med bild gratis'],
  openGraph: { title: SIDA.titel, description: SIDA.beskrivning, type: 'website', locale: 'sv_SE', url: URL, siteName: 'Jobbcoach.ai' },
  twitter: { card: 'summary_large_image', title: SIDA.titel, description: SIDA.beskrivning },
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
}

const FAQ = [
  {
    q: 'Vilka CV-mallar med bild är gratis?',
    a: `${GRATIS_FOTO} är gratis, med en rund fotoplats i det centrerade huvudet. Du laddar ner en fil per konto som PDF eller Word, utan kortuppgift och utan vattenstämpel. De övriga ${talSomOrd(FOTO.filter((m) => m.niva === 'premium').length)} mallarna med fotoplats ingår i Premium.`,
  },
  {
    q: 'Vad händer med fotoplatsen om jag inte har något foto?',
    a: 'I förhandsvisningen står din initial där fotot ska sitta, så att du ser hur mallen ser ut. I filen du laddar ner tas platsen bort när du inte har lagt till något foto, och du kan också slå av fotot i en mall som har det.',
  },
  {
    q: 'Kan jag lägga till fotot utan konto?',
    a: 'Nej, fotot lägger du till när du har ett konto. Uppladdningen av CV:t och valet av mall fungerar utan konto, men när du trycker på fotot ber vi dig skapa ett gratis konto först.',
  },
  {
    q: 'Läser rekryteringssystemen CV:t när det har ett foto?',
    a: 'Ja. Alla mallar med fotoplats har gått genom vår egen CV-läsare både med och utan foto, och texten kommer ut i rätt ordning med namnet först. Fotot ligger i en egen yta i mallen och inte mitt i texten.',
  },
  {
    q: 'Finns mallarna med bild också som Word-fil?',
    a: `${versal(talSomOrd(ANTAL_FOTO_MED_WORD))} av de ${ANTAL_FOTO} mallarna med fotoplats finns som Word-fil, gratismallen ${GRATIS_FOTO} inräknad. De övriga laddas ner som PDF.`,
  },
]

export default function CvMallarFotoSida() {
  return (
    <StilSida
      stil="foto"
      kick={`${ANTAL_FOTO} CV-mallar med bild`}
      ingress={
        <>
          {ANTAL_FOTO} av våra {MALL_ANTAL} mallar har plats för ett foto, och {GRATIS_FOTO} är gratis. Ladda upp ditt CV här så ser du det i
          mallarna med fotoplats direkt, och lägg till fotot när du har skapat ett konto.
        </>
      }
      galleriRubrik={`Alla ${ANTAL_FOTO} CV-mallar med plats för foto`}
      galleriIngress="Runda, kvadratiska och stående fotoplatser, i huvudet, i ett färgat band eller överst i en sidospalt. Tryck på en mall så ser du den med ett färdigt CV, eller ladda upp ditt eget högst upp."
      premiumRad={`${GRATIS_FOTO} är gratis, en nedladdning per konto som PDF eller Word. Alla ${ANTAL_FOTO} mallar med fotoplats, alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak ingår i ${paketMedPris(SALD_PLAN)}. Säg upp när du vill.`}
      avsnitt={[
        {
          id: 'var-fotot-sitter',
          kick: 'Fotoplatsen',
          rubrik: 'Var fotot sitter i mallarna',
          innehall: (
            <>
              <p>
                Mallarna skiljer sig mest i hur mycket fotot får ta. I de lugna mallarna är fotot en del av huvudet: Björk har en rund
                fotoplats i det centrerade huvudet, Koppar, Granit och Loft har den till höger om namnet, och Alm har ett foto med rundade hörn
                till vänster. Vill du att fotot ska synas mer har Siluett en stor rund bild mitt i huvudet och Mörkrum en rund bild i ett nästan
                svart block.
              </p>
              <p>
                Kvadratiska fotoplatser passar dig som vill ha ett stramare intryck. Kalksten och Kakel har fotot till vänster i huvudet, Fasad
                till höger bakom det stora namnet och Betong i ett grått band. I sidospaltsmallarna sitter fotot överst i spalten, kvadratiskt i
                Ek och runt i Sand. Panorama är den enda med ett stående foto, i kanten av ett tonat band.
              </p>
            </>
          ),
        },
        {
          id: 'utan-foto',
          kick: 'Utan foto',
          rubrik: 'Fotot i kontot, och vad mallen gör utan',
          innehall: (
            <>
              <p>
                Du kan ladda upp ditt CV och prova alla mallar här utan konto. Själva fotot lägger du till när du har skapat ett gratis konto,
                och sedan byter du mall utan att lägga in bilden igen.
              </p>
              <p>
                Har du inget foto ännu står din initial på fotoplatsen i förhandsvisningen, så att du ser hur mallen kommer att se ut. I filen du
                laddar ner tas platsen bort, och du kan också slå av fotot i en mall som har det. Mallen fungerar alltså både med och utan bild,
                och du kan bestämma dig per ansökan.
              </p>
            </>
          ),
        },
        {
          id: 'bild-i-sverige',
          kick: 'Bild eller inte',
          rubrik: 'När bild är vanligt, och vad bilden ska klara',
          innehall: (
            <>
              <p>
                I Sverige är bild på CV:t frivilligt och inte standard. I kundnära yrken och kreativa branscher kan en bild kännas naturlig,
                medan offentlig sektor, juridik, finans och akademi oftare talar emot den. Vi går igenom för- och nackdelarna, och när du hellre
                låter bli, i guiden{' '}
                <Link href="/artiklar/bild-i-cv-ja-eller-nej" className="pub-lank">
                  bild i CV, ja eller nej
                </Link>
                .
              </p>
              <p>
                Bestämmer du dig för en bild ska den vara tagen i bra ljus mot en neutral bakgrund, med kameran i ögonhöjd. Storlek, upplösning
                och beskärning finns i guiden om{' '}
                <Link href="/artiklar/cv-bild-guide" className="pub-lank">
                  hur du väljer bild till CV:t
                </Link>
                .
              </p>
              <p>
                I våra mallar ligger fotot i en egen yta, inte mitt i en textspalt. Alla mallar med fotoplats har gått genom vår egen CV-läsare
                både med och utan foto innan de kom med, och namnet, rubrikerna och ordningen kommer ut rätt i båda fallen.
              </p>
            </>
          ),
        },
      ]}
      lankar={[
        { href: '/cv-mallar', rubrik: `Alla ${MALL_ANTAL} CV-mallar`, text: 'Hela utbudet, också mallarna utan foto.' },
        { href: '/cv-mallar/word', rubrik: STIL_SIDOR.word.kort, text: 'Mallarna du laddar ner som Word-fil.' },
        { href: '/cv-mallar/enkla', rubrik: STIL_SIDOR.enkla.kort, text: 'Lugna mallar i en spalt med standardrubriker.' },
        { href: '/artiklar/bild-i-cv-ja-eller-nej', rubrik: 'Bild i CV, ja eller nej?', text: 'När bilden hjälper och när du hellre låter bli.' },
      ]}
      faqRubrik="Vanliga frågor om CV-mallar med bild"
      faq={FAQ}
      inloggadTill={`/dashboard/cv-mallar?mall=${FORSTA_GRATIS_FOTO}`}
    />
  )
}
