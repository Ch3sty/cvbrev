/**
 * CV:t per yrke (cv-exempel/[yrke] och cv-mallar/[yrke]): ett stort ark
 * med en andra sida bakom, på en platta i CV-delens petrol. Arket bär
 * inget namn och ingen text, eftersom samma bild står för alla yrken:
 * yrket står i rubriken bredvid.
 *
 * Ritas av next/og (Satori), byggdelarna i OgDelar.tsx.
 */
import { ArkRubrik, Linje, OG_FARG, OG_KOPPAR, OgArk, OgBakplatta, OgMarke, OgYta } from './OgDelar'

export default function OgCvMockup() {
  const c = OG_FARG.cv
  return (
    <OgYta>
      <OgBakplatta farg="cv" x={62} y={44} b={452} h={470} rot={6} />

      {/* Sidan bakom */}
      <OgArk x={170} y={34} b={330} h={460} rot={7} pad={26}>
        <Linje b="52%" h={10} farg="#B9B6C2" mt={4} />
        <ArkRubrik />
        <Linje />
        <Linje b="84%" />
      </OgArk>

      {/* Första sidan: foto, namn, kontakt och delarna */}
      <OgArk x={64} y={14} b={360} h={500} rot={-3} pad={30}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexShrink: 0, width: 62, height: 62, borderRadius: 31, background: c.ton }} />
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginLeft: 16 }}>
            <Linje b="78%" h={15} farg="#2B2B33" mt={0} />
            <Linje b="52%" h={8} farg={c.svag} mt={10} />
          </div>
        </div>
        <Linje b="88%" h={6} farg="#B9B6C2" mt={16} />

        <ArkRubrik mt={20} b="26%" h={8} />
        <Linje h={7} mt={10} />
        <Linje b="84%" h={7} mt={9} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            marginTop: 16,
            padding: '0 10px 12px',
            borderRadius: 9,
            border: `3px solid ${OG_KOPPAR.bas}`,
            background: '#FFF7F0',
          }}
        >
          <ArkRubrik mt={12} b="46%" h={8} />
          <Linje b="62%" h={8} farg="#8E8A99" mt={11} />
          <Linje h={7} mt={9} />
          <Linje b="84%" h={7} mt={9} />
          <Linje b="56%" h={8} farg="#8E8A99" mt={14} />
          <Linje b="90%" h={7} mt={9} />
        </div>

        <ArkRubrik mt={20} b="32%" h={8} />
        <Linje b="84%" h={7} mt={10} />
        <Linje b="46%" h={7} mt={9} />

        <ArkRubrik mt={20} b="38%" h={8} />
        <div style={{ display: 'flex', marginTop: 11 }}>
          {[78, 96, 64].map((b, i) => (
            <div key={i} style={{ display: 'flex', width: b, height: 20, marginLeft: i ? 8 : 0, borderRadius: 10, background: c.ton }} />
          ))}
        </div>
      </OgArk>

      <OgMarke farg="cv" x={448} y={398} rot={6} />
    </OgYta>
  )
}
