/**
 * All copy för betalväggarna, ur docs/plan-paket-och-onboarding.md Fas 2B
 * avsnitt 4 (PW1 till PW7), med namnen och reglerna ur
 * docs/rapporter/beslut-paketnamn-2026-09-24.md.
 *
 * Reglerna som gäller alla varianter: den primära knappen föreslår rätt
 * paket med verbet Skaffa, namnet, pris och period ("Skaffa CV-paketet, 79 kr
 * i veckan"). Rubriker som nämner ett paket bär pris och period i samma
 * sträng (R1). Under brödtexten står en fast prisrad. Hela paketet nämns en
 * gång i brödtexten, aldrig fler. Namnen läses ur PLANS. Inga talstreck.
 */

import { suggestPlan, type Feature, type Scope } from '@/lib/access/features'
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { PLAN_BY_KEY, paketMedPris, paketNamn, prisPeriod, type PlanKey } from '@/lib/plans/plans'

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
   * Prisraden under brödtexten: "79 kr i veckan, säg upp när du vill."
   * Saknas bara när kortet inte säljer ett paket (nedgraderad).
   */
  prisrad?: string
  /** Paketet knappen och prisraden gäller. */
  plan?: PlanKey
}

export interface PaywallCopyOpts {
  /** Antal fynd totalt, variant analys. */
  findingsTotal?: number
  /** Antal suddade träffar, variant jobbtraffar. */
  hiddenCount?: number
  /** Kvotnyckel, variant kvot. */
  quotaFeature?: string
  /** Paketet användaren valt i onboardingen. Styr vad knappen föreslår. */
  track?: Scope | null
  /** Paketet knappen ska föreslå. Utelämnat räknas det ur varianten. */
  plan?: PlanKey | null
}

/**
 * Gratisnivåns rader, GR1 till GR7 (Fas 2B avsnitt 8). Formeln är
 * "{vad} ingår i gratisnivån", och den ska se likadan ut överallt där den
 * går att hålla. Inga utropstecken, aldrig ordet "bara".
 */
export const GRATISRADER = {
  /** GR1, mallgalleriet, över listan. */
  mallar: `${FREE_TEMPLATE_COUNT} mallar ingår i gratisnivån`,
  /** GR2, testhubben, per testtyp. */
  tester: 'Grundnivån är fri, en gång per dygn',
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

/** Betalväggens knapp: "Skaffa CV-paketet, 79 kr i veckan". */
export function skaffaKnapp(plan: PlanKey): string {
  return `Skaffa ${paketMedPris(plan)}`
}

/** Prisraden under brödtexten. Dagspasset förnyas inte, resten sägs upp. */
export function paywallPrisrad(plan: PlanKey): string {
  return PLAN_BY_KEY[plan].mode === 'payment'
    ? `${prisPeriod(plan)}, förnyas inte.`
    : `${prisPeriod(plan)}, säg upp när du vill.`
}

/** Paketet en kvotnyckel naturligt leder till. */
const KVOT_PLAN: Record<string, PlanKey> = {
  letter_generation: 'cv_week',
  cv_analysis: 'cv_week',
  chat_message: 'all_week',
}

/**
 * Kvotvarianten används av de funktioner som fortfarande har ett tidsfönster.
 * Rubrik och brödtext byts per funktion så texten är sann, medan knappar och
 * layout är gemensamma. Nyckeln är samma sträng som kvotnyckeln i quota.
 */
export function kvotCopy(quotaFeature: string | undefined, plan?: PlanKey | null): Pick<PaywallCopy, 'title' | 'body' | 'primary' | 'plan'> {
  const nyckel = quotaFeature && KVOT_PLAN[quotaFeature] ? quotaFeature : 'letter_generation'
  const p = plan ?? KVOT_PLAN[nyckel]
  const cv = paketNamn('cv_week')
  const hela = paketNamn('all_week')
  switch (nyckel) {
    case 'cv_analysis':
      return {
        title: 'Du har använt din analys',
        body: `Du har sett det tyngsta fyndet och din läsbarhetspoäng. ${cv} öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat.`,
        primary: `Se alla åtgärder, ${prisPeriod(p)}`,
        plan: p,
      }
    case 'chat_message':
      // PW7: gränsen är tio per konto, inte per dag. Rubriken fick därför inte
      // stå kvar som "Dagens meddelanden är slut".
      return {
        title: 'Dina tio meddelanden är använda',
        body: `Tio meddelanden ingår i gratisnivån. I ${hela} frågar du Jobbcoachen så mycket du vill, med jobbmatchningen och allt i de andra paketen.`,
        primary: skaffaKnapp(p),
        plan: p,
      }
    default:
      return {
        title: 'Ditt personliga brev för veckan är skrivet',
        body: `Ett personligt brev per konto ingår, sedan ett i veckan. ${cv} ger personliga brev utan tak, tillsammans med alla mallar och den fulla analysen.`,
        primary: skaffaKnapp(p),
        plan: p,
      }
  }
}

/** Featuren varje variant spärrar på. Driver vilket paket som föreslås. */
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
 * Paketet knappen ska leda till. Feature vinner över variant, så en vy som
 * vet exakt vad som spärrade kan säga det.
 */
export function planForPaywall(
  variant: PaywallVariant,
  opts?: { feature?: Feature; track?: Scope | null }
): string | null {
  const feature = opts?.feature ?? VARIANT_FEATURE[variant]
  if (!feature) return null
  return suggestPlan(feature, opts?.track ?? null)
}

/** Paketet en variant säljer när inget annat är känt. */
function planForVariant(variant: PaywallVariant, opts?: PaywallCopyOpts): PlanKey | null {
  if (opts?.plan) return opts.plan
  if (variant === 'nedgraderad') return null
  if (variant === 'af-rapport') return 'all_week'
  if (variant === 'kvot') return opts?.track === 'allt' ? 'all_week' : KVOT_PLAN[opts?.quotaFeature ?? ''] ?? 'cv_week'
  return (planForPaywall(variant, { track: opts?.track ?? null }) as PlanKey | null) ?? 'cv_week'
}

export function getPaywallCopy(
  variant: PaywallVariant,
  opts?: PaywallCopyOpts
): PaywallCopy {
  const plan = planForVariant(variant, opts)
  const copy = byggCopy(variant, plan, opts)
  return plan ? { ...copy, plan, prisrad: paywallPrisrad(plan) } : copy
}

function byggCopy(variant: PaywallVariant, plan: PlanKey | null, opts?: PaywallCopyOpts): PaywallCopy {
  const cv = paketNamn('cv_week')
  const hela = paketNamn('all_week')
  // Knappen och rubriken följer paketet som föreslås. Har hon valt Hela
  // paketet säger rubriken det, fast funktionen också finns i ett mindre.
  const p: PlanKey = plan ?? 'cv_week'
  const namn = paketNamn(p)
  const arHela = PLAN_BY_KEY[p].scope === 'allt'
  const knapp = skaffaKnapp(p)

  switch (variant) {
    // PW1, alternativ A. Rubriken pekar på mallen användaren just tryckt på,
    // och brödtexten börjar i värdet hon redan ser, alltså förhandsvisningen
    // i full storlek.
    case 'mall':
      return {
        title: `Mallen ingår i ${paketMedPris(p)}`,
        body: `Du ser hela mallen som den blir. ${namn} ger alla ${TEMPLATE_COUNT}, plus de personliga breven och den fulla analysen.${arHela ? '' : ` Testerna ligger i ${hela}.`}`,
        primary: knapp,
        secondary: `Välj bland de ${FREE_TEMPLATE_COUNT} fria`,
      }

    // PW2, alternativ A. Rubriken namnger nivån hon ville in på.
    case 'testniva':
      return {
        title: `Avancerad nivå ingår i ${paketMedPris(p)}`,
        body: `${namn} ger alla 19 tester, alla nivåer, tidsatt provläge, det fördjupade personlighetstestet och förklaring till varje fråga.${arHela ? '' : ` Vill du ha CV-mallarna med finns ${hela}.`}`,
        primary: knapp,
        secondary: 'Kör grundnivån igen',
      }

    // PW3, alternativ B, omskriven efter ägarens beslut 2. Den kvitterar vad
    // användaren redan fått innan den säger vad som kostar, och namnger
    // omkörningen, som är det egentliga uttaget.
    case 'analys':
    case 'analys-omkorning':
      return {
        title: `Åtgärderna ligger i ${paketMedPris(p)}`,
        body: `Du har sett det tyngsta fyndet och din läsbarhetspoäng. ${namn} öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat.`,
        primary: `Se alla åtgärder, ${prisPeriod(p)}`,
        secondary: 'Jämför paketen',
      }

    // PW4, alternativ A. Rubriken säger att värdet är levererat innan
    // spärren nämns.
    case 'nedladdning':
      return {
        title: 'Ditt personliga brev är klart',
        body: `Läs och kopiera det fritt. Nedladdning som PDF och Word ingår i ${namn}, med alla mallar och full analys.${arHela ? '' : ` ${hela} ger testerna med.`}`,
        primary: knapp,
        secondary: 'Kopiera texten i stället',
      }

    // PW5, alternativ B. Första meningen erkänner vad användaren gjort innan
    // den säljer.
    case 'cv-export':
      return {
        title: 'Din gratis nedladdning är använd',
        body: `Du har laddat ner ett CV. Fler nedladdningar, alla mallar och full analys ingår i ${namn}.${arHela ? '' : ` ${hela} lägger till testerna.`}`,
        primary: knapp,
        secondary: 'Se vad paketen kostar',
      }

    // PW6, alternativ B. Jobbmatchningen finns bara i Hela paketet, så här
    // nämns det en gång och inget mindre paket föreslås.
    case 'jobbtraffar': {
      const n = opts?.hiddenCount ?? 0
      const totalt = n > 0 ? n + 3 : 25
      return {
        title: `Se varför du passar för alla ${totalt}`,
        body: `Du ser de tre bästa med skälen utskrivna. ${hela} öppnar resten, med titel, arbetsgivare, ort och varför just du passar.`,
        primary: knapp,
        secondary: 'Jämför paketen',
      }
    }

    // Menyns gråa val. Brödtexten säger vad funktionen gör och var den finns,
    // en gång, utan att räkna upp resten av paketet.
    case 'linkedin':
      return {
        title: `LinkedIn-profilen ingår i ${paketMedPris(p)}`,
        body: `Ny rubrik, ny om mig-text och kompetenserna överst, skrivna mot ditt CV så rekryterare hittar dig. Finns i ${cv} och ${hela}.`,
        primary: knapp,
        secondary: 'Inte nu',
      }

    case 'bli-upptackt':
      return {
        title: `Bli upptäckt ingår i ${paketMedPris(p)}`,
        body: 'Din profil visas för rekryterare utan namn tills du själv svarar, och du stänger av när du vill.',
        primary: knapp,
        secondary: 'Inte nu',
      }

    // PW7, alternativ A. Rubriken säger vad som hänt, bodyn vad som gäller.
    case 'chatt':
      return {
        title: 'Dina tio meddelanden är använda',
        body: `Tio meddelanden ingår i gratisnivån. I ${hela} frågar du Jobbcoachen så mycket du vill, med jobbmatchningen och allt i de andra paketen.`,
        primary: knapp,
        secondary: 'Jämför paketen',
      }

    // Historiken: senaste sessionen är fri, serien är uttaget. Rubriken säger
    // vad hon redan ser, inte vad hon saknar, och brödtexten säger varför
    // serien är värd något (avsnitt 4).
    case 'historik':
      return {
        title: 'Du ser ditt senaste resultat',
        body: `${namn} sparar varje försök och ritar upp hur du rör dig över tid, test för test. Det är den kurvan som visar om övningen ger något.`,
        primary: knapp,
        secondary: 'Jämför paketen',
      }

    case 'kvot': {
      const k = kvotCopy(opts?.quotaFeature, plan)
      return { title: k.title, body: k.body, primary: k.primary, secondary: 'Påminn mig' }
    }

    case 'test-tak':
      return {
        title: 'Dagens omgång är gjord',
        body: `Grundnivån är fri en gång per dygn. ${namn} ger alla nivåer, provläget och obegränsat antal försök.${arHela ? '' : ` ${hela} lägger till CV-mallarna.`}`,
        primary: knapp,
        secondary: 'Kom tillbaka imorgon',
      }

    case 'cv-antal':
      return {
        title: 'Du har två sparade CV',
        body: `Gratisnivån sparar två CV åt gången. ${namn} sparar så många du vill, med alla mallar och full analys.${arHela ? '' : ` ${hela} ger testerna med.`}`,
        primary: knapp,
        secondary: 'Ta bort ett gammalt CV',
      }

    case 'af-rapport':
      // Loggningen ingår i gratisnivån: den bygger användarens historik.
      // Det är uttaget av den färdigställda sammanställningen som kostar,
      // enligt principen gratis att skapa, betalt att ta ut.
      return {
        title: 'Din rapport är sammanställd',
        body: `Vi har räknat ihop månaden i Arbetsförmedlingens format. Att logga dina ansökningar ingår i gratisnivån. Att hämta ut den färdiga rapporten ingår i ${hela}.`,
        primary: knapp,
        secondary: 'Se vad paketen kostar',
      }

    case 'nedgraderad':
      return {
        title: 'Din period är slut',
        body: `Allt du skrev och analyserade finns kvar att läsa och kopiera. Nu gäller gratisnivån: ${FREE_TEMPLATE_COUNT} mallar av ${TEMPLATE_COUNT}, ett personligt brev i veckan, och nedladdning ingår i ${cv}.`,
        primary: 'Se vad paketen kostar',
        secondary: 'Fortsätt gratis',
      }
  }
}

/** Används av testerna: antalet premiummallar ska aldrig stå fel i copyn. */
export const PREMIUM_MALLAR = PREMIUM_TEMPLATE_COUNT

/** Kvar för bakåtkompatibilitet: kvotcopyn per nyckel, med standardpaketet. */
export const KVOT_COPY_BY_FEATURE: Record<string, Pick<PaywallCopy, 'title' | 'body' | 'primary'>> = {
  letter_generation: kvotCopy('letter_generation'),
  cv_analysis: kvotCopy('cv_analysis'),
  chat_message: kvotCopy('chat_message'),
}
