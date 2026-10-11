/**
 * All copy för betalväggarna, ur docs/plan-paket-och-onboarding.md Fas 2B
 * avsnitt 4 (PW1 till PW7), med namnet och skrivregeln ur
 * docs/design/copy-premium-2026-10-11.md (ägarens beslut 2026-10-11,
 * spec-rummen 17.3 och 17.4).
 *
 * Bara Jobbcoach Premium säljs. Reglerna som gäller alla varianter:
 * rubriken säger Premium ("Mallen ingår i Premium"), prisraden under
 * brödtexten bär fulla namnet ("Jobbcoach Premium, 149 kr i månaden. Säg
 * upp när du vill."), och knappen säger "Köp Premium, 149 kr i månaden"
 * (copy-premium avsnitt 8: fulla namnet ryms inte i knappen på 360 px).
 * Fulla namnet står en gång per yta. Rader om LinkedIn skriver fulla namnet
 * (krock 2). Namn och pris läses ur PLANS. Inga talstreck.
 */

import { suggestPlan, type Feature, type Scope } from '@/lib/access/features'
import type { BetalvaggPlats } from '@/lib/analytics/events'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import {
  PLAN_BY_KEY,
  SALD_PLAN,
  kopKnapp,
  paketKort,
  paketNamn,
  prisPeriod,
  saljbarPlan,
  type PlanKey,
} from '@/lib/plans/plans'

export type PaywallVariant =
  | 'mall'
  | 'testniva'
  | 'analys'
  | 'analys-omkorning'
  | 'nedladdning'
  | 'cv-export'
  | 'jobbtraffar'
  | 'chatt'
  | 'historik'
  // Menyns gråa val (spec-onboarding 2026-09-22, sektion 3 och 5).
  | 'linkedin'
  | 'bli-upptackt'
  // Kvarvarande varianter som inte hör till paketspärrarna.
  | 'kvot'
  | 'test-tak'
  | 'nedgraderad'
  | 'cv-antal'
  | 'af-rapport'

export interface PaywallCopy {
  title: string
  body: string
  primary: string
  secondary: string
  /**
   * Prisraden under brödtexten: "Jobbcoach Premium, 149 kr i månaden. Säg
   * upp när du vill." Den korta formen där fulla namnet redan står i
   * rubriken (LinkedIn).
   */
  prisrad?: string
  /** Paketet knappen och prisraden gäller. Alltid det som säljs. */
  plan?: PlanKey
}

export interface PaywallCopyOpts {
  /** Antal fynd totalt, variant analys. */
  findingsTotal?: number
  /** Antal suddade träffar, variant jobbtraffar. */
  hiddenCount?: number
  /** Kvotnyckel, variant kvot. */
  quotaFeature?: string
  /** Spåret användaren valt i onboardingen. Styr inte längre förslaget. */
  track?: Scope | null
  /** Paketet knappen ska föreslå. Ett osålt paket blir det som säljs. */
  plan?: PlanKey | null
  /**
   * Platsen väggen visas på. Arket från testrummets låsta rader (1f, W3)
   * namnger det låsta efter platsen (art-director 24.2 fråga 1).
   */
  plats?: BetalvaggPlats
}

/** Kortformen, en gång här så att ingen rad hårdkodar ordet. */
const PREMIUM = paketKort()

/**
 * Gratisnivåns rader, GR1 till GR7 (Fas 2B avsnitt 8). Formeln är
 * "{vad} ingår i gratisnivån", och den ska se likadan ut överallt där den
 * går att hålla. Inga utropstecken, aldrig ordet "bara".
 */
export const GRATISRADER = {
  /** GR1, mallgalleriet, över listan. */
  mallar: `${FREE_TEMPLATE_COUNT} mallar ingår i gratisnivån`,
  /** GR2, testhubben. Sant i båda gaterna (spec-rummen 23.3). */
  tester: 'Nivåmätningen och ett första pass ingår',
  /** GR3, CV-analysen, under poängen. */
  analys: 'Poängen och det tyngsta fyndet ingår',
  /** GR4, brevflödet. */
  brev: 'Ett personligt brev per konto, sedan ett i veckan',
  /** GR5, CV-export. */
  export: 'En nedladdning ingår i gratisnivån',
  /** GR6, jobbcoachen. */
  chatt: 'Tio meddelanden per konto ingår',
  /** GR7, jobbmatchningen. */
  jobbtraffar: 'De tre bästa träffarna ingår',
} as const

/** Betalväggens knapp: "Köp Premium, 149 kr i månaden" (copy-premium 8). */
export function skaffaKnapp(plan: PlanKey = SALD_PLAN): string {
  return kopKnapp(saljbarPlan(plan))
}

/**
 * Prisraden under brödtexten, med fulla namnet (copy-premium 3 och 8):
 * "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill."
 */
export function paywallPrisrad(plan: PlanKey = SALD_PLAN): string {
  const p = saljbarPlan(plan)
  return PLAN_BY_KEY[p].mode === 'payment'
    ? `${paketNamn(p)}, ${prisPeriod(p)}. Förnyas inte.`
    : `${paketNamn(p)}, ${prisPeriod(p)}. Säg upp när du vill.`
}

/**
 * Prisraden när fulla namnet redan står i rubriken på samma kort
 * (LinkedIn-väggen, prissidans kort, köpsteget): "149 kr i månaden, säg upp
 * när du vill."
 */
export function paywallPrisradKort(plan: PlanKey = SALD_PLAN): string {
  const p = saljbarPlan(plan)
  return PLAN_BY_KEY[p].mode === 'payment'
    ? `${prisPeriod(p)}, förnyas inte.`
    : `${prisPeriod(p)}, säg upp när du vill.`
}

/** Det som ingår utöver funktionen väggen gäller (ersätter "allt i de andra paketen"). */
const OVRIGT = 'alla CV-mallar, CV-analysen, personliga brev och alla rekryteringstester'

/**
 * Kvotvarianten används av de funktioner som fortfarande har ett tidsfönster.
 * Rubrik och brödtext byts per funktion så texten är sann, medan knappar och
 * layout är gemensamma. Nyckeln är samma sträng som kvotnyckeln i quota.
 */
export function kvotCopy(quotaFeature: string | undefined, plan?: PlanKey | null): Pick<PaywallCopy, 'title' | 'body' | 'primary' | 'plan'> {
  const p = saljbarPlan(plan ?? SALD_PLAN)
  switch (quotaFeature) {
    case 'cv_analysis':
      return {
        title: 'Du har använt din analys',
        body: `Du har sett det tyngsta fyndet och din läsbarhetspoäng. ${PREMIUM} öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat.`,
        primary: skaffaKnapp(p),
        plan: p,
      }
    case 'chat_message':
      // PW7: gränsen är tio per konto, inte per dag. Kortformen i rader om
      // Jobbcoachen, så att "Jobbcoach" inte står två gånger (krock 3).
      return {
        title: 'Dina tio meddelanden är använda',
        body: `Tio meddelanden ingår i gratisnivån. I ${PREMIUM} frågar du Jobbcoachen så mycket du vill.`,
        primary: skaffaKnapp(p),
        plan: p,
      }
    default:
      return {
        title: 'Ditt personliga brev för veckan är skrivet',
        body: `Ett personligt brev per konto ingår, sedan ett i veckan. Med ${PREMIUM} skriver du personliga brev utan tak, med alla mallar och hela CV-analysen.`,
        primary: skaffaKnapp(p),
        plan: p,
      }
  }
}

/**
 * Rubriken i arket från testrummets låsta rader, efter platsen: "Riktade
 * pass ingår i Premium", "Generalrepetitionen ingår i Premium",
 * "Ommätningen ingår i Premium" (strängarna i PASS_COPY.betalvagg). Kurvans
 * lås följer samma mönster, "{Det låsta} ingår i Premium" (copy-premium
 * avsnitt 3). Null utanför testrummets platser (provläget i testhubben
 * behåller variantens rubrik): då gäller variantens egen rubrik.
 */
export function testrumRubrik(plats: BetalvaggPlats | undefined): string | null {
  switch (plats) {
    case 'riktat':
      return `${PASS_COPY.betalvagg.riktat} ${PREMIUM}`
    case 'generalrepetition':
      return `${PASS_COPY.betalvagg.general} ${PREMIUM}`
    case 'ommatning':
      return `${PASS_COPY.betalvagg.ommatning} ${PREMIUM}`
    case 'dag2':
      return `${PASS_COPY.betalvagg.pass} ${PREMIUM}`
    case 'kurva':
      return `Hela kurvan ingår i ${PREMIUM}`
    default:
      return null
  }
}

/** Featuren varje variant spärrar på. Driver mätningen av feature_blocked. */
export const VARIANT_FEATURE: Partial<Record<PaywallVariant, Feature>> = {
  mall: 'cv_templates_all',
  testniva: 'tests_above_base',
  analys: 'cv_analysis_full',
  'analys-omkorning': 'cv_analysis_full',
  nedladdning: 'letter_download',
  'cv-export': 'cv_export',
  jobbtraffar: 'job_matches_all',
  chatt: 'chat_unlimited',
  historik: 'test_history',
  'test-tak': 'tests_above_base',
  linkedin: 'linkedin',
  'bli-upptackt': 'bli_upptackt',
}

/**
 * Paketet knappen ska leda till. Sedan 2026-10-11 alltid det som säljs
 * (suggestPlan ger all_month); varianter utan feature ger null.
 */
export function planForPaywall(
  variant: PaywallVariant,
  opts?: { feature?: Feature; track?: Scope | null }
): string | null {
  const feature = opts?.feature ?? VARIANT_FEATURE[variant]
  if (!feature) return null
  return suggestPlan(feature, opts?.track ?? null)
}

/** Paketet en variant säljer: alltid det som säljs, också på den nedgraderade. */
function planForVariant(_variant: PaywallVariant, opts?: PaywallCopyOpts): PlanKey {
  return saljbarPlan(opts?.plan ?? SALD_PLAN)
}

export function getPaywallCopy(
  variant: PaywallVariant,
  opts?: PaywallCopyOpts
): PaywallCopy {
  const plan = planForVariant(variant, opts)
  const bygg = byggCopy(variant, plan, opts)
  // Arket från testrummets låsta rader namnger det hon tryckte på, och det
  // sekundära är länken "Se vad som ingår", aldrig "Kör grundnivån igen"
  // (art-director 24.2 fråga 1, 24.3 punkt 5).
  const testrum = variant === 'testniva' ? testrumRubrik(opts?.plats) : null
  const copy = testrum ? { ...bygg, title: testrum, secondary: PAKETRADER.jamfor } : bygg
  // LinkedIn-väggen bär fulla namnet i rubriken, så prisraden tar den korta
  // formen och namnet står en gång på kortet (copy-premium 3 och 8).
  const prisrad = variant === 'linkedin' ? paywallPrisradKort(plan) : paywallPrisrad(plan)
  return { ...copy, plan, prisrad }
}

function byggCopy(variant: PaywallVariant, plan: PlanKey, opts?: PaywallCopyOpts): PaywallCopy {
  const knapp = skaffaKnapp(plan)
  const fullt = paketNamn(plan)

  switch (variant) {
    // PW1, alternativ A. Brödtexten börjar i värdet hon redan ser, alltså
    // förhandsvisningen i full storlek.
    case 'mall':
      return {
        title: `Mallen ingår i ${PREMIUM}`,
        body: `Du ser hela mallen som den blir. I ${PREMIUM} får du alla ${TEMPLATE_COUNT}, plus personliga brev, hela CV-analysen och alla rekryteringstester.`,
        primary: knapp,
        secondary: `Välj bland de ${FREE_TEMPLATE_COUNT} fria`,
      }

    // PW2, alternativ A. Rubriken namnger nivån hon ville in på.
    case 'testniva':
      return {
        title: `Avancerad nivå ingår i ${PREMIUM}`,
        body: `${PREMIUM} ger alla 19 tester, alla nivåer, övningsprov mot klockan, det fördjupade personlighetstestet och förklaring till varje fråga.`,
        primary: knapp,
        secondary: 'Kör grundnivån igen',
      }

    // PW3, alternativ B. Den kvitterar vad användaren redan fått innan den
    // säger vad som kostar, och namnger omkörningen, som är uttaget.
    case 'analys':
    case 'analys-omkorning':
      return {
        title: `Åtgärderna ingår i ${PREMIUM}`,
        body: `Du har sett det tyngsta fyndet och din läsbarhetspoäng. ${PREMIUM} öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat.`,
        primary: knapp,
        secondary: 'Se vad som ingår',
      }

    // PW4, alternativ A. Rubriken säger att värdet är levererat innan
    // spärren nämns.
    case 'nedladdning':
      return {
        title: 'Ditt personliga brev är klart',
        body: `Läs och kopiera det fritt. Nedladdning som PDF och Word ingår i ${PREMIUM}, med alla mallar och hela CV-analysen.`,
        primary: knapp,
        secondary: 'Kopiera texten i stället',
      }

    // PW5, alternativ B. Första meningen erkänner vad användaren gjort innan
    // den säljer.
    case 'cv-export':
      return {
        title: 'Din gratis nedladdning är använd',
        body: `Du har laddat ner ett CV. Fler nedladdningar, alla mallar och hela CV-analysen ingår i ${PREMIUM}.`,
        primary: knapp,
        secondary: 'Se priset',
      }

    // PW6, alternativ B.
    case 'jobbtraffar': {
      const n = opts?.hiddenCount ?? 0
      const totalt = n > 0 ? n + 3 : 25
      return {
        title: `Se varför du passar för alla ${totalt}`,
        body: `Du ser de tre bästa med skälen utskrivna. ${PREMIUM} öppnar resten, med titel, arbetsgivare, ort och varför just du passar.`,
        primary: knapp,
        secondary: 'Se vad som ingår',
      }
    }

    // Menyns gråa val. LinkedIn har en egen Premium, så raden skriver fulla
    // namnet (krock 2), och prisraden tar den korta formen.
    case 'linkedin':
      return {
        title: `LinkedIn-optimeringen ingår i ${fullt}`,
        body: 'Ny rubrik, ny om mig-text och kompetenserna överst, skrivna mot ditt CV så rekryterare hittar dig.',
        primary: knapp,
        secondary: 'Inte nu',
      }

    case 'bli-upptackt':
      return {
        title: `Bli upptäckt ingår i ${PREMIUM}`,
        body: 'Din profil visas för rekryterare utan namn tills du själv svarar, och du stänger av när du vill.',
        primary: knapp,
        secondary: 'Inte nu',
      }

    // PW7, alternativ A. Rubriken säger vad som hänt, brödtexten vad som gäller.
    case 'chatt':
      return {
        title: 'Dina tio meddelanden är använda',
        body: `Tio meddelanden ingår i gratisnivån. I ${PREMIUM} frågar du Jobbcoachen så mycket du vill, med jobbmatchningen, ${OVRIGT}.`,
        primary: knapp,
        secondary: 'Se vad som ingår',
      }

    // Historiken: senaste sessionen är fri, serien är uttaget.
    case 'historik':
      return {
        title: 'Du ser ditt senaste resultat',
        body: `${PREMIUM} sparar varje försök och ritar upp hur du rör dig över tid, test för test. Det är den kurvan som visar om övningen ger något.`,
        primary: knapp,
        secondary: 'Se vad som ingår',
      }

    case 'kvot': {
      const k = kvotCopy(opts?.quotaFeature, plan)
      return { title: k.title, body: k.body, primary: k.primary, secondary: 'Påminn mig' }
    }

    case 'test-tak':
      return {
        title: 'Dagens omgång är gjord',
        body: `${PREMIUM} ger alla nivåer, övningsprov och obegränsat antal försök.`,
        primary: knapp,
        secondary: 'Kom tillbaka i morgon',
      }

    case 'cv-antal':
      return {
        title: 'Du har två sparade CV',
        body: `Gratisnivån sparar två CV åt gången. Med ${PREMIUM} sparar du så många du vill, med alla mallar och hela CV-analysen.`,
        primary: knapp,
        secondary: 'Ta bort ett gammalt CV',
      }

    case 'af-rapport':
      // Loggningen ingår i gratisnivån: den bygger användarens historik.
      // Det är uttaget av den färdigställda sammanställningen som kostar.
      return {
        title: 'Din rapport är sammanställd',
        body: `Vi har räknat ihop månaden i Arbetsförmedlingens format. Att logga dina sökta tjänster ingår i gratisnivån. Att hämta ut den färdiga rapporten ingår i ${PREMIUM}.`,
        primary: knapp,
        secondary: 'Se priset',
      }

    case 'nedgraderad':
      return {
        title: 'Din period är slut',
        body: `Allt du skrev och analyserade finns kvar att läsa och kopiera. Nu gäller gratisnivån: ${FREE_TEMPLATE_COUNT} mallar av ${TEMPLATE_COUNT}, ett personligt brev i veckan, och nedladdning ingår i ${PREMIUM}.`,
        primary: knapp,
        secondary: 'Fortsätt gratis',
      }
  }
}

/** Används av testerna: antalet premiummallar ska aldrig stå fel i copyn. */
export const PREMIUM_MALLAR = PREMIUM_TEMPLATE_COUNT

/** Kvar för bakåtkompatibilitet: kvotcopyn per nyckel. */
export const KVOT_COPY_BY_FEATURE: Record<string, Pick<PaywallCopy, 'title' | 'body' | 'primary'>> = {
  letter_generation: kvotCopy('letter_generation'),
  cv_analysis: kvotCopy('cv_analysis'),
  chat_message: kvotCopy('chat_message'),
}

/* ------------------------------------------------ låsta rader och brickor */

/**
 * Raderna där gränssnittet säger att något ingår i Premium (copy-premium
 * avsnitt 3). En knapp säger "Köp Premium, 149 kr i månaden", en låst rad
 * "Ingår i Premium", en bricka på en mall eller ett typsnitt "Premium".
 * Rader som nämner LinkedIn skriver fulla namnet (krock 2).
 */
export const PAKETRADER = {
  ingar: `Ingår i ${PREMIUM}`,
  ingarUtanTak: `Ingår i ${PREMIUM}, utan tak`,
  bricka: PREMIUM,
  /** Köpknappen. Namnet är historiskt; den säljer Premium. */
  kopCv: skaffaKnapp(SALD_PLAN),
  jamfor: 'Se vad som ingår',
  mallSparr: `Mallen ingår i ${PREMIUM}. Välj en annan mall eller spara utan PDF.`,
  mallIngar: `Den här mallen ingår i ${PREMIUM}.`,
  mallarRubrik: `Mallar i ${PREMIUM}`,
  mallarGratisOchPaket: `Gratis eller i ${PREMIUM}`,
  lastCv: `Låst. Ingår i ${PREMIUM}.`,
  cvFullt: (max: number) =>
    `Du har nått din gräns på ${max} sparade CV. Radera ett befintligt CV för att spara det nya. Med ${PREMIUM} sparar du upp till 50 CV.`,
  cvFulltKort: `Ta bort ett gammalt CV för att spara fler. Med ${PREMIUM} sparar du upp till 50.`,
  cvUtanGrans: (antal: number) => `${antal} sparade CV. Utan tak i ${PREMIUM}.`,
  cvGrans: (max: number) =>
    `Du har nått din gräns på ${max} CV. Ta bort ett CV för att skapa ett nytt. Med ${PREMIUM} sparar du upp till 50.`,
  cvFler: `Med ${PREMIUM} sparar du upp till 50 CV.`,
  uppladdning: `Som gratisanvändare kan du ladda upp två CV. Fler CV ingår i ${PREMIUM}.`,
  analysUtanTak: `Du har ${PREMIUM}. Analysera så ofta du vill.`,
  linkedinKvot: `Du har använt din veckokvot. LinkedIn-optimeringen utan tak ingår i ${paketNamn(SALD_PLAN)}.`,
  paketAktivt: `Du har ${PREMIUM}`,
  tackTitel: (namn: string | null) => `Tack. Du har ${namn ?? paketNamn(SALD_PLAN)}.`,
  tackOkant: (datum: string | null) =>
    datum ? `${PREMIUM} gäller till och med ${datum}.` : `Allt i ${PREMIUM} är öppet.`,
  aktivitetKop: `köpte ${paketNamn(SALD_PLAN)}`,
  tillgangTill: (datum: string) => `${PREMIUM} gäller fram till ${datum}`,
  aterAktivera: `Du har redan en prenumeration som löper ut vid periodens slut. Vill du behålla ${PREMIUM} kan du återaktivera den i prenumerationsportalen.`,
  belonning: (dagar: number) => `Du har fått ${paketNamn(SALD_PLAN)} i ${dagar} ${dagar === 1 ? 'dag' : 'dagar'}.`,
  belonningEnDag: `Din belöning, en dag med ${paketNamn(SALD_PLAN)}, aktiveras automatiskt.`,
  mallarIPaketet: `CV-mallar som ingår i ${PREMIUM}`,
  exportGratis: `Ett CV, sedan ${PREMIUM}`,
} as const
