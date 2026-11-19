/**
 * Bankbredden i artiklarnas slutkort (docs/design/bankbredd-2026-11-19.md
 * avsnitt 4): bara testpaketet, formen rad på vägg, mellan rubrik och
 * punkter. Artiklarna ger 500 i next dev (next-mdx-remote), så placeringen
 * vaktas här.
 */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { SlutKort } from '../ArtikelReklam'

const html = (el: React.ReactElement) => {
  const div = document.createElement('div')
  div.innerHTML = renderToStaticMarkup(el)
  return div
}

describe('SlutKort och Bankbredd', () => {
  it('testpaketet: rad på vägg mellan rubrik och punkter, med följeraden', () => {
    const d = html(<SlutKort paket="test" cluster="test" slug="matrigma-test" />)
    const fig = d.querySelector('figure.bb')!
    expect(fig.className).toBe('bb bb-rad bb-vagg')
    expect(fig.querySelector('.bb-text')?.textContent).toBe('Nivån räknas bara på uppgifter du inte sett den senaste månaden.')
    const rubrik = d.querySelector('.pub-h2')!
    const punkter = d.querySelector('ul.pub-bock')!
    expect(rubrik.compareDocumentPosition(fig) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(fig.compareDocumentPosition(punkter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('cv och allt får ingen Bankbredd', () => {
    expect(html(<SlutKort paket="cv" cluster="cv" slug="x" />).querySelector('figure.bb')).toBeNull()
    expect(html(<SlutKort paket="allt" cluster="interview" slug="x" />).querySelector('figure.bb')).toBeNull()
  })
})
