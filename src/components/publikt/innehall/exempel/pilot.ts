/**
 * Piloten i SEO-svepet 2026-11-17 (docs/plan-seo-cv-kluster-2026-11-17.md, B3,
 * saas-leads P1 och tillägg 2): fem yrkespar slås ihop till /cv-exempel/<slug>.
 * Exempelsidan tar över yrkesmallsidans innehåll i ett mallblock: tre riktiga
 * miniatyrer, rekryterarens tips, det som ska synas i CV:t, rekryterings-
 * systemen och frågorna. Dubbletter mot exempelsidan visas inte (normaliserad
 * text). Serverdata, ingen React.
 */
import { YRKESMALL_LIST, YRKE_TILL_MALLAR, arPilotSammanslagen, type Yrkesmall } from '@/app/(public)/cv-mallar/yrkesmall-data'
import { FORVALD_MALL_ID, GRATIS_MALL_IDS, MALL_KATALOG, getMallKort } from '@/lib/cv/mallar/katalog'
import { losMallIdEllerForval } from '@/lib/cv/mallar/alias'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { fragor, punkter } from './exempel-data'

/** Jämförelsetext: gemener, bara bokstäver och siffror. */
export function normalisera(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

/**
 * Tre olika mallar, minst en gratis (P1): yrkets gratismall, dess
 * premiummall och den andra gratismallen. Löser premium till en gratismall
 * tas första premiummallen i samma familj ur katalogen.
 */
export function pilotMallar(slug: string): MallKort[] {
  const gamla = YRKE_TILL_MALLAR[slug] ?? { free: FORVALD_MALL_ID, premium: '' }
  const friId = losMallIdEllerForval(gamla.free)
  const fri = getMallKort(friId)?.niva === 'gratis' ? getMallKort(friId)! : getMallKort(FORVALD_MALL_ID)!
  let pre = getMallKort(losMallIdEllerForval(gamla.premium))
  if (!pre || pre.niva !== 'premium') {
    pre = MALL_KATALOG.find((m) => m.niva === 'premium' && m.familj === (pre ?? fri).familj) ?? MALL_KATALOG.find((m) => m.niva === 'premium')!
  }
  const andraFri = getMallKort(GRATIS_MALL_IDS.find((id) => id !== fri.id) ?? FORVALD_MALL_ID)!
  const ut: MallKort[] = []
  for (const m of [fri, pre, andraFri]) if (!ut.some((u) => u.id === m.id)) ut.push(m)
  return ut
}

export interface PilotInnehall {
  yrkesmall: Yrkesmall
  mallar: MallKort[]
  /** Rekryterarens tips som inte redan står bland exempelsidans tips. */
  tips: { rubrik: string; text: string }[]
  /** "Det här ska synas i CV:t": viktigt att tänka på (utan dubbletter) och arbetsuppgifterna. */
  synas: { rubrik: string; text: string }[]
  uppgifter: { rubrik: string; punkter: string[] }[]
  atsInfo: string
  /** Exempelsidans frågor först, sedan yrkesmallens som inte redan finns. */
  faq: { q: string; a: string }[]
  /** Bara yrkesmallens tillagda frågor, för schemat i page.tsx. */
  faqTillagda: { q: string; a: string }[]
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function pilotInnehall(slug: string, data: any): PilotInnehall | null {
  if (!arPilotSammanslagen(slug)) return null
  const yrkesmall = YRKESMALL_LIST.find((y) => y.slug === slug)
  if (!yrkesmall) return null

  const tipsRubriker = new Set(punkter(data.tips).map((t) => normalisera(t.titel)))
  const tips = yrkesmall.rekryterarTipsen.filter((t) => !tipsRubriker.has(normalisera(t.rubrik)))
  const visade = new Set([...tipsRubriker, ...tips.map((t) => normalisera(t.rubrik))])
  const synas = (yrkesmall.viktigtAttTankaPa ?? [])
    .filter((v) => !visade.has(normalisera(v.title)))
    .map((v) => ({ rubrik: v.title, text: v.description }))
  const uppgifter = yrkesmall.arbetsuppgifter ?? []

  const egna = fragor(data.faq)
  const finns = new Set(egna.map((f) => normalisera(f.q)))
  const faqTillagda = yrkesmall.faqItems.filter((f) => {
    const n = normalisera(f.q)
    if (finns.has(n)) return false
    finns.add(n)
    return true
  })

  return {
    yrkesmall,
    mallar: pilotMallar(slug),
    tips,
    synas,
    uppgifter,
    atsInfo: yrkesmall.atsInfo,
    faq: [...egna, ...faqTillagda],
    faqTillagda,
  }
}
