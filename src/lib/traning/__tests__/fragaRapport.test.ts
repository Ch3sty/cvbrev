import { describe, expect, it } from 'vitest'
import { lasRapport, RAPPORT_COPY } from '../fragaRapport'

describe('rapportknappen (tillagg-variation 3.2)', () => {
  it('läser en giltig rapport och kortar kommentaren till 200 tecken', () => {
    const r = lasRapport({ q_id: 'v7g-v3-vrid-01', session_id: '00000000-0000-4000-8000-000000000001', orsak: 'ratt_svar_fel', kommentar: 'x'.repeat(300) })
    expect(r).toMatchObject({ q_id: 'v7g-v3-vrid-01', test_kind: 'matris', orsak: 'ratt_svar_fel', bank_version: null })
    expect(r!.kommentar).toHaveLength(200)
  })
  it('fäller okänd orsak, saknat id och fel testsort', () => {
    expect(lasRapport({ q_id: 'a', orsak: 'tråkig' })).toBeNull()
    expect(lasRapport({ orsak: 'annat' })).toBeNull()
    expect(lasRapport({ q_id: 'a', orsak: 'annat', test_kind: 'logik' })).toBeNull()
  })
  it('ett sessions-id som inte är ett uuid sparas inte', () => {
    expect(lasRapport({ q_id: 'a', orsak: 'annat', session_id: 'x' })!.session_id).toBeNull()
  })
  it('texterna är svenska och utan tankstreck', () => {
    expect(JSON.stringify(RAPPORT_COPY)).not.toMatch(/[—–]/)
    expect(RAPPORT_COPY.lank).toBe('Något ser fel ut')
  })
})
