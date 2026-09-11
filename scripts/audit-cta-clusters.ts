/**
 * Skriver slug → kluster för alla artiklar i content/ (docs/plan-konvertering.md, C4).
 *
 * Körs manuellt före merge: `npx tsx scripts/audit-cta-clusters.ts`
 * Målet är noll generic bland topp 20-artiklarna. Läs igenom listan och
 * justera taggar i frontmatter eller nyckelord i src/lib/cta/clusters.ts.
 *
 * Flaggor:
 *   --generic   visa bara artiklar som hamnar i generic
 *   --csv       skriv ut som CSV (slug,cluster,tags)
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getCtaVariantForTags, type CtaCluster } from '../src/lib/cta/clusters'

const CONTENT_DIRS = [
  path.join(process.cwd(), 'content', 'artiklar'),
  path.join(process.cwd(), 'content', 'rekryterare'),
]

interface Row {
  dir: string
  slug: string
  cluster: CtaCluster
  tags: string[]
}

function collect(): Row[] {
  const rows: Row[] = []

  for (const dir of CONTENT_DIRS) {
    if (!fs.existsSync(dir)) continue
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .sort()

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      let tags: string[] = []
      try {
        const parsed = matter(raw)
        const fm = parsed.data as { tags?: unknown }
        if (Array.isArray(fm.tags)) {
          tags = fm.tags.filter((t): t is string => typeof t === 'string')
        }
      } catch (err) {
        console.error(`Kunde inte läsa frontmatter i ${file}:`, err)
      }

      rows.push({
        dir: path.basename(dir),
        slug: file.replace(/\.mdx?$/, ''),
        cluster: getCtaVariantForTags(tags),
        tags,
      })
    }
  }

  return rows
}

function main(): void {
  const args = process.argv.slice(2)
  const onlyGeneric = args.includes('--generic')
  const asCsv = args.includes('--csv')

  let rows = collect()
  if (onlyGeneric) rows = rows.filter((r) => r.cluster === 'generic')

  if (asCsv) {
    console.log('slug,cluster,tags')
    for (const row of rows) {
      console.log(`${row.slug},${row.cluster},"${row.tags.join('; ').replace(/"/g, '""')}"`)
    }
    return
  }

  const width = rows.reduce((max, r) => Math.max(max, r.slug.length), 0)
  let currentDir = ''
  for (const row of rows) {
    if (row.dir !== currentDir) {
      currentDir = row.dir
      console.log(`\ncontent/${currentDir}`)
      console.log('-'.repeat(width + 12))
    }
    console.log(`${row.slug.padEnd(width)}  ${row.cluster}`)
  }

  const counts = new Map<CtaCluster, number>()
  for (const row of collect()) {
    counts.set(row.cluster, (counts.get(row.cluster) ?? 0) + 1)
  }

  console.log('\nFördelning')
  console.log('-'.repeat(width + 12))
  for (const [cluster, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${cluster.padEnd(width)}  ${count}`)
  }
  console.log(`\nTotalt ${collect().length} artiklar.`)
}

main()
