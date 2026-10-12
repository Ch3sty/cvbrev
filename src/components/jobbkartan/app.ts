/**
 * Jobbkartans logik i webbläsaren, porterad från konceptet (docs/design/koncept-jobbkartan-2026-10-13.html).
 * Sidans markup renderas på servern (page.tsx, Hjalte.tsx) med fasta id:n; den här modulen fyller
 * diagrammen, animerar hjältekartan och kopplar sök, reglage och nedladdningar. Varje del startar
 * bara om dess element finns, så samma kod driver både /jobbkartan och inbäddningen.
 *
 * Yrkena och kommunerna hämtas som små statiska filer under /jobbkartan/data först när de behövs.
 */
import type { JobbkartanData } from '@/lib/jobbkartan/data'
import {
  fmt,
  hojdFor,
  inuti,
  kortLan,
  kvartalKort,
  kvartalNamn,
  manadNamn,
  projektor,
  rita,
  tyngdpunkt,
  uppdatera,
  type Projektor,
} from '@/lib/jobbkartan/karta'

const DATA = '/jobbkartan/data'
const SVGNS = 'http://www.w3.org/2000/svg'
const LAN_STANDARD = '01'
const YRKE_STANDARD = '2221'
const KOMMUN_STANDARD = '1480'

interface Yrke {
  kod: string
  namn: string
  /** 21 län × år, index län*antalÅr+år. */
  lan: number[]
  kon: [number, number]
  /** Riksområde × lönår, 0 = saknas. */
  lon: number[][] | null
}
type Kommun = [string, string, (number | null)[], (number | null)[]]

interface Serie {
  namn: string
  v: (number | null)[]
  klass: string
  band?: ([number, number] | null)[]
}
interface LinjeOpts {
  W?: number
  H?: number
  R?: number
  etiketter: string[]
  serier: Serie[]
  dec?: number
  enhet?: string
  ymin?: number
  ymax?: number
  markera?: number
  xMax?: number
  xVar?: (i: number) => string
}

type Attr = Record<string, string | number | null | undefined>

function sv<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attr = {}, text?: string) {
  const e = document.createElementNS(SVGNS, tag)
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, String(attrs[k]))
  if (text != null) e.textContent = text
  return e
}
function ht<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attr = {}, inner?: string) {
  const e = document.createElement(tag)
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, String(attrs[k]))
  if (inner != null) e.innerHTML = inner
  return e
}
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const procent = (n: number | null | undefined, dec = 0) => fmt(n, dec) + ' %'
function snygg(x: number) {
  const e = Math.pow(10, Math.floor(Math.log10(x)))
  const f = x / e
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e
}
function sistVarde(arr: (number | null)[]) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i]
    if (v != null) return { i, v }
  }
  return null
}

export function starta(rot: HTMLElement, D: JobbkartanData): () => void {
  const $ = <T extends Element = HTMLElement>(id: string) => rot.querySelector<T>('#' + id) ?? (document.getElementById(id) as T | null)
  const stadning: (() => void)[] = []
  const lyssna = <K extends keyof WindowEventMap>(typ: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    window.addEventListener(typ, fn, opts)
    stadning.push(() => window.removeEventListener(typ, fn, opts))
  }
  const lugn = matchMedia('(prefers-reduced-motion: reduce)').matches
  const smal = () => innerWidth < 700
  const geo = D.geo
  const LAN = D.lanKoder
  const AR = D.ar.length
  const namn = (kod: string) => D.lanNamn[kod]
  const kort = (kod: string) => kortLan(D.lanNamn[kod])
  const NQ = D.kvartal.length
  const SIST = NQ - 1
  const NM = D.manader.length

  const state = { q: SIST, lan: LAN_STANDARD, yrke: YRKE_STANDARD, kommun: KOMMUN_STANDARD }
  {
    const m = /^#vy-(\d\d)-(\d{4})-(\d{4})-(\d)$/.exec(location.hash || '')
    if (m) {
      if (D.lanNamn[m[1]] && m[1] !== '00') state.lan = m[1]
      state.yrke = m[2]
      state.kommun = m[3]
      if (+m[4] < NQ) state.q = +m[4]
    }
  }
  const vyKod = () => `vy-${state.lan}-${state.yrke}-${state.kommun}-${state.q}`
  let skrivHashT: ReturnType<typeof setTimeout> | undefined
  function skrivHash() {
    visaBadd()
    if (!location.hash && state.lan === LAN_STANDARD && state.yrke === YRKE_STANDARD && state.kommun === KOMMUN_STANDARD && state.q === SIST) return
    clearTimeout(skrivHashT)
    skrivHashT = setTimeout(() => {
      try {
        history.replaceState(history.state, '', '#' + vyKod())
      } catch {
        /* inbäddad i en ram som inte tillåter det */
      }
    }, 150)
  }

  /* ------------------------------------------------------------ Konkurrensen */
  function kon(kod: string, q: number) {
    const m = D.matchning[kod]
    const l = m?.lediga[q]
    const a = m?.arbetslosa[q]
    return l && a != null ? a / l : null
  }
  function konSpann(kod: string, q: number): [number, number] | null {
    const m = D.matchning[kod]
    const l = m.lediga[q], o = m.lediga_osak[q] || 0, a = m.arbetslosa[q]
    if (!l || a == null) return null
    return [a / (l + o), l - o > 0 ? a / (l - o) : Infinity]
  }
  /** Fast skala över alla kvartal så att animationen går att jämföra: 0,8 per steg. */
  const konSteg = (v: number | null) => (v == null ? 0 : Math.min(5, Math.floor(v / 0.8) + 1))
  const konT = (v: number | null) => (v == null ? null : Math.min(1, v / 4))
  function extrem(q: number) {
    let min: { kod: string; v: number } | null = null
    let max: { kod: string; v: number } | null = null
    for (const k of LAN) {
      const v = kon(k, q)
      if (v == null) continue
      if (!min || v < min.v) min = { kod: k, v }
      if (!max || v > max.v) max = { kod: k, v }
    }
    return { min, max }
  }

  /* ------------------------------------------------------------ Tooltip och meddelanden */
  const tips = $('jk-tips')
  function visaTips(html: string, x: number, y: number) {
    if (!tips) return
    tips.innerHTML = html
    tips.hidden = false
    const r = tips.getBoundingClientRect()
    let lx = x + 16, ly = y + 16
    if (lx + r.width > innerWidth - 8) lx = x - r.width - 12
    if (ly + r.height > innerHeight - 8) ly = y - r.height - 12
    tips.style.left = Math.max(8, lx) + 'px'
    tips.style.top = Math.max(8, ly) + 'px'
  }
  const gomTips = () => {
    if (tips) tips.hidden = true
  }
  let toastT: ReturnType<typeof setTimeout> | undefined
  function toast(text: string) {
    const t = $('jk-toast')
    if (!t) return
    t.textContent = text
    t.classList.add('syns')
    clearTimeout(toastT)
    toastT = setTimeout(() => t.classList.remove('syns'), 1800)
  }
  function kopiera(text: string, besked: string) {
    const reserv = () => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        toast(besked)
      } catch {
        toast('Kunde inte kopiera, markera texten själv')
      }
      ta.remove()
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(besked), reserv)
    else reserv()
  }
  function laddaNer(filnamn: string, rader: (string | number | null)[][]) {
    const csv = rader
      .map((r) => r.map((c) => (c == null ? '' : typeof c === 'number' ? String(c).replace('.', ',') : '"' + String(c).replace(/"/g, '""') + '"')).join(';'))
      .join('\r\n')
    // BOM så att Excel läser å, ä och ö rätt.
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = filnamn
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast(`${filnamn} laddas ner, ${rader.length - 1} rader`)
  }

  function lanTips(kod: string, x: number, y: number) {
    const q = state.q, v = kon(kod, q), m = D.matchning[kod]
    const l = m.lediga[q] ?? 0, o = m.lediga_osak[q] || 0
    const lag = Math.max(0, l - o), hog = l + o
    const kv = stor(kvartalNamn(D.kvartal[q]))
    visaTips(
      `<b>${esc(namn(kod))}</b>` +
        `<div class="huvud"><strong>${fmt(v, 1)}</strong><span>arbetslösa per<br>ledigt jobb</span></div>` +
        `<div class="rad"><span>Arbetslösa</span><span>${fmt(m.arbetslosa[q])}</span></div>` +
        `<div class="rad"><span>Lediga jobb</span><span>cirka ${fmt(l)}</span></div>` +
        (o
          ? `<div class="spann"><div class="spann-wrap"><div class="spann-bar"></div><i class="spann-prick"></i></div>` +
            `<div class="spann-skala"><span>${fmt(lag)}</span><span>${fmt(hog)}</span></div></div>` +
            `<div class="tips-fot">SCB räknar lediga jobb med en urvalsundersökning. Det rätta antalet ligger med stor sannolikhet mellan ${fmt(lag)} och ${fmt(hog)}. ${esc(kv)}.</div>`
          : `<div class="tips-fot">${esc(kv)}</div>`),
      x,
      y,
    )
  }
  /** Tooltip, klick och tangentbord för länen på en karta eller i ett diagram. */
  function kopplaLan(host: Element, valj: ((kod: string) => void) | null, tipsFn: (kod: string, x: number, y: number) => void, sel = '.lan') {
    host.addEventListener('pointermove', (e) => {
      const pe = e as PointerEvent
      const g = (pe.target as Element).closest(sel)
      if (!g) return gomTips()
      tipsFn(g.getAttribute('data-kod')!, pe.clientX, pe.clientY)
    })
    host.addEventListener('pointerleave', gomTips)
    if (valj) {
      host.addEventListener('click', (e) => {
        const g = (e.target as Element).closest(sel)
        if (g) valj(g.getAttribute('data-kod')!)
      })
      host.addEventListener('keydown', (e) => {
        const ke = e as KeyboardEvent
        const g = (ke.target as Element).closest(sel)
        if (g && (ke.key === 'Enter' || ke.key === ' ')) {
          ke.preventDefault()
          valj(g.getAttribute('data-kod')!)
        }
      })
    }
    host.addEventListener('focusin', (e) => {
      const g = (e.target as Element).closest(sel)
      if (!g) return
      const r = g.getBoundingClientRect()
      tipsFn(g.getAttribute('data-kod')!, r.left + r.width / 2, r.top + r.height / 2)
    })
    host.addEventListener('focusout', gomTips)
  }

  /* ------------------------------------------------------------ Linjediagram */
  function linjeDiagram(svg: SVGSVGElement, o: LinjeOpts) {
    svg.innerHTML = ''
    const W = o.W || 1000, H = o.H || 300, L = 40, R = o.R || 70, T = 14, B = 30
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const alla: number[] = []
    for (const s of o.serier) {
      for (const v of s.v) if (v != null && isFinite(v)) alla.push(v)
      for (const b of s.band ?? []) if (b && isFinite(b[1])) alla.push(b[0], b[1])
    }
    if (!alla.length) return
    let mn = o.ymin ?? Math.min(...alla), mx = o.ymax ?? Math.max(...alla)
    if (mx === mn) { mx += 1; mn -= 1 }
    const pad = (mx - mn) * 0.08
    if (o.ymin == null) mn -= pad
    if (o.ymax == null) mx += pad
    const n = o.etiketter.length
    const sx = (i: number) => L + (i / (n - 1)) * (W - L - R)
    const sy = (v: number) => T + (1 - (v - mn) / (mx - mn)) * (H - T - B)
    const rasteg = snygg((mx - mn) / 4)
    for (let g = Math.ceil(mn / rasteg) * rasteg; g <= mx; g += rasteg) {
      svg.appendChild(sv('line', { class: 'rut', x1: L, x2: W - R, y1: sy(g), y2: sy(g) }))
      svg.appendChild(sv('text', { x: L - 8, y: sy(g) + 4, 'text-anchor': 'end' }, fmt(g, rasteg < 1 ? 1 : 0)))
    }
    const steg = Math.ceil(n / (o.xMax || 9))
    o.etiketter.forEach((e, i) => {
      if (e && (i % steg === 0 || i === n - 1))
        svg.appendChild(sv('text', { x: sx(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' }, e))
    })
    if (o.markera != null) svg.appendChild(sv('line', { class: 'sikte', x1: sx(o.markera), x2: sx(o.markera), y1: T, y2: H - B }))
    for (const s of o.serier) {
      if (!s.band) continue
      let d = '', d2 = ''
      s.band.forEach((b, i) => {
        if (!b || !isFinite(b[1])) return
        d += (d ? 'L' : 'M') + sx(i) + ' ' + sy(b[1])
        d2 = 'L' + sx(i) + ' ' + sy(b[0]) + d2
      })
      svg.appendChild(sv('path', { class: 'band', d: d + d2 + 'Z' }))
    }
    for (const s of o.serier) {
      let d = ''
      s.v.forEach((v, i) => {
        if (v == null) return
        d += (d ? 'L' : 'M') + sx(i) + ' ' + sy(v)
      })
      svg.appendChild(sv('path', { class: 'linje ' + s.klass, d }))
      const sist = sistVarde(s.v)
      if (!sist) continue
      svg.appendChild(sv('circle', { class: 'prick ' + s.klass.replace('serie', 'fyll'), cx: sx(sist.i), cy: sy(sist.v), r: 4.5 }))
      svg.appendChild(sv('text', { class: 'stark', x: sx(sist.i) + 10, y: sy(sist.v) + 4 }, fmt(sist.v, o.dec) + (o.enhet || '')))
    }
    // Slutetiketter som krockar skjuts isär lodrätt; punkterna ligger kvar.
    const etik = Array.from(svg.querySelectorAll('text.stark'))
      .map((t) => ({ t, y: +t.getAttribute('y')! }))
      .sort((a, b) => a.y - b.y)
    for (let i = 1; i < etik.length; i++)
      if (etik[i].y - etik[i - 1].y < 13) {
        etik[i].y = etik[i - 1].y + 13
        etik[i].t.setAttribute('y', String(etik[i].y))
      }
    const sikte = sv('line', { class: 'sikte', x1: 0, x2: 0, y1: T, y2: H - B, visibility: 'hidden' })
    svg.appendChild(sikte)
    const fang = sv('rect', { x: L, y: T, width: W - L - R, height: H - T - B, fill: 'transparent' })
    svg.appendChild(fang)
    fang.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect()
      const x = (e.clientX - r.left) * (W / r.width)
      const i = Math.max(0, Math.min(n - 1, Math.round(((x - L) / (W - L - R)) * (n - 1))))
      sikte.setAttribute('x1', String(sx(i)))
      sikte.setAttribute('x2', String(sx(i)))
      sikte.setAttribute('visibility', 'visible')
      let html = `<b>${esc(o.xVar ? o.xVar(i) : o.etiketter[i])}</b>`
      for (const s of o.serier) {
        const v = s.v[i]
        if (v == null) continue
        const b = s.band?.[i]
        html += `<div class="rad"><span>${esc(s.namn)}</span><span>${fmt(v, o.dec)}${o.enhet || ''}${b && isFinite(b[1]) ? ` (${fmt(b[0], o.dec)} till ${fmt(b[1], o.dec)})` : ''}</span></div>`
      }
      visaTips(html, e.clientX, e.clientY)
    })
    fang.addEventListener('pointerleave', () => {
      sikte.setAttribute('visibility', 'hidden')
      gomTips()
    })
  }
  function legend(host: Element | null, poster: { namn: string; farg: string; band?: boolean }[]) {
    if (!host) return
    host.innerHTML = poster
      .map((p) => `<span><i style="background:var(--${p.farg})" class="${p.band ? 'band' : ''}"></i>${esc(p.namn)}</span>`)
      .join('')
  }

  /* ------------------------------------------------------------ Hjältekartan */
  const karta = $<SVGSVGElement>('jk-karta')
  const P = projektor(geo)
  const p: Projektor = P.p
  const cent: Record<string, [number, number]> = {}
  for (const l of geo) cent[l.kod] = tyngdpunkt(l.ytor)
  let hojdNu: Record<string, number> = {}
  for (const k of LAN) hojdNu[k] = hojdFor(konT(kon(k, state.q)))
  let utropG: SVGGElement | null = null
  let bilRorelse: SVGAnimateMotionElement | null = null
  let animId = 0

  function ritaUtrop(hojder: Record<string, number>) {
    if (!karta || !utropG) return
    const vb = karta.viewBox.baseVal
    utropG.replaceChildren()
    const ex = extrem(state.q)
    const koder: string[] = []
    if (ex.min) koder.push(ex.min.kod)
    if (ex.max && !koder.includes(ex.max.kod)) koder.push(ex.max.kod)
    if (!koder.includes(state.lan)) koder.push(state.lan)
    const boxar: { x: number; y: number; w: number }[] = []
    const sk = smal() ? 1.4 : 1
    for (const kod of koder) {
      const v = kon(kod, state.q)
      const c = cent[kod]
      const q = p(c[0], c[1], hojder[kod])
      const text = kort(kod) + ' ' + fmt(v, 1)
      const w = (text.length * 8.4 + 22) * sk, hh = 28 * sk
      let x = q[0] - w / 2
      let y = q[1] - 46 * sk
      if (x < vb.x + 4) x = vb.x + 4
      if (x + w > vb.x + vb.width - 4) x = vb.x + vb.width - 4 - w
      for (const b of boxar) if (x < b.x + b.w && x + w > b.x && y < b.y + hh + 6 && y + hh + 6 > b.y) y = b.y - hh - 8
      boxar.push({ x, y, w })
      const g = sv('g')
      g.appendChild(sv('line', { x1: q[0], y1: q[1], x2: q[0], y2: y + hh }))
      g.appendChild(sv('circle', { cx: q[0], cy: q[1], r: 3.2 }))
      g.appendChild(sv('rect', { x, y, width: w, height: hh, rx: 14 }))
      const t = sv('text', { x: x + w / 2, y: y + hh / 2 + 5 * sk, 'text-anchor': 'middle', 'font-size': 15 * sk })
      t.appendChild(sv('tspan', {}, kort(kod) + ' '))
      t.appendChild(sv('tspan', { class: 'v' }, fmt(v, 1)))
      g.appendChild(t)
      utropG.appendChild(g)
    }
  }
  function ritaHjalte(hojder: Record<string, number>) {
    if (!karta) return
    const q = state.q
    uppdatera(karta, geo, p, (kod) => ({ h: hojder[kod], k: konSteg(kon(kod, q)), vald: kod === state.lan }))
    karta.querySelectorAll('.fjall').forEach((f) => {
      const kod = f.getAttribute('data-kod')
      const q2 = p(+f.getAttribute('data-x')!, +f.getAttribute('data-y')!, kod && hojder[kod] != null ? hojder[kod] : 0.02)
      f.setAttribute('transform', `translate(${q2[0]} ${q2[1]})`)
    })
    ritaUtrop(hojder)
  }
  function animeraHjalte() {
    const mal: Record<string, number> = {}
    for (const k of LAN) mal[k] = hojdFor(konT(kon(k, state.q)))
    cancelAnimationFrame(animId)
    if (lugn) {
      hojdNu = mal
      ritaHjalte(hojdNu)
      return
    }
    const fran = { ...hojdNu }
    const t0 = performance.now()
    const steg = (now: number) => {
      const t = Math.min(1, (now - t0) / 420)
      const e = 1 - Math.pow(1 - t, 3)
      for (const k of LAN) hojdNu[k] = lerp(fran[k], mal[k], e)
      ritaHjalte(hojdNu)
      if (t < 1) animId = requestAnimationFrame(steg)
    }
    animId = requestAnimationFrame(steg)
  }
  function ritaBilvag() {
    if (!bilRorelse) return
    // E4 och E20 mellan Malmö och Luleå: Malmö, Jönköping, Örebro, Stockholm, Hudiksvall, Umeå, Luleå.
    const stader = [[13.0, 55.6], [14.16, 57.78], [15.21, 59.27], [18.07, 59.33], [17.31, 62.39], [20.26, 63.83], [22.15, 65.58]]
    let d = ''
    stader.forEach((s, i) => {
      const x = (s[0] - 16.5) * Math.cos((s[1] * Math.PI) / 180) * 111.32
      const y = (s[1] - 60) * 110.57
      const lan = geo.find((g) => inuti(x, y, g.ytor))
      const q = p(x, y, lan ? (hojdNu[lan.kod] ?? 0.02) : 0.02)
      d += (i ? 'L' : 'M') + q[0] + ' ' + (q[1] - 3)
    })
    bilRorelse.setAttribute('path', d)
  }

  if (karta) {
    utropG = sv('g', { class: 'utrop', 'aria-hidden': 'true' })
    karta.appendChild(utropG)
    kopplaLan(karta, valjLan, lanTips)

    // Platsannonser som flyger in till de tre länen med flest annonser.
    const host = $('jk-annonser')
    if (D.annonser && host) {
      const vb = karta.viewBox.baseVal
      const per = D.annonser.perLan
      const topp = Object.keys(per).filter((k) => cent[k]).sort((a, b) => per[b] - per[a]).slice(0, 3)
      const ledare = sv('g', { 'aria-hidden': 'true' })
      karta.insertBefore(ledare, utropG)
      const liten = innerWidth < 600
      for (const kod of topp) {
        const c = cent[kod]
        const q = p(c[0], c[1], 0.2)
        const ost = c[0] > -20
        const dx = (ost ? 0.3 : -0.3) * vb.width
        const cx = Math.max(vb.x + (liten ? 0.24 : 0.12) * vb.width, Math.min(vb.x + vb.width * (liten ? 0.76 : 0.88), q[0] + dx))
        const cy = ost ? q[1] - 0.13 * vb.height : q[1] + 0.03 * vb.height
        ledare.appendChild(sv('path', { class: 'ledare', d: `M${q[0]} ${q[1]}Q${(q[0] + cx) / 2} ${cy - 30} ${cx} ${cy}` }))
        const k = ht('div', { class: 'annons' })
        k.style.left = ((cx - vb.x) / vb.width) * 100 + '%'
        k.style.top = ((cy - vb.y) / vb.height) * 100 + '%'
        k.innerHTML = `<svg aria-hidden="true"><use href="#jk-i-annons"/></svg><span><b>${fmt(per[kod])}</b>platsannonser i ${esc(kort(kod))}</span>`
        host.appendChild(k)
      }
    }

    // Budbilen kör fram och tillbaka mellan Malmö och Luleå. Av vid reducerad rörelse.
    if (!lugn) {
      const g = sv('g', { class: 'bil', 'aria-hidden': 'true' })
      g.innerHTML =
        '<rect class="kaross" x="-9" y="-7" width="18" height="9" rx="2"/><rect class="hytt" x="4" y="-5" width="6" height="7" rx="1.5"/><circle class="hjul" cx="-5" cy="2.5" r="2"/><circle class="hjul" cx="6" cy="2.5" r="2"/>'
      bilRorelse = sv('animateMotion', { dur: '70s', repeatCount: 'indefinite', keyPoints: '0;1;0', keyTimes: '0;0.5;1', calcMode: 'linear' })
      g.appendChild(bilRorelse)
      karta.insertBefore(g, utropG)
      ritaBilvag()
    }
  }

  const lanval = $<HTMLSelectElement>('jk-lanval')
  if (lanval) {
    for (const k of [...LAN].sort((a, b) => namn(a).localeCompare(namn(b), 'sv'))) lanval.appendChild(ht('option', { value: k }, esc(namn(k))))
    lanval.addEventListener('change', () => valjLan(lanval.value))
  }

  function valjLan(kod: string) {
    state.lan = kod
    if (lanval) lanval.value = kod
    ritaHjalte(hojdNu)
    ritaPikto()
    ritaStaplar()
    ritaTidlinje()
    ritaOsak()
    skrivHash()
  }

  /* Tidsreglaget och uppspelningen. */
  const reglage = $<HTMLInputElement>('jk-kvartal')
  const spela = $<HTMLButtonElement>('jk-spela')
  let spelar: ReturnType<typeof setInterval> | null = null
  function ritaRiket(q: number) {
    const v = $('jk-riket-v'), e = $('jk-riket-e'), o = $<HTMLOutputElement>('jk-kvartal-namn')
    if (v) v.textContent = fmt(kon('00', q), 1)
    if (e) e.textContent = 'arbetslösa per ledigt jobb i hela landet, ' + kvartalNamn(D.kvartal[q])
    if (o) o.value = kvartalNamn(D.kvartal[q])
  }
  function sattQ(q: number) {
    state.q = q
    if (reglage) reglage.value = String(q)
    ritaRiket(q)
    animeraHjalte()
    ritaPikto()
    ritaStaplar()
    ritaTidlinje()
    ritaOsak()
    ritaTabell()
    skrivHash()
    setTimeout(ritaBilvag, 460)
  }
  function stoppa() {
    if (!spelar || !spela) return
    clearInterval(spelar)
    spelar = null
    spela.setAttribute('aria-pressed', 'false')
    spela.setAttribute('aria-label', 'Spela upp kvartalen')
    spela.querySelector('path')?.setAttribute('d', 'M4 2.5v11l9-5.5z')
  }
  stadning.push(stoppa)
  if (reglage) {
    reglage.max = String(SIST)
    reglage.value = String(state.q)
    reglage.addEventListener('input', () => {
      stoppa()
      sattQ(+reglage.value)
    })
  }
  if (spela) {
    spela.addEventListener('click', () => {
      if (spelar) return stoppa()
      spela.setAttribute('aria-pressed', 'true')
      spela.setAttribute('aria-label', 'Pausa')
      spela.querySelector('path')?.setAttribute('d', 'M3 2.5h3.5v11H3zM9.5 2.5H13v11H9.5z')
      if (state.q >= SIST) sattQ(0)
      spelar = setInterval(() => {
        if (state.q >= SIST) return stoppa()
        sattQ(state.q + 1)
      }, lugn ? 1400 : 950)
    })
  }

  /* ------------------------------------------------------------ Piktogrammet */
  function ikon(id: string) {
    const s = sv('svg', { 'aria-hidden': 'true' })
    s.appendChild(sv('use', { href: '#' + id }))
    return s
  }
  function ritaPikto() {
    const jobb = $('jk-pikto-jobb'), folk = $('jk-pikto-folk')
    if (!jobb || !folk) return
    const kod = state.lan, q = state.q, v = kon(kod, q) ?? 0, r = kon('00', q) ?? 0
    $('jk-pikto-rubrik')!.textContent = namn(kod)
    $('jk-pikto-tal')!.textContent = fmt(v, 1)
    $('jk-pikto-e')!.textContent = 'arbetslösa per ledigt jobb, ' + kvartalNamn(D.kvartal[q])
    jobb.replaceChildren()
    for (let i = 0; i < 10; i++) jobb.appendChild(ikon('jk-i-jobb'))
    folk.replaceChildren()
    const n = Math.round(v * 10)
    for (let j = 0; j < n; j++) {
      const s = ikon('jk-i-person')
      s.style.setProperty('--i', String(j))
      if (j >= 10) s.classList.add('extra')
      folk.appendChild(s)
    }
    $('jk-pikto-folk-e')!.textContent = n + ' arbetslösa' + (n > 10 ? ', ' + (n - 10) + ' fler än jobben' : n < 10 ? ', färre än jobben' : ', lika många som jobben')
    const diff = v - r
    const jmf = Math.abs(diff) < 0.15 ? 'ungefär som i landet' : diff < 0 ? 'kortare kö än i landet' : 'längre kö än i landet'
    const m = D.matchning[kod]
    $('jk-pikto-text')!.innerHTML = `På tio lediga jobb i ${esc(kort(kod))} går ${n} arbetslösa, <b>${jmf}</b> (${fmt(r, 1)}). Bakom siffran: ${fmt(m.arbetslosa[q])} arbetslösa och ${fmt(m.lediga[q])} lediga jobb.`
  }

  /* ------------------------------------------------------------ Staplarna över länen */
  const lanstaplar = $<SVGSVGElement>('jk-lanstaplar')
  if (lanstaplar) kopplaLan(lanstaplar, valjLan, lanTips, '.rad')
  function ritaStaplar() {
    const svg = lanstaplar
    if (!svg) return
    svg.innerHTML = ''
    const q = state.q, r = kon('00', q) ?? 0
    const rader = LAN.map((k) => ({ kod: k, v: kon(k, q) }))
      .filter((x): x is { kod: string; v: number } => x.v != null)
      .sort((a, b) => a.v - b.v)
    const W = smal() ? 430 : 640, L = smal() ? 98 : 118, R = smal() ? 40 : 46, RH = 21, T = 8
    const H = T + rader.length * RH + 24
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const max = Math.max(4, Math.ceil(Math.max(...rader.map((x) => x.v))))
    const sx = (v: number) => L + (v / max) * (W - L - R)
    for (let g = 0; g <= max; g++) {
      svg.appendChild(sv('line', { class: 'rut', x1: sx(g), x2: sx(g), y1: T, y2: H - 20 }))
      svg.appendChild(sv('text', { x: sx(g), y: H - 4, 'text-anchor': 'middle' }, fmt(g)))
    }
    rader.forEach((x, i) => {
      const y = T + i * RH
      const vald = x.kod === state.lan
      const grp = sv('g', { class: 'rad', tabindex: 0, role: 'button', 'data-kod': x.kod, 'aria-label': `${namn(x.kod)}: ${fmt(x.v, 1)} arbetslösa per ledigt jobb` })
      grp.appendChild(sv('rect', { x: 0, y, width: W, height: RH, fill: 'transparent' }))
      grp.appendChild(sv('text', { x: L - 10, y: y + 14.5, 'text-anchor': 'end', class: vald ? 'stark' : '' }, kort(x.kod)))
      grp.appendChild(sv('rect', { class: 'stapel' + (vald ? ' vald' : ''), x: L, y: y + 3, width: Math.max(2, sx(x.v) - L), height: RH - 7, rx: 3 }))
      grp.appendChild(sv('text', { x: sx(x.v) + 6, y: y + 14.5, class: vald ? 'stark' : '' }, fmt(x.v, 1)))
      svg.appendChild(grp)
    })
    svg.appendChild(sv('line', { class: 'riket', x1: sx(r), x2: sx(r), y1: T - 4, y2: H - 20 }))
    svg.appendChild(sv('text', { x: sx(r) + 5, y: T + 8, class: 'stark' }, 'Hela landet ' + fmt(r, 1)))
    const rub = $('jk-staplar-rubrik')
    if (rub) rub.textContent = `Alla ${rader.length} län, ${kvartalNamn(D.kvartal[q])}`
  }

  function ritaTidlinje() {
    const svg = $<SVGSVGElement>('jk-tidlinje')
    if (!svg) return
    const kod = state.lan
    linjeDiagram(svg, {
      W: smal() ? 520 : 1000,
      H: smal() ? 260 : 300,
      xMax: smal() ? 5 : 9,
      etiketter: D.kvartal.map(kvartalKort),
      dec: 1,
      ymin: 0,
      markera: state.q,
      xVar: (i) => kvartalNamn(D.kvartal[i]),
      serier: [
        { namn: 'Hela landet', v: D.kvartal.map((_, q) => kon('00', q)), klass: 'serie-2', band: D.kvartal.map((_, q) => konSpann('00', q)) },
        { namn: namn(kod), v: D.kvartal.map((_, q) => kon(kod, q)), klass: 'serie-1' },
      ],
    })
    legend($('jk-tid-legend'), [
      { namn: 'Hela landet', farg: 'serie-2' },
      { namn: 'Osäkerhetsmarginal, lediga jobb', farg: 'serie-2', band: true },
      { namn: namn(kod), farg: 'serie-1' },
    ])
  }

  /* ------------------------------------------------------------ Yrket */
  const yrkeCache: Record<string, Yrke> = {}
  let yrkeIndex: [string, string, number][] | null = null
  async function hamtaYrke(kod: string): Promise<Yrke | null> {
    if (yrkeCache[kod]) return yrkeCache[kod]
    try {
      const r = await fetch(`${DATA}/yrke/${kod}.json`)
      if (!r.ok) return null
      return (yrkeCache[kod] = (await r.json()) as Yrke)
    } catch {
      return null
    }
  }
  async function hamtaYrkeIndex() {
    if (yrkeIndex) return yrkeIndex
    const r = await fetch(`${DATA}/yrken.json`)
    yrkeIndex = (await r.json()) as [string, string, number][]
    return yrkeIndex
  }

  function yrkeFakta(y: Yrke) {
    const a = y.lan, A = AR - 1
    let tot = 0, totL = 0
    LAN.forEach((_, i) => {
      tot += a[i * AR + A] || 0
      totL += D.totLan[i][A]
    })
    const rAndel = tot / totL
    const lq: Record<string, number | null> = {}, andel: Record<string, number> = {}, antal: Record<string, number> = {}, utv: Record<string, number | null> = {}
    const arsum = D.ar.map(() => 0)
    LAN.forEach((k, i) => {
      const n = a[i * AR + A] || 0
      antal[k] = n
      andel[k] = n / D.totLan[i][A]
      lq[k] = n >= 20 ? andel[k] / rAndel : null
      const n0 = a[i * AR] || 0
      utv[k] = n0 >= 100 && n >= 100 ? ((n - n0) / n0) * 100 : null
      for (let j = 0; j < AR; j++) arsum[j] += a[i * AR + j] || 0
    })
    const topp = LAN.filter((k) => lq[k] != null).sort((p1, p2) => lq[p2]! - lq[p1]!)
    const upp = LAN.filter((k) => utv[k] != null).sort((p1, p2) => utv[p2]! - utv[p1]!)
    let lonAr: number | null = null
    let lon: Record<string, number | null> | null = null
    if (y.lon) {
      for (let ai = D.lonAr.length - 1; ai >= 0 && lonAr == null; ai--) if (y.lon.some((r) => r[ai] > 0)) lonAr = ai
      if (lonAr != null) {
        const la = lonAr
        lon = {}
        D.lonRegioner.forEach((r, ri) => {
          lon![r] = y.lon![ri][la] > 0 ? y.lon![ri][la] : null
        })
      }
    }
    return { namn: y.namn, tot, lq, andel, antal, utv, topp, upp, ner: [...upp].reverse(), ar: arsum, kon: y.kon, lon, lonAr }
  }
  type Fakta = ReturnType<typeof yrkeFakta>
  const lqSteg = (v: number | null) => (v == null ? 0 : v < 0.5 ? 1 : v < 0.85 ? 2 : v < 1.2 ? 3 : v < 1.7 ? 4 : 5)
  let faktaNu: Fakta | null = null

  const yrkeKarta = $<SVGSVGElement>('jk-yrkekarta')
  let yrkeP: Projektor | null = null
  if (yrkeKarta) {
    const r = rita(geo, null, { id: 'y', marg: 16 })
    yrkeKarta.setAttribute('viewBox', r.viewBox)
    yrkeKarta.insertAdjacentHTML('beforeend', r.svg)
    yrkeP = r.p
    kopplaLan(yrkeKarta, null, (kod, x, y) => {
      const f = faktaNu
      if (!f) return
      visaTips(
        `<b>${esc(namn(kod))}</b>` +
          `<div class="huvud"><strong>${f.lq[kod] == null ? '–' : fmt(f.lq[kod], 1) + ' ×'}</strong><span>${f.lq[kod] == null ? 'för få anställda<br>för att jämföra' : 'jämfört med<br>landet'}</span></div>` +
          `<div class="rad"><span>Anställda ${D.ar[AR - 1]}</span><span>${fmt(f.antal[kod])}</span></div>` +
          `<div class="rad"><span>Andel av länets anställda</span><span>${procent(f.andel[kod] * 100, 2)}</span></div>` +
          (f.utv[kod] != null ? `<div class="rad"><span>Sedan ${D.ar[0]}</span><span>${f.utv[kod]! >= 0 ? '+' : ''}${fmt(f.utv[kod], 0)} %</span></div>` : ''),
        x,
        y,
      )
    })
  }

  const lonKarta = $<SVGSVGElement>('jk-lonkarta')
  let lonP: Projektor | null = null
  const regionFor = (lanKod: string) => Object.keys(D.nuts).find((r) => D.nuts[r].includes(lanKod)) ?? null
  if (lonKarta) {
    const r = rita(geo, null, { id: 'l', platt: true, marg: 10 })
    lonKarta.setAttribute('viewBox', r.viewBox)
    lonKarta.insertAdjacentHTML('beforeend', r.svg)
    lonP = r.p
    kopplaLan(lonKarta, null, (kod, x, y) => {
      const f = faktaNu
      const reg = regionFor(kod)
      if (!f || !reg) return
      const v = f.lon?.[reg]
      visaTips(
        `<b>${esc(D.riksomraden[reg])}</b><div class="rad"><span>${esc(namn(kod))} ingår</span></div>` +
          `<div class="rad"><span>Månadslön ${f.lonAr != null ? D.lonAr[f.lonAr] : ''}</span><span>${v ? fmt(v) + ' kr' : 'saknas'}</span></div>`,
        x,
        y,
      )
    })
  }

  function ritaLon(f: Fakta) {
    const svg = $<SVGSVGElement>('jk-lonstaplar')
    const fot = $('jk-lon-fot')
    if (!svg || !lonKarta || !lonP || !fot) return
    svg.innerHTML = ''
    const regs = D.lonRegioner.filter((r) => r !== 'SE')
    if (!f.lon) {
      uppdatera(lonKarta, geo, lonP, () => ({ h: 0.012, k: 0 }))
      svg.setAttribute('viewBox', '0 0 640 10')
      fot.textContent = `För ${f.namn.toLowerCase()} saknas lön i lönestrukturstatistiken, så kartan är grå.`
      return
    }
    const lon = f.lon
    const rader = regs.map((r) => ({ r, v: lon[r] })).filter((x): x is { r: string; v: number } => !!x.v).sort((a, b) => b.v - a.v)
    const rang: Record<string, number> = {}
    rader.forEach((x, i) => (rang[x.r] = i))
    const n = rader.length
    const stegFor = (i: number) => 5 - Math.min(4, Math.floor((i / n) * 5))
    uppdatera(lonKarta, geo, lonP, (kod) => {
      const r = regionFor(kod)
      return { h: 0.012, k: r == null || rang[r] == null ? 0 : stegFor(rang[r]) }
    })
    const W = smal() ? 440 : 640, L = smal() ? 126 : 170, R = smal() ? 70 : 80, RH = 26, T = 6, H = T + n * RH + 8
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const max = Math.max(...rader.map((x) => x.v))
    const sx = (v: number) => L + (v / (max * 1.05)) * (W - L - R)
    rader.forEach((x, i) => {
      const y = T + i * RH
      svg.appendChild(sv('text', { x: L - 10, y: y + 17, 'text-anchor': 'end' }, D.riksomraden[x.r]))
      svg.appendChild(sv('rect', { x: L, y: y + 4, width: sx(x.v) - L, height: RH - 8, rx: 3, fill: `var(--k${stegFor(i)})` }))
      svg.appendChild(sv('text', { x: sx(x.v) + 8, y: y + 17, class: 'stark' }, fmt(x.v) + ' kr'))
    })
    if (lon.SE) svg.appendChild(sv('line', { class: 'riket', x1: sx(lon.SE), x2: sx(lon.SE), y1: T, y2: H - 4 }))
    fot.textContent =
      `Medellön per månad ${D.lonAr[f.lonAr!]}, alla sektorer. ` +
      (lon.SE ? `Streckad linje: hela landet, ${fmt(lon.SE)} kr.` : '') +
      (rader.length < regs.length ? ' Områden utan uppgift visas inte.' : '')
  }

  function ritaYrke(y: Yrke) {
    if (!yrkeKarta || !yrkeP) return
    const f = (faktaNu = yrkeFakta(y))
    uppdatera(yrkeKarta, geo, yrkeP, (kod) => {
      const v = f.lq[kod]
      return { h: hojdFor(v == null ? null : Math.min(1, v / 2.5)), k: lqSteg(v) }
    })
    $('jk-yrke-namn')!.textContent = f.namn
    const t1 = f.topp[0]
    const lqV = $('jk-yrke-lq')!, lqE = $('jk-yrke-lq-e')!
    if (t1 && f.lq[t1]! >= 1.1) {
      lqV.textContent = fmt(f.lq[t1], 1) + ' ×'
      lqE.textContent = 'vanligare i ' + namn(t1) + ' än i landet i snitt'
    } else if (t1) {
      lqV.textContent = fmt(f.lq[t1], 1) + ' ×'
      lqE.textContent = 'i ' + namn(t1) + ', jämnt spritt över landet'
    } else {
      lqV.textContent = '–'
      lqE.textContent = 'för få anställda för att visa per län'
    }
    const ol = $('jk-yrke-topp')!
    ol.replaceChildren()
    const maxLq = t1 ? f.lq[t1]! : 1
    f.topp.slice(0, 4).forEach((k, i) => {
      ol.appendChild(
        ht('li', {}, `<span class="n">${i + 1}</span><span class="namn"><span>${esc(kort(k))}</span><i class="b" style="width:${Math.round((f.lq[k]! / maxLq) * 110)}px"></i></span><span class="v">${fmt(f.lq[k], 1)} ×</span>`),
      )
    })
    // Trenden i hela landet
    const d0 = f.ar[0], dN = f.ar[AR - 1]
    const delta = d0 ? ((dN - d0) / d0) * 100 : null
    const trend = $<SVGSVGElement>('jk-yrketrend')
    if (trend) linjeDiagram(trend, { W: 520, H: 180, R: 80, etiketter: D.ar, dec: 0, serier: [{ namn: 'Anställda i landet', v: f.ar, klass: 'serie-1' }] })
    $('jk-yrke-trend-rubrik')!.textContent = `Anställda i hela landet, ${D.ar[0]} till ${D.ar[AR - 1]}`
    $('jk-yrke-trend-text')!.innerHTML =
      `<b>${fmt(dN)} anställda ${D.ar[AR - 1]}</b>, ` +
      (delta == null ? `ingen uppgift för ${D.ar[0]}` : `${delta >= 0 ? '+' : ''}${fmt(delta, 0)} % sedan ${D.ar[0]}`) +
      '. Anställda med arbetsplats i länet, alla län summerade.'
    // Kön
    const [m, kv] = f.kon
    const pk = m + kv ? (kv / (m + kv)) * 100 : 0
    $('jk-konbar')!.innerHTML = `<i class="k" style="width:${pk}%"></i><i class="m" style="width:${100 - pk}%"></i>`
    $('jk-kon-rubrik')!.textContent = `Män och kvinnor i yrket, ${D.ar[AR - 1]}`
    $('jk-kon-etikett')!.innerHTML =
      `<span><i class="prick-k"></i><b>${procent(pk)}</b> kvinnor</span><span><b>${procent(100 - pk)}</b> män<i class="prick-m"></i></span>`
    // Växer och krymper
    const upp = $('jk-utv-upp')!, ner = $('jk-utv-ner')!
    upp.replaceChildren()
    ner.replaceChildren()
    const rad = (k: string) => ht('li', {}, `<span>${esc(kort(k))}</span><b>${f.utv[k]! >= 0 ? '+' : ''}${fmt(f.utv[k], 0)} %</b>`)
    f.upp.slice(0, 3).forEach((k) => upp.appendChild(rad(k)))
    f.ner.slice(0, 3).forEach((k) => ner.appendChild(rad(k)))
    if (!f.upp.length) upp.appendChild(ht('li', {}, '<span>För få anställda per län</span>'))
    const allaVaxer = f.ner.length > 0 && f.utv[f.ner[0]]! >= 0
    const allaKrymper = f.upp.length > 0 && f.utv[f.upp[0]]! < 0
    const period = `${D.ar[0]} till ${D.ar[AR - 1]}`
    $('jk-utv-upp-h')!.textContent = (allaKrymper ? 'Krymper minst, ' : 'Växer mest, ') + period
    $('jk-utv-ner-h')!.textContent = allaVaxer ? 'Växer minst' : 'Krymper mest'
    ritaLon(f)
  }

  const chips = $('jk-yrkechips')
  async function valjYrke(kod: string, skriv = true) {
    const y = await hamtaYrke(kod)
    if (!y) return
    state.yrke = kod
    chips?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', b.getAttribute('data-kod') === kod ? 'true' : 'false'))
    ritaYrke(y)
    if (skriv) skrivHash()
  }
  chips?.querySelectorAll<HTMLButtonElement>('.chip').forEach((b) => b.addEventListener('click', () => valjYrke(b.getAttribute('data-kod')!)))

  interface Post {
    kod: string
    namn: string
    sok: string
    extra: string
    vikt: number
  }
  function sokLista(input: HTMLInputElement, lista: HTMLUListElement, poster: () => Promise<Post[]>, onVal: (kod: string) => void, tomText: string) {
    let aktiv = -1
    let synliga: Post[] = []
    const stang = () => {
      lista.hidden = true
      input.setAttribute('aria-expanded', 'false')
      input.removeAttribute('aria-activedescendant')
      aktiv = -1
    }
    async function visa() {
      const q = input.value.trim().toLowerCase()
      if (!q) return stang()
      const alla = await poster()
      if (input.value.trim().toLowerCase() !== q) return
      lista.replaceChildren()
      synliga = alla
        .filter((p1) => p1.sok.includes(q))
        .sort((a, b) => (a.sok.startsWith(q) ? 0 : 1) - (b.sok.startsWith(q) ? 0 : 1) || b.vikt - a.vikt)
        .slice(0, 8)
      if (!synliga.length) lista.appendChild(ht('li', { 'aria-disabled': 'true' }, esc(tomText)))
      synliga.forEach((p1, i) => {
        const li = ht('li', { role: 'option', id: `${lista.id}-${i}`, 'aria-selected': 'false' }, `${esc(p1.namn)}<small>${esc(p1.extra)}</small>`)
        li.addEventListener('mousedown', (e) => {
          e.preventDefault()
          valj(p1)
        })
        lista.appendChild(li)
      })
      lista.hidden = false
      input.setAttribute('aria-expanded', 'true')
    }
    function valj(p1: Post) {
      input.value = ''
      stang()
      onVal(p1.kod)
    }
    input.addEventListener('input', visa)
    input.addEventListener('focus', () => {
      poster().catch(() => {})
      visa()
    })
    input.addEventListener('blur', () => setTimeout(stang, 120))
    input.addEventListener('keydown', (e) => {
      if (lista.hidden) return
      const li = lista.querySelectorAll('[role=option]')
      if (e.key === 'ArrowDown') { e.preventDefault(); aktiv = Math.min(li.length - 1, aktiv + 1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); aktiv = Math.max(0, aktiv - 1) }
      else if (e.key === 'Enter') {
        e.preventDefault()
        const p1 = synliga[aktiv >= 0 ? aktiv : 0]
        if (p1) valj(p1)
        return
      } else if (e.key === 'Escape') return stang()
      else return
      li.forEach((x, i) => x.setAttribute('aria-selected', i === aktiv ? 'true' : 'false'))
      if (aktiv >= 0) input.setAttribute('aria-activedescendant', li[aktiv].id)
    })
  }
  const yrkesok = $<HTMLInputElement>('jk-yrkesok'), yrkelista = $<HTMLUListElement>('jk-yrkelista')
  if (yrkesok && yrkelista) {
    let poster: Post[] | null = null
    sokLista(
      yrkesok,
      yrkelista,
      async () =>
        (poster ??= (await hamtaYrkeIndex()).map((y) => ({ kod: y[0], namn: y[1], sok: y[1].toLowerCase(), extra: fmt(y[2]) + ' anställda', vikt: y[2] }))),
      (kod) => valjYrke(kod),
      'Inget yrke matchar. Prova ett kortare ord.',
    )
  }

  /* ------------------------------------------------------------ Kommunen */
  let kommunerP: Promise<Kommun[]> | null = null
  const hamtaKommuner = () => (kommunerP ??= fetch(`${DATA}/kommuner.json`).then((r) => r.json() as Promise<Kommun[]>))
  async function ritaKommun(skriv = true) {
    const svgAl = $<SVGSVGElement>('jk-kommun-al-diagram'), svgSg = $<SVGSVGElement>('jk-kommun-sg-diagram')
    if (!svgAl || !svgSg) return
    let alla: Kommun[]
    try {
      alla = await hamtaKommuner()
    } catch {
      return
    }
    const k = alla.find((x) => x[0] === state.kommun) ?? alla.find((x) => x[0] === KOMMUN_STANDARD)
    if (!k) return
    state.kommun = k[0]
    const lanKod = k[0].slice(0, 2)
    const al = k[2], sg = k[3]
    const [lanAl, lanSg] = D.lanBas[lanKod]
    const [rAl, rSg] = D.lanBas['00']
    const s = sistVarde(al), s2 = sistVarde(sg)
    $('jk-kommun-namn')!.textContent = k[1]
    $('jk-kommun-al')!.textContent = s ? procent(s.v, 1) : '–'
    $('jk-kommun-al-e')!.textContent = s ? 'arbetslösa i ' + manadNamn(D.manader[s.i], true) : 'ingen uppgift'
    $('jk-kommun-sg')!.textContent = s2 ? procent(s2.v, 1) : '–'
    const la = s ? lanAl[s.i] : null, ra = s ? rAl[s.i] : null
    const jmf = s && la != null ? (Math.abs(s.v - la) < 0.2 ? 'ungefär som länet' : s.v < la ? 'lägre än länets ' + procent(la, 1) : 'högre än länets ' + procent(la, 1)) : ''
    const fjol = s && s.i >= 12 ? al[s.i - 12] : null
    $('jk-kommun-text')!.innerHTML = s
      ? `<b>${esc(k[1])}</b> ligger ${jmf} och hela landet har ${procent(ra, 1)}. Ett år tidigare: ${fjol != null ? procent(fjol, 1) : 'ingen uppgift'}.`
      : 'Ingen uppgift för kommunen.'
    const et = D.manader.map((m, i) => (i % 6 === 0 || i === NM - 1 ? manadNamn(m) : ''))
    const xVar = (i: number) => manadNamn(D.manader[i], true)
    const varden = [...al, ...lanAl, ...rAl].filter((v): v is number => v != null)
    linjeDiagram(svgAl, {
      W: 480, H: 240, R: 62, etiketter: et, xMax: 40, dec: 1, enhet: ' %', xVar, ymin: 0, ymax: Math.ceil(Math.max(...varden) * 1.15),
      serier: [{ namn: k[1], v: al, klass: 'serie-1' }, { namn: namn(lanKod), v: lanAl, klass: 'serie-2' }, { namn: 'Hela landet', v: rAl, klass: 'serie-3' }],
    })
    linjeDiagram(svgSg, {
      W: 480, H: 240, R: 62, etiketter: et, xMax: 40, dec: 1, enhet: ' %', xVar,
      serier: [{ namn: k[1], v: sg, klass: 'serie-1' }, { namn: namn(lanKod), v: lanSg, klass: 'serie-2' }, { namn: 'Hela landet', v: rSg, klass: 'serie-3' }],
    })
    legend($('jk-kommun-legend'), [{ namn: k[1], farg: 'serie-1' }, { namn: namn(lanKod), farg: 'serie-2' }, { namn: 'Hela landet', farg: 'serie-3' }])
    if (skriv) skrivHash()
  }
  const valjKommun = (kod: string) => {
    state.kommun = kod
    ritaKommun()
  }
  const kommunsok = $<HTMLInputElement>('jk-kommunsok'), kommunlista = $<HTMLUListElement>('jk-kommunlista')
  if (kommunsok && kommunlista) {
    let poster: Post[] | null = null
    sokLista(
      kommunsok,
      kommunlista,
      async () => (poster ??= (await hamtaKommuner()).map((k) => ({ kod: k[0], namn: k[1], sok: k[1].toLowerCase(), extra: kort(k[0].slice(0, 2)), vikt: 0 }))),
      valjKommun,
      'Ingen kommun matchar.',
    )
  }
  rot.querySelectorAll<HTMLButtonElement>('[data-kommun]').forEach((b) =>
    b.addEventListener('click', () => {
      valjKommun(b.getAttribute('data-kommun')!)
      $('jk-kommun')?.scrollIntoView({ behavior: lugn ? 'auto' : 'smooth', block: 'start' })
    }),
  )

  /* ------------------------------------------------------------ Journalister */
  function ritaOsak() {
    const v1 = $('jk-osak-riket'), v2 = $('jk-osak-lan')
    if (!v1 || !v2) return
    const q = state.q
    const sp = konSpann('00', q), m = D.matchning['00']
    v1.textContent = sp ? fmt(sp[0], 1) + ' till ' + fmt(sp[1], 1) : '–'
    $('jk-osak-riket-e')!.textContent = `Hela landet, ${kvartalNamn(D.kvartal[q])}: cirka ${fmt(m.lediga[q])} lediga jobb, plus eller minus ${fmt(m.lediga_osak[q])}. Då ligger kön någonstans i det här spannet.`
    const kod = state.lan, s2 = konSpann(kod, q), m2 = D.matchning[kod]
    v2.textContent = s2 ? fmt(s2[0], 1) + ' till ' + (isFinite(s2[1]) ? fmt(s2[1], 1) : 'okänt') : '–'
    $('jk-osak-lan-e')!.textContent =
      `${namn(kod)}: cirka ${fmt(m2.lediga[q])} lediga jobb, plus eller minus ${fmt(m2.lediga_osak[q])}` +
      (s2 && (!isFinite(s2[1]) || s2[1] / s2[0] > 3) ? '. Spannet är så brett att talet mest säger riktning.' : '.')
  }
  function ritaTabell() {
    const t = $<HTMLTableElement>('jk-tabell')
    if (!t) return
    // Tabellen är serverrenderad; bara markeringen av valt kvartal följer reglaget.
    t.querySelectorAll('[data-q]').forEach((c) => c.classList.toggle('nu', +c.getAttribute('data-q')! === state.q))
  }
  function baddKod() {
    return `<iframe src="https://www.jobbcoach.ai/embed/jobbkartan#${vyKod()}" width="600" height="1400" title="Jobbkartan från Jobbcoach.ai, data från SCB" loading="lazy" style="border:0;border-radius:16px;max-width:100%"></iframe>`
  }
  function visaBadd() {
    const c = $('jk-badd-kod')
    if (c) c.textContent = baddKod()
  }
  $('jk-csv-konk')?.addEventListener('click', () => {
    const q = state.q
    const rader: (string | number | null)[][] = [['Län', 'Kvartal', 'Arbetslösa', 'Lediga jobb', 'Osäkerhetsmarginal lediga jobb', 'Arbetslösa per ledigt jobb', 'Källa']]
    for (const kod of ['00', ...LAN]) {
      const m = D.matchning[kod]
      const v = kon(kod, q)
      rader.push([namn(kod), D.kvartal[q], m.arbetslosa[q], m.lediga[q], m.lediga_osak[q], v == null ? null : Math.round(v * 100) / 100, 'SCB TAB6428'])
    }
    laddaNer(`jobbkartan-konkurrens-${D.kvartal[q]}.csv`, rader)
  })
  $('jk-csv-yrke')?.addEventListener('click', async () => {
    const y = await hamtaYrke(state.yrke)
    if (!y) return
    const f = yrkeFakta(y)
    const rader: (string | number | null)[][] = [['Yrke (SSYK 2012)', 'Län', ...D.ar.map((a) => 'Anställda ' + a), `Andel av länets anställda ${D.ar[AR - 1]} (%)`, 'Jämfört med landet', 'Källa']]
    LAN.forEach((k, i) =>
      rader.push([
        `${y.kod} ${y.namn}`,
        namn(k),
        ...D.ar.map((_, j) => y.lan[i * AR + j]),
        Math.round(f.andel[k] * 10000) / 100,
        f.lq[k] == null ? null : Math.round(f.lq[k]! * 100) / 100,
        'SCB TAB4428',
      ]),
    )
    laddaNer(`jobbkartan-yrke-${y.kod}.csv`, rader)
  })
  $('jk-csv-kommun')?.addEventListener('click', async () => {
    const k = (await hamtaKommuner()).find((x) => x[0] === state.kommun)
    if (!k) return
    const lanKod = k[0].slice(0, 2)
    const rader: (string | number | null)[][] = [
      ['Månad', `${k[1]} arbetslöshet %`, `${k[1]} sysselsättningsgrad %`, `${namn(lanKod)} arbetslöshet %`, `${namn(lanKod)} sysselsättningsgrad %`, 'Riket arbetslöshet %', 'Riket sysselsättningsgrad %', 'Källa'],
    ]
    D.manader.forEach((m, i) =>
      rader.push([m, k[2][i], k[3][i], D.lanBas[lanKod][0][i], D.lanBas[lanKod][1][i], D.lanBas['00'][0][i], D.lanBas['00'][1][i], 'SCB TAB5663']),
    )
    laddaNer(`jobbkartan-kommun-${k[0]}.csv`, rader)
  })
  $('jk-badd')?.addEventListener('click', () => kopiera(baddKod(), 'Bäddkoden är kopierad'))
  $('jk-lank')?.addEventListener('click', () => kopiera(`${location.origin}/jobbkartan#${vyKod()}`, 'Länken är kopierad'))

  /* ------------------------------------------------------------ Storlek och start */
  let varSmal = smal()
  let resizeT: ReturnType<typeof setTimeout> | undefined
  lyssna('resize', () => {
    clearTimeout(resizeT)
    resizeT = setTimeout(() => {
      if (smal() === varSmal) return
      varSmal = smal()
      ritaHjalte(hojdNu)
      ritaStaplar()
      ritaTidlinje()
      if (yrkeCache[state.yrke]) ritaYrke(yrkeCache[state.yrke])
      ritaKommun(false)
    }, 200)
  })
  lyssna('scroll', gomTips, { passive: true })

  if (lanval) lanval.value = state.lan
  ritaRiket(state.q)
  if (state.q !== SIST) {
    for (const k of LAN) hojdNu[k] = hojdFor(konT(kon(k, state.q)))
    ritaBilvag()
  }
  ritaHjalte(hojdNu)
  ritaPikto()
  ritaStaplar()
  ritaTidlinje()
  ritaOsak()
  ritaTabell()
  visaBadd()

  // Yrket och kommunen hämtar sina filer när avsnitten närmar sig skärmen.
  const senare: [string, () => void][] = [
    ['jk-yrke', () => valjYrke(state.yrke, false).then(() => { if (!faktaNu) valjYrke(YRKE_STANDARD, false) })],
    ['jk-kommun', () => ritaKommun(false)],
  ]
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (poster) => {
        for (const p1 of poster) {
          if (!p1.isIntersecting) continue
          io.unobserve(p1.target)
          senare.find(([id]) => id === p1.target.id)?.[1]()
        }
      },
      { rootMargin: '800px 0px' },
    )
    for (const [id] of senare) {
      const e = $(id)
      if (e) io.observe(e)
    }
    stadning.push(() => io.disconnect())
  } else for (const [, fn] of senare) fn()

  rot.classList.add('jk-redo')
  return () => {
    cancelAnimationFrame(animId)
    clearTimeout(resizeT)
    clearTimeout(toastT)
    clearTimeout(skrivHashT)
    for (const f of stadning) f()
  }
}
