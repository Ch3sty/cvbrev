/**
 * HTML-renderaren: CV:t i en mall som ett fristående HTML-dokument för
 * förhandsvisningen, exempel-iframen och PDF:en (samma HTML, plan avsnitt 3.4).
 *
 * ATS-säker och semantisk:
 *  - namnet är dokumentets h1 (data-falt="namn") och står först i DOM:en,
 *    titeln har data-falt="titel" (exempel-iframens textbyte, planens villkor c),
 *  - varje avsnitt är <section data-avsnitt> med <h2 data-sektion>, varje post
 *    har data-post,
 *  - två spalter är en tabell utan kanter (Chrome delar den över sidor), med
 *    huvudspalten först i DOM:en och sidospalten till vänster med
 *    direction: rtl, så läsordningen blir huvud, huvudspalt, sidospalt,
 *  - inga absolut placerade element, ingen gradienttext, spärrning högst 0,16 em.
 *
 * Sidbrytningen ligger här, inte i mallarna: poster bryts aldrig mitt i,
 * rubriken hålls ihop med första posten, ingen ensam rad sist eller först på
 * en sida (orphans och widows), och sidmarginalerna gäller på varje sida.
 *
 * Mallens tokens (färger, typsnitt, grader, mått) står som CSS-variabler på
 * :root, så att en konstnärlig mall kan bygga vidare i `extraCss`.
 */
import { getFontFamilyForHTML } from '@/lib/documents/typsnitt'
import type { CVMetadata } from '../../cv-metadata'
import type { MallVal } from '../kontrakt'
import { los, palett, typsnittFor, WEBBTYPSNITT, type Hex, type Palett } from '../farg'
import { byggDokument, kompetensForm, visaFoto, type Avsnitt, type Dokument, type KontaktRad, type Post } from '../innehall'
import type { MallDef } from '../typer'
import { getMall, getMallMedAlias, losMallIdEllerForval } from '../register'

export interface RenderaHtmlVal {
  /**
   * Förhandsvisning: en tom fotoplats visar initialen och titelraden har
   * reserverad höjd. Aldrig i PDF:en.
   */
  forhandsvisning?: boolean
}

/* ----------------------------------------------------------- hjälpare */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const attr = esc

/** Ett riktigt mellanslag som Chrome skriver ut i PDF:ens text, också mellan flexceller. */
const MELLAN = '<span class="mellan"> </span>'

/* -------------------------------------------------------------- delar */

function kontaktLista(rader: KontaktRad[], form: 'rad' | 'lista'): string {
  if (!rader.length) return ''
  const li = rader
    .map((r) => `<li data-falt="${r.typ}">${esc(r.text)}</li>`)
    .join(form === 'rad' ? '<li class="sep" aria-hidden="true"> · </li>' : '')
  return `<ul class="kontakt kontakt-${form}" data-falt="kontakt">${li}</ul>`
}

function foto(dok: Dokument, def: MallDef, val: MallVal, opt: RenderaHtmlVal): string {
  if (!def.foto || !visaFoto(def, val)) return ''
  const klass = `foto foto-${def.foto.form}`
  if (dok.foto) return `<img class="${klass}" src="${attr(dok.foto)}" alt="" data-falt="foto">`
  // Initialen i en tom fotoplats är bara förhandsvisning, aldrig PDF.
  if (opt.forhandsvisning) return `<div class="${klass} foto-tom" aria-hidden="true" data-falt="foto">${esc(dok.initial)}</div>`
  return ''
}

function namnOchTitel(dok: Dokument): string {
  return `<h1 class="namn" data-falt="namn">${esc(dok.namn)}</h1><p class="titel" data-falt="titel">${esc(dok.titel)}</p>`
}

function huvud(dok: Dokument, def: MallDef, val: MallVal, opt: RenderaHtmlVal): string {
  const h = def.huvud
  const kontaktIHuvud = !def.sidospalt?.kontakt
  const bild = def.foto?.plats === 'huvud' ? foto(dok, def, val, opt) : ''
  const kontakt = kontaktIHuvud ? kontaktLista(dok.kontakt, h.layout === 'delad' ? 'lista' : h.kontakt) : ''
  const klass = ['huvud', `huvud-${h.layout}`, h.band ? 'huvud-band' : '', h.band?.utfallande ? 'huvud-utfallande' : '']
    .filter(Boolean)
    .join(' ')
  if (h.layout === 'delad') {
    return `<header class="${klass}"><div class="huvud-vanster">${namnOchTitel(dok)}</div>${bild}<div class="huvud-hoger">${kontakt}</div></header>`
  }
  // Fotot står efter texten i DOM:en (namnet först i läsordningen) och
  // flyttas fram med order.
  return `<header class="${klass}"><div class="huvud-text">${namnOchTitel(dok)}${kontakt}</div>${bild}</header>`
}

function post(p: Post, def: MallDef, sektion: string): string {
  const titel = esc(p.titel)
  const under = p.under ? esc(p.under) : ''
  const period = p.period ? `<span class="period">${esc(p.period)}</span>` : ''
  let rad: string
  if (def.post.arbetsgivare === 'samma-rad' && under) {
    rad = `<h3 class="posttitel">${titel}<span class="sep">, </span><span class="under-inline">${under}</span></h3>`
  } else {
    rad = `<h3 class="posttitel">${titel}</h3>`
  }
  let huvudrad: string
  if (def.post.period === 'hoger') huvudrad = `<div class="postrad">${rad}${period ? MELLAN + period : ''}</div>`
  else if (def.post.period === 'under') huvudrad = `${rad}${period ? `<p class="period-rad">${period}</p>` : ''}`
  else huvudrad = `${period ? `<p class="period-marginal">${period}</p>` : ''}${rad}`
  const underRad = def.post.arbetsgivare === 'egen-rad' && under ? `<p class="under">${under}</p>` : ''
  const text = p.text.map((t) => `<p class="posttext">${esc(t)}</p>`).join('')
  const punkter = p.punkter.length ? `<ul class="punkter">${p.punkter.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''
  return `<div class="post post-${sektion}" data-post>${huvudrad}${underRad}${text}${punkter}</div>`
}

/** Innehållet i ett avsnitt, som block. Det första blocket hålls ihop med rubriken. */
function block(a: Avsnitt, def: MallDef, iSidospalt: boolean): string[] {
  const inn = a.innehall
  switch (inn.typ) {
    case 'text':
      return inn.stycken.map((t) => `<p class="text">${esc(t)}</p>`)
    case 'poster':
      return inn.poster.map((p) => post(p, def, a.sektion))
    case 'lista': {
      if (a.sektion === 'intressen' && !iSidospalt) return [`<p class="rad">${inn.rader.map(esc).join(' · ')}</p>`]
      return [`<ul class="lista">${inn.rader.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`]
    }
    case 'sprak': {
      const form = iSidospalt ? 'lista' : def.sprak
      const del = (r: { sprak: string; niva: string }) => `<strong>${esc(r.sprak)}</strong>${r.niva ? `, ${esc(r.niva)}` : ''}`
      if (form === 'rad') return [`<p class="rad sprak-rad">${inn.rader.map(del).join(' · ')}</p>`]
      return [`<ul class="lista sprak-lista">${inn.rader.map((r) => `<li>${del(r)}</li>`).join('')}</ul>`]
    }
    case 'kompetenser': {
      const form = kompetensForm(def, iSidospalt)
      const alla = inn.grupper.flatMap((g) => g.lista)
      if (form === 'rad') return [`<p class="rad kompetens-rad">${alla.map(esc).join(' · ')}</p>`]
      if (form === 'lista') return [`<ul class="lista kompetens-lista">${alla.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`]
      if (form === 'grupper') {
        return inn.grupper.map(
          (g) => `<p class="grupp">${g.namn ? `<strong>${esc(g.namn)}:</strong> ` : ''}${g.lista.map(esc).join(', ')}</p>`
        )
      }
      // Spalter: en tabell utan kanter, en grupp per cell (som i Word).
      const grupper = delaISpalter(inn.grupper)
      const n = grupper.length === 2 || grupper.length === 4 ? 2 : Math.min(3, grupper.length)
      const rader: string[] = []
      for (let i = 0; i < grupper.length; i += n) {
        const celler = grupper.slice(i, i + n)
        while (celler.length < n) celler.push({ namn: '', lista: [] })
        rader.push(
          `<tr>${celler
            .map((g) =>
              g.namn || g.lista.length
                ? `<td>${g.namn ? `<p class="spaltrubrik">${esc(g.namn)}</p>` : ''}<ul class="spaltlista">${g.lista
                    .map((s) => `<li>${esc(s)}</li>`)
                    .join('')}</ul></td>`
                : '<td></td>'
            )
            .join('')}</tr>`
        )
      }
      return [`<table class="kompetensspalter spalter-${n}" role="presentation">${rader.join('')}</table>`]
    }
  }
}

/** En lång grupp utan delning blir tre spalter, som i Word. */
export function delaISpalter(grupper: { namn: string; lista: string[] }[]): { namn: string; lista: string[] }[] {
  if (grupper.length === 1 && grupper[0].lista.length >= 6) {
    const l = grupper[0].lista
    const n = Math.ceil(l.length / 3)
    return [
      { namn: '', lista: l.slice(0, n) },
      { namn: '', lista: l.slice(n, n * 2) },
      { namn: '', lista: l.slice(n * 2) },
    ]
  }
  return grupper
}

function avsnitt(a: Avsnitt, def: MallDef, iSidospalt: boolean): string {
  const delar = block(a, def, iSidospalt)
  const rubrik = `<h2 class="rubrik" data-sektion="${a.sektion}">${esc(a.rubrik)}</h2>`
  // Rubriken och första blocket hålls ihop, så att rubriken aldrig blir
  // ensam sist på en sida.
  const forsta = `<div class="start">${rubrik}${delar[0] ?? ''}</div>`
  return `<section class="avsnitt avsnitt-${a.sektion}" data-avsnitt="${a.sektion}">${forsta}${delar.slice(1).join('')}</section>`
}

function kontaktAvsnitt(dok: Dokument, def: MallDef): string {
  if (!dok.kontakt.length) return ''
  const rubrik = def.sidospalt?.kontaktRubrik ?? 'Kontakt'
  return `<section class="avsnitt avsnitt-kontakt" data-avsnitt="kontakt"><div class="start"><h2 class="rubrik" data-sektion="kontakt">${esc(
    rubrik
  )}</h2>${kontaktLista(dok.kontakt, 'lista')}</div></section>`
}

/* ---------------------------------------------------------------- CSS */

function css(def: MallDef, val: MallVal, p: Palett, opt: RenderaHtmlVal): string {
  const en = val.enSida ? def.enSida : { grad: 0, marginal: 1, luft: 1 }
  const g = (pt: number) => `${Math.max(6, pt + en.grad)}pt`
  const luft = (mm: number) => `${(mm * en.luft).toFixed(2)}mm`
  const sida = { topp: def.sida.topp * en.marginal, botten: def.sida.botten * en.marginal, sida: def.sida.sida * en.marginal }
  const typ = typsnittFor(def, val)
  const f = (x: Parameters<typeof los>[0], reserv: Hex) => los(x, p, reserv)
  const h = def.huvud
  const r = def.rubrik
  const s = def.sidospalt
  const band = h.band
  const rubrikLinje = r.linje
    ? r.linje.var === 'vanster'
      ? `border-left:${r.linje.pt}pt solid ${f(r.linje.farg, p.accent)};padding-left:2.2mm;`
      : `border-${r.linje.var === 'under' ? 'bottom' : 'top'}:${r.linje.pt}pt solid ${f(r.linje.farg, p.linje)};padding-${
          r.linje.var === 'under' ? 'bottom' : 'top'
        }:1.2mm;`
    : ''
  const marginalRubrik = r.placering === 'marginal'
  const marginalPeriod = def.post.period === 'marginal'
  const mR = r.marginalBredd ?? 34
  const mP = def.post.marginalBredd ?? 28
  const fotoMm = def.foto?.storlek ?? 30

  return `
:root{
  --accent:${p.accent};--ton:${p.ton};--text:${p.text};--dampad:${p.dampad};--linje:${p.linje};
  --typsnitt:${getFontFamilyForHTML(typ.brod)};--typsnitt-rubrik:${getFontFamilyForHTML(typ.rubrik)};
  --grad:${g(def.grad.brod)};--grad-namn:${g(def.grad.namn)};--grad-titel:${g(def.grad.titel)};
  --grad-rubrik:${g(def.grad.rubrik)};--grad-post:${g(def.grad.posttitel)};--grad-liten:${g(def.grad.liten)};
  --sida-topp:${sida.topp}mm;--sida-botten:${sida.botten}mm;--sida-sida:${sida.sida}mm;
  --radavstand:${def.radavstand};
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{background:#fff;color:var(--text);font-family:var(--typsnitt);font-size:var(--grad);line-height:var(--radavstand);
  -webkit-font-smoothing:antialiased;font-kerning:normal;hyphens:manual;overflow-wrap:break-word}
.cv{background:#fff;width:210mm;min-height:297mm;margin:0 auto;padding:var(--sida-topp) var(--sida-sida) var(--sida-botten)}
.mellan{white-space:pre}
h1,h2,h3{font-family:var(--typsnitt-rubrik)}
p,li{orphans:2;widows:2}
ul{list-style:none}

/* Huvudet */
.huvud{display:flex;gap:6mm;align-items:center;margin-bottom:${luft(h.luftUnder)};${
    h.linjeUnder ? `border-bottom:${h.linjeUnder.pt}pt solid ${f(h.linjeUnder.farg, p.linje)};padding-bottom:${luft(4)};` : ''
  }break-inside:avoid;break-after:avoid}
.huvud-text{flex:1;min-width:0}
.huvud .foto{order:-1;flex:none}
.huvud-centrerad{flex-direction:column;text-align:center;gap:3mm}
.huvud-centrerad .kontakt{justify-content:center}
.huvud-delad{align-items:flex-end;justify-content:space-between}
.huvud-delad .huvud-vanster{flex:1;min-width:0}
.huvud-delad .huvud-hoger{text-align:right}
.huvud-delad .foto{order:0}
${
  band
    ? `.huvud-band{background:${f(band.bakgrund, p.accent)};color:${f(band.text, p.vit)};padding:${band.luft.lodratt}mm ${band.luft.sidor}mm;}
.huvud-band .namn,.huvud-band .titel,.huvud-band .kontakt{color:inherit}
${band.utfallande ? `.huvud-utfallande{margin:calc(-1 * var(--sida-topp)) calc(-1 * var(--sida-sida)) ${luft(h.luftUnder)};padding:${band.luft.lodratt + sida.topp * 0.5}mm var(--sida-sida) ${band.luft.lodratt}mm}` : ''}`
    : ''
}
.namn{font-size:var(--grad-namn);line-height:1.1;font-weight:${h.namnVikt ?? 700};color:${f(def.farger.namn, p.text)};${
    h.namnVersaler ? 'text-transform:uppercase;' : ''
  }letter-spacing:${Math.min(h.namnSparrning ?? 0, 0.08)}em}
.titel{font-size:var(--grad-titel);color:${f(def.farger.titel ?? 'accent', p.accent)};margin-top:1mm;${
    h.titelVersaler ? 'text-transform:uppercase;letter-spacing:0.06em;' : ''
  }${h.titelKursiv ? 'font-style:italic;' : ''}}
.titel:empty{margin:0}
${opt.forhandsvisning ? '.titel:empty{min-height:1.2em;margin-top:1mm}' : ''}
.kontakt{font-size:var(--grad-liten);color:${band ? 'inherit' : f('dampad', p.dampad)};margin-top:2mm}
.kontakt-rad{display:flex;flex-wrap:wrap;column-gap:0}
.kontakt-rad .sep{color:${band ? 'inherit' : p.dampad};white-space:pre}
.kontakt-lista li{line-height:1.45}

/* Foto */
.foto{display:block;width:${fotoMm}mm;height:${fotoMm}mm;object-fit:cover;background:var(--ton)}
.foto-rund{border-radius:50%}
.foto-fyrkant{border-radius:1mm}
.foto-tom{display:flex;align-items:center;justify-content:center;font-family:var(--typsnitt-rubrik);font-size:${fotoMm * 1.1}pt;color:var(--accent);background:var(--ton)}

/* Avsnitt och rubriker */
.avsnitt{margin-top:${luft(r.luftOver)}}
.avsnitt:first-child{margin-top:0}
.start{break-inside:avoid}
.rubrik{font-size:var(--grad-rubrik);font-weight:${r.vikt ?? 700};color:${f(r.farg, p.accent)};${
    r.versaler ? 'text-transform:uppercase;' : ''
  }letter-spacing:${Math.min(r.sparrning, 0.16)}em;line-height:1.25;margin-bottom:${luft(r.luftUnder)};${rubrikLinje}${
    r.placering === 'centrerad' ? 'text-align:center;' : ''
  }break-after:avoid}
${
  marginalRubrik
    ? `.spalt-huvud .avsnitt{padding-left:${mR}mm}
.spalt-huvud .rubrik{float:left;width:${mR - 4}mm;margin-left:-${mR}mm;margin-bottom:0}
.spalt-huvud .avsnitt::after{content:"";display:block;clear:both}`
    : ''
}

/* Poster */
.post{break-inside:avoid;margin-top:${luft(def.post.luftMellan)}}
.start>.post{margin-top:0}
${def.post.linjeMellan ? `.start+.post,.post+.post{border-top:${def.post.linjeMellan.pt}pt solid ${f(def.post.linjeMellan.farg, p.linje)};padding-top:${luft(def.post.luftMellan)}}` : ''}
.posttitel{font-size:var(--grad-post);font-weight:700;color:${f(def.farger.posttitel, p.text)};line-height:1.3}
.postrad{display:flex;align-items:baseline;gap:0}
.postrad .posttitel{flex:1;min-width:0}
.postrad .period{flex:none;padding-left:3mm;text-align:right}
.period{font-size:var(--grad-liten);color:${f(def.farger.period, p.dampad)};font-weight:400;${def.post.periodKursiv ? 'font-style:italic;' : ''}font-variant-numeric:tabular-nums;white-space:nowrap}
.period-rad{line-height:1.3;margin-top:0.3mm}
${
  marginalPeriod
    ? `.post{padding-left:${mP}mm}
.period-marginal{float:left;width:${mP - 3}mm;margin-left:-${mP}mm;line-height:1.5}
.post::after{content:"";display:block;clear:both}`
    : ''
}
.under,.under-inline{color:${f(def.farger.arbetsgivare, p.dampad)};${def.post.arbetsgivareFet ? 'font-weight:700;' : ''}${
    def.post.arbetsgivareKursiv ? 'font-style:italic;' : ''
  }}
.under{margin-top:0.3mm}
.posttitel .under-inline{font-weight:${def.post.arbetsgivareFet ? 700 : 400}}
.posttext{margin-top:1mm}
.punkter{margin-top:1.2mm;padding-left:4.2mm;list-style:"${def.punkt.tecken.replace(/"/g, '')}  " outside}
.punkter li{margin-top:0.6mm;break-inside:avoid}
.punkter li::marker,.lista li::marker,.spaltlista li::marker{color:${f(def.punkt.farg, p.accent)}}
.text+.text{margin-top:1.5mm}

/* Listor och rader */
.lista{padding-left:4.2mm;list-style:"${def.punkt.tecken.replace(/"/g, '')}  " outside}
.lista li{margin-top:0.5mm;break-inside:avoid}
.sprak-lista{list-style:none;padding-left:0}
.grupp+.grupp{margin-top:1mm}
.grupp strong{color:${f(def.farger.arbetsgivare, p.dampad)}}
.kompetensspalter{width:100%;border-collapse:collapse;table-layout:fixed;break-inside:avoid}
.kompetensspalter td{vertical-align:top;padding:0 3mm 1.5mm 0}
.spaltrubrik{font-weight:700;font-size:var(--grad-liten);text-transform:uppercase;letter-spacing:0.06em;color:var(--accent);margin-bottom:0.8mm}
.spaltlista{padding-left:4mm;list-style:"${def.punkt.tecken.replace(/"/g, '')}  " outside}
.avsnitt-referenser .text{color:${f('dampad', p.dampad)}}

/* Två spalter */
${
  s
    ? `.spalter{width:calc(100% + 2 * var(--sida-sida));margin:0 calc(-1 * var(--sida-sida));border-collapse:collapse;table-layout:fixed}
.spalter>tbody>tr>td{direction:ltr;vertical-align:top;text-align:left}
.spalt-sido{width:${s.bredd}mm;padding:${s.bakgrund ? `${s.luft}mm` : '0'} ${
        s.sida === 'vanster' ? `${s.luft}mm 0 var(--sida-sida)` : `var(--sida-sida) 0 ${s.luft}mm`
      };${s.bakgrund ? `background:${f(s.bakgrund, p.ton)};` : ''}color:${f(s.text, p.text)};${
        s.linje ? `border-${s.sida === 'vanster' ? 'right' : 'left'}:${s.linje.pt}pt solid ${f(s.linje.farg, p.linje)};` : ''
      }}
.spalt-huvud{padding:0 ${s.sida === 'vanster' ? `var(--sida-sida) 0 ${s.mellanrum}mm` : `${s.mellanrum}mm 0 var(--sida-sida)`}}
.spalt-sido .rubrik{color:${f(s.rubrik ?? r.farg, p.accent)}}
.spalt-sido .foto{margin:0 auto ${luft(5)}}
.spalt-sido .huvud{display:block;text-align:left;margin-bottom:${luft(5)};border:0;padding:0}
.spalt-sido .kontakt-lista li{overflow-wrap:anywhere}`
    : ''
}

@page{size:A4;margin:var(--sida-topp) 0 var(--sida-botten) 0}
${band?.utfallande ? '@page:first{margin-top:0}' : ''}
@media print{
  .cv{width:auto;min-height:0;margin:0;padding:0 var(--sida-sida)}
  ${band?.utfallande ? `.huvud-utfallande{margin-top:0;padding-top:${band.luft.lodratt + sida.topp * 0.5}mm}` : ''}
}
${!def.word && def.extraCss ? def.extraCss : ''}`
}

/* ------------------------------------------------------------- dokument */

/** HTML för ett Dokument (används av renderMallHtml och testerna). */
export function renderDokumentHtml(dok: Dokument, def: MallDef, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  const p = palett(def, val)
  const s = def.sidospalt
  const huvudISpalten = Boolean(s?.huvudISpalten)
  const huvudspalt = dok.huvudspalt.map((a) => avsnitt(a, def, false)).join('')

  let kropp: string
  if (s) {
    const fotoISpalt = def.foto?.plats === 'sidospalt' ? foto(dok, def, val, opt) : ''
    const sido = [
      fotoISpalt,
      huvudISpalten ? huvud(dok, def, val, opt) : '',
      s.kontakt ? kontaktAvsnitt(dok, def) : '',
      ...dok.sidospalt.map((a) => avsnitt(a, def, true)),
    ].join('')
    // Huvudspalten först i DOM:en (läsordningen), utom när namnet står i
    // sidospalten; sidospalten hamnar till vänster med direction: rtl.
    const celler = huvudISpalten
      ? `<td class="spalt-sido">${sido}</td><td class="spalt-huvud">${huvudspalt}</td>`
      : `<td class="spalt-huvud">${huvudspalt}</td><td class="spalt-sido">${sido}</td>`
    const direction = huvudISpalten ? (s.sida === 'vanster' ? 'ltr' : 'rtl') : s.sida === 'vanster' ? 'rtl' : 'ltr'
    kropp = `${huvudISpalten ? '' : huvud(dok, def, val, opt)}<table class="spalter" role="presentation" style="direction:${direction}"><tbody><tr>${celler}</tr></tbody></table>`
  } else {
    kropp = `${huvud(dok, def, val, opt)}<main class="spalt-huvud">${huvudspalt}</main>`
  }

  const typ = typsnittFor(def, val)
  const webb = [...new Set([typ.brod, typ.rubrik].map((t) => WEBBTYPSNITT[t]).filter(Boolean))]
  const lank = webb.length
    ? `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${webb
        .map((w) => `family=${w}`)
        .join('&')}&display=swap">`
    : ''

  return `<!DOCTYPE html>
<html lang="sv" data-mall="${attr(def.id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(dok.namn ? `CV ${dok.namn}` : 'CV')}</title>
${lank}
<style>${css(def, val, p, opt)}</style>
</head>
<body><div class="cv mall-${attr(def.id)} familj-${def.familj}">${kropp}</div></body>
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
