/**
 * Hjältens knapp (byggordern L och I, docs/artiklar-2026-11/seo-slutgranskning.md):
 * testklustret öppnar provet i artikelns egen typ, matris och artiklar utan
 * prov behåller exakt adressen utan parameter, I-provet säger sex uppgifter.
 */
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { PROVA_HREF, artikelProvTyp, hjalteKnapp } from '../artikel-kluster'

describe('hjalteKnapp', () => {
  it('matris och artiklar utan prov: oförändrad adress och text', () => {
    expect(hjalteKnapp('test', 'test', 'matris')).toEqual({ text: 'Prova fem uppgifter gratis', href: PROVA_HREF })
    expect(hjalteKnapp('test', 'test', null)).toEqual({ text: 'Prova fem uppgifter gratis', href: PROVA_HREF })
    expect(hjalteKnapp('test', 'test')).toEqual({ text: 'Prova fem uppgifter gratis', href: PROVA_HREF })
    expect(hjalteKnapp('test', 'test', 'okand')).toEqual({ text: 'Prova fem uppgifter gratis', href: PROVA_HREF })
  })

  it('egen typ: provet i typen, I-provet med sex uppgifter', () => {
    expect(hjalteKnapp('test', 'test', 'spatial')).toEqual({ text: 'Prova fem uppgifter gratis', href: `${PROVA_HREF}?typ=spatial` })
    expect(hjalteKnapp('test', 'test', 'talserie')).toEqual({ text: 'Prova fem uppgifter gratis', href: `${PROVA_HREF}?typ=talserie` })
    expect(hjalteKnapp('test', 'test', 'iprov')).toEqual({ text: 'Prova sex uppgifter gratis', href: `${PROVA_HREF}?typ=iprov` })
  })

  it('andra kluster rörs inte av provtypen', () => {
    expect(hjalteKnapp('letter', 'brev', 'spatial')).toEqual(hjalteKnapp('letter', 'brev'))
    expect(hjalteKnapp('interview', 'test', 'spatial')).toEqual(hjalteKnapp('interview', 'test'))
    expect(hjalteKnapp('career', 'lankrad', 'spatial')).toEqual(hjalteKnapp('career', 'lankrad'))
  })

  it('typen läses ur första ArtikelProv i artikeln', () => {
    const mdx = fs.readFileSync(path.join(process.cwd(), 'content/artiklar/rotation-test-guide.mdx'), 'utf8')
    expect(artikelProvTyp(mdx)).toBe('spatial')
    expect(artikelProvTyp('<ArtikelProv typ="iprov" ersatterProvkort />')).toBe('iprov')
    expect(artikelProvTyp('Ingen komponent här')).toBeNull()
  })
})
