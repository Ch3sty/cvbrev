/**
 * All copy för betalväggarna, ordagrant ur docs/plan-paket-och-onboarding.md
 * Fas 2B avsnitt 4 (PW1 till PW7) och de rekommenderade alternativen där.
 *
 * Regeln som gäller alla varianter: den primära knappen föreslår rätt spår,
 * och Allt nämns en gång i brödtexten, aldrig fler. Inga talstreck.
 */

import { suggestPlan, type Feature, type Scope } from '@/lib/access/features'
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT } from '@/lib/cv/template-antal'

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
}

export interface PaywallCopyOpts {
  /** Antal fynd totalt, variant analys. */
  findingsTotal?: number
  /** Antal suddade träffar, variant jobbtraffar. */
  hiddenCount?: number
  /** Kvotnyckel, variant kvot. */
  quotaFeature?: string
  /** Spåret användaren valt i onboardingen. Styr vad knappen föreslår. */
  track?: Scope | null
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
  brev: 'Ett brev per konto, sedan ett i veckan',
  /** GR5, CV-export. */
  export: 'En nedladdning ingår i gratisnivån',
  /** GR6, jobbcoachen. */
  chatt: 'Tio meddelanden per konto ingår',
  /** GR7, jobbmatchningen. */
  jobbtraffar: 'De tre bästa träffarna ingår',
} as const

/**
 * Kvotvarianten används av de funktioner som fortfarande har ett tidsfönster.
 * Rubrik och brödtext byts per funktion så texten är sann, medan knappar och
 * layout är gemensamma. Nyckeln är samma sträng som kvotnyckeln i quota.
 */
export const KVOT_COPY_BY_FEATURE: Record<string, Pick<PaywallCopy, 'title' | 'body' | 'primary'>> = {
  letter_generation: {
    title: 'Ditt brev för veckan är skrivet',
    body: 'Ett brev per konto ingår, sedan ett i veckan. CV-veckan ger brev utan tak, tillsammans med alla mallar och den fulla analysen.',
    primary: 'Ta CV-veckan',
  },
  cv_analysis: {
    title: 'Du har använt din analys',
    body: 'Du har sett det tyngsta fyndet och din läsbarhetspoäng. CV-veckan öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat.',
    primary: 'Se alla åtgärder',
  },
  chat_message: {
    // PW7: gränsen är tio per konto, inte per dag. Rubriken fick därför inte
    // stå kvar som "Dagens meddelanden är slut".
    title: 'Dina tio meddelanden är använda',
    body: 'Tio meddelanden ingår i gratisnivån. Allt-veckan ger chatten utan tak, tillsammans med båda spåren och jobbmatchningen.',
    primary: 'Ta Allt-veckan',
  },
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

export function getPaywallCopy(
  variant: PaywallVariant,
  opts?: PaywallCopyOpts
): PaywallCopy {
  switch (variant) {
    // PW1, alternativ A. Rubriken pekar på mallen användaren just tryckt på,
    // och brödtexten börjar i värdet hon redan ser, alltså förhandsvisningen
    // i full storlek.
    case 'mall':
      return {
        title: 'Den här mallen ingår i CV-veckan',
        body: `Du ser hela mallen som den blir. CV-veckan ger alla ${TEMPLATE_COUNT}, plus brevet och den fulla analysen. Testerna ligger i Allt-veckan.`,
        primary: 'Ta CV-veckan',
        secondary: `Välj bland de ${FREE_TEMPLATE_COUNT} fria`,
      }

    // PW2, alternativ A. Rubriken namnger nivån hon ville in på.
    case 'testniva':
      return {
        title: 'Avancerad nivå ingår i Testveckan',
        body: 'Testveckan ger alla 19 tester, alla nivåer, tidsatt provläge och förklaring till varje fråga. Vill du ha CV-spåret med finns Allt-veckan.',
        primary: 'Ta Testveckan',
        secondary: 'Kör grundnivån igen',
      }

    // PW3, alternativ B, omskriven efter ägarens beslut 2. Den kvitterar vad
    // användaren redan fått innan den säger vad som kostar, och namnger
    // omkörningen, som är det egentliga uttaget.
    case 'analys':
    case 'analys-omkorning':
      return {
        title: 'Åtgärderna ligger i CV-veckan',
        body: 'Du har sett det tyngsta fyndet och din läsbarhetspoäng. CV-veckan öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat.',
        primary: 'Se alla åtgärder',
        secondary: 'Jämför paketen',
      }

    // PW4, alternativ A. Rubriken säger att värdet är levererat innan
    // spärren nämns.
    case 'nedladdning':
      return {
        title: 'Ditt brev är klart',
        body: 'Läs och kopiera det fritt. Nedladdning som PDF och Word ingår i CV-veckan, med alla mallar och full analys. Allt-veckan ger testerna med.',
        primary: 'Ta CV-veckan',
        secondary: 'Kopiera texten i stället',
      }

    // PW5, alternativ B. Första meningen erkänner vad användaren gjort innan
    // den säljer.
    case 'cv-export':
      return {
        title: 'Din gratis nedladdning är använd',
        body: 'Du har laddat ner ett CV. Fler nedladdningar, alla mallar och full analys ingår i CV-veckan. Allt-veckan lägger till testerna.',
        primary: 'Ta CV-veckan',
        secondary: 'Se vad paketen kostar',
      }

    // PW6, alternativ B. Jobbmatchningen finns bara i Allt, så här nämns
    // Allt en gång och inget spår föreslås: inget spår löser spärren.
    case 'jobbtraffar': {
      const n = opts?.hiddenCount ?? 0
      const totalt = n > 0 ? n + 3 : 25
      return {
        title: `Se varför du passar för alla ${totalt}`,
        body: 'Du ser de tre bästa med skälen utskrivna. Allt öppnar resten, med titel, arbetsgivare, ort och varför just du passar.',
        primary: 'Ta Allt-veckan',
        secondary: 'Jämför paketen',
      }
    }

    // PW7, alternativ A. Rubriken säger vad som hänt, bodyn vad som gäller.
    // Menyns gråa val. Brödtexten säger vad funktionen gör och var den finns,
    // en gång, utan att räkna upp resten av paketet.
    case 'linkedin':
      return {
        title: 'LinkedIn-profilen ingår i CV-veckan',
        body: 'Ny rubrik, ny om mig-text och kompetenserna överst, skrivna mot ditt CV så rekryterare hittar dig. Finns i CV-veckan och Allt.',
        primary: 'Ta CV-veckan',
        secondary: 'Inte nu',
      }

    case 'bli-upptackt':
      return {
        title: 'Bli upptäckt ingår i Allt',
        body: 'Din profil visas för rekryterare utan namn tills du själv svarar, och du stänger av när du vill. Finns i Allt.',
        primary: 'Ta Allt-veckan',
        secondary: 'Inte nu',
      }

    case 'chatt':
      return {
        title: 'Dina tio meddelanden är använda',
        body: 'Tio meddelanden ingår i gratisnivån. Allt-veckan ger chatten utan tak, tillsammans med båda spåren och jobbmatchningen.',
        primary: 'Ta Allt-veckan',
        secondary: 'Jämför paketen',
      }

    // Historiken: senaste sessionen är fri, serien är uttaget. Rubriken säger
    // vad hon redan ser, inte vad hon saknar, och brödtexten säger varför
    // serien är värd något (avsnitt 4).
    case 'historik':
      return {
        title: 'Du ser ditt senaste resultat',
        body: 'Testveckan sparar varje försök och ritar upp hur du rör dig över tid, test för test. Det är den kurvan som visar om övningen ger något.',
        primary: 'Ta Testveckan',
        secondary: 'Jämför paketen',
      }

    case 'kvot': {
      const perFeature =
        (opts?.quotaFeature ? KVOT_COPY_BY_FEATURE[opts.quotaFeature] : undefined) ??
        KVOT_COPY_BY_FEATURE.letter_generation
      return { ...perFeature, secondary: 'Påminn mig' }
    }

    case 'test-tak':
      return {
        title: 'Dagens omgång är gjord',
        body: 'Grundnivån är fri en gång per dygn. Testveckan ger alla nivåer, provläget och obegränsat antal försök. Allt-veckan lägger till CV-spåret.',
        primary: 'Ta Testveckan',
        secondary: 'Kom tillbaka imorgon',
      }

    case 'cv-antal':
      return {
        title: 'Du har två sparade CV',
        body: 'Gratisnivån sparar två CV åt gången. CV-veckan sparar så många du vill, med alla mallar och full analys. Allt-veckan ger testerna med.',
        primary: 'Ta CV-veckan',
        secondary: 'Ta bort ett gammalt CV',
      }

    case 'af-rapport':
      // Loggningen ingår i gratisnivån: den bygger användarens historik.
      // Det är uttaget av den färdigställda sammanställningen som kostar,
      // enligt principen gratis att skapa, betalt att ta ut.
      return {
        title: 'Din rapport är sammanställd',
        body: 'Vi har räknat ihop månaden i Arbetsförmedlingens format. Att logga dina ansökningar ingår i gratisnivån. Att hämta ut den färdiga rapporten ingår i Allt-veckan.',
        primary: 'Ta Allt-veckan',
        secondary: 'Se vad paketen kostar',
      }

    case 'nedgraderad':
      return {
        title: 'Din period är slut',
        body: `Allt du skrev och analyserade finns kvar att läsa och kopiera. Nu gäller gratisnivån: ${FREE_TEMPLATE_COUNT} mallar av ${TEMPLATE_COUNT}, ett brev i veckan, och nedladdning ingår i CV-veckan.`,
        primary: 'Se vad paketen kostar',
        secondary: 'Fortsätt gratis',
      }
  }
}

/** Används av testerna: antalet premiummallar ska aldrig stå fel i copyn. */
export const PREMIUM_MALLAR = PREMIUM_TEMPLATE_COUNT
