/**
 * Exempelbrevet (art directorns brev till Nordanvind Energi, skissen
 * "Personliga brev, omgång 1"). Används av kontaktarken, testerna och av
 * Mallar när användaren inte har skrivit något brev än (då med användarens
 * eget namn). Klientsäker: ren data.
 */
import type { BrevAvsandare, BrevData, BrevKrav } from './typer'

export const EXEMPEL_AVSANDARE: BrevAvsandare = {
  namn: 'Erik Lindberg',
  titel: 'Projektledare inom IT',
  epost: 'erik.lindberg@exempel.se',
  telefon: '070-123 45 67',
  ort: 'Stockholm',
}

const STYCKEN = [
  'När ni skriver att kundplattformen ska byggas om utan att kunderna märker av bytet känner jag igen uppdraget. På Nordea ledde jag införandet av en ny mobilbanksplattform för 1,2 miljoner kunder, med ett team på tolv personer och en budget på 15 miljoner kronor. Vi gick i mål två veckor före plan.',
  'Det jag tar med mig till er är framför allt tre saker. Jag är van att hålla ihop utvecklare, leverantörer och verksamhet i samma plan. Jag har infört agilt arbetssätt i en organisation som inte bett om det, och fått leveranstakten att öka med 35 procent. Och jag rapporterar hellre en risk för tidigt än för sent, vilket styrgrupper brukar uppskatta.',
  'Energibranschen är ny för mig, men kraven på driftsäkerhet och regelefterlevnad är desamma som i banken. Resten lär jag mig gärna av er.',
  'Jag berättar gärna mer om hur jag skulle lägga upp de första nittio dagarna.',
]

/** Kortare variant, cirka 120 ord. */
const KORT = [
  'När ni skriver att kundplattformen ska byggas om utan att kunderna märker av bytet känner jag igen uppdraget. På Nordea ledde jag införandet av en ny mobilbanksplattform för 1,2 miljoner kunder, med ett team på tolv personer och en budget på 15 miljoner kronor. Vi gick i mål två veckor före plan.',
  'Jag är van att hålla ihop utvecklare, leverantörer och verksamhet i samma plan, och jag rapporterar hellre en risk för tidigt än för sent. Det har gett mig styrgrupper som litar på planen.',
  'Energibranschen är ny för mig, men kraven på driftsäkerhet och regelefterlevnad är desamma som i banken. Resten lär jag mig gärna av er.',
  'Jag berättar gärna mer om hur jag skulle lägga upp de första nittio dagarna.',
]

/** Längre variant, cirka 350 ord. */
const LANG = [
  STYCKEN[0],
  STYCKEN[1],
  'På Klarna ledde jag sedan åtta utvecklingsprojekt inom checkout samtidigt. Där lärde jag mig att en plan bara håller om alla som berörs har varit med och gjort den. Jag lägger därför tid tidigt på att förankra mål, tidplan och prioriteringar hos både beställare och team, och jag följer upp varje vecka med samma få mått, så att ingen behöver gissa var vi står. Det gjorde också att vi kunde säga nej till nya önskemål utan att någon kände sig överkörd.',
  'Jag är certifierad i PMP och SAFe, men metoder är för mig verktyg och inget mål i sig. I ett stort införande som ert väljer jag det arbetssätt som passar organisationen, och jag byter hellre spår i tid än håller fast vid något som inte fungerar. Jag har också lett upphandlingar av leverantörer och vet vad ett avtal behöver säga för att en leverans ska gå att följa upp. Det viktigaste är att kunderna får en plattform som fungerar från första dagen och att medarbetarna känner sig trygga i förändringen.',
  'Energibranschen är ny för mig, men kraven på driftsäkerhet och regelefterlevnad är desamma som i banken. Där var varje driftstopp en nyhet, och vi planerade varje release med samma noggrannhet som en revision. Resten lär jag mig gärna av er.',
  'Jag berättar gärna mer om hur jag skulle lägga upp de första nittio dagarna, och om vad jag tror att ert team behöver för att lyckas med bytet.',
]

export type ExempelLangd = 'kort' | 'normal' | 'lang'

/** Exempelbrevet, med en annan avsändare om den ges (Mallar utan brev). */
export function exempelBrev(langd: ExempelLangd = 'normal', avsandare: BrevAvsandare = EXEMPEL_AVSANDARE, sprak: 'sv' | 'en' = 'sv'): BrevData {
  return {
    avsandare,
    mottagare: { foretag: 'Nordanvind Energi', person: 'Maria Ekström, rekryterande chef' },
    tjanst: 'IT-projektledare till kundplattformen',
    datum: '2026-11-21',
    halsning: 'Hej Maria,',
    stycken: langd === 'kort' ? KORT : langd === 'lang' ? LANG : STYCKEN,
    sprak,
  }
}

/** Kraven i skissen Brevet-1440: sex med svar och ett som saknas. */
export const EXEMPEL_KRAV: BrevKrav[] = [
  { krav: 'Leda stora införanden', citat: 'På Nordea ledde jag införandet av en ny mobilbanksplattform för 1,2 miljoner kunder' },
  { krav: 'Budget- och teamansvar', citat: 'ett team på tolv personer och en budget på 15 miljoner kronor' },
  { krav: 'Hålla ihop leverantörer och verksamhet', citat: 'Jag är van att hålla ihop utvecklare, leverantörer och verksamhet i samma plan.' },
  { krav: 'Agilt arbetssätt', citat: 'Jag har infört agilt arbetssätt' },
  { krav: 'Rapportera till styrgrupp', citat: 'jag rapporterar hellre en risk för tidigt än för sent' },
  { krav: 'Driftsäkerhet och regelefterlevnad', citat: 'kraven på driftsäkerhet och regelefterlevnad är desamma som i banken' },
  { krav: 'Engelska i tal och skrift', citat: null },
]
