/**
 * Ett mallkort i Mallar (skissens .mall): brevet i mallen som liten bild,
 * namnet, nivån, en rad om utseendet och formaten. Hela kortet är en knapp:
 * ett tryck provar mallen. Vald: orange kant och, när mallen bara provas,
 * brickan "Du provar".
 *
 * Inga hooks: går att rendera från både server och klient.
 */
import BrevMiniatyr from '@/components/brev3/ark/BrevMiniatyr'
import { Formatmarken, Tagg } from '@/components/brev3/kit'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import type { MallarKort } from './filter'
import { MALLAR_TEXT } from './text'

/** Miniatyrens bredd på dator (kortets bild minus luften runt). Telefonen skalar ner den i CSS. */
export const KORT_MINI_BREDD = 197
const KORT_MINI_HOJD = 250

export interface MallKortProps {
  mall: MallarKort
  /** Brevet ritat i mallen. Saknas: katalogens bild tills brevet är hämtat. */
  html?: string | null
  vald: boolean
  /** Brickan "Du provar" (vald men inte sparad). */
  provar: boolean
  /** "Ditt CV har den här." före raden. */
  cvMall: boolean
  onProva: (id: string) => void
}

export function MallKort({ mall, html, vald, provar, cvMall, onProva }: MallKortProps) {
  const gratis = mall.niva === 'gratis'
  const niva = gratis ? 'Gratis' : PAKETRADER.bricka
  return (
    <button
      type="button"
      className="b3-mallk"
      aria-pressed={vald}
      aria-label={`${mall.namn}, ${niva}.${cvMall ? MALLAR_TEXT.dittCvHar + ' ' : ''}${mall.kort}.`}
      onClick={() => onProva(mall.id)}
    >
      <span className="b3-mallk-bild" aria-hidden="true">
        <span className="b3-mallk-mini">
          {html ? (
            <BrevMiniatyr html={html} bredd={KORT_MINI_BREDD} hojd={KORT_MINI_HOJD} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/mallar/v2/${mall.id}-liten.webp`} alt="" width={KORT_MINI_BREDD} height={KORT_MINI_HOJD} loading="lazy" decoding="async" />
          )}
        </span>
        {provar ? <span className="b3-mallk-provar">{MALLAR_TEXT.duProvar}</span> : null}
      </span>
      <span className="b3-mallk-text">
        <span className="b3-mallk-topp">
          <b>{mall.namn}</b>
          <Tagg ton={gratis ? 'g' : 'p'}>{niva}</Tagg>
        </span>
        <small>{cvMall ? `${MALLAR_TEXT.dittCvHar} ${mall.kort}.` : `${mall.kort}.`}</small>
        <span className="b3-mallk-fm">
          <Formatmarken yta="papper" format={mall.word ? ['PDF', 'Word'] : ['PDF']} />
        </span>
      </span>
    </button>
  )
}
