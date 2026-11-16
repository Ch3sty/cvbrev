/**
 * HTML-renderaren: CV:t i en mall som ett fristående HTML-dokument för
 * förhandsvisningen, exempel-iframen och PDF:en (samma HTML, plan avsnitt 3.4).
 *
 * ATS-säker och semantisk:
 *  - namnet är dokumentets h1 (data-falt="namn") och första texten i DOM:en,
 *    titeln har data-falt="titel" (exempel-iframens textbyte, planens villkor c),
 *  - varje avsnitt är <section data-avsnitt> med <h2 data-sektion>, varje post
 *    har data-post,
 *  - två spalter är en tabell utan kanter (Chrome delar den över sidor);
 *    huvudet ligger ovanför, och den korta spalten står först i DOM:en så att
 *    den läses hel före huvudspalten (direction: rtl lägger en högerspalt
 *    till höger),
 *  - inget absolut placerat utom tidsaxelns punkter, ingen gradienttext,
 *    spärrning högst 0,16 em, ingen avstavning.
 *
 * Sidbrytningen ligger här, inte i mallarna: poster bryts aldrig mitt i,
 * rubriken hålls ihop med första posten, ingen ensam rad sist eller först på
 * en sida (orphans och widows), och sidmarginalerna gäller på varje sida
 * (@page). Mallens tokens står som CSS-variabler på :root, så att en
 * konstnärlig mall kan bygga vidare i `extraCss`.
 */
import { getFontFamilyForHTML } from '@/lib/documents/typsnitt'
import type { CVMetadata } from '../../cv-metadata'
import type { MallVal } from '../kontrakt'
import { los, matt, palett, typsnittFor, WEBBTYPSNITT, type Hex, type Palett } from '../farg'
import {
  byggDokument,
  intygDetalj,
  kompetensForm,
  visaFoto,
  type Avsnitt,
  type Dokument,
  type KontaktRad,
  type Post,
} from '../innehall'
import type { Farg, Linje, MallDef, TextStil } from '../typer'
import { getMall, getMallMedAlias, losMallIdEllerForval } from '../register'

export interface RenderaHtmlVal {
  /** Förhandsvisning: en tom fotoplats visar initialen. Aldrig i PDF:en. */
  forhandsvisning?: boolean
}

/* ----------------------------------------------------------- hjälpare */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Ett riktigt mellanslag som Chrome skriver ut i PDF:ens text, också mellan flexceller. */
const MELLAN = '<span class="mellan"> </span>'
/** " · " mellan uppgifter på en rad; varje uppgift är ett eget element. */
const PRICK = '<span class="prick"> · </span>'

interface Ctx {
  def: MallDef
  val: MallVal
  p: Palett
  opt: RenderaHtmlVal
  f: (x: Farg | undefined, reserv: Hex) => Hex
}

/** Marginalkolumnens bredd när layouten har en. */
function marginalBredd(def: MallDef): number | null {
  const l = def.layout
  return l.typ === 'marginalrubrik' || l.typ === 'marginalperiod' ? l.bredd : null
}

/* -------------------------------------------------------------- huvudet */

function kontaktLista(rader: KontaktRad[], form: 'rad' | 'lista'): string {
  if (!rader.length) return ''
  const li = rader.map((r) => `<li data-falt="${r.typ}">${esc(r.text)}</li>`)
  return `<ul class="kontakt kontakt-${form}" data-falt="kontakt">${form === 'rad' ? li.join(`<li class="prick" aria-hidden="true"> · </li>`) : li.join('')}</ul>`
}

function foto(dok: Dokument, c: Ctx): string {
  const { def, val, opt } = c
  if (!def.foto || !visaFoto(def, val)) return ''
  const klass = `foto foto-${def.foto.form}`
  if (dok.foto) return `<img class="${klass}" src="${esc(dok.foto)}" alt="" data-falt="foto">`
  if (opt.forhandsvisning) return `<div class="${klass} foto-tom" aria-hidden="true" data-falt="foto">${esc(dok.initial)}</div>`
  return ''
}

function namnOchTitel(dok: Dokument): string {
  return `<h1 class="namn" data-falt="namn">${esc(dok.namn)}</h1><p class="titel" data-falt="titel">${esc(dok.titel)}</p>`
}

function huvud(dok: Dokument, c: Ctx, iSpalt = false): string {
  const { def } = c
  const h = def.huvud
  const kontaktIHuvud = !(def.layout.typ === 'sidospalt' && def.layout.spalt.kontakt)
  const kontakt = kontaktIHuvud ? kontaktLista(dok.kontakt, h.kontakt) : ''
  const bild = def.foto && def.foto.plats !== 'sidospalt' && !iSpalt ? foto(dok, c) : ''
  const form = iSpalt ? 'vanster' : h.form
  // Fotot står efter texten i DOM:en (namnet först i läsordningen) och flyttas med order.
  if (form === 'block-vanster') {
    return `<header class="huvud huvud-block"><div class="namnruta">${`<h1 class="namn" data-falt="namn">${esc(dok.namn)}</h1>`}</div><div class="huvud-text"><p class="titel" data-falt="titel">${esc(dok.titel)}</p>${kontakt}</div></header>`
  }
  if (form === 'tidningshuvud') {
    return `<header class="huvud huvud-tidning"><h1 class="namn" data-falt="namn">${esc(dok.namn)}</h1><div class="daterad"><p class="titel" data-falt="titel">${esc(
      dok.titel
    )}</p>${MELLAN}${kontakt}</div></header>`
  }
  const fotoKlass = def.foto ? ` foto-${def.foto.plats}` : ''
  return `<header class="huvud huvud-${form}${fotoKlass}${bild ? ' med-foto' : ''}"><div class="huvud-text">${namnOchTitel(dok)}${kontakt}</div>${bild}</header>`
}

/* ---------------------------------------------------------------- poster */

function post(p: Post, c: Ctx, sektion: string): string {
  const { def } = c
  const l = def.layout
  const titel = `<h3 class="posttitel">${esc(p.titel)}</h3>`
  const under = p.under ? `<p class="under">${esc(p.under)}</p>` : ''
  const text = p.text.map((t) => `<p class="posttext">${esc(t)}</p>`).join('')
  const punkter = p.punkter.length ? `<ul class="punkter">${p.punkter.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''
  if (l.typ === 'marginalperiod') {
    let marg: string
    if (l.stortAr && p.startAr) {
      const slut = p.slut === 'Pågående' ? 'Pågående' : p.slut && p.slut !== p.startAr ? `till ${p.slut}` : ''
      marg = `<p class="period-marginal stort-ar"><span class="ar">${esc(p.startAr)}</span>${slut ? `${MELLAN}<span class="slut">${esc(slut)}</span>` : ''}</p>`
    } else {
      marg = p.period ? `<p class="period-marginal"><span class="period">${esc(p.period)}</span></p>` : ''
    }
    return `<div class="post post-${sektion} post-marginal" data-post>${marg}<div class="post-innehall">${titel}${under}${text}${punkter}</div></div>`
  }
  const period = p.period ? `${MELLAN}<span class="period">${esc(p.period)}</span>` : ''
  return `<div class="post post-${sektion}" data-post><div class="postrad">${titel}${period}</div>${under}${text}${punkter}</div>`
}

/* -------------------------------------------------------------- avsnitt */

/** En rad med etiketten i marginalkolumnen. */
function marginalRad(etikett: string, innehall: string, klass = ''): string {
  return `<div class="mrad ${klass}"><p class="metikett">${etikett}</p><div class="minnehall">${innehall}</div></div>`
}

function kompetenser(a: Avsnitt & { innehall: { typ: 'kompetenser' } }, c: Ctx, iSpalt: boolean): string[] {
  const form = kompetensForm(c.def, iSpalt)
  const grupper = a.innehall.grupper
  const lista = (l: string[]) => `<ul class="lista">${l.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`
  switch (form) {
    case 'grupp':
      return grupper.map((g) => `<p class="grupp">${g.namn ? `<strong>${esc(g.namn)}:</strong> ` : ''}${g.lista.map(esc).join(', ')}</p>`)
    case 'mittpunkt':
      return grupper.map(
        (g) =>
          `<div class="grupp-mitt">${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}<p class="mittpunkt">${g.lista
            .map((s) => `<span class="kompetens">${esc(s)}</span>`)
            .join(PRICK)}</p></div>`
      )
    case 'lista':
      return grupper.map((g) => `<div class="grupp-lista">${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}${lista(g.lista)}</div>`)
    case 'brickor':
      return grupper.map(
        (g) =>
          `<div class="grupp-brickor">${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}<p class="brickor">${g.lista
            .map((s) => `<span class="bricka">${esc(s)}</span>`)
            .join(' ')}</p></div>`
      )
    case 'marginal':
      return grupper.map((g) => marginalRad(esc(g.namn), `<p>${g.lista.map(esc).join(', ')}</p>`))
    case 'spalter': {
      const rader: string[] = []
      for (let i = 0; i < grupper.length; i += 2) {
        const par = grupper.slice(i, i + 2)
        rader.push(
          `<tr>${par
            .map((g) => `<td>${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}${lista(g.lista)}</td>`)
            .join('')}${par.length < 2 ? '<td></td>' : ''}</tr>`
        )
      }
      return [`<table class="kompetensspalter" role="presentation"><tbody>${rader.join('')}</tbody></table>`]
    }
  }
}

function block(a: Avsnitt, c: Ctx, iSpalt: boolean): string[] {
  const { def } = c
  const inn = a.innehall
  const formIntyg = iSpalt ? 'lista' : def.intyg
  const formSprak = iSpalt ? 'lista' : def.sprak
  switch (inn.typ) {
    case 'text':
      return inn.stycken.map((t) => `<p class="text">${esc(t)}</p>`)
    case 'poster':
      return inn.poster.map((p) => post(p, c, a.sektion))
    case 'lista':
      if (iSpalt) return [`<ul class="lista">${inn.rader.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`]
      return [`<p class="rad">${inn.rader.map((r) => `<span>${esc(r)}</span>`).join(PRICK)}</p>`]
    case 'intyg': {
      if (formIntyg === 'marginal')
        return inn.rader.map((r) => marginalRad(esc(r.ar), `<p><span class="intyg-namn">${esc(r.namn)}</span>${r.utgivare ? `, <span class="intyg-detalj">${esc(r.utgivare)}</span>` : ''}</p>`))
      if (formIntyg === 'lista') {
        const rader = inn.rader.map(
          (r) => `<li><span class="intyg-namn">${esc(r.namn)}</span>${intygDetalj(r) ? `<br><span class="intyg-detalj">${esc(intygDetalj(r, ', '))}</span>` : ''}</li>`
        )
        return [`<ul class="intyglista">${rader.join('')}</ul>`]
      }
      return inn.rader.map(
        (r) => `<div class="intygrad"><span class="intyg-namn">${esc(r.namn)}</span>${intygDetalj(r) ? `${MELLAN}<span class="intyg-detalj">${esc(intygDetalj(r))}</span>` : ''}</div>`
      )
    }
    case 'sprak': {
      if (formSprak === 'marginal') return inn.rader.map((r) => marginalRad(esc(r.sprak), `<p>${esc(r.niva)}</p>`))
      if (formSprak === 'lista')
        return [`<ul class="spraklista">${inn.rader.map((r) => `<li><span class="sprak">${esc(r.sprak)}</span>${r.niva ? `${MELLAN}<span class="niva">${esc(r.niva)}</span>` : ''}</li>`).join('')}</ul>`]
      return [`<p class="rad sprakrad">${inn.rader.map((r) => `<span><strong>${esc(r.sprak)}</strong>${r.niva ? ` ${esc(r.niva)}` : ''}</span>`).join(PRICK)}</p>`]
    }
    case 'kompetenser':
      return kompetenser(a as Avsnitt & { innehall: { typ: 'kompetenser' } }, c, iSpalt)
  }
}

function avsnitt(a: Avsnitt, c: Ctx, iSpalt: boolean): string {
  let delar = block(a, c, iSpalt)
  // Certifieringarna i ett fält i spalten (Kalksten, Granit): rubriken och raderna i en ruta.
  const intygsfalt = iSpalt && a.sektion === 'intyg' && c.def.layout.typ === 'sidospalt' && c.def.layout.spalt.intygsfalt
  const rubrik = `<h2 class="rubrik" data-sektion="${a.sektion}">${esc(a.rubrik)}</h2>`
  if (c.def.profilSpalter && a.sektion === 'profil' && !iSpalt) delar = [`<div class="profilspalter">${delar.join('')}</div>`]
  const forsta = `<div class="start">${rubrik}${delar[0] ?? ''}</div>`
  const klass = `avsnitt avsnitt-${a.sektion} typ-${a.innehall.typ}${intygsfalt ? ' intygsfalt' : ''}`
  return `<section class="${klass}" data-avsnitt="${a.sektion}">${forsta}${delar.slice(1).join('')}</section>`
}

function kontaktAvsnitt(dok: Dokument): string {
  if (!dok.kontakt.length) return ''
  return `<section class="avsnitt avsnitt-kontakt" data-avsnitt="kontakt"><div class="start"><h2 class="rubrik" data-sektion="kontakt">Kontakt</h2>${kontaktLista(
    dok.kontakt,
    'lista'
  )}</div></section>`
}

/** Tidsaxeln under huvudet (Horisont, bara PDF). Utgår med färre än två poster. */
function tidsaxel(dok: Dokument): string {
  const punkter = dok.tidsaxel
  if (punkter.length < 2) return ''
  const forsta = punkter[0].ar
  const sista = new Date().getFullYear() + 1
  const pos = (ar: number) => 5 + ((ar - forsta) / Math.max(1, sista - forsta)) * 90
  let senast = -Infinity
  let nere = false
  const delar = punkter.map((p) => {
    // Etiketter närmare än tre år växlar till nedre raden.
    nere = p.ar - senast < 3 ? !nere : false
    senast = p.ar
    return `<div class="axelpunkt axel-${p.typ}${nere ? ' axel-nere' : ''}" style="left:${pos(p.ar).toFixed(2)}%"><span class="axelprick"></span><span class="axeletikett"><strong>${p.ar}</strong>${MELLAN}${esc(
      p.etikett
    )}</span></div>`
  })
  return `<div class="tidsaxel" aria-hidden="true">${delar.join('')}</div>`
}

/* ---------------------------------------------------------------- CSS */

function textStil(t: TextStil | undefined, c: Ctx, reservFarg: Hex): string {
  if (!t) return ''
  return [
    t.vikt ? `font-weight:${t.vikt}` : '',
    t.versaler ? 'text-transform:uppercase' : '',
    t.kursiv ? 'font-style:italic' : '',
    t.sparrning !== undefined ? `letter-spacing:${Math.min(t.sparrning, 0.16)}em` : '',
    `color:${c.f(t.farg, reservFarg)}`,
  ]
    .filter(Boolean)
    .join(';')
}

const linjeCss = (l: Linje, c: Ctx, reserv: Hex) => `${l.pt}pt solid ${c.f(l.farg, reserv)}`

function css(c: Ctx): string {
  const { def, val, p, f } = c
  const m = matt(def, val)
  const g = (pt: number) => `${m.grad(pt)}pt`
  const typ = typsnittFor(def, val)
  const h = def.huvud
  const r = def.rubrik
  const l = def.layout
  const mb = marginalBredd(def)
  const band = h.form === 'band' ? h.band : undefined
  const fotoMm = def.foto?.storlek ?? 30
  const sidfarg = def.farger.sida ?? '#ffffff'

  const ut: string[] = []
  ut.push(`:root{--accent:${p.accent};--ton:${p.ton};--text:${p.text};--dampad:${p.dampad};--linje:${p.linje};--sida:${sidfarg};
--typsnitt:${getFontFamilyForHTML(typ.brod)};--typsnitt-rubrik:${getFontFamilyForHTML(typ.rubrik)};
--grad:${g(def.grad.brod)};--grad-namn:${g(def.grad.namn)};--grad-titel:${g(def.grad.titel)};--grad-kontakt:${g(def.grad.kontakt)};
--grad-rubrik:${g(def.grad.rubrik)};--grad-post:${g(def.grad.posttitel)};--grad-period:${g(def.grad.period)};--grad-spalt:${g(def.grad.sidospalt ?? def.grad.brod)};
--sida-topp:${m.sida.topp}mm;--sida-botten:${m.sida.botten}mm;--sida-vanster:${m.sida.vanster}mm;--sida-hoger:${m.sida.hoger}mm;
--radavstand:${def.radavstand};--marginal:${mb ?? 0}mm;--punkt-indrag:${def.punkt.indrag}mm}`)
  ut.push(`*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:var(--sida)}
body{background:var(--sida);color:var(--text);font-family:var(--typsnitt);font-size:var(--grad);line-height:var(--radavstand);font-kerning:normal;hyphens:none;-webkit-hyphens:none;overflow-wrap:break-word}
.cv{background:var(--sida);width:210mm;min-height:297mm;margin:0 auto;padding:var(--sida-topp) var(--sida-hoger) var(--sida-botten) var(--sida-vanster)}
.mellan{white-space:pre}
.prick{white-space:pre;color:${f('dampad', p.dampad)}}
h1,h2,h3{font:inherit}
.namn,.rubrik{font-family:var(--typsnitt-rubrik)}
p,li{orphans:2;widows:2}
ul{list-style:none}
strong{font-weight:700}`)

  // Huvudet
  ut.push(`.huvud{display:flex;gap:7mm;align-items:center;margin-bottom:${h.luftUnder}mm;break-inside:avoid;break-after:avoid}
.huvud-text{flex:1;min-width:0}
.namn{font-size:var(--grad-namn);line-height:${h.namn.radavstand ?? 1.1};${textStil({ vikt: 700, ...h.namn }, c, p.text)}}
.titel{font-size:var(--grad-titel);margin-top:${h.luftTitel}mm;${textStil(h.titel, c, p.accent)}}
.titel:empty{display:none}
.kontakt{font-size:var(--grad-kontakt);color:${f('dampad', p.dampad)};margin-top:${h.luftKontakt}mm}
.kontakt-rad{display:flex;flex-wrap:wrap}
.kontakt-lista li{line-height:1.5;overflow-wrap:anywhere}
.huvud-centrerad{flex-direction:column;text-align:center;gap:4mm}
.huvud-centrerad .kontakt-rad{justify-content:center}
.huvud-centrerad .foto{order:-1}
.huvud-hoger{text-align:right}
.huvud-hoger .kontakt-rad{justify-content:flex-end}
.foto-huvud-vanster .foto{order:-1}
.foto-huvud-hoger{align-items:flex-start}`)
  if (h.linjeUnder) {
    const lu = h.linjeUnder
    ut.push(
      lu.dubbel
        ? `.huvud{border-bottom:${lu.pt * 3 + 2}pt double ${f(lu.farg, p.linje)};padding-bottom:${lu.luft}mm}`
        : `.huvud{border-bottom:${linjeCss(lu, c, p.linje)};padding-bottom:${lu.luft}mm}`
    )
  }
  if (h.stapel) ut.push(`.huvud-text{border-left:${linjeCss(h.stapel, c, p.accent)};padding-left:${h.stapel.indrag}mm}`)
  if (band) {
    ut.push(`.huvud-band{background:${f(band.bakgrund, p.accent)};margin:0 calc(-1 * var(--sida-hoger)) ${h.luftUnder}mm calc(-1 * var(--sida-vanster));
padding:${band.luft.topp}mm ${band.luft.sidor}mm ${band.luft.botten}mm;${band.minHojd ? `min-height:${band.minHojd}mm;` : ''}align-items:center}
.huvud-band .namn,.huvud-band .titel,.huvud-band .kontakt,.huvud-band .prick{color:${f(band.text, p.vit)}}
.huvud-band.foto-huvud-hoger{align-items:center}
@media screen{.huvud-band{margin-top:calc(-1 * var(--sida-topp))}}`)
  }
  if (h.form === 'block-vanster' && h.block) {
    const b = h.block
    ut.push(`.huvud-block{align-items:flex-end;gap:8mm}
.namnruta{flex:none;width:${b.storlek}mm;height:${b.storlek}mm;background:${f(b.bakgrund, p.accent)};padding:${b.luft}mm;display:flex;align-items:flex-end}
.namnruta .namn{color:${f(b.text, p.vit)}}
.huvud-block .titel{margin-top:0}`)
  }
  if (h.form === 'tidningshuvud') {
    ut.push(`.huvud-tidning{display:block;border-top:2pt solid ${p.text};text-align:center}
.huvud-tidning .namn{padding:2mm 0 1.5mm;border-bottom:0.5pt solid ${p.text}}
.daterad{display:flex;justify-content:space-between;align-items:baseline;gap:4mm;padding:1.5mm 0;border-bottom:0.5pt solid ${p.text};text-align:left}
.daterad .titel{margin:0}
.daterad .kontakt{margin:0;justify-content:flex-end}`)
  }

  // Foto
  ut.push(`.foto{display:block;flex:none;width:${fotoMm}mm;height:${fotoMm}mm;object-fit:cover;background:var(--ton)}
.foto-rund{border-radius:50%}
.foto-tom{display:flex;align-items:center;justify-content:center;font-family:var(--typsnitt-rubrik);font-size:${Math.round(fotoMm * 1.1)}pt;color:var(--accent)}`)

  // Rubriker
  const rl = r.linje
  let rubrikLinje = ''
  if (rl && rl.var === 'vanster') rubrikLinje = `border-left:${linjeCss(rl, c, p.accent)};padding-left:${rl.luft}mm;`
  else if (rl && !rl.langd) rubrikLinje = `border-${rl.var === 'under' ? 'bottom' : 'top'}:${linjeCss(rl, c, p.linje)};padding-${rl.var === 'under' ? 'bottom' : 'top'}:${rl.luft}mm;`
  ut.push(`.avsnitt{margin-top:${m.luftOver}mm}
.cv-kropp>.avsnitt:first-child,.spalt>.avsnitt:first-child{margin-top:0}
.start{break-inside:avoid}
.rubrik{font-size:var(--grad-rubrik);line-height:1.25;margin-bottom:${r.luftUnder}mm;${textStil({ vikt: 700, ...r }, c, p.accent)};${rubrikLinje}${
    r.justering === 'centrerad' ? 'text-align:center;' : ''
  }${r.indrag ? `padding-left:${r.indrag}mm;` : ''}break-after:avoid}`)
  if (rl?.langd) ut.push(`.rubrik::after{content:"";display:block;width:${rl.langd}mm;margin-top:${rl.luft}mm;border-top:${linjeCss(rl, c, p.accent)}}`)
  if (r.band) ut.push(`.rubrik{background:${f(r.band.bakgrund, p.ton)};padding:${r.band.lodratt}mm ${r.band.sidor}mm}`)
  if (r.kvadrat) ut.push(`.rubrik::before{content:"";display:inline-block;width:${r.kvadrat.mm}mm;height:${r.kvadrat.mm}mm;background:${f(r.kvadrat.farg, p.accent)};margin-right:${r.kvadrat.luft}mm;vertical-align:0.05em}`)

  // Layouten
  if (l.typ === 'marginalrubrik') {
    ut.push(`.cv-kropp .avsnitt{padding-left:var(--marginal)}
.cv-kropp .avsnitt::after{content:"";display:block;clear:both}
.cv-kropp .rubrik{float:left;width:calc(var(--marginal) - 4mm);margin-left:calc(-1 * var(--marginal));margin-bottom:0}`)
    if (l.linjeOver) ut.push(`.cv-kropp .avsnitt+.avsnitt{border-top:${linjeCss(l.linjeOver, c, p.linje)};padding-top:${l.linjeOver.luft}mm}`)
  }
  if (l.typ === 'marginalperiod') {
    ut.push(`.post-marginal{display:flex;break-inside:avoid}
.period-marginal{flex:none;width:var(--marginal);padding-right:3mm}
.post-innehall{flex:1;min-width:0;padding-bottom:${def.post.luftMellan}mm}
.post-marginal+.post-marginal,.start>.post-marginal{margin-top:0}
.mrad{display:flex;break-inside:avoid}
.metikett{flex:none;width:var(--marginal);padding-right:3mm;font-weight:700}
.minnehall{flex:1;min-width:0}`)
    if (l.lodrat) ut.push(`.post-innehall{border-left:${linjeCss(l.lodrat, c, p.accent)};padding-left:${l.lodrat.luft}mm}`)
    if (l.indragAvsnitt) ut.push(`.cv-kropp .typ-text .text,.cv-kropp .typ-kompetenser .grupp,.cv-kropp .typ-kompetenser .grupp-mitt,.cv-kropp .typ-lista .rad,.cv-kropp .typ-intyg .intygrad,.cv-kropp .typ-sprak .sprakrad{margin-left:var(--marginal)}`)
    if (l.stortAr) ut.push(`.stort-ar .ar{display:block;font-size:${l.stortAr.pt}pt;line-height:1;font-weight:${l.stortAr.vikt};color:${l.stortAr.farg}}
.stort-ar .slut{display:block;font-size:9pt;color:#888;margin-top:1mm}
.stort-ar .mellan{display:none}`)
  } else {
    ut.push(`.mrad{display:flex;break-inside:avoid}.metikett{flex:none;width:30mm;font-weight:700}.minnehall{flex:1}`)
  }

  // Poster
  ut.push(`.post{break-inside:avoid;margin-top:${def.post.luftMellan}mm}
.start>.post{margin-top:0}
.postrad{display:flex;align-items:baseline}
.posttitel{flex:1;min-width:0;font-size:var(--grad-post);font-weight:700;line-height:1.3;color:${f(def.farger.posttitel, p.text)}}
.period{flex:none;padding-left:3mm;font-size:var(--grad-period);color:${f(def.farger.period, p.dampad)};${def.post.periodKursiv ? 'font-style:italic;' : ''}${def.post.periodFet ? 'font-weight:700;' : ''}font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}
.period-marginal .period{padding-left:0;text-align:left;white-space:normal}
.under{${textStil(def.post.arbetsgivare, c, f(def.farger.arbetsgivare, p.dampad))};margin-top:0.3mm}
.posttext{margin-top:0.8mm;color:${f('dampad', p.dampad)}}
.punkter,.lista{margin-top:1mm;padding-left:var(--punkt-indrag);list-style:"${def.punkt.tecken.replace(/"/g, '')}  " outside}
.punkter li,.lista li{margin-top:0.6mm;break-inside:avoid}
.punkter li::marker,.lista li::marker{color:${f(def.punkt.farg, p.text)}}
.text+.text{margin-top:1.5mm}`)
  if (def.post.linjeMellan) ut.push(`.start+.post,.post+.post{border-top:${linjeCss(def.post.linjeMellan, c, p.linje)};padding-top:${def.post.luftMellan}mm}`)

  // Kompetenser, intyg, språk
  ut.push(`.grupp+.grupp,.grupp-mitt+.grupp-mitt,.grupp-lista+.grupp-lista,.grupp-brickor+.grupp-brickor{margin-top:1.4mm}
.grupp strong,.gruppnamn{font-weight:700}
.gruppnamn{margin-bottom:0.4mm}
.grupp-lista .lista{margin-top:0.4mm}
.kompetensspalter{width:100%;border-collapse:collapse;table-layout:fixed;break-inside:avoid}
.kompetensspalter td{vertical-align:top;padding:0 6mm 1.5mm 0;width:50%}
.kompetensspalter td+td{padding-right:0}
.brickor{line-height:2}
.bricka{display:inline-block;line-height:1.35;border:0.75pt solid var(--accent);border-radius:3mm;padding:0.4mm 2.6mm;font-size:9pt;color:var(--accent);margin:0 1.5mm 1.5mm 0}
.intygrad,.spraklista li{display:flex;justify-content:space-between;align-items:baseline;gap:3mm;break-inside:avoid}
.intygrad+.intygrad{margin-top:0.8mm}
.intyg-detalj,.niva{color:${f('dampad', p.dampad)};font-size:var(--grad-period);text-align:right}
.intyglista li{break-inside:avoid}
.intyglista li+li{margin-top:1.5mm}
.intyglista .intyg-detalj{text-align:left}
.spraklista .sprak{font-weight:400}
.spraklista .niva{font-weight:700;color:inherit;font-size:inherit}
.avsnitt-referenser{break-before:avoid}
.avsnitt-referenser .text{color:${f('dampad', p.dampad)}}`)

  // Spalter
  if (l.typ === 'sidospalt') {
    const s = l.spalt
    const yttre = s.sida === 'vanster' ? 'var(--sida-vanster)' : 'var(--sida-hoger)'
    ut.push(`.spalter{width:calc(100% + var(--sida-vanster) + var(--sida-hoger));margin:0 calc(-1 * var(--sida-hoger)) 0 calc(-1 * var(--sida-vanster));border-collapse:collapse;table-layout:fixed}
.spalter>tbody>tr>td{direction:ltr;vertical-align:top;text-align:left}
.spalt-sido{width:${s.bredd}mm;padding:${s.luft.topp}mm ${s.sida === 'vanster' ? `${s.luft.inre}mm 0 ${yttre}` : `${yttre} 0 ${s.luft.inre}mm`};${
      s.bakgrund ? `background:${f(s.bakgrund, p.ton)};` : ''
    }color:${f(s.text, p.text)};font-size:var(--grad-spalt)}
.spalt-huvud{padding:${s.luft.topp}mm ${s.sida === 'vanster' ? `var(--sida-hoger) 0 ${s.mellanrum}mm` : `${s.mellanrum}mm 0 var(--sida-vanster)`}}
.spalt-sido .rubrik{${textStil(s.rubrik, c, f(r.farg, p.accent))};${s.rubrik?.pt ? `font-size:${m.grad(s.rubrik.pt)}pt;` : ''}${
      s.rubrik?.linje ? `border:0;border-bottom:${linjeCss(s.rubrik.linje, c, p.linje)};padding:0 0 ${s.rubrik.linje.luft}mm 0;` : ''
    }background:none}
.spalt-sido .rubrik::before,.spalt-sido .rubrik::after{display:none}
.spalt-sido .foto{margin:0 0 6mm}
.spalt-sido .kontakt{margin-top:0;color:inherit}
.spalt-sido .huvud{display:block;margin-bottom:6mm}
.spalt-sido .huvud .namn,.spalt-sido .huvud .titel{color:inherit}
.spalt-sido .niva,.spalt-sido .intyg-detalj{color:inherit;opacity:0.85}
.spalt-sido .lista li::marker{color:inherit}`)
    if (s.intygsfalt) {
      const fl = s.intygsfalt
      ut.push(`.intygsfalt .start,.intygsfalt{break-inside:avoid}
.intygsfalt{border:${linjeCss(fl.kant, c, p.linje)};padding:${fl.luft}mm;${fl.bakgrund ? `background:${f(fl.bakgrund, p.vit)};` : ''}}
.spalt-sido .intygsfalt .rubrik{border:0;padding:0}`)
    }
  }
  if (l.typ === 'tvaspalt') {
    ut.push(`.spalter{width:100%;border-collapse:collapse;table-layout:fixed}
.spalter>tbody>tr>td{vertical-align:top;direction:ltr;text-align:left}
.spalt-huvud{width:${(l.vansterAndel * 100).toFixed(2)}%;padding-right:${l.mellanrum / 2}mm}
.spalt-sido{padding-left:${l.mellanrum / 2}mm;font-size:var(--grad-spalt)}
.full-bredd{margin-bottom:${m.luftOver}mm}`)
  }

  // Profil i spalter (Tidning) och tidsaxeln (Horisont)
  if (def.profilSpalter) {
    ut.push(`.profilspalter{column-count:2;column-gap:7mm;text-align:justify}
.profilspalter .text:first-child::first-letter{float:left;font-family:var(--typsnitt-rubrik);font-size:28pt;line-height:0.85;color:var(--accent);padding:1mm 1.5mm 0 0}`)
  }
  if (def.tidsaxel) {
    ut.push(`.tidsaxel{position:relative;height:18mm;margin:0 0 ${m.luftOver}mm;border-top:1pt solid #B9C2CC;top:4mm}
.axelpunkt{position:absolute;top:-1.9mm;transform:translateX(-1.4mm)}
.axelprick{display:block;width:2.8mm;height:2.8mm;border-radius:50%;background:var(--accent);border:1pt solid var(--accent)}
.axel-utbildning .axelprick{background:#fff}
.axeletikett{display:block;font-size:7.5pt;white-space:nowrap;margin-top:1mm;color:#555}
.axeletikett strong{color:#222}
.axel-nere .axeletikett{margin-top:5mm;padding-top:1mm;border-left:0.5pt solid #B9C2CC;padding-left:1mm}`)
  }

  // Sidan
  ut.push(`@page{size:A4;margin:var(--sida-topp) 0 var(--sida-botten) 0}
${band ? '@page:first{margin-top:0}' : ''}
@media print{
  .cv{width:auto;min-height:0;margin:0;padding:0 var(--sida-hoger) 0 var(--sida-vanster)}
}`)
  if (!def.word && def.extraCss) ut.push(def.extraCss)
  return ut.join('\n')
}

/* ------------------------------------------------------------- dokument */

/** HTML för ett Dokument (används av renderMallHtml och testerna). */
export function renderDokumentHtml(dok: Dokument, def: MallDef, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  const p = palett(def, val)
  const c: Ctx = { def, val, p, opt, f: (x, reserv) => los(x, p, reserv) }
  const l = def.layout
  const huvudspalt = dok.huvudspalt.map((a) => avsnitt(a, c, false)).join('')
  const axel = def.tidsaxel ? tidsaxel(dok) : ''

  let kropp: string
  if (l.typ === 'sidospalt') {
    const s = l.spalt
    const fotoISpalt = def.foto?.plats === 'sidospalt' ? foto(dok, c) : ''
    const sido = [
      s.huvudISpalten ? huvud(dok, c, true) : '',
      fotoISpalt,
      s.kontakt ? kontaktAvsnitt(dok) : '',
      ...dok.sidospalt.map((a) => avsnitt(a, c, true)),
    ].join('')
    // Spalten först i DOM:en. Chrome skriver PDF:ens text sida för sida i
    // DOM-ordning; den korta spalten ryms nästan alltid på sida 1, och då
    // läses den hel före huvudspalten i stället för mitt emellan sida 1 och
    // 2 av erfarenheten. direction: rtl lägger en högerspalt till höger.
    const celler = `<td class="spalt spalt-sido">${sido}</td><td class="spalt spalt-huvud cv-kropp">${huvudspalt}</td>`
    kropp = `${s.huvudISpalten ? '' : huvud(dok, c)}${axel}<table class="spalter" role="presentation" style="direction:${s.sida === 'vanster' ? 'ltr' : 'rtl'}"><tbody><tr>${celler}</tr></tbody></table>`
  } else if (l.typ === 'tvaspalt') {
    const full = dok.fullBredd.map((a) => avsnitt(a, c, false)).join('')
    const hoger = dok.sidospalt.map((a) => avsnitt(a, c, true)).join('')
    kropp = `${huvud(dok, c)}${axel}<div class="full-bredd cv-kropp">${full}</div><table class="spalter" role="presentation" style="direction:rtl"><tbody><tr><td class="spalt spalt-sido">${hoger}</td><td class="spalt spalt-huvud cv-kropp">${huvudspalt}</td></tr></tbody></table>`
  } else {
    kropp = `${huvud(dok, c)}${axel}<main class="spalt cv-kropp">${huvudspalt}</main>`
  }

  const typ = typsnittFor(def, val)
  const webb = [...new Set([typ.brod, typ.rubrik].map((t) => WEBBTYPSNITT[t]).filter(Boolean))]
  const lank = webb.length
    ? `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${webb
        .map((w) => `family=${w}`)
        .join('&')}&display=swap">`
    : ''

  return `<!DOCTYPE html>
<html lang="sv" data-mall="${esc(def.id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(dok.namn ? `CV ${dok.namn}` : 'CV')}</title>
${lank}
<style>${css(c)}</style>
</head>
<body><div class="cv mall-${esc(def.id)} familj-${def.familj}">${kropp}</div></body>
</html>`
}

/** CV:t i en definition som HTML-dokument. */
export function renderDefHtml(cv: CVMetadata, def: MallDef, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  return renderDokumentHtml(byggDokument(cv, def, val), def, val, opt)
}

/**
 * CV:t i mallen som HTML-dokument. `mallId` får vara ett gammalt id (alias
 * löses); ett okänt id ger förvalsmallen. `opt.forhandsvisning` visar
 * initialen i en tom fotoplats, aldrig i PDF:en.
 */
export function renderMallHtml(cv: CVMetadata, mallId: string, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  const def = getMallMedAlias(mallId) ?? getMall(losMallIdEllerForval(mallId))!
  return renderDefHtml(cv, def, val, opt)
}
