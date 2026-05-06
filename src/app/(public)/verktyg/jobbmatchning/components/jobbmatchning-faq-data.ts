/**
 * FAQ-data for /verktyg/jobbmatchning landningssidan.
 * 8 fragor optimerade for long-tail-keywords kring "soka jobb" och "hitta jobb".
 */

export interface FaqItem {
  q: string
  a: string
}

export const JOBBMATCHNING_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur hittar jag jobb som passar mig?',
    a: 'Aktivera ditt CV i vår jobbmatchningstjänst så söker vi automatiskt bland tusentals lediga tjänster i hela Sverige. Vi läser ut din yrkeserfarenhet, dina kompetenser, din utbildning och din ort och ger dig en matchnings-procent per annons. De jobb där du har starkast match hamnar överst i listan.',
  },
  {
    q: 'Var hittar jag lediga jobb i Sverige?',
    a: 'Vi söker direkt mot Arbetsförmedlingens öppna API som är Sveriges största samling av lediga jobb. Det innebär att du får tillgång till samma annonser som finns på arbetsformedlingen.se, men sorterade efter hur väl just ditt CV matchar varje tjänst.',
  },
  {
    q: 'Hur matchar man CV mot lediga jobb?',
    a: 'Vår matchningstjänst extraherar nyckeldata från ditt CV: yrkesroller, kompetenser, utbildningsnivå, plats och språk. Sedan jämförs den datan mot kraven i varje jobbannons. Resultatet är en procentsiffra mellan 0 och 100 som visar hur väl just ditt CV svarar mot det specifika jobbet.',
  },
  {
    q: 'Var kommer jobben ifrån?',
    a: 'Alla jobbannonser kommer från Arbetsförmedlingens öppna data, som täcker både offentlig och privat sektor i hela Sverige. Vi lägger inte till egna annonser och tar inte betalt av arbetsgivare för synlighet, så listan är opartisk och uppdaterad direkt från källan.',
  },
  {
    q: 'Hur ofta uppdateras jobbannonserna?',
    a: 'Annonserna uppdateras dagligen. När en arbetsgivare publicerar en ny tjänst på Arbetsförmedlingen syns den i din feed inom timmar. När en tjänst tas bort försvinner den också automatiskt från listan, så du slipper söka jobb som redan är tillsatta.',
  },
  {
    q: 'Är det gratis att söka jobb online hos er?',
    a: 'Ja. Du får 10 matchade jobb per sökning gratis utan att lämna kortuppgifter. Vill du se alla matchande jobb (upp till 300 per sökning) och göra obegränsade sökningar uppgraderar du till Premium för 149 kr per månad. Du kan testa Premium gratis i sju dagar.',
  },
  {
    q: 'Funkar jobbmatchning för alla yrken?',
    a: 'Ja. Vi använder JobTech Taxonomy som är den officiella svenska standarden för yrkesklassificering, så funktionen täcker allt från undersköterskor och lärare till mjukvaruutvecklare och projektledare. Det enda kravet är att du har ett CV att aktivera.',
  },
  {
    q: 'Behöver jag ladda upp ett CV?',
    a: 'Ja, vi behöver något att matcha mot. Du kan antingen ladda upp ett befintligt CV i PDF eller Word, eller skapa ett nytt med vår CV-byggare. När CV:t är aktiverat extraheras all data automatiskt och du kan börja söka jobb direkt.',
  },
]
