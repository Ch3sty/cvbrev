/**
 * Rättningarna efter klicktestet i produktion 2026-11-21 (docs/qa/jobbsoket-slutkontroll-2026-11-21.md):
 * uppföljningsblockets startläge (fel 2), händelsens dag mot sökdagen (fel 3)
 * och raden "Följde upp" som vyn visar direkt (fel 4).
 */
import { describe, expect, it } from 'vitest'
import { nyligenUppfoljd } from '../uppfoljning'
import { handelseForeSokt, soktEfterHandelse, tidigasteHandelse } from '../validering'
import { foljdeUppRad } from '../handelser'
import type { Uppfoljning } from '../typer'

const rad = (over: Partial<Uppfoljning>): Uppfoljning => ({
  id: 'u1',
  application_id: 'a1',
  user_id: 'x',
  subject: 'Min ansökan till tjänsten som ekonomiassistent',
  body: 'Hej',
  rewrites: 0,
  sent_at: null,
  sent_via: null,
  created_at: '2026-11-21T13:00:00+00:00',
  updated_at: '2026-11-21T13:00:00+00:00',
  ...over,
})

describe('nyligenUppfoljd: inget nytt utkast efter "Ja, det är skickat"', () => {
  const idag = '2026-11-21'

  it('skickad i dag, inget utkast: Följde upp med Ångra, ingen POST', () => {
    const s = rad({ sent_at: idag, sent_via: 'kopierat' })
    expect(nyligenUppfoljd({ utkast: null, senastSkickad: s, nastaPaminnelse: '2026-12-03' }, idag)).toEqual({ id: 'u1', dag: idag, nasta: '2026-12-03' })
  })

  it('"Jag har redan skickat det" (rad utan text) räknas likadant', () => {
    const s = rad({ subject: null, body: null, sent_at: idag, sent_via: 'eget' })
    expect(nyligenUppfoljd({ utkast: null, senastSkickad: s, nastaPaminnelse: '2026-12-03' }, idag)?.id).toBe('u1')
  })

  it('ett oskickat utkast visas i stället', () => {
    const s = rad({ sent_at: '2026-11-20', sent_via: 'epost' })
    expect(nyligenUppfoljd({ utkast: rad({ id: 'u2' }), senastSkickad: s, nastaPaminnelse: '2026-12-02' }, idag)).toBeNull()
  })

  it('påminnelsedagen nådd: tjänsten kan vara tyst igen, då får ett utkast skrivas', () => {
    const s = rad({ sent_at: '2026-11-09', sent_via: 'epost' })
    expect(nyligenUppfoljd({ utkast: null, senastSkickad: s, nastaPaminnelse: '2026-11-21' }, idag)).toBeNull()
  })

  it('aldrig uppföljd', () => {
    expect(nyligenUppfoljd({ utkast: null, senastSkickad: null, nastaPaminnelse: null }, idag)).toBeNull()
  })
})

describe('händelsens dag mot sökdagen', () => {
  it('en kallelse före sökdagen nekas med sökdagen utskriven', () => {
    expect(handelseForeSokt('interview_invited', '2026-11-20', '2026-11-21')).toBe(
      'Dagen kan inte ligga före dagen du sökte tjänsten, 21 november. Ändra sökdatumet först om det är fel.'
    )
  })

  it('samma dag och senare går igenom', () => {
    expect(handelseForeSokt('interview_invited', '2026-11-21', '2026-11-21')).toBeNull()
    expect(handelseForeSokt('rejected', '2026-11-25', '2026-11-21')).toBeNull()
  })

  it('"Sökt" själv kontrolleras inte', () => {
    expect(handelseForeSokt('applied', '2026-11-01', '2026-11-21')).toBeNull()
  })

  it('"Den är genomförd" på intervjudagen efter en kallelse efter sökdagen går igenom', () => {
    expect(handelseForeSokt('interview_completed', '2026-11-20', '2026-11-10')).toBeNull()
  })

  it('sökdatumet efter en händelse nekas', () => {
    const h = [
      { event_type: 'applied', occurred_at: '2026-11-21' },
      { event_type: 'interview_invited', occurred_at: '2026-11-20' },
      { event_type: 'interview_completed', occurred_at: '2026-11-26' },
    ]
    expect(tidigasteHandelse(h)).toBe('2026-11-20')
    expect(soktEfterHandelse('2026-11-21', h)).toBe('Du har en händelse den 20 november. Sökdatumet kan inte ligga efter den.')
    expect(soktEfterHandelse('2026-11-20', h)).toBeNull()
    expect(soktEfterHandelse('2026-11-17', h)).toBeNull()
  })

  it('"Sökt ändå" (bakåtdaterat sökdatum utan andra händelser) går igenom', () => {
    expect(soktEfterHandelse('2026-11-19', [{ event_type: 'applied', occurred_at: '2026-11-19' }])).toBeNull()
  })
})

describe('foljdeUppRad', () => {
  it('raden som vyn visar direkt efter loggningen', () => {
    expect(foljdeUppRad(rad({ sent_at: '2026-11-21', sent_via: 'kopierat' }))).toEqual({
      typ: 'foljde_upp',
      id: 'uppfoljning-u1',
      radId: 'u1',
      datum: '2026-11-21',
      rubrik: 'Följde upp',
      text: 'Uppföljningsmejlet kopierat och skickat.',
    })
  })

  it('ingen rad för ett oskickat utkast', () => {
    expect(foljdeUppRad(rad({}))).toBeNull()
  })
})
