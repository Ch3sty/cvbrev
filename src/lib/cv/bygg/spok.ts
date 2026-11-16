/**
 * Spöktexten på arket (skissen, ändrat efter ägarens granskning 16 nov):
 * ett tomt avsnitt står med mallens rubrik och under den ett exempel i grått
 * som visar formen. Exemplet följer titeln från startbladet, ur samma
 * ordlista som rubrikuppsättningarna (src/lib/cv/rubriker.ts), och är
 * generiskt tills titeln finns. Grå text följer aldrig med i filen: den
 * läggs bara i förhandsvisningen (preview-html med spok), aldrig i det som
 * sparas eller laddas ner.
 *
 * Klientsäker, ren data.
 */
import type { CVMetadata } from '../cv-metadata'
import type { Sektion } from '../mallar/kontrakt'
import { uppsattningForTitel, type UppsattningId } from '../rubriker'
import { harInnehall } from './modell'

export interface Spoktext {
  profil: string
  erfarenhet: { titel: string; arbetsgivare: string; punkter: [string, string] }
  utbildning: { utbildning: string; skola: string }
  kompetenser: string[]
}

export const SPOK_GENERISK: Spoktext = {
  profil: 'En eller två meningar om vem du är och vad du söker.',
  erfarenhet: {
    titel: 'Yrkestitel',
    arbetsgivare: 'Arbetsgivare',
    punkter: ['Vad du gjorde, gärna med en siffra', 'Ett ansvar eller ett resultat'],
  },
  utbildning: { utbildning: 'Utbildning eller program', skola: 'Skola' },
  kompetenser: ['Verktyg', 'Metoder', 'Språk', 'Sådant som syns i jobbet'],
}

type Yrke = Omit<Spoktext, 'erfarenhet' | 'profil'> & {
  profil: (t: string) => string
  arbetsgivare: string
  punkter: [string, string]
}

const UTB = SPOK_GENERISK.utbildning

/** Exemplen per yrkesområde. Titeln sätts in där yrket står. */
const YRKE: Record<Exclude<UppsattningId, 'allman'>, Yrke> = {
  butik: {
    profil: (t) => `${t} med vana vid kundmöten och försäljning, som söker en roll med mer ansvar.`,
    arbetsgivare: 'Butiken AB',
    punkter: ['Hur många kunder du mötte per dag, och vad du sålde', 'Ett mål du nådde eller ett ansvar du hade'],
    utbildning: UTB,
    kompetenser: ['Kundbemötande', 'Kassasystem', 'Merförsäljning', 'Varuexponering'],
  },
  vard: {
    profil: (t) => `${t} med erfarenhet av omvårdnad och patientnära arbete, som söker en tjänst med kontinuitet.`,
    arbetsgivare: 'Regionen eller kommunen',
    punkter: [
      'Vilken avdelning eller verksamhet, och hur många patienter eller brukare',
      'Ett ansvarsområde, till exempel läkemedel eller dokumentation',
    ],
    utbildning: { utbildning: 'Vård- och omsorgsprogrammet', skola: 'Skola' },
    kompetenser: ['Omvårdnad', 'Dokumentation', 'Läkemedelshantering', 'Bemötande'],
  },
  it: {
    profil: (t) => `${t} som bygger och förvaltar system, och söker ett team där kvaliteten räknas.`,
    arbetsgivare: 'Företaget AB',
    punkter: ['Vad du byggde och med vilka verktyg', 'Ett resultat, till exempel snabbare laddning eller färre fel'],
    utbildning: { utbildning: 'Systemvetenskap eller motsvarande', skola: 'Skola' },
    kompetenser: ['TypeScript', 'Git', 'Molntjänster', 'Testning'],
  },
  bygg: {
    profil: (t) => `${t} med erfarenhet från både nyproduktion och service, som söker ett stadigt arbetslag.`,
    arbetsgivare: 'Byggföretaget AB',
    punkter: ['Vilka typer av projekt, och hur stora', 'En behörighet du använde eller ett ansvar du hade'],
    utbildning: { utbildning: 'Bygg- och anläggningsprogrammet', skola: 'Skola' },
    kompetenser: ['Ritningsläsning', 'Arbetsmiljö', 'Maskinhantering', 'Egenkontroller'],
  },
  lager: {
    profil: (t) => `${t} van vid högt tempo och noggrann plockning, som söker en roll med mer ansvar.`,
    arbetsgivare: 'Logistikföretaget AB',
    punkter: ['Hur många order eller kollin du hanterade per pass', 'Truckkort, system eller ett ansvar du hade'],
    utbildning: UTB,
    kompetenser: ['Truckkort A och B', 'Orderplock', 'Lagersystem', 'Inleverans'],
  },
  ekonomi: {
    profil: (t) => `${t} med vana vid löpande bokföring och bokslut, som söker en roll med mer analys.`,
    arbetsgivare: 'Företaget AB',
    punkter: ['Vilka flöden du ansvarade för, till exempel reskontra eller lön', 'Ett resultat, till exempel ett snabbare bokslut'],
    utbildning: { utbildning: 'Ekonomprogrammet', skola: 'Skola' },
    kompetenser: ['Bokföring', 'Excel', 'Visma eller Fortnox', 'Bokslut'],
  },
  offentlig: {
    profil: (t) => `${t} med erfarenhet av handläggning och utredning, som söker ett uppdrag med samhällsnytta.`,
    arbetsgivare: 'Kommunen',
    punkter: ['Vilka ärenden du handlade, och hur många', 'Ett regelverk du arbetade efter eller ett förbättringsarbete'],
    utbildning: UTB,
    kompetenser: ['Handläggning', 'Förvaltningslagen', 'Utredning', 'Dokumentation'],
  },
  skola: {
    profil: (t) => `${t} som skapar trygga sammanhang för lärande, och söker en skola med tydligt kollegialt arbete.`,
    arbetsgivare: 'Skolan',
    punkter: ['Vilka åldrar eller ämnen, och hur stora grupper', 'Ett ansvar, till exempel mentorskap eller ett projekt'],
    utbildning: { utbildning: 'Lärarprogrammet', skola: 'Universitet eller högskola' },
    kompetenser: ['Lektionsplanering', 'Bedömning', 'Ledarskap i klassrummet', 'Vårdnadshavarkontakt'],
  },
  restaurang: {
    profil: (t) => `${t} van vid högt tempo i kök och servering, som söker ett lag som håller hög kvalitet.`,
    arbetsgivare: 'Restaurangen',
    punkter: ['Hur många gäster eller kuvert per pass', 'Ett ansvar, till exempel egenkontroll eller beställningar'],
    utbildning: { utbildning: 'Restaurang- och livsmedelsprogrammet', skola: 'Skola' },
    kompetenser: ['Livsmedelshygien', 'À la carte', 'Kassasystem', 'Gästbemötande'],
  },
  student: {
    profil: (t) => `${t} som snart tar examen och söker ett första jobb att växa i.`,
    arbetsgivare: 'Extrajobbet eller praktikplatsen',
    punkter: ['Vad du gjorde på extrajobbet eller praktiken', 'Något du lärde dig eller ett ansvar du fick'],
    utbildning: { utbildning: 'Programmet du läser', skola: 'Skola' },
    kompetenser: ['Excel', 'Samarbete', 'Engelska', 'Ansvarstagande'],
  },
  chef: {
    profil: (t) => `${t} som leder team mot tydliga mål, och söker en roll med helhetsansvar.`,
    arbetsgivare: 'Företaget AB',
    punkter: ['Hur många du ledde, och vilket ansvar du hade för budget', 'Ett resultat du drev igenom'],
    utbildning: UTB,
    kompetenser: ['Ledarskap', 'Budgetansvar', 'Förändringsledning', 'Rekrytering'],
  },
}

/** Kundtjänst är ett eget fall i butiksområdet: skissens exempel, ordagrant. */
const KUNDTJANST = /kundtjänst|kundservice|kundsupport|kundmottag/i
const KUNDTJANST_TEXT = {
  profil: (t: string) => `${t} med vana vid telefon och chatt, som söker en roll med mer ansvar.`,
  punkter: ['Hur många ärenden du tog emot per dag, och i vilka kanaler', 'Ett problem du löste eller ett system du lärde dig'] as [
    string,
    string,
  ],
  kompetenser: ['Kundbemötande', 'Ärendesystem', 'Excel', 'Engelska'],
}

/** Spöktexten för en titel: generisk utan titel, annars ur yrkesområdet. */
export function spokFor(titel: string | null | undefined): Spoktext {
  const t = (titel ?? '').replace(/\s+/g, ' ').trim()
  if (t.length < 2) return SPOK_GENERISK
  if (KUNDTJANST.test(t)) {
    return {
      profil: KUNDTJANST_TEXT.profil(t),
      erfarenhet: { titel: t, arbetsgivare: 'Företaget AB', punkter: KUNDTJANST_TEXT.punkter },
      utbildning: UTB,
      kompetenser: KUNDTJANST_TEXT.kompetenser,
    }
  }
  const id = uppsattningForTitel(t)
  if (id === 'allman') {
    return {
      ...SPOK_GENERISK,
      profil: `${t} med erfarenhet från yrket, som söker en roll med mer ansvar.`,
      erfarenhet: { ...SPOK_GENERISK.erfarenhet, titel: t },
    }
  }
  const y = YRKE[id]
  return {
    profil: y.profil(t),
    erfarenhet: { titel: t, arbetsgivare: y.arbetsgivare, punkter: y.punkter },
    utbildning: y.utbildning,
    kompetenser: y.kompetenser,
  }
}

/** Raden med pennan i det tomma profilavsnittet (skissen, punkt 3). */
export const PROFILRAD = {
  forst: 'Fyll gärna i jobben först, så kan Jobbcoachen skriva profilen utifrån dem. Eller skriv själv direkt.',
  erbjud: 'Jobbcoachen kan skriva ett förslag utifrån dina jobb.',
} as const

/** Vad förhandsvisningen ska märka som spöke. */
export interface Spokmarkering {
  /** Avsnitt som bara har exempel. */
  sektioner: Sektion[]
  namn: boolean
  titel: boolean
  /** Raden under profilens exempel, eller null. */
  profilRad: string | null
}

/** De avsnitt som får exempel när de är tomma: de guidade utom språk. */
const MED_EXEMPEL = ['profil', 'erfarenhet', 'utbildning', 'kompetenser'] as const

/** Avsnitten som står som spöken på arket just nu. */
export function spokAvsnitt(cv: CVMetadata): Sektion[] {
  const ut: Sektion[] = MED_EXEMPEL.filter((s) => !harInnehall(cv, s))
  if (!harInnehall(cv, 'sprak')) ut.push('sprak')
  return ut
}

/**
 * CV:t för förhandsvisningen: tomma avsnitt fylls med exempel ur titeln,
 * ett tomt namn blir "Ditt namn". Returnerar också markeringen som
 * renderaren gör grå. Originalet ändras aldrig.
 */
export function medSpok(cv: CVMetadata): { cv: CVMetadata; markering: Spokmarkering } {
  const titel = cv.personalInfo?.title ?? ''
  const s = spokFor(titel)
  const ut: CVMetadata = structuredClone(cv)
  ut.personalInfo = { ...(ut.personalInfo ?? { fullName: '', email: '' }) }
  const sektioner = spokAvsnitt(cv)
  for (const sek of sektioner) {
    if (sek === 'profil') ut.summary = s.profil
    if (sek === 'erfarenhet')
      ut.experience = [
        {
          position: s.erfarenhet.titel,
          company: s.erfarenhet.arbetsgivare,
          location: 'Ort',
          startDate: 'Månad år',
          endDate: 'nu',
          description: [...s.erfarenhet.punkter],
        },
      ]
    if (sek === 'utbildning')
      ut.education = [{ degree: s.utbildning.utbildning, institution: s.utbildning.skola, startDate: 'År', endDate: 'år' }]
    if (sek === 'kompetenser') ut.skills = [{ category: '', skills: [...s.kompetenser] }]
    if (sek === 'sprak') ut.languages = [{ language: 'Svenska', proficiency: 'Modersmål' }]
  }
  const namn = !(ut.personalInfo.fullName ?? '').trim()
  if (namn) ut.personalInfo.fullName = 'Ditt namn'
  const harTitel = Boolean((ut.personalInfo.title ?? '').trim())
  if (!harTitel) ut.personalInfo.title = 'Din titel'
  const profilRad = sektioner.includes('profil') ? (harInnehall(cv, 'erfarenhet') ? PROFILRAD.erbjud : PROFILRAD.forst) : null
  return { cv: ut, markering: { sektioner, namn, titel: !harTitel, profilRad } }
}
