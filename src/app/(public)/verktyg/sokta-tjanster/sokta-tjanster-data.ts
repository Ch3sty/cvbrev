/**
 * Text och tal för /verktyg/sokta-tjanster (publikt omgång 3). Lydelserna
 * är copys godkända text i docs/publikt-omgang3/nytt-innehall.md, avsnittet
 * sokta-tjanster, inom SEO:s besked (seo-besked-skisser.md, Den nya sidan).
 * Talen läses ur konstanterna, aldrig för hand.
 *
 * Arbetsförmedlingens regler: bara det som står belagt i
 * docs/publikt-omgang3/seo-krav.md, med källan och datumet den lästes.
 * Ren data, klientsäker.
 */

import { NO_RESPONSE_NUDGE_DAYS, STATUS_META } from '@/lib/applications/status'
import { APPLICATION_SHARE_TTL_DAYS } from '@/lib/applications/shareTtl'
import { INTERVJU_BESKED_DAGAR } from '@/lib/jobbsok/typer'
import { SALD_PLAN, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { talOrd, storForst } from '@/components/publikt/talord'

/** Tal som ord upp till tjugo ("tolv"), annars siffran. talOrd slutar vid tio. */
const TONARE: Record<number, string> = { 11: 'elva', 12: 'tolv', 13: 'tretton', 14: 'fjorton', 15: 'femton', 16: 'sexton', 17: 'sjutton', 18: 'arton', 19: 'nitton', 20: 'tjugo' }
export function talOrdTill20(n: number): string {
  return n <= 10 ? talOrd(n) : TONARE[n] ?? String(n)
}

export const TYST_DAGAR = talOrdTill20(NO_RESPONSE_NUDGE_DAYS)
export const BESKED_DAGAR = talOrdTill20(INTERVJU_BESKED_DAGAR)
export const PREMIUM_MED_PRIS = `${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}`

export const AF_KALLA = 'https://arbetsformedlingen.se/for-arbetssokande/arbetslos---vad-hander-nu/aktivitetsrapportera'
export const AF_LAST = '22 november 2026'

export const TITEL = 'Sökta jobb: håll koll på dina ansökningar | Jobbcoach.ai'
export const OG_TITEL = 'Sökta jobb: håll koll på dina ansökningar'
export const BESKRIVNING = `Logga sökta jobb, se var ansökningarna står och få ett utkast till uppföljningsmejl efter ${TYST_DAGAR} tysta dagar. Med underlag till aktivitetsrapporten.`
export const H1 = 'Håll koll på varje jobb du har sökt'
export const URL = 'https://www.jobbcoach.ai/verktyg/sokta-tjanster'

export const STEG = [
  { rubrik: 'Spara annonsen du ska söka', text: 'Lägg den under Ska sökas med sista ansökningsdag. Från en träff i Matchade jobb sparar du med ett tryck.' },
  { rubrik: 'Logga när du har sökt', text: 'Markera annonsen som sökt, eller logga ett jobb du har sökt på egen hand. Brickan flyttar till Sökt.' },
  { rubrik: 'Uppdatera när något händer', text: `${STATUS_META.test_invited.label}, kallad till intervju, erbjudande eller avslag. Varje händelse hamnar på tjänsten med sitt datum.` },
  {
    rubrik: 'Följ upp och ta ut månaden',
    text: `Efter ${TYST_DAGAR} tysta dagar föreslår vi ett uppföljningsmejl. Vid månadens slut står det du har sökt samlat på ett blad.`,
  },
] as const

export const FEATURE_LIST = [
  'Logga sökta jobb med tjänst, arbetsgivare och datum',
  'Ska sökas med sista ansökningsdag',
  'Veckans mål',
  'Statistik från sökt till erbjudande',
  `Utkast till uppföljningsmejl efter ${TYST_DAGAR} tysta dagar`,
  'Månadsrapport som underlag till aktivitetsrapporten',
]

export const FRAGOR: { q: string; a: string; lank?: { href: string; text: string } }[] = [
  {
    q: 'Kostar det något att logga sökta jobb?',
    a: `Nej. Att logga sökta jobb, spara annonser under Ska sökas, sätta veckans mål och se statistiken är gratis för alla med konto, och du behöver inte lämna några kortuppgifter. Det första utkastet till ett uppföljningsmejl är också gratis. Fler utkast och månadsrapporten med alla rader ingår i ${PREMIUM_MED_PRIS}.`,
  },
  {
    q: 'Skickar ni uppföljningsmejlet åt mig?',
    a: 'Nej. Vi skriver ett utkast, och du öppnar det i din egen e-post eller kopierar texten. Du ändrar det du vill och skickar själv, från din egen adress. Vi skickar aldrig något till en arbetsgivare.',
  },
  {
    q: 'Skickar ni min aktivitetsrapport till Arbetsförmedlingen?',
    a: 'Nej. Månadsrapporten är ditt eget underlag. Du lämnar in aktivitetsrapporten själv, på Mina sidor eller på något av de andra sätt Arbetsförmedlingen anger. Vi skickar ingenting dit.',
  },
  {
    q: 'Vad ska stå i en aktivitetsrapport?',
    a: `Enligt Arbetsförmedlingen ska alla jobb du har sökt under månaden stå med, annonserade eller inte, och även intervjuer du har varit på. Du lämnar rapporten mellan den 1:a och den 14:e varje månad, och den gäller månaden innan. Den lämnas på Mina sidor, med blankett eller per telefon, och du sparar underlag som visar att du har sökt jobben i minst tre månader. Vår månadsrapport har tjänst, arbetsgivare och datum för varje sökt jobb. Vad som gäller i ditt fall står hos Arbetsförmedlingen, på sidan Aktivitetsrapportera (läst ${AF_LAST}).`,
    lank: { href: AF_KALLA, text: 'Aktivitetsrapportera, arbetsformedlingen.se' },
  },
  {
    q: `Varför föreslår ni uppföljning efter just ${TYST_DAGAR} dagar?`,
    a: `Det är vår egen gräns, ingen regel. ${storForst(TYST_DAGAR)} dagar är långt nog för att arbetsgivaren ska ha hunnit läsa, och kort nog för att rekryteringen oftast fortfarande pågår. Efter en intervju föreslår vi mejlet redan efter ${BESKED_DAGAR} dagar utan besked. Du kan alltid höra av dig tidigare på egen hand.`,
  },
  {
    q: 'Måste jag hitta jobben genom er jobbmatchning?',
    a: 'Nej. Du loggar vilket jobb som helst med tjänst, arbetsgivare och datum, också spontanansökningar och jobb du har fått höra om genom en kontakt. Kommer du från en träff i Matchade jobb är uppgifterna redan ifyllda.',
  },
  {
    q: 'Kan jag lägga in jobb jag sökte innan jag skapade kontot?',
    a: 'Ja. Du väljer själv datumet när du loggar, så äldre ansökningar hamnar i rätt månad. Har du skrivit personliga brev hos oss tidigare föreslår vi att lägga in dem som sökta tjänster, med ett tryck.',
  },
  {
    q: 'Hur hänger intervjun ihop med den sökta tjänsten?',
    a: 'När du loggar att du är kallad sätter du dag, tid och plats på tjänsten. Den står då under Inför intervjun, med frågorna du har övat på och annonsens krav bredvid. Dagen efter intervjun frågar vi hur det gick.',
  },
  {
    q: 'Vem kan se mina sökta tjänster?',
    a: `Ingen annan användare, ingen rekryterare och ingen arbetsgivare. De ligger i ditt konto och visas aldrig i Bli upptäckt. Skapar du en delningslänk ser den som har länken det du har valt att visa, i ${APPLICATION_SHARE_TTL_DAYS} dagar. När vi skriver ett utkast till ett uppföljningsmejl går tjänst och arbetsgivare till Googles AI-tjänst, aldrig ditt namn eller dina kontaktuppgifter. Vi skickar ingenting till Arbetsförmedlingen.`,
  },
]
