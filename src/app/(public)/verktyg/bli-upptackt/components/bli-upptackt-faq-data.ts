import { PLAN_BY_KEY } from '@/lib/plans/plans'

export type FaqItem = { q: string; a: string }

const ALLT_VECKA = PLAN_BY_KEY.all_week
const ALLT_MANAD = PLAN_BY_KEY.all_month
const CV_VECKA = PLAN_BY_KEY.cv_week
const TEST_VECKA = PLAN_BY_KEY.test_week

export const BLI_UPPTACKT_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Kan min nuvarande chef se att jag är synlig?',
    a: 'Nej. Vi döljer vilket företag du jobbar på just nu, så din arbetsgivare kan inte hitta eller känna igen din profil även om de letar i kandidatpoolen.',
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
    a: `Synligheten ingår i ${ALLT_VECKA.name}, ${ALLT_VECKA.amount} kr i veckan eller ${ALLT_MANAD.amount} kr i månaden, och du säger upp när du vill. Utan ${ALLT_VECKA.name} kan du skapa din profil och göra testerna, men profilen visas inte i rekryterarnas sökningar. Med ${ALLT_VECKA.name} får du dessutom jobbmatchning varje natt, Jobbcoachen så mycket du vill och allt i ${CV_VECKA.name} och ${TEST_VECKA.name}.`,
  },
  {
    q: 'Syns min lön eller mitt löneanspråk för rekryterare?',
    a: 'Nej. Din profil visar bara din roll, region, kompetenser och testresultat. Lön är något du och rekryteraren pratar om själva, om och när ni börjar chatta.',
  },
  {
    q: 'Kan jag ångra mig och sluta synas?',
    a: 'Ja, när som helst. Du stänger av synligheten med ett klick, och din profil slutar då dyka upp i rekryterares sökningar direkt.',
  },
]
