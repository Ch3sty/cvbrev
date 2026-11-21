/**
 * Analys-sidans texter (CV-rummet steg 4, genomgången del för del sedan
 * 2026-11-21). Betalväggens rubrik, brödtext, prisrad och knapp kommer
 * alltid ur hjälparna (paywall-copy, KampanjPrisKontext).
 * Inga tankstreck, ordet AI används inte (Jobbcoachen).
 */
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { PAKETRADER } from '@/components/paywall/paywall-copy'

const TALORD = ['Inga', 'En', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta', 'Nio', 'Tio']
const talord = (n: number) => TALORD[n] ?? String(n)
const sma = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

export const ANALYS = {
  ogon: (datum: string | null) => (datum ? `Läsbarhetspoäng · analyserat ${datum}` : 'Läsbarhetspoäng'),

  /* ---------------------------------------------------- väggen, resultat */
  rubrik: (kvar: number) => (kvar <= 0 ? '100 av 100' : `${kvar} poäng kvar till 100`),
  ingressMedForslag: (med: number) =>
    med >= 100 ? 'Våra förslag tar dig hela vägen till 100.' : `Våra förslag tar dig till ${med}. Resten gör du själv, del för del här nedanför.`,
  ingressMedForslagKort: (med: number) => (med >= 100 ? 'Våra förslag tar dig hela vägen till 100.' : `Våra förslag tar dig till ${med}.`),
  ingressEget: (delar: number) =>
    delar === 1
      ? 'De sitter i en del. Genomgången visar vad som saknas och var du fyller i det.'
      : `De sitter i ${sma(talord(delar))} delar. Genomgången visar vad som saknas och var du fyller i det.`,
  ingressEgetKort: (delar: number) => (delar === 1 ? 'De sitter i en del.' : `De sitter i ${sma(talord(delar))} delar.`),
  ingressKlar: 'Varje del är på plats. Välj en mall och ladda ner.',
  idag: 'av 100 i dag',
  medForslag: 'med våra förslag',
  medSiffror: 'med dina siffror',
  medForslagOchSiffror: 'med förslag och siffror',
  talAria: (idag: number) => `Läsbarhetspoängen är ${idag} av 100 i dag.`,
  talAriaMed: (idag: number, med: number, text: string) => `Läsbarhetspoängen är ${idag} av 100 i dag och ${med} ${text}.`,
  atgarda: 'Åtgärda i CV:t',
  atgardaSidorad: 'Du väljer vilka förslag som följer med.',
  oppnaCv: 'Öppna CV:t',
  oppnaCvSidorad: 'Poängen räknas om när du sparar.',
  laddaNer: 'Välj mall och ladda ner',
  laddaNerSidorad: `Samma CV i ${TEMPLATE_COUNT} mallar.`,

  /* Jobbcoachens förslag (beslutet 2026-11-21): genomgången är öppen för
     alla CV, förslagstexterna hämtas, gratis en gång per konto. */
  hamtaForslag: 'Hämta Jobbcoachens förslag',
  hamtaSidorad: 'En gång ingår gratis. Tar under en minut.',
  hamtaSidoradPremium: 'Ingår. Hämta så ofta du vill.',
  inteSkrivitForslag: 'Jobbcoachen har inte skrivit förslag än.',
  /** Tidsbegränsad rad (visaPoangAndrad i analysData.ts), till och med 31 januari 2027. */
  poangAndrad: 'Vi räknar poängen noggrannare sedan 21 november, så talet kan ha ändrats. Ditt CV är detsamma.',
  premOgonForslag: `Förslagen ingår i ${PAKETRADER.bricka}`,
  premRubrikForslag: 'Låt Jobbcoachen skriva texterna',
  kvotHamtaSlut: `Att hämta nya förslag ingår i ${PAKETRADER.bricka}.`,

  /* ------------------------------------------------ golvet, genomgången */
  genomgangOgon: 'Genomgången, del för del',
  genomgangRubrik: (kvar: number) =>
    kvar === 0 ? 'Sju delar. Alla är på plats.' : `Sju delar. ${talord(kvar)} har poäng kvar.`,
  genomgangAv: (namn: string | null) => (namn ? `Genomgång av ”${namn}”.` : 'Genomgång av CV:t.'),
  forslagSkrevs: (datum: string) => `Förslagen skrevs ${datum}.`,
  nyaForslag: 'Be om nya förslag',
  allt: 'Allt på plats',
  ochFler: (n: number) => ` Och ${sma(talord(n))} till.`,
  delAria: (namn: string, poang: number, max: number) => `${namn}, ${poang} av ${max} poäng`,
  delAv: (poang: number, max: number) => `${poang} av ${max}`,
  saknas: 'Saknas',
  delvis: 'Delvis',
  klar: 'Klar',
  oppnaICv: 'Öppna i CV:t',
  jobbcoachensForslag: 'Jobbcoachens förslag',
  laststForslag: (titel: string) => titel,
  lastAria: (titel: string) => `${titel}. Förslaget ingår i Premium.`,

  /* Förslaget utfällt (dagens papper). */
  nuvarande: 'Nuvarande text',
  forslag: 'Vårt förslag',
  forslagKompetenser: 'Lägg till om de stämmer',
  ingenText: 'Ingen text i CV:t än.',
  andrat: 'Vad vi har ändrat:',
  andratLista: (lista: string[]) => (lista.length ? `${lista.join(', ')}.` : 'formuleringen är tydligare.'),
  andraTexten: 'Ändra texten',
  anvandForslaget: 'Använd förslaget',
  fyllI: 'Fyll i din egen siffra där det står [antal]. Vi hittar aldrig på tal åt dig, och en siffra räknas först när du skrivit in den.',
  plus: (n: number) => `+${n} poäng`,
  plusAria: (n: number) => `Ger ${n} poäng`,

  // Siffrorna som står kvar i CV:t (efterrättning A 2026-11-21).
  siffrorSidorad: (rader: number) =>
    rader === 1 ? 'En rad väntar på din siffra.' : `${talord(rader)} rader väntar på dina siffror.`,
  siffrorRubrik: 'Dina siffror',
  siffrorText: 'Vi skriver aldrig tal åt dig. Där det står [antal] fyller du i ditt eget, till exempel hur många kunder, order eller kronor.',
  siffrorKnapp: 'Fyll i siffrorna',

  premOgon: 'Poängen och det tyngsta förslaget ingår',
  seVadSomIngar: 'Se vad som ingår',

  mallen: (namn: string) => `Mallen ${namn}.`,
  seMallar: `Se det i ${TEMPLATE_COUNT} mallar`,

  /* ------------------------------------------------- Vägen till 100 */
  vagenOgon: 'Vägen till 100',
  vagenIdag: 'I dag',
  vagenForslag: 'Våra förslag',
  vagenSjalv: 'Du själv',
  vagenAria: (idag: number, forslag: number, sjalv: number) =>
    `${idag} poäng i dag. Våra förslag ger ${forslag} till. Du själv kan hämta ${sjalv} till.`,
  forklaring:
    'Poängen räknas ur det som står i ditt CV, del för del. Samma CV ger alltid samma poäng, och plus på ett förslag är exakt vad poängen blir med förslaget infört. Allt som saknas står i genomgången.',

  arkAlt: (delar: string) => (delar ? `Ditt CV med markeringar för delarna: ${delar}.` : 'Ditt CV i sin mall.'),

  /* ------------------------------------- panelen i läget utan struktur */
  introPanelOgon: 'Så går det till',
  introPanelRubrik: 'Hela CV:t, del för del',
  introSteg: [
    {
      titel: 'Vi läser CV:t',
      text: 'Sju delar: kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och helheten med datum och längd.',
    },
    { titel: 'Du får poängen', text: 'En poäng av 100 och vad som saknas i varje del. Samma CV ger alltid samma poäng.' },
    {
      titel: 'Du rättar, vi skriver',
      text: 'Jobbcoachen skriver förslag på texterna. Resten fyller du i själv, och poängen räknas om när du sparar.',
    },
  ],
  introBytCv: 'Vill du se ett annat CV väljer du det under Byt CV.',
  kvotLabel: 'Jobbcoachens förslag',

  // Utan struktur.
  strukturRubrik: 'Vi kunde inte läsa avsnitten i ditt CV',
  strukturIngress: 'Utan avsnitt kan vi inte räkna poängen. Vi läser in CV:t på nytt, det tar några sekunder.',
  strukturKnapp: 'Strukturera nu',
  strukturar: 'Strukturerar',
  strukturFel: 'Det gick inte att strukturera CV:t. Försök igen om en stund.',
}
