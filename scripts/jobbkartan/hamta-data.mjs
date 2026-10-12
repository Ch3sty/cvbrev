/**
 * Hämtar Jobbkartans data från SCB:s Statistikdatabas (PxWebApi v2, ingen nyckel, CC0) och
 * skriver den uppdelad så att sidan laddar snabbt:
 *
 *   src/lib/jobbkartan/data/oversikt.json   konkurrensen per län och kvartal, arbetslöshet per län
 *                                           och månad, totalt anställda per län, lägst/högst bland
 *                                           kommunerna. Läses av sidan på servern och följer med inline.
 *   public/jobbkartan/data/yrken.json       sökindex: [ssyk, namn, anställda senaste år]
 *   public/jobbkartan/data/yrke/<ssyk>.json ett yrke: anställda per län och år, kön, lön per riksområde
 *   public/jobbkartan/data/kommuner.json    alla kommuner: arbetslöshet och sysselsättningsgrad per månad
 *
 * Körs för hand när SCB publicerar nytt (BAS varje månad, lediga jobb och AKU varje kvartal,
 * yrkesregistret och lönerna en gång om året):
 *   node scripts/jobbkartan/hamta-data.mjs
 * Platsannonserna hämtas inte här; sidan läser dem live från JobTech (hamtaAnnonser i src/lib/jobbkartan/data.ts).
 *
 * Tabeller: TAB6428 (aggregerad matchning), TAB5663 (BAS), TAB4428 (anställda per län och yrke),
 * TAB5696 (lön per riksområde och yrke). Taket är 30 anrop per 10 s och 150 000 värden per anrop.
 */
import fs from 'node:fs'
import path from 'node:path'

const B = 'https://statistikdatabasen.scb.se/api/v2'
const ROT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..')
const LAN = ['01', '03', '04', '05', '06', '07', '08', '09', '10', '12', '13', '14', '17', '18', '19', '20', '21', '22', '23', '24', '25']
const NUTS = {
  SE11: ['01'], SE12: ['03', '04', '05', '18', '19'], SE21: ['06', '07', '08', '09'], SE22: ['10', '12'],
  SE23: ['13', '14'], SE31: ['17', '20', '21'], SE32: ['22', '23'], SE33: ['24', '25'],
}
const sov = (ms) => new Promise((r) => setTimeout(r, ms))

async function hamta(id, sel) {
  const qs = Object.entries(sel).map(([k, v]) => `valueCodes[${k}]=${encodeURIComponent(v)}`).join('&')
  for (let forsok = 0; forsok < 3; forsok++) {
    const r = await fetch(`${B}/tables/${id}/data?lang=sv&outputFormat=json-stat2&${qs}`)
    if (r.ok) { await sov(450); return kub(await r.json()) }
    if (r.status !== 429 && r.status < 500) throw new Error(`${id} ${r.status} ${await r.text()}`)
    await sov(4000)
  }
  throw new Error(`${id}: gav upp efter tre försök`)
}

/** json-stat2 till en uppslagsfunktion get({dimension: kod}). */
function kub(d) {
  const ids = d.id
  const ord = ids.map((k) => { const ix = d.dimension[k].category.index; return Object.keys(ix).sort((a, b) => ix[a] - ix[b]) })
  const get = (sel) => {
    let o = 0
    for (let i = 0; i < ids.length; i++) {
      const p = ord[i].indexOf(sel[ids[i]] ?? ord[i][0])
      if (p < 0) return null
      o = o * d.size[i] + p
    }
    return d.value[o]
  }
  return { get, ord: Object.fromEntries(ids.map((k, i) => [k, ord[i]])), lab: Object.fromEntries(ids.map((k) => [k, d.dimension[k].category.label])) }
}

const idag = new Date().toISOString().slice(0, 10)
const oversikt = { hamtad: idag, lanKoder: LAN, nuts: NUTS }

// 1. Konkurrensen om jobben per kvartal
let k = await hamta('TAB6428', { Region: '00,' + LAN.join(','), ContentsCode: '000007O2,000007O8,000007O9', Tid: '*' })
oversikt.kvartal = k.ord.Tid
oversikt.lanNamn = Object.fromEntries(['00', ...LAN].map((r) => [r, k.lab.Region[r]]))
oversikt.matchning = Object.fromEntries(['00', ...LAN].map((r) => [r, {
  arbetslosa: k.ord.Tid.map((t) => k.get({ Region: r, ContentsCode: '000007O2', Tid: t })),
  lediga: k.ord.Tid.map((t) => k.get({ Region: r, ContentsCode: '000007O8', Tid: t })),
  lediga_osak: k.ord.Tid.map((t) => k.get({ Region: r, ContentsCode: '000007O9', Tid: t })),
}]))

// 2. Arbetslöshet och sysselsättningsgrad per månad, län och kommun
k = await hamta('TAB5663', { Region: '*', NyckeltalSCB: 'BAS02,BAS03', ContentsCode: '000007AN', Tid: '*' })
oversikt.manader = k.ord.Tid
const bas = (r, n) => k.ord.Tid.map((t) => k.get({ Region: r, NyckeltalSCB: n, Tid: t }))
oversikt.lanBas = Object.fromEntries(['00', ...LAN].map((r) => [r, [bas(r, 'BAS03'), bas(r, 'BAS02')]]))
const kommuner = k.ord.Region.filter((r) => r.length === 4).map((r) => [r, k.lab.Region[r], bas(r, 'BAS03'), bas(r, 'BAS02')])
const sist = (a) => { for (let i = a.length - 1; i >= 0; i--) if (a[i] != null) return a[i]; return null }
const rang = kommuner.map((x) => ({ kod: x[0], namn: x[1], v: sist(x[2]) })).filter((x) => x.v != null).sort((a, b) => a.v - b.v)
oversikt.kommunLagst = rang.slice(0, 3)
oversikt.kommunHogst = rang.slice(-3).reverse()
oversikt.antalKommuner = rang.length

// 3. Anställda per län och yrke, alla år i tabellen (män och kvinnor hämtas var för sig)
// De fem senaste åren i tabellen, så att skriptet tar med nya år utan ändring.
const meta = await (await fetch(`${B}/tables/TAB4428/metadata?lang=sv`)).json()
const tidIx = meta.dimension.Tid.category.index
const ar = Object.keys(tidIx).sort((a, b) => tidIx[a] - tidIx[b]).slice(-5)
const yrkeLan = {}, yrkeNamn = {}, kon = {}
for (const a of ar) {
  const d = await hamta('TAB4428', { Region: LAN.join(','), Yrke2012: '*', Kon: '1,2', ContentsCode: '000006XV', Tid: a })
  for (const y of d.ord.Yrke2012) {
    if (y === '0002') continue // yrke okänt
    yrkeNamn[y] = d.lab.Yrke2012[y]
    yrkeLan[y] ??= LAN.map(() => [])
    LAN.forEach((r, i) => yrkeLan[y][i].push((d.get({ Region: r, Yrke2012: y, Kon: '1', Tid: a }) || 0) + (d.get({ Region: r, Yrke2012: y, Kon: '2', Tid: a }) || 0)))
    if (a === ar.at(-1)) {
      let m = 0, kv = 0
      LAN.forEach((r) => { m += d.get({ Region: r, Yrke2012: y, Kon: '1', Tid: a }) || 0; kv += d.get({ Region: r, Yrke2012: y, Kon: '2', Tid: a }) || 0 })
      kon[y] = [m, kv]
    }
  }
}
oversikt.ar = ar
oversikt.totLan = LAN.map((_, i) => ar.map((_, j) => Object.values(yrkeLan).reduce((s, v) => s + v[i][j], 0)))

// 4. Lön per riksområde och yrke
const L = await hamta('TAB5696', { Region: '*', Sektor: '0', Yrke2012: '*', Kon: '1+2', ContentsCode: '000007AS', Tid: '*' })
oversikt.lonAr = L.ord.Tid
oversikt.lonRegioner = L.ord.Region
oversikt.riksomraden = L.lab.Region

// Skriv
const dataDir = path.join(ROT, 'src/lib/jobbkartan/data')
const pub = path.join(ROT, 'public/jobbkartan/data')
fs.mkdirSync(dataDir, { recursive: true })
fs.mkdirSync(path.join(pub, 'yrke'), { recursive: true })
for (const f of fs.readdirSync(path.join(pub, 'yrke'))) fs.unlinkSync(path.join(pub, 'yrke', f))

const index = []
for (const y of Object.keys(yrkeNamn)) {
  const v = yrkeLan[y]
  const tot = v.reduce((s, r) => s + r.at(-1), 0)
  if (!tot) continue
  const lon = L.ord.Region.map((r) => L.ord.Tid.map((t) => L.get({ Region: r, Yrke2012: y, Tid: t }) || 0))
  const harLon = lon.some((r) => r.some((x) => x > 0))
  index.push([y, yrkeNamn[y], tot])
  fs.writeFileSync(path.join(pub, 'yrke', `${y}.json`), JSON.stringify({ kod: y, namn: yrkeNamn[y], lan: v.flat(), kon: kon[y], lon: harLon ? lon : null }))
}
index.sort((a, b) => b[2] - a[2])
oversikt.antalYrken = index.length
// Förslagsknapparna under yrkessökningen: vanliga yrken bland våra CV- och brevexempel.
const UTVALDA = ['2221', '8332', '2512', '2341', '5321', '5223', '7111', '5120', '2241', '7411']
oversikt.utvaldaYrken = UTVALDA.filter((y) => yrkeNamn[y]).map((y) => [y, yrkeNamn[y].replace(/ m\.fl\.$/, '')])
fs.writeFileSync(path.join(pub, 'yrken.json'), JSON.stringify(index))
fs.writeFileSync(path.join(pub, 'kommuner.json'), JSON.stringify(kommuner))
fs.writeFileSync(path.join(dataDir, 'oversikt.json'), JSON.stringify(oversikt))

const kb = (f) => Math.round(fs.statSync(f).size / 1024) + ' kB'
console.log(`oversikt.json ${kb(path.join(dataDir, 'oversikt.json'))}, yrken.json ${kb(path.join(pub, 'yrken.json'))} (${index.length} yrken), kommuner.json ${kb(path.join(pub, 'kommuner.json'))} (${kommuner.length} kommuner)`)
console.log(`Senaste kvartal ${oversikt.kvartal.at(-1)}, månad ${oversikt.manader.at(-1)}, yrkesår ${ar.at(-1)}, lönår ${oversikt.lonAr.at(-1)}`)
