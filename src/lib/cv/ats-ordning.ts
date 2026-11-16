/**
 * Textordningen i PDF:en (plan-mallar-2026-11-15 avsnitt 6b).
 *
 * Chrome skriver texten i PDF:en i målningsordning. Element med
 * `position: relative` (jobbpunkter, poster) målas i ett senare skede än
 * vanliga block, så deras text hamnar sist i filen, skild från arbetsgivaren.
 * Rekryteringssystem läser då punkterna efter kompetenser och språk.
 *
 * Rättelsen gör alla block positionerade (relative utan förskjutning, som
 * inte flyttar något) så att allt målas i ett skede, i dokumentordning.
 * Undantag: block mellan ett absolut placerat element och dess
 * referensblock, så att inget absolut element byter referens och flyttas.
 * Inline-element rörs inte; de målas med sitt stycke och orden står kvar i
 * radens ordning.
 *
 * Funktionen körs i sidan (page.evaluate) och måste vara fristående.
 */
export function ordnaTextForATS(): number {
  const alla = Array.from(document.body.querySelectorAll<HTMLElement>('*'))
  const skapar = (cs: CSSStyleDeclaration) =>
    cs.position !== 'static' ||
    cs.transform !== 'none' ||
    cs.filter !== 'none' ||
    (cs.contain && /paint|layout|strict|content/.test(cs.contain))

  const skydda = new Set<Element>()
  const referenser = new Set<Element>()
  const skyddaVagenFran = (start: Element | null) => {
    let nod = start
    while (nod && nod !== document.body && nod !== document.documentElement) {
      if (skapar(getComputedStyle(nod))) {
        referenser.add(nod)
        return
      }
      skydda.add(nod)
      nod = nod.parentElement
    }
  }

  for (const el of alla) {
    if (getComputedStyle(el).position === 'absolute') skyddaVagenFran(el.parentElement)
    for (const pseudo of ['::before', '::after']) {
      const pcs = getComputedStyle(el, pseudo)
      if (pcs.position === 'absolute' && pcs.content !== 'none') skyddaVagenFran(el)
    }
  }

  const BLOCK = /^(block|flow-root|flex|grid|list-item|table|table-row-group|table-header-group|table-footer-group|table-row|table-cell|table-caption)$/
  const utanForskjutning = (cs: CSSStyleDeclaration) =>
    [cs.top, cs.right, cs.bottom, cs.left].every((v) => v === 'auto' || v === '0px') && cs.zIndex === 'auto'
  let andrade = 0
  for (const el of alla) {
    const cs = getComputedStyle(el)

    // Gradienttext (background-clip: text) ritas som bild i PDF:en och
    // försvinner för läsaren. Den får gradientens mörkaste färg som vanlig text.
    const klipp = cs.backgroundClip || (cs as unknown as Record<string, string>).webkitBackgroundClip
    if (klipp === 'text') {
      const farger = cs.backgroundImage.match(/rgba?\([^)]*\)/gi) ?? []
      const ljus = (f: string) => {
        const [r, g, b] = (f.match(/[\d.]+/g) ?? ['0', '0', '0']).map(Number)
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const farg = farger.length ? farger.reduce((a, b) => (ljus(b) < ljus(a) ? b : a)) : '#111827'
      el.style.setProperty('background-image', 'none', 'important')
      el.style.setProperty('-webkit-text-fill-color', farg, 'important')
      el.style.setProperty('color', farg, 'important')
      andrade++
    }

    // Stort bokstavsavstånd gör "ERFARENHET" till "E R F A R E N H E T" i
    // läsaren. Högst 0,16 em, som läses rätt i alla typsnitt vi provat.
    const grad = parseFloat(cs.fontSize)
    const avstand = parseFloat(cs.letterSpacing)
    if (grad > 0 && avstand > grad * 0.165) {
      el.style.setProperty('letter-spacing', '0.16em', 'important')
      andrade++
    }

    // Automatisk avstavning skriver "bestäl-" + "lare" i texten, och läsaren
    // ser två ord. Bara uttryckliga bindestreck får bryta.
    if (cs.hyphens === 'auto') {
      el.style.setProperty('hyphens', 'manual', 'important')
      andrade++
    }

    // Ett relative-block med z-index över noll målas sist av allt. När alla
    // block målas i dokumentordning ligger det ändå ovanpå det som kom före.
    if (cs.position === 'relative' && cs.zIndex !== 'auto' && Number(cs.zIndex) > 0 && cs.transform === 'none') {
      el.style.zIndex = 'auto'
      andrade++
    }

    if (skydda.has(el)) continue
    // Inline-element som är relative utan att flytta något eller bära ett
    // absolut barn blir statiska och målas med sitt stycke.
    if (cs.position === 'relative' && !BLOCK.test(cs.display) && !referenser.has(el) && utanForskjutning(cs) && cs.transform === 'none') {
      el.style.position = 'static'
      andrade++
      continue
    }
    if (cs.position !== 'static') continue
    if (!BLOCK.test(cs.display)) continue
    el.style.position = 'relative'
    andrade++
  }
  return andrade
}
