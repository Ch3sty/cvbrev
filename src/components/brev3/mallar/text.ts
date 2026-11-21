/**
 * Texterna i Mallar och mallväljaren (skissen Mallar, BYGGSPEC avsnitt 7).
 * Skissens rader står ordagrant; det skissen inte ritar är skrivet i samma
 * ton. Pris, planens namn och köpknappen kommer ur paywall-copy och
 * kampanjen, aldrig härifrån.
 */
import { PAKETRADER } from '@/components/paywall/paywall-copy'

export const MALLAR_TEXT = {
  rubrik: 'Brev och CV i samma mall',
  ingress: 'Samma huvud, samma typsnitt, samma färg. Texten följer med när du byter, och du provar alla mallar fritt.',
  ingressMobil: 'Texten följer med när du byter. Prova alla mallar fritt.',
  provar: (mall: string) => `Du provar mallen ${mall}`,
  star: (mall: string) => `Brevet står i ${mall}`,
  starNu: (mall: string) => `Brevet står nu i ${mall}`,
  last: 'Brevet är låst på gratisnivån. Du kan prova mallarna, men inte byta.',
  exempelOgon: (mall: string) => `Exempelbrev i mallen ${mall}`,
  exempelIngress: 'Skriv ditt första brev, så ser du det här i alla mallar.',
  skrivBrevet: 'Skriv brevet',
  andraTexten: 'Ändra texten',
  typsnitt: (namn: string) => `Typsnitt: ${namn}`,
  tillbaka: (mall: string) => `Tillbaka till ${mall}`,
  laddaNer: (mall: string) => `Ladda ner i ${mall}`,
  word: 'Word',
  laddarNer: 'Filen skapas',
  sidoradGratis: (word: boolean, pris: string) => `${word ? 'PDF och Word' : 'PDF'} ingår i ${PAKETRADER.bricka}, ${pris}.`,
  sidoradPremium: (word: boolean) => (word ? 'PDF att bifoga, Word att ändra i själv.' : 'Den här mallen finns som PDF.'),
  brevRad: 'Brev:',
  bytBrev: 'Byt brev',
  bytBrevRubrik: 'Välj brev',
  dittCv: 'Ditt CV',
  dittBrev: 'Ditt brev',
  arkEtikett: (mall: string) => `Ditt CV och ditt brev i mallen ${mall}, sida vid sida`,
  panelOgon: 'Ditt brev i varje mall',
  // Skissen skriver "CV-rummets 40 mallar". "Rum" är ett internt designord (byggspecen 1.7).
  panelRubrik: (n: number) => `Alla ${n} CV-mallar, nu också för brevet`,
  panelRubrikMobil: 'Ditt brev i varje mall',
  filterEtikett: 'Visa mallar',
  dittCvHar: 'Ditt CV har den här.',
  duProvar: 'Du provar',
  visaOvriga: (n: number) => `Visa de ${n} övriga`,
  hamtar: 'Hämtar mallarna',
  aldreBrev: 'Äldre brev i mallarna Klassisk, Sidofält, Minimal, Kompakt, Centrerad och Professional Split öppnas som förut.',
  typsnittRubrik: 'Typsnitt',
  typsnittUnder: 'Gäller PDF och Word. Elva typsnitt, tio av dem ingår gratis.',
  typsnittEtikett: 'Typsnitt',
  premiumRubrik: (n: number) => `Alla ${n} mallar för både CV och brev, som PDF och Word`,
  premiumMobil: 'Ladda ner brevet som PDF och Word, i alla mallar',
  fel: {
    spara: 'Mallen kunde inte sparas. Försök igen.',
    forhandsvisa: 'Mallen kunde inte visas. Försök igen.',
    ladda: 'Filen kunde inte skapas. Försök igen.',
    last: 'Brevet är låst på gratisnivån, så mallen sparades inte.',
  },
  namnRubrik: 'Vi behöver ditt namn först',
  namnText: 'Det står överst i brevet.',
  kopieratKvitto: 'Texten är kopierad',
  // Mallväljaren
  valjareRubrik: 'Välj mall',
  valjareUnder: 'Samma mallar som för ditt CV. Texten följer med.',
  vald: 'Vald',
  seVadSomIngar: 'Se vad som ingår',
  ingarPremium: PAKETRADER.ingar,
} as const
