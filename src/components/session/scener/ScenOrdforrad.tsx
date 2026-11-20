/**
 * Ordförråd. Säger: ett ord, vilket av alternativen betyder samma eller
 * motsatsen? Bladet med en liten eyebrow, ordet som ett tjockt streck på mjuk
 * yta, fyra alternativrader med brickor. Kopparn: brickan på det rätta
 * alternativet, vars rad står i stark kontur.
 */

import { A, Blad, DIM, Dimrad, K, Rad, SEN, ScenRam, YTA, MJUK, type ScenProps } from './bas'

const RAD = [54, 68, 82, 96]
const LANGD = [52, 68, 44, 60]

export default function ScenOrdforrad(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={8} y={8} w={144} h={104} />
      <g className={SEN}>
        <Dimrad d="M66 20h28" w={2.5} />
        <rect className={YTA} x="40" y="26" width="80" height="16" rx="4" fill={MJUK} />
        <Rad d="M50 34h60" w={6} />
        {RAD.map((y, i) => (
          <g key={y}>
            {i === 1 ? (
              <circle className={YTA} cx="30" cy={y} r="4.5" fill={A} />
            ) : (
              <circle cx="30" cy={y} r="3.5" stroke={DIM} strokeWidth="2" />
            )}
            {i === 1 ? <Rad d={`M42 ${y}h${LANGD[i]}`} /> : <Dimrad d={`M42 ${y}h${LANGD[i]}`} />}
          </g>
        ))}
      </g>
    </ScenRam>
  )
}
