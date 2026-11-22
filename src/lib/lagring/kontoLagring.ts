// src/lib/lagring/kontoLagring.ts
//
// Det appen själv lägger i webbläsarens localStorage och sessionStorage, och
// vad som ska bort när kontot loggar ut (klicktestet på live 2026-11-22:
// nycklar från två tidigare konton låg kvar efter utloggningen).
//
// Två slags nycklar:
//   kontots      utkast, sparade svar, en sammanfattning per konto, val i
//                vyerna. Tas bort vid utloggning och när ett annat konto
//                loggar in i samma webbläsare.
//   webbläsarens temat, hemskärmsfrågan (PWA), appens notisfråga, varifrån
//                registreringen startade och besökarens demoräkning. Står
//                kvar. Cookiesamtycket är en cookie och rörs inte här, och
//                Supabase (sb-*) och mätningen (ph_*, _ga) sköter sina egna.
//
// Varje nyckel som appen skriver ska stå i en av listorna nedan; testet
// src/lib/lagring/__tests__/kontoLagring.test.ts läser källkoden och fäller
// sviten när en ny fil börjar skriva i lagringen utan att stå här.
//
// Ägaren: nyckeln jc_lagring_agare bär id:t på kontot vars data ligger i
// webbläsaren. Loggar ett annat konto in rensas kontots nycklar först, så att
// ett nytt konto aldrig får ett tidigare kontos utkast. Saknas ägaren (en
// besökare utan konto har fyllt i något) står utkasten kvar och följer med in
// i det nya kontot, vilket är hela poängen med dem.

/** Kontots nycklar, exakt namn. */
export const KONTOTS_NYCKLAR: readonly string[] = [
  // Utkast och besökarens arbete på väg in i kontot (publikt omgång 3).
  'jc_cv_prova',
  'jc_jobb_prova',
  'jc_sokt_prova',
  'jc_sokt_forifyllt',
  'jc_coach_fraga',
  'jc_brev_annons',
  'jc_pending_draft',
  'jc_pending_draft_val',
  'jc_pending_cv_start',
  'jc_pending_test',
  'jc_pending_intervju',
  'jc_pending_personlighet',
  'jc_prova_resultat_v2',
  'jc_smakprov_aktiv',
  'jobbcoach-cover-letter-prefill',
  'jobbcoach_cv_bygg_reserv',
  'jobbcoach_recruiter_application_draft',
  'arbetsstil-star-v1',
  // Samtal, val och stängda rutor i kontot.
  'jobbcoachen_conversation_id',
  'jc_profil_komplettering_snoozed_at',
  'jc_downgraded_notice_dismissed',
  'jobbcoach_bli_upptackt_collapsed',
  'jc_recruiter_msg_templates',
  'jc_recruiter_msg_last',
  'jc_recruiter_panel_open',
  'jc_mall_tips_sett',
  'jc_cv3_avsnitt_tips',
  'jc_komigang_dold',
  'intervjufraga_ihop',
  'sokta_tjanster_backfill_snoozed_until',
  'v4_hem_visad',
  'v4_plankort_ihop',
  'nasta-steg-follow-up-until',
  'nasta-steg-af-until',
  'nasta-steg-interview-rewrite-until',
  'nasta-steg-personality-full-until',
  'tjanstfraga_test',
  'hjalp_dold',
  'password_prompt_dismissed',
  'flodesdjup',
  'flodeFran',
  'jc_flodets_ursprung',
  // Zustand-lagret med persist (src/store/cv-store.ts).
  'cv-store',
]

/** Kontots nycklar, början på namnet. */
export const KONTOTS_PREFIX: readonly string[] = [
  'dashboard_summary_v1_',
  'jobbmatchning:senaste:',
  'flow:',
  'v4_hint_visad:',
  'v4_hint_stangd:',
  'feature-spotlight-dismissed-',
  'jobbcoach_uiflag_',
  'jc_smakprov_',
]

/** Webbläsarens nycklar, som står kvar. Listade för att klassningen ska vara uttalad. */
export const WEBBLASARENS_NYCKLAR: readonly string[] = [
  'tema',
  'jc_pwa_dismissed_at',
  'jc_pwa_installed',
  'jc_pwa_first_seen_at',
  'jc_signup_entry',
  'jobbcoachen_demo_messages',
  'tk-notisfraga',
  'tk-startlank',
  'testklar.onboarding',
  'kampanj_nu',
]
export const WEBBLASARENS_PREFIX: readonly string[] = ['jc_sticky_dismissed:']

/** Kontot vars data ligger i webbläsaren. */
export const AGARE_NYCKEL = 'jc_lagring_agare'

export function horTillKontot(nyckel: string): boolean {
  if (WEBBLASARENS_NYCKLAR.includes(nyckel) || WEBBLASARENS_PREFIX.some((p) => nyckel.startsWith(p))) return false
  if (nyckel === AGARE_NYCKEL) return true
  return KONTOTS_NYCKLAR.includes(nyckel) || KONTOTS_PREFIX.some((p) => nyckel.startsWith(p))
}

/** Lagringen, eller null när den inte går att nå (privat läge, servern). */
function lagring(typ: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window[typ] ?? null
  } catch {
    return null
  }
}

function nycklarI(s: Storage): string[] {
  const ut: string[] = []
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i)
    if (k !== null) ut.push(k)
  }
  return ut
}

/**
 * Tar bort kontots nycklar ur båda lagringarna. Returnerar hur många som
 * togs bort. Kastar aldrig: utloggningen får inte stoppas av lagringen.
 */
export function rensaKontoLagring(): number {
  let antal = 0
  for (const typ of ['localStorage', 'sessionStorage'] as const) {
    const s = lagring(typ)
    if (!s) continue
    try {
      for (const k of nycklarI(s)) {
        if (horTillKontot(k)) {
          s.removeItem(k)
          antal++
        }
      }
    } catch {
      // Blockerad lagring: inget mer att göra.
    }
  }
  return antal
}

/** Utloggning: kontots nycklar bort, ägaren bort. */
export function vidUtloggning(): void {
  rensaKontoLagring()
}

/**
 * Ett konto är inloggat. Är ett annat konto ägare rensas dess nycklar först
 * (också besökarens utkast, som kan vara det förra kontots). Utan ägare står
 * besökarens utkast kvar för det nya kontot.
 */
export function vidInloggning(userId: string): void {
  const s = lagring('localStorage')
  if (!s || !userId) return
  try {
    const agare = s.getItem(AGARE_NYCKEL)
    if (agare && agare !== userId) rensaKontoLagring()
    s.setItem(AGARE_NYCKEL, userId)
  } catch {
    // Blockerad lagring: inget att skydda.
  }
}

/**
 * Ingen session i webbläsaren (cookien borta eller sessionen ogiltig). Fanns
 * en ägare har kontot loggats ut utan att den här fliken märkte det (en annan
 * flik, en utgången session): rensa nu, innan besökaren hinner fylla i något
 * nytt som ska följa med till nästa konto.
 */
export function utanSession(): void {
  const s = lagring('localStorage')
  if (!s) return
  try {
    if (s.getItem(AGARE_NYCKEL)) rensaKontoLagring()
  } catch {
    // Se ovan.
  }
}
