/**
 * Personlighet. Säger: här finns inget rätt svar, bara ditt. Bladet med ett
 * påstående i två rader och en skala med fem punkter där din punkt är
 * koppar; under står nästa påstående och dess skala dämpade, i väntan.
 */

import { A, Blad, DIM, Dimrad, FILL, K, Rad, SEN, ScenRam, YTA, type ScenProps } from './bas'

const X = [28, 54, 80, 106, 132]

export default function ScenPersonlighet(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={8} y={8} w={144} h={104} />
      <g className={SEN}>
        <Rad d="M24 28h80" />
        <Dimrad d="M24 40h52" />
        <Dimrad d="M28 60h104" />
        {X.map((x, i) =>
          i === 3 ? (
            <circle key={x} className={YTA} cx={x} cy="60" r="8" fill={A} />
          ) : (
            <circle key={x} cx={x} cy="60" r="6" fill={FILL} stroke={K} strokeWidth="3" />
          )
        )}
        <Dimrad d="M24 82h64" />
        <Dimrad d="M28 98h104" w={2.5} />
        {X.map((x) => (
          <circle key={x} className={YTA} cx={x} cy="98" r="3" fill={DIM} />
        ))}
      </g>
    </ScenRam>
  )
}
