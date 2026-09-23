/**
 * Klustermappning för artikel-CTA (docs/plan-konvertering.md, C4).
 *
 * En artikels taggar avgör vilken produkt-CTA som visas. Reglerna är
 * substrängsmatchning i fast prioritetsordning: det första klustret som
 * matchar någon tagg vinner, oavsett hur många taggar de andra matchar.
 * Klientsäker, inga beroenden.
 */

export type CtaCluster = 'test' | 'interview' | 'letter' | 'cv' | 'career' | 'generic'

/** Prioritetsordningen. Ändra inte utan att köra om scripts/audit-cta-clusters.ts. */
export const CLUSTER_PRIORITY: readonly CtaCluster[] = [
  'test',
  'interview',
  'letter',
  'cv',
  'career',
] as const

/**
 * Nyckelord per kluster. Matchas som substräng mot normaliserade taggar,
 * så "matrigma" träffar även "matrigma test" och "begåvningstest matrigma".
 */
const CLUSTER_KEYWORDS: Record<Exclude<CtaCluster, 'generic'>, readonly string[]> = {
  test: ['test', 'matrigma', 'begåvning', 'begavning'],
  interview: [
    'intervju',
    'star metoden',
    'star modellen',
    'star teknik',
    'beteendefrågor',
    'beteendefragor',
    'styrkor och svagheter',
    'varför ska vi anställa dig',
    'varfor ska vi anstalla dig',
    'personliga egenskaper',
  ],
  letter: [
    'personligt brev',
    'ansökningsbrev',
    'ansokningsbrev',
    'motivationsbrev',
    'cover letter',
    'följebrev',
    'foljebrev',
  ],
  cv: ['cv', 'resume', 'meritförteckning', 'meritforteckning', 'ats'],
  career: [
    'karriär',
    'karriar',
    'byta jobb',
    'uppsägning',
    'uppsagning',
    'arbetsgivarintyg',
    'tjänstgöringsbetyg',
    'tjanstgoringsbetyg',
    'lön',
    'lon',
    'studera',
    'omskolning',
    'ångest',
    'angest',
  ],
}

/** Lowercase, trimmat, bindestreck till mellanslag, kollapsade mellanslag. */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Returnerar klustret för en artikels taggar. Saknas taggar, eller matchar
 * ingen regel, blir det 'generic'.
 */
export function getCtaVariantForTags(tags: string[] | undefined | null): CtaCluster {
  if (!tags || tags.length === 0) return 'generic'

  const normalized = tags.map(normalizeTag).filter(Boolean)
  if (normalized.length === 0) return 'generic'

  for (const cluster of CLUSTER_PRIORITY) {
    const keywords = CLUSTER_KEYWORDS[cluster as Exclude<CtaCluster, 'generic'>]
    if (normalized.some((tag) => keywords.some((kw) => tag.includes(kw)))) {
      return cluster
    }
  }

  return 'generic'
}

/** Kluster utan produkt-CTA. Karriärartiklar får bara en länkrad. */
export function clusterHasProductCta(cluster: CtaCluster): boolean {
  return cluster !== 'career'
}

/* ----------------------------------------------------- paketet per kluster */

/**
 * Paketet som reklamkorten i en artikel föreslår
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, klusterregeln).
 *
 *   test       → Testveckan
 *   cv, letter → CV-veckan
 *   interview  → Allt
 *   career     → Allt när taggarna handlar om lön, uppsägning, byta jobb
 *                eller arbetsgivarintyg; annars inget paket alls
 *   generic    → gratiskortet
 *
 * Aldrig trial, aldrig "7 dagar gratis".
 */
export type ArtikelPaket = 'cv' | 'test' | 'allt' | 'gratis'

/** Karriärtaggar som gör att en karriärartikel föreslår Allt. */
const CAREER_ALLT: readonly string[] = [
  'lön',
  'lon',
  'uppsägning',
  'uppsagning',
  'säga upp',
  'saga upp',
  'byta jobb',
  'arbetsgivarintyg',
  'tjänstgöringsbetyg',
  'tjanstgoringsbetyg',
  'löneförhandling',
  'loneforhandling',
]

function harTagg(tags: string[] | undefined | null, nyckelord: readonly string[]): boolean {
  if (!tags) return false
  const norm = tags.map(normalizeTag)
  return norm.some((t) => nyckelord.some((kw) => t.includes(kw)))
}

/** Karriärartikel om lön, uppsägning eller jobbyte. */
export function arKarriarLon(tags: string[] | undefined | null): boolean {
  return harTagg(tags, CAREER_ALLT)
}

export function paketForKluster(
  cluster: CtaCluster,
  tags: string[] | undefined | null
): ArtikelPaket | null {
  switch (cluster) {
    case 'test':
      return 'test'
    case 'cv':
    case 'letter':
      return 'cv'
    case 'interview':
      return 'allt'
    case 'career':
      return arKarriarLon(tags) ? 'allt' : null
    case 'generic':
      return 'gratis'
  }
}

/** Inline-kortets verktyg. CV-artiklar om ATS eller analys får CV-analysen i stället för mallarna. */
export type InlineVerktyg = 'test' | 'mallar' | 'analys' | 'brev' | 'coach' | 'raknare' | 'lankrad'

export function inlineVerktygForKluster(
  cluster: CtaCluster,
  tags: string[] | undefined | null
): InlineVerktyg {
  switch (cluster) {
    case 'test':
      return 'test'
    case 'cv':
      return harTagg(tags, ['ats', 'analys']) ? 'analys' : 'mallar'
    case 'letter':
      return 'brev'
    case 'interview':
      return 'coach'
    case 'career':
      return arKarriarLon(tags) ? 'raknare' : 'lankrad'
    case 'generic':
      return 'mallar'
  }
}
