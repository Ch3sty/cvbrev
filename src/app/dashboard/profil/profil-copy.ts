/**
 * Profilsidans strängar, ordagrant ur designfilens slutcopy
 * (docs/design/profil-registrering-2026-09-24.html, "Alla strängar på ett
 * ställe"). Inga talstreck, "personliga brev" aldrig bara "brev" i rubriker.
 */


import { PLAN_BY_KEY, paketNamn, prisPeriod } from '@/lib/plans/plans'

export const PROFIL = {
  eyebrow: 'Konto',
  rubrik: 'Din profil',
  under: 'Det som står överst i ditt CV och dina personliga brev. Allt sparas när du lämnar fältet.',
  hoppaTill: 'Hoppa till',
  hopp: {
    cv: 'CV-uppgifter',
    'personliga-brev': 'Personliga brev',
    jobbsok: 'Jobbsök',
    konto: 'Konto',
  },
  saknas: {
    ort: 'Ort saknas i ditt CV',
    namn: 'Namnet saknas. Utan det kan vi inte skapa ditt CV.',
  },
} as const

export const CV_SEKTION = {
  rubrik: 'Överst i ditt CV',
  under: 'Foto, namn och ort står i CV:ts huvud. Vi sätter in dem själva efteråt, de skickas aldrig till någon AI.',
  valfritt: 'Valfritt',
  kravs: 'Krävs',
  namn: { etikett: 'Namn', text: 'Står överst i ditt CV och dina personliga brev.', plats: 'Förnamn och efternamn' },
  namnFel: 'Namnet måste vara minst två tecken.',
  ort: { etikett: 'Ort', text: 'Rekryteraren ser direkt om du bor nära jobbet.', plats: 'Till exempel Örebro' },
  telefon: { etikett: 'Telefon', text: 'Så att rekryteraren kan ringa dig.', plats: '070 123 45 67' },
  epost: { etikett: 'E-post', text: 'Din inloggning och adressen rekryteraren svarar på.' },
  linkedin: {
    etikett: 'LinkedIn',
    text: 'Blir en rad i CV:t. Rekryterare klickar ofta dit innan de hör av sig.',
    plats: 'linkedin.com/in/ditt-namn',
  },
  hamtatCv: 'Hämtat från ditt CV',
  integritet: 'Sparas separat, går aldrig till någon AI',
  saGorVi: 'Så gör vi',
  integritetRubrik: 'Dina uppgifter går aldrig till någon AI',
  forhandsvisning: 'Så ser CV:ts huvud ut i mallar med foto. Fylls i medan du skriver.',
} as const

export const FOTO = {
  etikett: 'Foto',
  ladda: 'Ladda upp foto',
  byt: 'Byt foto',
  taBort: 'Ta bort',
  laddar: 'Laddar upp',
  meta: 'JPG, PNG eller WebP, högst 2 MB',
  metaLaddar: 'Bilden förminskas till 800 px innan den skickas',
  metaGoogle: 'Hämtat från ditt Google-konto',
  forklaring: 'Används bara i CV-mallar med plats för foto. Foto är frivilligt i Sverige, och rekryteringssystem läser bara texten.',
  dra: 'Släpp bilden här',
  fel: {
    stor: {
      rubrik: 'Bilden är för stor',
      text: (mb: string) => `Den är ${mb} MB och gränsen är 2 MB. Ta en skärmdump av bilden eller välj en mindre.`,
    },
    typ: { rubrik: 'Filen går inte att läsa', text: 'Välj en bild i JPG, PNG eller WebP.' },
    nat: { rubrik: 'Bilden kunde inte sparas', text: 'Nätet svarade inte. Försök igen om en stund.' },
  },
} as const

export const BREV_SEKTION = {
  rubrik: 'Personliga brev',
  under: 'Gäller bara dina personliga brev. Ditt CV påverkas inte.',
  ton: 'Förvald ton',
  tonText: 'Tonen vi börjar med när du skapar ett nytt brev. Du kan alltid byta i själva brevet.',
  smartMeta: 'Ingår när du har ett paket',
  huvud: 'Brevhuvudet',
  huvudText: 'Vad som står under ditt namn överst i brevet.',
  telefon: { etikett: 'Telefon i brevhuvudet', text: 'Av om du hellre blir kontaktad på mejl.' },
  ort: { etikett: 'Ort i brevhuvudet', text: 'Av om du söker jobb på annan ort.' },
  forhandsvisning: 'Så börjar dina personliga brev.',
} as const

export const JOBBSOK_SEKTION = {
  rubrik: 'Jobbsök',
  under: 'Styr jobbmatchningen och Jobbcoachens svar. Inget här står i ditt CV eller dina brev.',
  malroll: { etikett: 'Målroll', text: 'Jobbcoachen utgår från rollen när du frågar om lön, intervjuer och nästa steg.', plats: 'Till exempel Projektledare' },
  bransch: { etikett: 'Bransch', text: 'Gör Jobbcoachens svar relevanta för din bransch.', plats: 'Vård, IT, bygg, handel' },
  preferenser: 'Så söker vi jobb åt dig',
  ingaPreferenser: 'Inga önskemål än, vi söker i hela landet',
  andra: 'Ändra',
  klar: 'Klar',
  preferenserText: 'Styr vad jobbmatchningen letar efter. Du kan ändra det här när som helst, också direkt på sidan Dina matchningar.',
  synlig: 'Sökbar för rekryterare',
  inteSynlig: 'Inte sökbar för rekryterare',
  bliUpptackt: 'Bli upptäckt',
} as const

export const KONTO_SEKTION = {
  rubrik: 'Konto',
  under: 'Paket, mejl från oss, utloggning och radering.',
  prenumeration: 'Prenumeration',
  gratis: `Gratisnivån · tre paket, från ${PLAN_BY_KEY.all_day.amount} kr`,
  mejl: 'Mejl från oss',
  mejlStatus: (vecka: boolean, paminnelser: boolean) =>
    `Veckosammanfattning ${vecka ? 'på' : 'av'}, påminnelser ${paminnelser ? 'på' : 'av'}`,
  mejlUnder: 'Mejl om ditt konto och dina betalningar skickas alltid.',
  loggaUt: 'Logga ut',
  loggaUtText: 'Från den här enheten',
  radera: 'Radera mitt konto',
  raderaText: 'All data tas bort och kan inte återställas',
} as const

/** Smart val på gratisnivån (PremiumGateModal). Paketnamnen med pris, R1. */
export const SMART_VAL = {
  rubrik: 'Smart val ingår när du har ett paket',
  eyebrow: 'Ingår i alla tre paketen',
  text: 'Vi läser annonsens språk och bransch och väljer tonen åt dig, brev för brev.',
  rader: [
    'Vi läser tonen i varje annons',
    'Du slipper välja manuellt för varje brev',
    'Samma ton som arbetsgivaren använder i annonsen',
  ],
  pris: `${paketNamn('cv_week')} och ${paketNamn('test_week')} kostar ${prisPeriod('cv_week')}, ${paketNamn('all_week')} ${prisPeriod('all_week')}.`,
  knapp: 'Jämför paketen',
  senare: 'Kanske senare',
} as const

/** Länken in från brevflödets tonsteg. */
export const ANDRA_FORVALD_TON = 'Ändra förvald ton'
