import { paketKort } from '@/lib/plans/plans'

export type FaqItem = { q: string; a: string }

const PREMIUM = paketKort()

export const BLI_UPPTACKT_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Kan min nuvarande chef se att jag är synlig?',
    a: 'Nej, inte i läget Anonym först, som är förvalt. Där döljer vi vilka företag du har jobbat på, så din arbetsgivare kan inte hitta eller känna igen din profil även om de letar i kandidatpoolen. Väljer du Öppen profil syns ditt namn och dina arbetsgivare direkt.',
  },
  {
    q: 'Kommer jag bli nerspammad av rekryterare?',
    a: 'Nej. Bara rekryterare vars sökning matchar din profil kan se dig, och de kan bara skicka en kontaktförfrågan, inte kontakta dig direkt. Du väljer själv om du vill svara.',
  },
  {
    q: 'Hur vet jag att rekryterarna är seriösa?',
    a: 'Vi kontrollerar att varje rekryterare och företag är verifierat innan de får tillgång till kandidatpoolen. Oseriösa konton stängs av.',
  },
  {
    q: 'Måste jag göra personlighetstestet och kunskapstesterna?',
    a: 'Nej, det är helt frivilligt. Du kan synas ändå. Men gör du testerna får din profil starkare bevis för vad du kan och hur du jobbar, vilket ökar chansen att rätt rekryterare hör av sig.',
  },
  {
    q: 'Vad kostar det att synas för rekryterare?',
    a: `Ingenting. Profilen, synligheten och grundnivån i testerna är gratis, utan kortuppgift. Vill du göra profilen starkare öppnar ${PREMIUM} alla testnivåer, så att du kan visa verifierade resultat på avancerad och expertnivå i stället för bara grundnivån.`,
  },
  {
    q: 'Syns min lön eller mitt löneanspråk för rekryterare?',
    a: 'Nej. Din profil visar din roll, dina kompetenser, dina villkor, dina testresultat med nivå och, om du valt det, dina två främsta styrkor i ord. Placeringen syns bara när ditt resultat ligger över mitten. Lön är något du och rekryteraren pratar om själva, om och när ni börjar chatta.',
  },
  {
    q: 'Kan jag ångra mig och sluta synas?',
    a: 'Ja, när som helst. Du stänger av synligheten med reglaget på sidan, och din profil slutar då dyka upp i rekryterares sökningar direkt.',
  },
]
