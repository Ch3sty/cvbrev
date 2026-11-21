/**
 * Dina brev: all första data i en parallell omgång på servern (BYGGSPEC
 * avsnitt 7). Brevlistan med lås och kvot (motorn), avsändaren, CV:na,
 * antalet sökta tjänster och högst tre jobb ur matchningarna. Breven ritas
 * här till miniatyrer (en CSS per brev, delad mellan bilderna), så att
 * första HTML:en är hela sidan och ingen rundtur behövs efter hydreringen.
 *
 * Bara server.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { hamtaBrevlista, hamtaBrevProfil, ritaRad, type BrevIListan } from '@/lib/letters/server'
import { nastaSteg, brevetsVag, kravForBrev, type NastaSteg, type BrevetsVag } from '@/lib/letters/lage'
import { kravMatt } from '@/lib/letters/krav'
import { brevDataFranBrev, titelUrStrukturerad, type BrevProfil } from '@/lib/letters/brevData'
import { ritaBrevHtml } from '@/lib/letters/ritaBrev'
import { exempelBrev } from '@/lib/letters/brevmall/exempel'
import { brevMallKort, BREV_FORVALD_MALL } from '@/lib/letters/brevmall/katalog'
import { brevMallDef, brevGransMm, uppskattadHojd } from '@/lib/letters/brevmall/render'
import { cvMallUrStrukturerad } from '@/lib/letters/brevRegler'
import { DOCX_TEMPLATES, type DocxTemplateId } from '@/lib/letters/docx-templates'
import type { BrevKrav } from '@/lib/letters/brevmall/typer'
import type { BrevKvot } from '@/lib/letters/brevKvot'
import { getActiveCvIds } from '@/lib/cv/cv-quota'
import { CV_GRANS_BETALT, CV_GRANS_GRATIS } from '@/lib/supabase/premiumAccess'
import { buildMatchReasons } from '@/app/dashboard/jobbmatchning/data/match-reasons'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import { toJobPreferences } from '@/types/user.types'
import { hamtaBasta } from '@/lib/jobmatching/sammanfattning.server'
import { arkKalla, type ArkKalla } from './Miniatyr'
import { jobbTagg, sistaDag, skalRad } from './text'

type Klient = SupabaseClient<any, any, any>

export interface HemCv {
  id: string
  namn: string
  created_at: string
}

export interface HemJobb {
  id: string
  tagg: string
  sistaDag: string | null
  titel: string
  foretag: string
  ort: string | null
  skal: string | null
  /** Annonsen som den går med till Skriv (samma sammanställning som matchningarna). */
  annons: string
  annonsUrl: string | null
}

export interface HemMallInfo {
  /** Brevets mall (id i katalogen) eller null för gamla brev. */
  id: string | null
  namn: string
  /** CV:ts mall, om den går att läsa ut. */
  cvMallId: string | null
  cvMallNamn: string | null
  samma: boolean
}

export interface HemMatt {
  brevId: string
  foretag: string | null
  krav: { antal: number; medSvar: number; saknade: string[] } | null
  ord: number
  /** Del av en sida (över 1: sida två). */
  andel: number
  mall: HemMallInfo
}

export interface DinaBrevData {
  harBetalt: boolean
  kvot: BrevKvot
  steg: NastaSteg
  brev: BrevIListan[]
  /** Brevet panelen och väggen handlar om (nästa steg, annars det senaste). */
  fokus: BrevIListan | null
  vag: BrevetsVag | null
  matt: HemMatt | null
  /** Miniatyrernas källor per brev-id, plus 'exempel', 'bakom-1', 'bakom-2'. */
  ark: Record<string, ArkKalla>
  cvs: HemCv[]
  lastaCvIds: string[]
  valtCv: HemCv | null
  antalSokta: number
  jobb: HemJobb[]
}

const JOBB_ATT_LASA = 12

function rensaFilnamn(namn: string): string {
  return namn.replace(/\.(pdf|docx?|txt|json)$/i, '').trim() || namn
}

function norm(t: unknown): string {
  return String(t ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Annonstexten till Skriv, samma sammanställning som JobbmatchningClient (buildJobText). */
function annonsText(job: Record<string, any>): string {
  const delar: string[] = []
  if (job.headline) delar.push(String(job.headline))
  if (job.employer?.name) delar.push(`Arbetsgivare: ${job.employer.name}`)
  const ort = job.workplace_address?.municipality || job.workplace_address?.region
  if (ort) delar.push(`Ort: ${ort}`)
  const text = job.description?.text ?? job.description?.text_formatted ?? ''
  if (text) delar.push(String(text))
  return delar.join('\n\n')
}

function arDokument(html: string | null | undefined): html is string {
  return !!html && /<html[\s>]|<!doctype/i.test(html)
}

function gammalMallNamn(templateId: string | null | undefined): string {
  const t = templateId && templateId in DOCX_TEMPLATES ? DOCX_TEMPLATES[templateId as DocxTemplateId] : DOCX_TEMPLATES.classic
  return t.name
}

/** Hur stor del av en sida brevet fyller, med brevmallens egen uppskattning. */
function langdAndel(brev: BrevIListan, profil: BrevProfil | null): { ord: number; andel: number } {
  const data = brevDataFranBrev(brev, profil)
  const ord = data.stycken.reduce((n, s) => n + s.split(/\s+/).filter((o) => /[\p{L}\p{N}]/u.test(o)).length, 0)
  const def = brevMallDef(brev.mall_id ?? BREV_FORVALD_MALL)
  const grans = brevGransMm(def)
  const ryms = uppskattadHojd(def, data, 2) <= grans
  const andel = ryms ? Math.min(1, uppskattadHojd(def, data, 0) / grans) : uppskattadHojd(def, data, 2) / grans
  return { ord, andel }
}

export async function hamtaDinaBrev(supabase: Klient, userId: string, valtCvId: string | null): Promise<DinaBrevData> {
  const [lista, avsandare, cvRes, soktaRes, aktivtCvRes, prefRes] = await Promise.all([
    hamtaBrevlista(supabase, userId),
    hamtaBrevProfil(supabase, userId),
    supabase
      .from('cv_texts')
      .select('id, file_name, created_at, bygge:structured_data->bygge, pi:structured_data->personalInfo')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('active_cv_for_matching').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('job_preferences').eq('id', userId).maybeSingle(),
  ])

  const { brev, harBetalt, kvot } = lista
  const profil = avsandare.profil as BrevProfil | null

  // CV:na. Titeln ur CV:t följer med avsändaren i exempelbrevet.
  const cvRader = (cvRes.data ?? []) as Array<{ id: string; file_name: string; created_at: string; bygge: { mall?: unknown } | null; pi: unknown }>
  const cvs: HemCv[] = cvRader.map((c) => ({ id: c.id, namn: rensaFilnamn(c.file_name), created_at: c.created_at ?? '' }))
  const aktiva = getActiveCvIds(cvs, harBetalt ? CV_GRANS_BETALT : CV_GRANS_GRATIS)
  const lastaCvIds = cvs.filter((c) => !aktiva.has(c.id)).map((c) => c.id)

  const sokta = new Set(brev.filter((b) => b.ansokanId).map((b) => b.id))
  const steg = nastaSteg({ brev, sokta, harCv: cvs.length > 0, harBetalt })
  const fokus = (steg.brevId ? brev.find((b) => b.id === steg.brevId) : brev[0]) ?? null
  const vag = fokus ? (steg.vag ?? brevetsVag(fokus, sokta.has(fokus.id))) : null

  // CV:t breven bygger på: det valda, annars det senaste brevets, annars det nyaste.
  const senasteCvId = brev.find((b) => b.cv_id)?.cv_id ?? null
  const valtCv =
    cvs.find((c) => c.id === valtCvId && !lastaCvIds.includes(c.id)) ?? cvs.find((c) => c.id === senasteCvId) ?? cvs.find((c) => !lastaCvIds.includes(c.id)) ?? null
  const valtCvRad = valtCv ? cvRader.find((c) => c.id === valtCv.id) : null

  // Miniatyrerna: de första breven i listan, fokusbrevet i två andra mallar
  // bakom i bunten, och exempelbrevet när inget brev finns.
  const ark: Record<string, ArkKalla> = {}
  let n = 0
  const nyttScope = () => `bm-hem-${n++}`
  const htmlFor = (b: BrevIListan) => (arDokument(b.content) ? b.content : ritaRad(b, profil))
  for (const b of brev.slice(0, 40)) ark[b.id] = arkKalla(htmlFor(b), nyttScope())

  if (fokus) {
    const data = brevDataFranBrev(fokus, profil)
    const andra = ['koppar', 'kalksten', 'bjork'].filter((m) => m !== fokus.mall_id).slice(0, 2)
    andra.forEach((m, i) => {
      ark[`bakom-${i + 1}`] = arkKalla(ritaBrevHtml({ mall_id: m }, data), nyttScope())
    })
  } else {
    const titel = titelUrStrukturerad(valtCvRad ? { personalInfo: valtCvRad.pi } : null)
    const avs = profil
      ? { ...brevDataFranBrev({}, profil).avsandare, titel: titel ?? profil.titel ?? null }
      : undefined
    const ex = exempelBrev('normal', avs)
    const cvMall = cvMallUrStrukturerad(valtCvRad ? { bygge: valtCvRad.bygge } : null)
    const mall = cvMall && brevMallKort(cvMall)?.niva === 'gratis' ? cvMall : BREV_FORVALD_MALL
    ark.exempel = arkKalla(ritaBrevHtml({ mall_id: mall }, ex), nyttScope())
    ark['bakom-1'] = arkKalla(ritaBrevHtml({ mall_id: mall === 'koppar' ? 'kalksten' : 'koppar' }, ex), nyttScope())
  }

  // Måtten på fokusbrevet.
  let matt: HemMatt | null = null
  if (fokus) {
    const krav: BrevKrav[] | null = fokus.kravTraffar ?? kravForBrev(fokus)
    const km = kravMatt(krav)
    const { ord, andel } = langdAndel(fokus, profil)
    const brevetsCv = cvRader.find((c) => c.id === fokus.cv_id) ?? valtCvRad ?? null
    const cvMallId = cvMallUrStrukturerad(brevetsCv ? { bygge: brevetsCv.bygge } : null)
    const mallId = fokus.mall_id ?? null
    matt = {
      brevId: fokus.id,
      foretag: fokus.company?.trim() || null,
      krav: km ? { antal: km.antal, medSvar: km.medSvar, saknade: (krav ?? []).filter((k) => !k.citat).map((k) => k.krav) } : null,
      ord,
      andel,
      mall: {
        id: mallId,
        namn: mallId ? (brevMallKort(mallId)?.namn ?? 'Linne') : gammalMallNamn(fokus.template_id),
        cvMallId,
        cvMallNamn: cvMallId ? (brevMallKort(cvMallId)?.namn ?? null) : null,
        samma: !!mallId && mallId === cvMallId,
      },
    }
  }

  // Jobben: de bästa träffarna (samma väg som Översikt och Matchade jobb:
  // sammanfattningen, annars hela körningen, med ort och avstånd) som
  // användaren inte har skrivit brev till.
  const jobb: HemJobb[] = []
  const aktivtCv = (aktivtCvRes.data ?? null) as ActiveCVData | null
  const prefs = toJobPreferences((prefRes.data as { job_preferences?: unknown } | null)?.job_preferences)
  const basta = await hamtaBasta(supabase, userId, aktivtCv, prefs).catch((err) => {
    console.error('[brev] Kunde inte läsa de bästa träffarna:', err)
    return null
  })
  if (basta) {
    const skrivna = new Set(brev.map((b) => `${norm(b.company)}|${norm(b.job_title)}`))
    const orter = prefs.locations
    for (let i = 0; i < basta.ranked.length && i < JOBB_ATT_LASA && jobb.length < 3; i++) {
      const job = basta.ranked[i].job as Record<string, any> | null
      if (!job || !job.headline) continue
      const foretag = String(job.employer?.name ?? '').trim()
      if (skrivna.has(`${norm(foretag)}|${norm(job.headline)}`)) continue
      let skal: string | null = null
      if (aktivtCv) {
        const { reasons, score } = buildMatchReasons(job, aktivtCv, orter)
        skal = skalRad(reasons.filter((r) => r !== score.locationLabel && r !== 'Distans' && r !== 'Liknar din bakgrund'))
      }
      jobb.push({
        id: String(job.id ?? i),
        tagg: jobbTagg(job.publication_date) ?? 'Matchning',
        sistaDag: sistaDag(job.application_deadline),
        titel: String(job.headline),
        foretag,
        ort: job.workplace_address?.municipality || job.workplace_address?.region || null,
        skal,
        annons: annonsText(job),
        annonsUrl: job.application_details?.url || job.application_url || job.webpage_url || null,
      })
    }
  }

  return {
    harBetalt,
    kvot,
    steg,
    brev,
    fokus,
    vag,
    matt,
    ark,
    cvs,
    lastaCvIds,
    valtCv,
    antalSokta: soktaRes.count ?? 0,
    jobb,
  }
}
