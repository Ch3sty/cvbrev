import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { formatSkalsteg, formatTal, medEnhet } from '../format'
import BarChart from '../BarChart'
import LineChart from '../LineChart'
import PieChart from '../PieChart'

const NBSP = ' '

describe('svensk talform i diagrammen', () => {
  it('decimalkomma, tusental och enhet efter mellanslag', () => {
    expect(formatTal(18.5)).toBe('18,5')
    expect(medEnhet(18.5, '%')).toBe(`18,5${NBSP}%`)
    expect(medEnhet(12.5, ' MSEK')).toBe(`12,5${NBSP}MSEK`)
    expect(medEnhet(42, '')).toBe('42')
    expect(formatTal(1450).replace(/\s/g, ' ')).toBe('1 450')
    expect(formatSkalsteg(2.5, 1)).toBe('2,5')
    expect(formatSkalsteg(20, 0)).toBe('20')
  })

  it('stapeldiagrammet skriver 18,5 % och aldrig 18.5%', () => {
    const html = renderToStaticMarkup(<BarChart data={[{ label: 'IT', value: 18.5 }, { label: 'HR', value: 7.25 }]} unit="%" />)
    expect(html).toContain(`18,5${NBSP}%`)
    expect(html).toContain(`7,25${NBSP}%`)
    const texter = [...html.matchAll(/>([^<]+)</g)].map((m) => m[1])
    expect(texter.filter((t) => /\d\.\d/.test(t))).toEqual([])
  })

  it('linjediagrammet skriver värdet vid varje punkt', () => {
    const data = [398, 281, 224, 373].map((y, i) => ({ x: `K${i + 1}`, y }))
    const html = renderToStaticMarkup(<LineChart data={data} unit="MWh" yAxisLabel="Förbrukning (MWh)" />)
    for (const v of ['398', '281', '224', '373']) expect(html).toContain(`>${v}</text>`)
    const utan = renderToStaticMarkup(<LineChart data={data} unit="MWh" showValues={false} />)
    expect(utan).not.toContain('>398</text>')
  })

  it('cirkeldiagrammet skriver procent med mellanslag', () => {
    const html = renderToStaticMarkup(<PieChart data={[{ label: 'A', value: 30.5 }, { label: 'B', value: 69.5 }]} />)
    expect(html).toContain(`31${NBSP}%`)
    expect(html).toContain(`30,5${NBSP}%`)
  })
})
