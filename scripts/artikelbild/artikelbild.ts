// scripts/artikelbild/artikelbild.ts
// =============================================================================
// Artikelbilden "På bordet" (docs/design/koncept-artikelbilder-2026-11-14.md).
//
// Kör:
//   npx tsx scripts/artikelbild/artikelbild.ts <slug> [<slug> ...]   ritar, validerar, skriver webp
//   npx tsx scripts/artikelbild/artikelbild.ts --alla                 alla med underlag
//   npx tsx scripts/artikelbild/artikelbild.ts --mall cv              alla i en mall
//   ... --torr        validerar och skriver QA-bilder, men ingen webp i public/
//   ... --ark         kontaktark per mall (580 och 360 px, ljus och mörk botten) i QA-mappen
//   npx tsx scripts/artikelbild/artikelbild.ts --register             skriver uppgiftsregistret
//   npx tsx scripts/artikelbild/artikelbild.ts --exempel              art-directors sju exempel, för jämförelse
//
// Underlaget per artikel: docs/qa/artikelbilder/underlag/<slug>.json, { alt, fyll }.
// Klustret, färgen och mallen tas ur koden (getCtaVariantForTags, KLUSTER_RUM,
// arLonArtikel), aldrig ur underlaget. Ut: public/images/artiklar/<slug>-v2.webp
// bara när valideringen är utan fel. QA-bilderna (aldrig i git) hamnar i
// ARTIKELBILD_QA eller i systemets temp-mapp.
// =============================================================================

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import matter from 'gray-matter'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import { getCtaVariantForTags, arLonArtikel, type CtaCluster } from '../../src/lib/cta/clusters'
import { KLUSTER_RUM } from '../../src/components/publikt/innehall/artikel-kluster'
// @ts-ignore ren JavaScript
import { MALLAR, RUM, FAST_ORD, PERSONER_RESERV, MIN_BROD, MARGINAL, t } from './mall.mjs'
import { allaUppgifter } from './figurer'

const ART = 'content/artiklar/'
const UNDERLAG = 'docs/qa/artikelbilder/underlag/'
const MATNING = 'docs/qa/artikelbilder/matning/'
const REGISTER = 'docs/qa/artikelbilder/uppgifter.json'
const BILDER = 'public/images/artiklar/'
const QA = process.env.ARTIKELBILD_QA || path.join(os.tmpdir(), 'artikelbild-qa')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const args = process.argv.slice(2)
const flagga = (f: string) => args.includes(f)
const TORR = flagga('--torr')

/* ------------------------------------------------------------- spärrlistor */
/** Testleverantörer: kan få undantag i etiketten (seo-strategen, namnet i title). */
const LEVERANTORER = ['alva', 'alva labs', 'assessio', 'matrigma', 'cubiks', 'talogy', 'cut-e', 'aon', 'shl', 'saville', 'hogan', 'mercuri']
/** Myndigheter: aldrig, varken i bilden eller i alt-texten. Vi skriver testtypen. */
const MYNDIGHETER = ['pliktverket', 'polisen', 'polismyndigheten', 'försvarsmakten', 'skatteverket', 'säpo', 'säkerhetspolisen', 'kronofogden', 'försäkringskassan', 'arbetsförmedlingen', 'migrationsverket', 'tullverket', 'kustbevakningen', 'kriminalvården', 'rekryteringsmyndigheten', 'totalförsvarets rekryteringsmyndighet']
const ordgrans = (namn: string, text: string) => new RegExp(`(^|[^a-zåäö0-9])${namn.replace(/[-]/g, '\\-')}($|[^a-zåäö0-9])`).test(text)
const PRISORD = /\b(kr\s*\/\s*m[åa]n|gratis|rabatt|black\s*week|black|kampanj|premium|erbjudande|cyber monday)\b/i

/* ------------------------------------------------------------------ hjälp */
const norm = (s: string) => s.toLowerCase()
  .replace(/[\u00a0\u2011\u202f]/g, ' ').replace(/[\u2013\u2014]/g, '-').replace(/[\u201c\u201d\u201e]/g, '"').replace(/[\u2018\u2019]/g, "'")
  .replace(/\*\*|__/g, '').replace(/\s+/g, ' ').trim()

type Artikel = { slug: string; title: string; tags: string[]; mdx: string; raw: string; kluster: CtaCluster; mall: string; rum: string }
function lasArtikel(slug: string): Artikel {
  const raw = fs.readFileSync(`${ART}${slug}.mdx`, 'utf8')
  const { data } = matter(raw)
  const tags: string[] = data.tags ?? []
  const kluster = getCtaVariantForTags(tags)
  const mall = kluster === 'test' ? 'tester' : kluster === 'cv' ? 'cv' : kluster === 'letter' ? 'brev' : kluster === 'interview' ? 'intervju'
    : kluster === 'career' && arLonArtikel(tags) ? 'lon' : 'karriar'
  return { slug, title: data.title, tags, mdx: norm(raw), raw, kluster, mall, rum: KLUSTER_RUM[kluster] }
}

/** Exempelsidornas personer (samma namn som på /personligt-brev-exempel och /cv-exempel) plus mallens reservlista. */
function personer(): Set<string> {
  const s = fs.readFileSync('src/app/(public)/personligt-brev-exempel/[yrke]/exempel-data.ts', 'utf8')
  const namn = new Set<string>(PERSONER_RESERV)
  for (const m of s.matchAll(/^\s+namn: '([^']+)'/gm)) namn.add(m[1])
  return namn
}

/** Uppgifts-id som artikeltexterna redan använder, och vem som äger dem. */
function registerUrText(): Map<string, string> {
  const r = new Map<string, string>()
  for (const f of fs.readdirSync(ART).filter((x) => x.endsWith('.mdx'))) {
    const s = fs.readFileSync(ART + f, 'utf8')
    for (const m of s.matchAll(/<(?:MatrisUppgift|MatrisFacit|TalserieUppgift|SpatialUppgift|SpatialFacit|OrdUppgift)\s+id="([^"]+)"/g)) r.set(m[1], f.replace('.mdx', ''))
  }
  return r
}
function lasUnderlag(slug: string) {
  const p = `${UNDERLAG}${slug}.json`
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}
function helaRegistret(): Map<string, string[]> {
  const r = new Map<string, string[]>()
  const add = (id: string, slug: string) => { const l = r.get(id) ?? []; if (!l.includes(slug)) l.push(slug); r.set(id, l) }
  for (const [id, slug] of registerUrText()) add(id, slug)
  if (fs.existsSync(UNDERLAG)) for (const f of fs.readdirSync(UNDERLAG).filter((x) => x.endsWith('.json'))) {
    const u = JSON.parse(fs.readFileSync(UNDERLAG + f, 'utf8'))
    const id = u.fyll?.huvud?.uppgift
    if (id) add(id, f.replace('.json', ''))
  }
  return r
}

/* ----------------------------------------------------------- källkontroll */
type Varde = { nyckel: string; text: string; kalla?: string; beraknat?: string }
/** Samlar varje ifyllt värde. Mallens fasta ord och fiktiva namn hoppas över. */
function varden(v: any, ut: Varde[] = [], nyckel = ''): Varde[] {
  const HOPPA = ['typ', 'skala', 'lyft', 'accent', 'uppgift', 'undantag', 'lyftKalla', 'delarKalla', 'staplarKalla', 'staplar_andel', 'sektion', 'lage']
  if (typeof v === 'string') ut.push({ nyckel, text: v })
  else if (typeof v === 'number' || typeof v === 'boolean' || v == null) return ut
  else if (Array.isArray(v)) {
    // Handbrutna rader (profil, inledning, fråga, svar, uppgift) är en text; listor (citat, alternativ) är flera.
    if (v.every((x) => typeof x === 'string') && !['rader', 'grepp', 'alternativ'].includes(nyckel)) ut.push({ nyckel, text: v.join(' ') })
    else v.forEach((x) => varden(x, ut, nyckel))
  } else if ('text' in v) ut.push({ nyckel, text: v.text, kalla: v.kalla, beraknat: v.beraknat })
  else for (const [k, x] of Object.entries(v)) if (!HOPPA.includes(k)) varden(x, ut, k)
  return ut
}

/* ---------------------------------------------------------------- mätning */
const fontUri = (f: string) => `data:font/woff2;base64,${fs.readFileSync('src/assets/fonts/' + f).toString('base64')}`
const SCHIBSTED = fontUri('SchibstedGrotesk-Variable.woff2')
const INTER = fontUri('InterVariable.woff2')
const sida = (svg: string) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Schibsted Grotesk';src:url('${SCHIBSTED}') format('woff2');font-weight:400 900}
@font-face{font-family:'Inter';src:url('${INTER}') format('woff2');font-weight:100 900}
html,body{margin:0;background:#fff}svg{display:block}</style><script>window.__name=(f)=>f</script></head><body>${svg}</body></html>`

/**
 * Mätningen i Chrome: varje textrad (och rektangel i ett kort) mot sin ruta
 * (data-ruta) eller sitt kort (data-kort), med typsnitten laddade.
 */
const MAT = (marginal: number, minBrod: number) => {
  const ut: any[] = []
  const luftUnder = (b: DOMRect) => {
    for (let d = 0; d <= 80; d += 2) {
      for (let x = b.x; x <= b.x + b.width; x += 8) {
        if (document.elementsFromPoint(x, b.y + b.height + d).some((e: any) => e.closest && e.closest('[data-huvud]'))) return d
      }
    }
    return 80
  }
  for (const el of Array.from(document.querySelectorAll('text, [data-kort] rect, [data-ruta] rect')) as any[]) {
    if (el.tagName === 'rect' && el.closest('[data-kort] [transform]')) continue
    const b = el.getBBox()
    const text = el.tagName === 'text' ? el.textContent : `rect ${Math.round(b.width)}×${Math.round(b.height)}`
    if (el.tagName === 'text') {
      const rot = el.closest('[transform*="rotate("]')
      if (rot && !/rotate\(0[ ,)]/.test(rot.getAttribute('transform'))) ut.push({ text, min: -1, var: 'roterad grupp' })
      const fs = parseFloat(el.getAttribute('font-size'))
      if (!el.hasAttribute('data-liten') && !el.hasAttribute('data-etikett') && fs < minBrod) ut.push({ text, min: -2, var: `läsrad ${fs} px` })
      if (fs < 20) ut.push({ text, min: -3, var: `text ${fs} px` })
    }
    if (el.hasAttribute('data-etikett')) {
      ut.push({ text, min: Math.min(1382 - (b.x + b.width), luftUnder(b)), var: 'etikett' })
      continue
    }
    const ram = el.closest('[data-ruta]') || el.closest('[data-kort]')
    if (!ram) { ut.push({ text, min: -999, var: 'ingen ram' }); continue }
    const [x, y, w, h] = (ram.getAttribute('data-ruta') || ram.getAttribute('data-kort')).split(',').map(Number)
    if (el.tagName === 'rect' && !ram.hasAttribute('data-ruta') && el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none' && b.width > 400) continue
    // Rutornas egna rektanglar (chipp och talrutor) mäts mot kortet.
    const m = { v: b.x - x, h: x + w - (b.x + b.width), o: b.y - y, n: y + h - (b.y + b.height) }
    ut.push({ text, min: Math.min(m.v, m.h, m.o, m.n), var: ram.hasAttribute('data-ruta') ? 'ruta' : 'kort', m })
  }
  return { rader: ut, min: Math.min(...ut.map((r) => r.min)), under: ut.filter((r) => r.min < marginal) }
}

async function startaSida() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1536, height: 1024, deviceScaleFactor: 1 })
  await page.setContent(sida('<svg width="10" height="10"></svg>'), { waitUntil: 'load' })
  await page.evaluate(async () => {
    await Promise.all([document.fonts.load("800 64px 'Schibsted Grotesk'"), document.fonts.load('500 28px Inter'), document.fonts.load('700 28px Inter')])
  })
  return { browser, page }
}

/** Radbredder ur Chrome (canvas, samma typsnitt som bilden), med cache. */
function matare(page: any) {
  const cache = new Map<string, number>()
  const fragor = new Set<string>()
  const nyckel = (text: string, size: number, weight: number, fam: string) => JSON.stringify([text, size, weight, fam])
  return {
    mat(text: string, size: number, weight: number, fam = 'Inter, Arial, sans-serif') {
      const k = nyckel(text, size, weight, fam)
      if (cache.has(k)) return cache.get(k)!
      fragor.add(k)
      return text.length * size * 0.55
    },
    async hamta() {
      if (!fragor.size) return false
      const lista = [...fragor].map((k) => JSON.parse(k))
      const bredd: number[] = await page.evaluate((l: any[]) => {
        const c = document.createElement('canvas').getContext('2d')!
        return l.map(([text, size, weight, fam]) => { c.font = `${weight} ${size}px ${fam}`; return c.measureText(text).width })
      }, lista)
      lista.forEach((l, i) => cache.set(JSON.stringify(l), bredd[i]))
      fragor.clear()
      return true
    },
  }
}

/* --------------------------------------------------------------- en bild */
type Resultat = { slug: string; mall: string; kB: number; minstaMarginal: number; tightast: string; fel: string[] }

async function enBild(page: any, slug: string, under: any, uppgifter: Map<string, () => any>, register: Map<string, string[]>, namn: Set<string>, opts: { exempel?: boolean } = {}): Promise<Resultat> {
  const a = lasArtikel(slug)
  const fel: string[] = []
  const fyll = under.fyll
  if (!fyll) return { slug, mall: a.mall, kB: 0, minstaMarginal: 0, tightast: '', fel: ['underlaget saknar fyll'] }

  // Rita två gånger: första varvet samlar radbredderna som ska mätas i Chrome.
  const m = matare(page)
  let svg = ''
  let ctxFel: string[] = []
  for (let varv = 0; varv < 4; varv++) {
    ctxFel = []
    const ctx = { mat: m.mat, fel: ctxFel, uppgift: (id: string) => uppgifter.get(id)?.() }
    try { svg = MALLAR[a.mall](ctx, fyll, a.rum) } catch (e: any) { ctxFel.push(`mallen kastade: ${e.message}`) }
    if (!(await m.hamta())) break
  }
  fel.push(...ctxFel)

  // ---- etiketten
  const et = t(fyll.etikett ?? '') as string
  const ord = et.trim().split(/\s+/)
  if (!et) fel.push('etikett saknas')
  if (ord.length > 4) fel.push(`etiketten har ${ord.length} ord (max 4)`)
  if (et.length > 26) fel.push(`etiketten är ${et.length} tecken (max 26)`)

  // ---- namn i bilden: myndigheter aldrig, leverantörer bara i etiketten med undantag
  const texter = [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map((x) => ({ etikett: x[1].includes('data-etikett'), text: norm(x[2].replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&')) }))
  for (const tx of texter) {
    const myn = MYNDIGHETER.find((n) => ordgrans(n, tx.text))
    if (myn) fel.push(`myndighetsnamnet "${myn}" står i bilden ("${tx.text}"); skriv testtypen`)
    const lev = LEVERANTORER.find((n) => ordgrans(n, tx.text))
    if (lev) {
      const u = fyll.etikett?.undantag
      if (!tx.etikett) fel.push(`leverantörsnamnet "${lev}" står i bilden utanför etiketten`)
      else if (!u || !u.av || !u.datum || !u.skal) fel.push(`etiketten innehåller "${lev}" utan fullständigt undantag (av, datum, skal)`)
      else if (u.av !== 'seo-strategen') fel.push('undantaget ska vara givet av seo-strategen')
      else if (!norm(a.title).includes(lev)) fel.push(`undantaget för "${lev}" gäller bara när namnet står i artikelns title`)
    }
  }
  if (PRISORD.test(texter.map((x) => x.text).join(' '))) fel.push('pris- eller kampanjord i bilden')

  // ---- svenska tecken: varje å ä ö i indata ska finnas som entitet i SVG:n
  const indata = varden(fyll).map((v) => v.text).join(' ') + ' ' + et
  for (const [tecken, ent] of [['å', '&#229;'], ['ä', '&#228;'], ['ö', '&#246;'], ['Å', '&#197;'], ['Ä', '&#196;'], ['Ö', '&#214;']]) {
    if (indata.includes(tecken) && !svg.includes(ent)) fel.push(`tecknet ${tecken} finns i indata men inte i bilden`)
  }
  if (/[^\x00-\x7F]/.test(svg)) fel.push('rå icke-ASCII i SVG (ska vara entiteter)')
  if (/<(filter|linearGradient|radialGradient|image)\b/.test(svg)) fel.push('filter, gradient eller bild i SVG')
  if (!/^<svg[^>]*width="1536" height="1024"/.test(svg)) fel.push('fel mått')
  const storlekar = [...svg.matchAll(/font-size="([\d.]+)"/g)].map((x) => +x[1])
  if (storlekar.length && Math.min(...storlekar) < 20) fel.push(`minsta text ${Math.min(...storlekar)} px (< 20)`)

  // ---- källkontroll: allt ifyllt står i artikeln, eller bär en kalla-rad som gör det
  const fasta = new Set(FAST_ORD.map(norm))
  for (const v of varden(fyll)) {
    if (v.nyckel === 'etikett') continue
    if (v.nyckel === 'namn' && namn.has(v.text)) continue
    if (!v.kalla && fasta.has(norm(v.text))) continue
    const sok = norm(v.kalla ?? v.text)
    if (!a.mdx.includes(sok)) fel.push(`"${v.text}" (${v.nyckel || 'värde'}) finns inte i artikeln${v.kalla ? ` (kalla "${v.kalla}")` : ''}`)
    if (v.beraknat !== undefined && !/\d/.test(v.beraknat)) fel.push(`beräknat värde "${v.text}" saknar uttryck med siffror`)
  }
  if (a.mall === 'cv' && !namn.has(fyll.namn)) fel.push(`personen "${fyll.namn}" finns inte i exempelsidornas eller mallens lista`)
  const kallaKrav = (k: string | undefined, vad: string) => { if (!k || !a.mdx.includes(norm(k))) fel.push(`${vad} saknar källa i artikeln${k ? ` ("${k}")` : ''}`) }
  if (fyll.vanster?.typ === 'tidskala') kallaKrav(fyll.vanster.lyftKalla, 'skalans markering')
  if (fyll.huvud?.typ === 'skala') { kallaKrav(fyll.huvud.lyftKalla, 'skalans markering'); kallaKrav(fyll.huvud.staplarKalla, 'staplarnas höjder') }
  if (fyll.delar) kallaKrav(fyll.delarKalla, 'delarnas proportioner')

  // ---- uppgiftsregistret: en uppgift i högst en artikel, bara artikelfigurer
  const id = fyll.huvud?.uppgift
  if (id && !opts.exempel) {
    if (!uppgifter.has(id)) fel.push(`uppgiften ${id} finns inte i src/lib/artikelfigurer (bankfrågor är spärrade)`)
    const agare = (register.get(id) ?? []).filter((s) => s !== slug)
    if (agare.length) fel.push(`uppgiften ${id} används redan av ${agare.join(', ')}`)
  }

  // ---- alt-texten
  const alt: string = under.alt ?? ''
  const altOrd = alt.trim().split(/\s+/).filter(Boolean).length
  if (altOrd < 8 || altOrd > 15) fel.push(`alt-texten har ${altOrd} ord (8 till 15)`)
  if (/bild av|bilden visar|illustration av/i.test(alt)) fel.push('alt-texten börjar beskriva bilden som bild')
  if (norm(alt) === norm(a.title)) fel.push('alt-texten är samma som titeln')
  if (/[\u2013\u2014]/.test(alt)) fel.push('tankstreck i alt-texten')
  if (MYNDIGHETER.some((n) => ordgrans(n, norm(alt)))) fel.push('myndighetsnamn i alt-texten')
  if (LEVERANTORER.some((n) => new RegExp(`\\b(ur|från|hos)\\s+${n}`).test(norm(alt)))) fel.push('alt-texten påstår att uppgiften kommer från leverantören (skriv "i samma format som")')
  if (/"/.test(alt)) fel.push('citattecken i alt-texten (bryter MDX-attributet)')

  // ---- kontrast: etiketten mot botten
  const lum = (hex: string) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
  const r = RUM[a.rum]
  const kontrast = (lum(r.ljus) + 0.05) / (lum(r.vagg) + 0.05)
  if (kontrast < 4.5) fel.push(`etikettens kontrast ${kontrast.toFixed(1)}:1 (< 4,5)`)

  // ---- rendera och mät i Chrome
  await page.setContent(sida(svg), { waitUntil: 'load' })
  const laddade: string[] = await page.evaluate(async () => {
    await Promise.all([document.fonts.load("800 64px 'Schibsted Grotesk'"), document.fonts.load('500 28px Inter')])
    return [...(document.fonts as any)].filter((f: any) => f.status === 'loaded').map((f: any) => f.family.replace(/"/g, ''))
  })
  if (!laddade.includes('Schibsted Grotesk') || !laddade.includes('Inter')) fel.push(`typsnitt saknas: ${laddade.join(', ')}`)
  const matt = await page.evaluate(MAT, MARGINAL, MIN_BROD)
  for (const u of matt.under) fel.push(`"${u.text}" har ${Math.round(u.min)} px till ${u.var === "kort" ? "kortets" : u.var === "ruta" ? "rutans" : u.var + "s"} kant (< ${MARGINAL})`)
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1536, height: 1024 } })
  const webp = await sharp(png).webp({ quality: 82, smartSubsample: true }).toBuffer()
  if (webp.length > 120 * 1024) fel.push(`webp ${Math.round(webp.length / 1024)} kB (> 120)`)
  const meta = await sharp(webp).metadata()
  if (meta.width !== 1536 || meta.height !== 1024) fel.push(`webp ${meta.width}×${meta.height}`)

  fs.mkdirSync(QA, { recursive: true })
  fs.writeFileSync(path.join(QA, `${slug}.png`), png)
  fs.writeFileSync(path.join(QA, `${slug}.svg`), svg)
  if (!fel.length && !TORR && !opts.exempel) fs.writeFileSync(`${BILDER}${slug}-v2.webp`, webp)
  if (opts.exempel) fs.writeFileSync(path.join(QA, `${slug}-v2.webp`), webp)
  const tightast = matt.rader.reduce((x: any, y: any) => (y.min < x.min ? y : x), matt.rader[0] ?? { text: '', min: 0 })
  const res = { slug, mall: a.mall, kB: Math.round(webp.length / 1024), minstaMarginal: Math.round(matt.min), tightast: tightast.text, fel }
  if (!fel.length && !TORR && !opts.exempel) {
    fs.mkdirSync(MATNING, { recursive: true })
    fs.writeFileSync(`${MATNING}${slug}.json`, JSON.stringify({ slug, mall: a.mall, kluster: a.kluster, kB: res.kB, minstaMarginal: res.minstaMarginal, tightast: res.tightast, uppgift: id ?? null }, null, 1) + '\n')
  }
  return res
}

/* ------------------------------------------------------------- kontaktark */
async function kontaktark(slugs: string[], namnet: string) {
  const W = 580, pad = 20
  const rader: Buffer[] = []
  for (const s of slugs) {
    const p = path.join(QA, `${s}.png`)
    if (!fs.existsSync(p)) continue
    const a = lasArtikel(s)
    const b580 = await sharp(p).resize(W).png().toBuffer()
    const b360 = await sharp(p).resize(360).png().toBuffer()
    const h = Math.round((W * 1024) / 1536)
    const mork = await sharp({ create: { width: W + 360 + pad * 3, height: h + pad * 2 + 30, channels: 3, background: RUM[a.rum].vagg } })
      .composite([{ input: b580, left: pad, top: pad }, { input: b360, left: W + pad * 2, top: pad },
        { input: Buffer.from(`<svg width="${W}" height="24"><text x="0" y="18" font-family="Arial" font-size="16" fill="#fff">${s}</text></svg>`), left: pad, top: h + pad + 6 }]).png().toBuffer()
    const ljus = await sharp({ create: { width: 360 + pad * 2, height: h + pad * 2 + 30, channels: 3, background: '#EDE8DF' } })
      .composite([{ input: b360, left: pad, top: pad }]).png().toBuffer()
    const radW = W + 360 + pad * 3 + 360 + pad * 2
    rader.push(await sharp({ create: { width: radW, height: h + pad * 2 + 30, channels: 3, background: '#888' } }).composite([{ input: mork, left: 0, top: 0 }, { input: ljus, left: W + 360 + pad * 3, top: 0 }]).png().toBuffer())
  }
  if (!rader.length) return
  const m0 = await sharp(rader[0]).metadata()
  // Högst åtta rader per ark, så att arket går att läsa.
  for (let i = 0; i < rader.length; i += 8) {
    const del = rader.slice(i, i + 8)
    const ut = path.join(QA, `kontaktark-${namnet}-${i / 8 + 1}.png`)
    await sharp({ create: { width: m0.width!, height: m0.height! * del.length, channels: 3, background: '#888' } }).composite(del.map((r, j) => ({ input: r, left: 0, top: j * m0.height! }))).png().toFile(ut)
    console.log(`kontaktark: ${ut}`)
  }
}

/* ------------------------------------------------------------------ main */
async function main() {
  if (flagga('--register')) {
    const r = helaRegistret()
    const ut: Record<string, string> = {}
    const dubbletter: string[] = []
    for (const [id, slugs] of [...r].sort()) { ut[id] = slugs[0]; if (slugs.length > 1) dubbletter.push(`${id}: ${slugs.join(', ')}`) }
    fs.writeFileSync(REGISTER, JSON.stringify(ut, null, 1) + '\n')
    console.log(`${REGISTER}: ${Object.keys(ut).length} uppgifter`)
    if (dubbletter.length) { console.error('Dubbletter:\n  ' + dubbletter.join('\n  ')); process.exitCode = 1 }
    return
  }
  const exempel = flagga('--exempel')
  const uppgifter = allaUppgifter(exempel)
  const register = helaRegistret()
  const namn = personer()
  let slugs: string[]
  let underlag: Record<string, any> = {}
  if (exempel) {
    const ex = JSON.parse(fs.readFileSync('scripts/artikelbild/exempel.json', 'utf8'))
    for (const e of ex) underlag[e.slug] = e
    slugs = ex.map((e: any) => e.slug)
  } else {
    const mallArg = args.includes('--mall') ? args[args.indexOf('--mall') + 1] : null
    const alla = fs.readdirSync(UNDERLAG).filter((x) => x.endsWith('.json')).map((x) => x.replace('.json', ''))
    slugs = flagga('--alla') ? alla : mallArg ? alla.filter((s) => lasArtikel(s).mall === mallArg) : args.filter((x) => !x.startsWith('--') && x !== mallArg)
    for (const s of slugs) underlag[s] = lasUnderlag(s)
  }
  const { browser, page } = await startaSida()
  const res: Resultat[] = []
  for (const s of slugs) {
    if (!underlag[s]) { res.push({ slug: s, mall: '?', kB: 0, minstaMarginal: 0, tightast: '', fel: [`underlag saknas: ${UNDERLAG}${s}.json`] }); continue }
    try { res.push(await enBild(page, s, underlag[s], uppgifter, register, namn, { exempel })) } catch (e: any) { res.push({ slug: s, mall: '?', kB: 0, minstaMarginal: 0, tightast: '', fel: [`kastade: ${e.message}`] }) }
  }
  await browser.close()
  if (flagga('--ark')) {
    const perMall: Record<string, string[]> = {}
    for (const r of res) (perMall[r.mall] ??= []).push(r.slug)
    for (const [mall, l] of Object.entries(perMall)) await kontaktark(l, mall)
  }
  let fel = 0
  for (const r of res) {
    const ok = !r.fel.length
    if (!ok) fel++
    console.log(`${ok ? 'OK ' : 'FEL'} ${r.slug} [${r.mall}] ${r.kB} kB, minsta marginal ${r.minstaMarginal} px (${r.tightast})`)
    for (const f of r.fel) console.log(`      - ${f}`)
  }
  console.log(`\n${res.length - fel} av ${res.length} utan fel. QA-bilder: ${QA}`)
  if (fel) process.exitCode = 1
}

main().catch((e) => { console.error(e); process.exit(1) })
