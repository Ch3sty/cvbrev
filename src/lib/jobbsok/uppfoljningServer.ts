/**
 * Uppföljningsmejlet på servern (F5): underlaget, utkastet (AI eller mall),
 * kostnadsloggen och läsningarna rutterna delar.
 *
 * Bara server.
 */
import 'server-only'
import { trackAIUsage } from '@/lib/ai-cost-tracker'
import { kravForBrev } from '@/lib/letters/lage'
import { arPlatshallareNamn } from '@/lib/profile/dokumentKontakt'
import { skrivUppfoljningsmejl, type AiMejlResultat } from '@/lib/openai/uppfoljningsmejl'
import { dagFor, idagSv } from './datum'
import { mallAmne, sattIhop, uppfoljningsmall, valjKompetenser, type Mejl, type UppfoljningUnderlag } from './uppfoljning'
import type { Klient } from './server'
import type { Dag, JobApplication, Uppfoljning, UppfoljningsTyp } from './typer'

export interface UnderlagOchNamn {
  underlag: UppfoljningUnderlag
  /** Namnet i signaturen; sätts in av servern, går aldrig till AI:n. */
  namn: string | null
  /** Kända uppgifter att maska i text användaren skrivit (Skriv om kortare). */
  kanda: { namn: string | null; telefon: string | null; epost: string | null }
}

/**
 * Läser det mejlet byggs av: brevets språk och krav, CV:ts kompetenser och
 * roller, namnet. `moment` är sorten och intervjudagen (omgång 2); utan den
 * blir underlaget för en obesvarad ansökan, som "Skriv om kortare" läser det.
 */
export async function lasUnderlag(
  supabase: Klient,
  userId: string,
  a: JobApplication,
  epost?: string | null,
  moment: { typ: UppfoljningsTyp; momentDag: Dag | null } = { typ: 'ansokan', momentDag: null }
): Promise<UnderlagOchNamn> {
  const [brevRes, cvRes, profilRes] = await Promise.all([
    a.letter_id
      ? supabase.from('letters').select('language, krav, body_stycken, content').eq('id', a.letter_id).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('active_cv_for_matching').select('extracted_skills, extracted_occupations').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('full_name, phone').eq('id', userId).maybeSingle(),
  ])
  const brev = brevRes.data as { language?: string | null; krav?: unknown; body_stycken?: unknown; content?: string | null } | null
  const krav = (brev ? kravForBrev(brev) : null) ?? []
  const cv = cvRes.data as { extracted_skills?: unknown; extracted_occupations?: unknown } | null
  const skills = Array.isArray(cv?.extracted_skills) ? (cv!.extracted_skills as unknown[]).filter((s): s is string => typeof s === 'string') : []
  const roller = Array.isArray(cv?.extracted_occupations)
    ? (cv!.extracted_occupations as Array<{ normalized?: unknown; original?: unknown }>)
        .map((o) => (typeof o?.normalized === 'string' ? o.normalized : typeof o?.original === 'string' ? o.original : ''))
        .filter(Boolean)
    : []
  const profil = profilRes.data as { full_name?: string | null; phone?: string | null } | null
  const namn = profil?.full_name && !arPlatshallareNamn(profil.full_name) ? profil.full_name.trim() : null
  return {
    underlag: {
      jobTitle: a.job_title,
      company: a.company,
      appliedAt: dagFor(a.applied_at) ?? idagSv(),
      kanal: a.application_channel,
      kompetenser: valjKompetenser(skills, roller, krav.map((k) => k.krav)),
      krav: krav.map((k) => k.krav),
      sprak: brev?.language === 'en' ? 'en' : 'sv',
      typ: moment.typ,
      momentDag: moment.typ === 'ansokan' ? null : moment.momentDag,
    },
    namn,
    kanda: { namn, telefon: profil?.phone ?? null, epost: epost ?? null },
  }
}

export interface Utkast {
  mejl: Mejl
  kalla: 'ai' | 'mall'
  ai: AiMejlResultat
}

/** Utkastet: AI först, mallen när AI:n inte svarar i tid eller svaret inte håller. */
export async function skrivUtkast(u: UnderlagOchNamn): Promise<Utkast> {
  const ai = await skrivUppfoljningsmejl(u.underlag)
  if (ai.mejl) {
    // Ämnesraden är alltid mallens ("Min ansökan till tjänsten som ...", rökprovet 2026-11-21):
    // AI:ns egna ämnesrader blev rubrikaktiga ("Uppföljning av ansökan Ekonomiassistent").
    // mallAmne läser sorten ur underlaget, så utkastTyp känner igen raden (omgång 2).
    return { mejl: { subject: mallAmne(u.underlag), body: sattIhop(ai.mejl.stycken, u.underlag.sprak, u.namn) }, kalla: 'ai', ai }
  }
  return { mejl: uppfoljningsmall(u.underlag, u.namn), kalla: 'mall', ai }
}

/** Kostnaden i ai_usage_costs, som CV-byggarens förslag. Bara när modellen faktiskt svarade. */
export async function loggaKostnad(
  supabase: Klient,
  userId: string,
  ai: AiMejlResultat,
  feature: 'uppfoljning_utkast' | 'uppfoljning_kortare',
  endpoint: string
): Promise<void> {
  if (!ai.tokens && ai.cost === null) return
  await trackAIUsage({
    supabase,
    userId,
    featureName: feature,
    endpoint,
    model: ai.model,
    promptTokens: ai.tokens?.prompt ?? 0,
    completionTokens: ai.tokens?.completion ?? 0,
    costUsd: ai.cost ?? 0,
    generationTimeMs: ai.ms,
    metadata: { giltigt: !!ai.mejl, orsak: ai.orsak },
  })
}

/** Uppföljningarna för en tjänst, äldst först (admin-klienten, filtrerat på user_id). */
export async function lasTjanstensUppfoljningar(db: Klient, userId: string, applicationId: string): Promise<{ rader: Uppfoljning[]; error: { code?: string; message?: string } | null }> {
  const { data, error } = await db
    .from('job_application_followups')
    .select('*')
    .eq('user_id', userId)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })
  return { rader: (data ?? []) as Uppfoljning[], error }
}

/** Oskickat utkast, om något. */
export function oskickat(rader: readonly Uppfoljning[]): Uppfoljning | null {
  return [...rader].reverse().find((r) => !r.sent_at) ?? null
}
