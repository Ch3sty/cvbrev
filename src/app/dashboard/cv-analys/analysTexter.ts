/**
 * Analys-sidans texter (CV-rummet steg 4, skissen Analys). Introts och
 * spärrens texter är dagens (CVAnalysisIntro, paywall-copy); betalväggens
 * rubrik, brödtext, prisrad och knapp kommer alltid ur hjälparna.
 * Inga tankstreck, ordet AI används inte.
 */
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'

const TALORD = ['Inget', 'En', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta', 'Nio', 'Tio']

export const ANALYS = {
  ogon: (datum: string | null) => (datum ? `Läsbarhetspoäng · analyserat ${datum}` : 'Läsbarhetspoäng'),
  rubrik: (n: number) => (n === 0 ? 'Inget drar ner just nu' : n === 1 ? 'En sak drar ner' : `${TALORD[n] ?? n} saker drar ner`),
  ingress: (n: number) =>
    n === 0
      ? 'Förslagen höjer inte poängen just nu. Välj en mall och ladda ner.'
      : n === 1
        ? 'Den går att åtgärda på en kväll. Siffran på arket visar var den sitter.'
        : 'Alla går att åtgärda på en kväll. Siffrorna på arket visar var de sitter.',
  ingressKort: (n: number) => (n === 0 ? 'Förslagen höjer inte poängen just nu.' : 'Siffrorna på arket visar var de sitter.'),
  idag: 'av 100 i dag',
  medForslag: 'med våra förslag',
  talAria: (idag: number, med: number) => `Läsbarhetspoängen är ${idag} av 100 i dag och ${med} med våra förslag.`,
  atgarda: 'Åtgärda i CV:t',
  atgardaSidorad: 'Du väljer vilka förslag som följer med till CV:t.',
  laddaNer: 'Välj mall och ladda ner',
  laddaNerSidorad: `Samma CV i ${TEMPLATE_COUNT} mallar.`,

  drarNerOgon: 'Vad som drar ner, i ordning',
  borjaMed: (typ: 'profil' | 'roll' | 'kompetenser', foretag?: string) =>
    typ === 'profil' ? 'Börja med sammanfattningen' : typ === 'kompetenser' ? 'Börja med kompetenserna' : foretag ? `Börja med rollen på ${foretag}` : 'Börja med rollen',
  borjaMedRad: (typ: 'profil' | 'roll' | 'kompetenser') =>
    typ === 'profil'
      ? 'Det första rekryteraren läser. Vårt förslag säger tydligare vilken roll du har och vad du kan.'
      : typ === 'kompetenser'
        ? 'Kompetenser som rekryterare letar efter i roller som dina. Lägg bara till dem du faktiskt har.'
        : 'Vårt förslag beskriver vad du gjorde, rad för rad, med verb först.',
  // Siffrorna som står kvar i CV:t (efterrättning A 2026-11-21).
  rubrikAterstar: (n: number) => (n === 1 ? 'En sak återstår' : `${TALORD[n] ?? n} saker återstår`),
  siffrorIngress: 'Där det står [antal] skriver du ditt eget tal. Markeringen på arket visar var.',
  siffrorIngressKort: 'Där det står [antal] skriver du ditt eget tal.',
  siffrorSidorad: (rader: number) =>
    rader === 1 ? 'En rad väntar på din siffra.' : `${TALORD[rader] ?? rader} rader väntar på dina siffror.`,
  medSiffror: 'med dina siffror',
  medForslagOchSiffror: 'med förslag och siffror',
  mojligaMedSiffror: 'poäng möjliga med förslag och siffror',
  talAriaMed: (idag: number, med: number, text: string) => `Läsbarhetspoängen är ${idag} av 100 i dag och ${med} ${text}.`,
  borjaMedSiffror: 'Börja med dina siffror',
  siffrorRubrik: 'Dina siffror',
  siffrorText: 'Vi skriver aldrig tal åt dig. Där det står [antal] fyller du i ditt eget, till exempel hur många kunder, order eller kronor.',
  siffrorKort: 'Där det står [antal] fyller du i ditt eget tal.',
  siffrorKnapp: 'Fyll i siffrorna',
  siffrorAlt: 'dina siffror',
  inget: 'Inget drar ner just nu',
  ingetRad: 'Förslagen höjer inte poängen. Ditt CV är redo för en mall.',
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
  lastAria: (titel: string) => `${titel}. Åtgärden ingår i Premium.`,

  premOgon: 'Poängen och det tyngsta fyndet ingår',
  seVadSomIngar: 'Se vad som ingår',

  mallen: (namn: string) => `Mallen ${namn}.`,
  seMallar: `Se det i ${TEMPLATE_COUNT} mallar`,

  sasOgon: 'Så räknas poängen',
  mojliga: 'poäng möjliga',
  ingenOkning: 'Ingen ökning med förslagen',
  idagRad: 'I dag',
  stapelAria: (idag: number, delar: string) => `${idag} poäng i dag.${delar ? ` ${delar}` : ''}`,
  forklaring:
    'Poängen räknas ur det som står i ditt CV: kontaktuppgifter, personbeskrivning, roller, kompetenser, utbildning, språk, datum och längd. Varje del har en högsta poäng och tillsammans blir det 100. Samma CV ger alltid samma poäng, och plus på ett förslag är exakt vad poängen blir med förslaget infört.',
  allaDelar: 'Alla sju delar',
  delAv: (idag: number, max: number) => `${idag} av ${max}`,

  arkAlt: (n: number, delar: string) => (n ? `Ditt CV med ${n} ${n === 1 ? 'markering' : 'markeringar'}: ${delar}.` : 'Ditt CV i sin mall.'),

  // Introt: dagens texter (CVAnalysisIntro).
  introOgon: 'CV-analys',
  introRubrik: 'Se ditt CV som rekryteraren ser det',
  introIngress: 'Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV likadant, på under en minut.',
  introKnapp: 'Analysera mitt CV',
  introSidorad: 'En analys ingår gratis. Poängen får du direkt.',
  introSidoradPremium: 'Analysen ingår. Kör den så ofta du vill.',
  introPanelRubrik: 'En komplett bild av ditt CV',
  introPanelRad: 'Vi går igenom struktur, nyckelord och formuleringar, och visar vad som håller dig tillbaka.',
  introInnehall: [
    'Poäng för hur väl rekryteringssystem läser ditt CV',
    'Analys av dina kompetenser och nyckelord',
    'Granskning av personlig beskrivning',
    'Konkreta förbättringar för varje sektion',
    'Jämförelse av före och efter',
    'Möjlighet att exportera till PDF',
  ],
  fordelar: [
    {
      titel: 'Läsbar i rekryteringssystem',
      text: 'De flesta arbetsgivare låter ett rekryteringssystem (ATS) sortera ansökningarna först. Vi visar om ditt CV klarar det.',
    },
    { titel: 'Genomgång per avsnitt', text: 'Färdiga formuleringar för varje del av CV:t, från profiltext till kompetenser.' },
    { titel: 'Snabbt resultat', text: 'Fullständig analys på under en minut. Inga onödiga väntetider.' },
  ],
  kvotLabel: 'Analyser kvar',

  // Utan struktur.
  strukturRubrik: 'Vi kunde inte läsa avsnitten i ditt CV',
  strukturIngress: 'Utan avsnitt kan vi inte räkna poängen. Vi läser in CV:t på nytt, det tar några sekunder.',
  strukturKnapp: 'Strukturera nu',
  strukturar: 'Strukturerar',
  strukturFel: 'Det gick inte att strukturera CV:t. Försök igen om en stund.',
}
