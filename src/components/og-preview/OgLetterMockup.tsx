/**
 * Det personliga brevet per yrke (personligt-brev-exempel/[yrke]): ett
 * stort ark på en platta i brevdelens plommon, med annonsens krav som
 * lapp över hörnet. Raderna som svarar på kraven är märkta, som i
 * produkten. Arket bär inget namn och ingen text, eftersom samma bild står
 * för alla yrken: yrket står i rubriken bredvid.
 *
 * Ritas av next/og (Satori), byggdelarna i OgDelar.tsx.
 */
import { Linje, OG_FARG, OG_KOPPAR, OgArk, OgBakplatta, OgBock, OgMarke, OgSvav, OgYta } from './OgDelar'

export default function OgLetterMockup() {
  const b = OG_FARG.brev
  return (
    <OgYta>
      <OgBakplatta farg="brev" x={50} y={44} b={452} h={470} rot={-6} />

      <OgArk x={104} y={12} b={368} h={506} rot={3} pad={32}>
        {/* Avsändare och datum */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '58%' }}>
            <Linje b="82%" h={14} farg={b.svag} mt={0} />
            <Linje h={7} farg="#B9B6C2" mt={10} />
            <Linje b="70%" h={7} farg="#B9B6C2" mt={8} />
          </div>
          <Linje b="22%" h={7} farg="#B9B6C2" mt={4} />
        </div>

        {/* Ärenderad och hälsning */}
        <Linje b="64%" h={11} farg="#2B2B33" mt={30} />
        <Linje b="22%" h={8} farg="#8E8A99" mt={22} />

        {/* Tre stycken, svaren på annonsens krav märkta */}
        <Linje h={8} mt={18} />
        <Linje b="78%" h={8} farg={OG_KOPPAR.ljus} mt={10} />
        <Linje h={8} mt={10} />
        <Linje b="56%" h={8} mt={10} />

        <Linje h={8} mt={22} />
        <Linje b="66%" h={8} farg={OG_KOPPAR.ljus} mt={10} />
        <Linje b="90%" h={8} mt={10} />
        <Linje b="42%" h={8} mt={10} />

        <Linje h={8} mt={22} />
        <Linje b="84%" h={8} mt={10} />
        <Linje b="48%" h={8} farg={OG_KOPPAR.ljus} mt={10} />

        {/* Underskrift */}
        <Linje b="30%" h={8} farg="#8E8A99" mt={26} />
        <Linje b="40%" h={11} farg={b.svag} mt={12} />
      </OgArk>

      {/* Annonsens krav: tre har fått svar, ett inte */}
      <OgSvav x={0} y={318} b={196} rot={-5} pad="15px 16px 17px" radie={18}>
        <Linje b="74%" h={10} farg="#2B2B33" mt={0} />
        {[86, 62, 78].map((bredd) => (
          <div key={bredd} style={{ display: 'flex', alignItems: 'center', marginTop: 11 }}>
            <OgBock s={24} />
            <div style={{ display: 'flex', width: bredd, height: 8, marginLeft: 10, borderRadius: 4, background: '#D5D2DB' }} />
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 11 }}>
          <OgBock s={24} pa={false} />
          <div style={{ display: 'flex', width: 70, height: 8, marginLeft: 10, borderRadius: 4, background: '#D5D2DB' }} />
        </div>
      </OgSvav>

      <OgMarke farg="brev" x={462} y={404} rot={-5} />
    </OgYta>
  )
}
