/**
 * Sökvägarna i lagringen mot reglerna på hinken cvs efter S-1
 * (beslut-agarpunkter 2026-11-22): första mappen users, andra kontots id.
 * Varje väg som rutterna bygger ska klara prövningen, annars slutar
 * uppladdningen att fungera när reglerna byts.
 */
import { describe, expect, it } from 'vitest'

import { bilagaSokvag, cvSokvag, inomEgenMapp, kontoMapp, profilfotoSokvag } from '../sokvagar'
import { unikSokvag } from '@/lib/cv/dubblett'

const U1 = '11111111-2222-4333-8444-555555555555'
const U2 = '99999999-2222-4333-8444-555555555555'

describe('sökvägarna ligger under users/<id>/', () => {
  it('CV:t, också en ny version med samma filnamn', () => {
    const v = cvSokvag(U1, 'Mitt CV 2026 (slutlig).pdf')
    expect(v).toBe(`users/${U1}/mitt-cv-2026-slutlig.pdf`)
    expect(inomEgenMapp(v, U1)).toBe(true)
    expect(inomEgenMapp(unikSokvag(v, 1_700_000_000_000), U1)).toBe(true)
    expect(inomEgenMapp(`${kontoMapp(U1)}/.placeholder`, U1)).toBe(true)
  })

  it('bilagan till Jobbcoachen, med och utan samtal', () => {
    expect(bilagaSokvag(U1, 'k1', 'brev.docx', 5)).toBe(`users/${U1}/chat_attachments/k1/5_brev.docx`)
    expect(bilagaSokvag(U1, null, 'brev.docx', 5)).toBe(`users/${U1}/chat_attachments/temp/5_brev.docx`)
    for (const v of [bilagaSokvag(U1, 'k1', 'a.pdf'), bilagaSokvag(U1, '', 'a.pdf')]) expect(inomEgenMapp(v, U1)).toBe(true)
  })

  it('ett samtals-id med snedstreck eller punkter blir temp', () => {
    for (const id of ['../../x', `../${U2}`, 'a/b', '..']) {
      const v = bilagaSokvag(U1, id, 'a.pdf', 1)
      expect(v).toBe(`users/${U1}/chat_attachments/temp/1_a.pdf`)
      expect(inomEgenMapp(v, U1)).toBe(true)
    }
  })

  it('profilfotot', () => {
    expect(profilfotoSokvag(U1, 'Bild.JPEG', 7)).toBe(`users/${U1}/profile-photo-7.jpeg`)
    expect(profilfotoSokvag(U1, 'bild', 7)).toBe(`users/${U1}/profile-photo-7.bild`)
    expect(inomEgenMapp(profilfotoSokvag(U1, 'x.png'), U1)).toBe(true)
  })
})

describe('prövningen säger nej till allt utanför den egna mappen', () => {
  it('hinkens rot, en annans mapp och users/ själv', () => {
    // Den gamla vägen i cv-store (borttagen): <id>-<tid>.<ändelse> i roten.
    expect(inomEgenMapp(`${U1}-1700000000000.pdf`, U1)).toBe(false)
    expect(inomEgenMapp(`${U1}/gammal.pdf`, U1)).toBe(false)
    expect(inomEgenMapp(`users/${U2}/annans.pdf`, U1)).toBe(false)
    expect(inomEgenMapp('users/x.pdf', U1)).toBe(false)
    expect(inomEgenMapp(`users/${U1}/../${U2}/x.pdf`, U1)).toBe(false)
  })
})
