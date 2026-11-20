// @vitest-environment node
/**
 * facit_betyder rättad i omgång 3 (del D): SO:s definition beskrev fel
 * betydelse av facit. Sju är rättade med text ur uppgiftens egna belägg
 * (facit_betyder_kalla 'belagg'), 24 med en egen formulering av den
 * betydelse ordparet prövar (facit_betyder_kalla 'egen'). `kalla` gäller
 * verifieringen av ordparet och tillskriver aldrig en egen definition en
 * ordbok.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const alla: Q[] = ['bankGrund', 'bankAvancerad', 'bankExpert'].flatMap((f) => JSON.parse(readFileSync(`src/lib/ordforradV1/${f}.json`, 'utf8')))

const UR_BELAGG: Record<string, string> = {
  'of-g-s-15': 'enkel, inte svår',
  'of-g-s-30': 'grund, grundval',
  'of-g-m-19': 'nederlag',
  'of-a-s-01': 'avsiktlig',
  'of-a-s-13': 'tillämpa, omsätta i handling',
  'of-a-s-29': 'förnimma, uppmärksamma',
  'of-e-s-42': 'ambivalent',
}

const EGNA: Record<string, string> = {
  'of-g-s-05': 'som är mycket viktig för helheten',
  'of-g-s-06': 'hjälpa någon genom att ge kraft eller uppbackning',
  'of-g-s-28': 'vänlig och omtänksam mot andra',
  'of-g-m-18': 'ta av last från ett fordon eller fartyg',
  'of-a-s-48': 'ganska stor till mängd eller omfattning',
  'of-a-s-49': 'som har goda skäl för sig',
  'of-a-m-01': 'som är lätt att förstå eller överblicka',
  'of-a-m-05': 'som har låg styrka eller intensitet',
  'of-a-m-32': 'som uttrycker ogillande eller avvisande',
  'of-e-s-35': 'som finns i själva saken och hör till dess natur',
  'of-e-s-49': 'som ska hållas hemlig och bara delas i förtroende',
  'of-e-s-50': 'det mest väsentliga i något',
  'of-g-s-35': 'som inte ger efter för tryck',
  'of-g-s-41': 'ge sig i kast med något för att se om det lyckas',
  'of-g-m-35': 'som medvetet ger en osann eller vilseledande bild',
  'of-a-m-17': 'som döljer vad man egentligen tycker eller känner',
  'of-a-s-22': 'berätta något som har hållits hemligt',
  'of-a-s-28': 'som växer tätt och kraftigt',
  'of-a-s-40': 'hur stort område eller hur mycket något gäller',
  'of-a-s-66': 'säga att något är sant, ofta något som talar emot en själv',
  'of-a-m-26': 'som är stabil och inte lätt rubbas',
  'of-e-s-06': 'tecken som tyder på något',
  'of-e-s-28': 'något tungt eller betungande som någon måste bära',
  'of-e-s-71': 'som bryter mot god ton och gott uppförande',
}

describe('ordförråd, facit_betyder', () => {
  it('de sju ur beläggen står ordagrant i uppgiftens egna fält och är märkta belagg', () => {
    for (const [id, text] of Object.entries(UR_BELAGG)) {
      const q = alla.find((x) => x.id === id)
      expect(q?.facit_betyder, id).toBe(text)
      expect(q.facit_betyder_kalla, id).toBe('belagg')
      expect([...q.kalla.belagg, ...q.misstag, q.exempel].join('\n'), id).toContain(text)
    }
  })

  it('de 24 egna definitionerna är märkta egen', () => {
    for (const [id, text] of Object.entries(EGNA)) {
      const q = alla.find((x) => x.id === id)
      expect(q?.facit_betyder, id).toBe(text)
      expect(q.facit_betyder_kalla, id).toBe('egen')
    }
    expect(alla.filter((q) => q.facit_betyder_kalla === 'egen').length).toBe(24)
    expect(alla.filter((q) => q.facit_betyder_kalla === 'belagg').length).toBe(7)
  })

  it('ingen definition är tom eller har tankstreck', () => {
    for (const q of alla) {
      expect(q.facit_betyder.trim().length, q.id).toBeGreaterThan(0)
      expect(q.facit_betyder, q.id).not.toMatch(/[—–]/)
    }
  })
})
