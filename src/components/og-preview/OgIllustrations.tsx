/**
 * Illustrationerna i delningsbilderna, en per sida eller sidtyp.
 *
 * Varje illustration visar produkten som den ser ut, i delens färg:
 * testerna i indigo (tran), CV i petrol (cv), personliga brev i plommon
 * (brev) och Jobbsöket i skog (jobb). Innehållet är sajtens egna exempel
 * (Sara Lindström, den kontrollräknade matrisen, 93 av 100 med två delar
 * som tappar). Tal står bara inuti en avbildad produktvy.
 *
 * Ytan är 560 × 560 och ritas av next/og (Satori): flexbox och absolut
 * placering, byggdelarna i OgDelar.tsx.
 */
import type { ReactNode } from 'react'
import {
  ArkRubrik,
  Lage,
  Linje,
  OG_FARG,
  OG_INK,
  OG_KOPPAR,
  OgArk,
  OgBakplatta,
  OgBlad,
  OgBock,
  OgBrade,
  OgBricka,
  OgDorr,
  OgKort,
  OgLucka,
  OgMinistig,
  OgRad,
  OgSju,
  OgSvar,
  OgSvav,
  OgTapp,
  OgYta,
  Platta,
  type OgFarg,
} from './OgDelar'

/* ------------------------------------------------------------------ */
/* Delat innehåll                                                      */
/* ------------------------------------------------------------------ */

/** Satori ritar inte fragment som kolumn: delat innehåll ligger alltid i en egen kolumn. */
const KOLUMN = { display: "flex", flexDirection: "column", flexShrink: 0 } as const

/** Poängen i CV-analysen: talet stort, "av 100" bredvid. */
function Poang({ farg, storlek }: { farg: OgFarg; storlek: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', fontSize: storlek, fontWeight: 800, lineHeight: 0.9, letterSpacing: storlek * -0.04 }}>93</div>
      <div
        style={{
          display: 'flex',
          marginLeft: 8,
          marginBottom: Math.round(storlek * 0.06),
          fontSize: Math.max(18, Math.round(storlek * 0.21)),
          fontWeight: 500,
          color: OG_FARG[farg].mjuk,
          whiteSpace: 'nowrap',
        }}
      >
        av 100
      </div>
    </div>
  )
}

/** Den valda delen på arket: kopparram och varm botten, som i CV-byggaren. */
function ValdDel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        marginTop: 14,
        padding: '0 8px 10px',
        borderRadius: 8,
        border: `3px solid ${OG_KOPPAR.bas}`,
        background: '#FFF7F0',
      }}
    >
      {children}
    </div>
  )
}

/** CV:t på arket: namn, kontaktrad och delarna som linjer. */
function CvInnehall({ namn = 20, vald = true, langt }: { namn?: number; vald?: boolean; langt?: boolean }) {
  return (
    <div style={KOLUMN}>
      <div style={{ display: 'flex', fontSize: namn, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
        Sara Lindström
      </div>
      <Linje b="78%" h={6} farg="#B9B6C2" mt={8} />
      <ArkRubrik />
      <Linje />
      <Linje b="84%" />
      {vald ? (
        <ValdDel>
          <ArkRubrik mt={10} b="46%" />
          <Linje b="84%" />
          <Linje />
          <Linje b="62%" />
        </ValdDel>
      ) : (
        <div style={KOLUMN}>
          <ArkRubrik b="46%" />
          <Linje b="84%" />
          <Linje />
          <Linje b="62%" />
        </div>
      )}
      <ArkRubrik />
      <Linje b="84%" />
      <Linje b="46%" />
      {langt ? (
        <div style={KOLUMN}>
          <ArkRubrik b="30%" />
          <Linje b="62%" />
          <Linje b="74%" />
        </div>
      ) : null}
    </div>
  )
}

/** Brevet på arket: avsändare, hälsning och två stycken där svaren på kraven är märkta. */
function BrevInnehall({ farg = OG_FARG.brev.svag, tat }: { farg?: string; tat?: boolean }) {
  const steg = tat ? 7 : 8
  const h = tat ? 6 : 7
  return (
    <div style={KOLUMN}>
      <Linje b="42%" h={tat ? 9 : 11} farg={farg} mt={0} />
      <Linje b="62%" h={h - 1} farg="#B9B6C2" mt={8} />
      <Linje b="26%" h={h} farg="#8E8A99" mt={tat ? 16 : 20} />
      <Linje h={h} mt={tat ? 12 : 16} />
      <Linje b="76%" h={h} farg={OG_KOPPAR.ljus} mt={steg} />
      <Linje h={h} mt={steg} />
      <Linje b="58%" h={h} mt={steg} />
      <Linje h={h} mt={tat ? 14 : 18} />
      <Linje b="64%" h={h} farg={OG_KOPPAR.ljus} mt={steg} />
      <Linje b="88%" h={h} mt={steg} />
      <Linje b="40%" h={h} mt={steg} />
    </div>
  )
}

/** En nål i CV-byggaren: delens nummer vid arkets kant. */
function Nal({ x, y, nr, nu }: { x: number; y: number; nr: number; nu?: boolean }) {
  return (
    <Lage x={x} y={y} b={38}>
      <div style={{ display: 'flex', width: 38, height: 41, borderRadius: 19, background: 'rgba(6, 8, 26, 0.3)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: 19,
            border: '3px solid #FFFFFF',
            background: nu ? OG_KOPPAR.bas : '#EEF3F2',
            color: nu ? OG_KOPPAR.text : '#5C6F6E',
            fontSize: 17,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {nr}
        </div>
      </div>
    </Lage>
  )
}

/** En pratbubbla i samtalet med Jobbcoachen. */
function Bubbla({ fran, farg, children, under }: { fran: 'du' | 'coach'; farg: OgFarg; children: ReactNode; under?: string }) {
  const f = OG_FARG[farg]
  const du = fran === 'du'
  return (
    <div style={{ display: 'flex', justifyContent: du ? 'flex-end' : 'flex-start', marginTop: du ? 0 : 12 }}>
      <div
        style={{
          display: 'flex',
          maxWidth: du ? 350 : 390,
          borderRadius: 20,
          borderBottomRightRadius: du ? 6 : 20,
          borderBottomLeftRadius: du ? 20 : 6,
          background: du ? 'transparent' : 'rgba(6, 8, 26, 0.3)',
          paddingBottom: du ? 0 : 5,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 16px 13px',
            borderRadius: 20,
            borderBottomRightRadius: du ? 6 : 20,
            borderBottomLeftRadius: du ? 20 : 6,
            background: du ? f.ljus : '#FFFFFF',
            color: du ? f.vagg3 : OG_INK.ett,
            fontSize: 19,
            fontWeight: 500,
            lineHeight: 1.34,
          }}
        >
          <div style={{ display: 'flex' }}>{children}</div>
          {under ? (
            <div style={{ display: 'flex', marginTop: 6, fontSize: 16, fontWeight: 800, color: OG_KOPPAR.ink }}>{under}</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** En pilleretikett. */
function Chip({ children, yta, farg, storlek = 15 }: { children: ReactNode; yta: string; farg: string; storlek?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        padding: `${Math.round(storlek * 0.42)}px ${Math.round(storlek * 0.85)}px`,
        borderRadius: 999,
        background: yta,
        color: farg,
        fontSize: storlek,
        fontWeight: 800,
        lineHeight: 1.15,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

/** En knapp i koppar med klack, som sajtens. Bild av knappen, ingen handling. */
function KopparKnapp({ children, storlek = 20 }: { children: ReactNode; storlek?: number }) {
  return (
    <div style={{ display: 'flex', flexShrink: 0, borderRadius: 999, background: OG_KOPPAR.ink, paddingBottom: 5 }}>
      <div
        style={{
          display: 'flex',
          padding: `${Math.round(storlek * 0.55)}px ${Math.round(storlek * 1.1)}px`,
          borderRadius: 999,
          background: OG_KOPPAR.bas,
          color: OG_KOPPAR.text,
          fontSize: storlek,
          fontWeight: 800,
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* STARTSIDAN och FUNKTIONER: de fyra delarna som kort                 */
/* ------------------------------------------------------------------ */

export function OgHomeIllustration() {
  return (
    <OgYta>
      <OgKort farg="tran" x={2} y={-12} b={300} rot={-2} namn="Rekryteringstester">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <OgBrade b={198} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <OgSvar s={50} f="kx" />
            <OgSvar s={50} f="cx" vald />
            <OgSvar s={50} f="cp" />
          </div>
        </div>
      </OgKort>

      <OgKort farg="cv" x={320} y={2} b={236} rot={2.4} namn="CV-analys">
        <Poang farg="cv" storlek={86} />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}>
          <OgSju farg="cv" />
        </div>
        <OgTapp namn="Erfarenhet" poang="30 av 35" andel={86} />
        <OgTapp namn="Språk" poang="3 av 5" andel={60} />
      </OgKort>

      <OgKort farg="brev" x={0} y={308} b={278} rot={1.6} namn="Personliga brev">
        <OgBlad pad="16px 16px 18px">
          <Linje b="44%" h={9} farg={OG_FARG.brev.svag} mt={0} />
          <Linje h={7} mt={9} />
          <Linje b="72%" h={7} farg={OG_KOPPAR.ljus} mt={9} />
          <Linje h={7} mt={9} />
          <Linje b="54%" h={7} farg={OG_KOPPAR.ljus} mt={9} />
          <Linje b="82%" h={7} mt={9} />
        </OgBlad>
        <OgRad farg="brev" fet="3 av 4 krav" text="har fått svar" />
      </OgKort>

      <OgKort farg="jobb" x={296} y={328} b={262} rot={-2} namn="Jobbsöket">
        <OgMinistig farg="jobb" b={222} />
        <OgRad farg="jobb" fet="Intervju" text="tisdag 10.00" mt={10} />
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* REKRYTERINGSTESTER: matrisuppgiften och en talserie                 */
/* ------------------------------------------------------------------ */

export function OgRekryteringstesterIllustration() {
  const t = OG_FARG.tran
  return (
    <OgYta>
      <OgKort
        farg="tran"
        x={4}
        y={-4}
        b={404}
        rot={-2}
        namn="Matrislogik"
        namnStorlek={24}
        pad={20}
        hoger={
          <Chip yta="rgba(255, 255, 255, 0.14)" farg={t.ink} storlek={16}>
            9 av 15
          </Chip>
        }
      >
        {/* Framsteget i bitar: besvarade, den man står på, kvar */}
        <div style={{ display: 'flex', marginBottom: 14 }}>
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexGrow: 1,
                flexBasis: 0,
                height: 8,
                marginLeft: i ? 4 : 0,
                borderRadius: 4,
                background: i < 8 ? t.ljus : i === 8 ? OG_KOPPAR.bas : 'rgba(255, 255, 255, 0.16)',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <OgBrade b={280} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <OgSvar s={66} f="kx" />
            <OgSvar s={66} f="cx" vald />
            <OgSvar s={66} f="cp" />
          </div>
        </div>
      </OgKort>

      <OgKort farg="tran" x={200} y={392} b={354} rot={3} namn="Talserier">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['3', '6', '12', '24'].map((tal) => (
            <OgBricka key={tal} s={56}>
              {tal}
            </OgBricka>
          ))}
          <OgLucka s={56} />
        </div>
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* PERSONLIGHETSTEST: fem skalor med var sin markör, två drag i ord    */
/* ------------------------------------------------------------------ */
// Profilen visas i produkten som lägen på fem skalor och som drag i ord,
// aldrig som poäng. Bilden säger samma sak: markörer på skalor, inga tal.
export function OgPersonlighetstestIllustration() {
  const t = OG_FARG.tran
  const skala = 236
  const rader = [
    { namn: 'Samvetsgrannhet', lage: 0.84 },
    { namn: 'Utåtriktning', lage: 0.3 },
    { namn: 'Stabilitet', lage: 0.58 },
    { namn: 'Vänlighet', lage: 0.66 },
    { namn: 'Öppenhet', lage: 0.8 },
  ]
  return (
    <OgYta>
      <OgKort farg="tran" x={28} y={44} b={504} rot={-2} namn="Din profil" namnStorlek={24} pad={24}>
        {rader.map((r, i) => (
          <div key={r.namn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: i ? 16 : 6 }}>
            <div style={{ display: 'flex', fontSize: 21, fontWeight: 800, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>{r.namn}</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0, width: skala, height: 30 }}>
              <div style={{ display: 'flex', width: skala, height: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.16)' }} />
              <div style={{ position: 'absolute', left: skala / 2 - 1, top: 4, width: 3, height: 22, borderRadius: 2, background: t.svag }} />
              <div
                style={{
                  position: 'absolute',
                  left: Math.round(r.lage * skala) - 15,
                  top: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  border: '5px solid #FFFFFF',
                  background: OG_KOPPAR.bas,
                }}
              />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', marginTop: 26, fontSize: 17, fontWeight: 500, color: t.mjuk }}>Dina tydligaste drag</div>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <Chip yta={OG_KOPPAR.bas} farg={OG_KOPPAR.text} storlek={19}>
            Hög samvetsgrannhet
          </Chip>
          <div style={{ display: 'flex', marginLeft: 10 }}>
            <Chip yta={t.ink} farg={t.vagg} storlek={19}>
              Hög öppenhet
            </Chip>
          </div>
        </div>
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* CV-ANALYS: arket med den del som tappar, och poängen                */
/* ------------------------------------------------------------------ */

export function OgCvAnalysisIllustration() {
  return (
    <OgYta>
      <OgArk x={6} y={34} b={316} h={452} rot={-4} pad={26}>
        <CvInnehall namn={22} langt />
      </OgArk>
      <OgKort farg="cv" x={256} y={140} b={298} rot={2.5} namn="CV-analys" namnStorlek={24} pad={20}>
        <Poang farg="cv" storlek={108} />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 18 }}>
          <OgSju farg="cv" h={18} />
        </div>
        <OgTapp namn="Erfarenhet" poang="30 av 35" andel={86} storlek={19} mt={18} />
        <OgTapp namn="Språk" poang="3 av 5" andel={60} storlek={19} mt={16} />
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* SKAPA CV: arket i byggaren med nålar, och Jobbcoachens förslag      */
/* ------------------------------------------------------------------ */

export function OgSkapaCvIllustration() {
  const c = OG_FARG.cv
  const forslag = ['Drev fyra upphandlingar enligt LOU', 'Ansvarade för budget och tidplan']
  return (
    <OgYta>
      <OgArk x={34} y={4} b={338} h={468} rot={-3} pad={28}>
        <CvInnehall namn={23} langt />
      </OgArk>
      <Nal x={12} y={36} nr={1} />
      <Nal x={18} y={112} nr={2} />
      <Nal x={24} y={196} nr={3} nu />
      <Nal x={34} y={314} nr={4} />
      <OgKort farg="cv" x={196} y={296} b={346} rot={3} namn="Jobbcoachen föreslår" namnStorlek={21}>
        {forslag.map((text, i) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', marginTop: i ? 12 : 2 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: 9,
                background: i === 0 ? OG_KOPPAR.bas : 'rgba(255, 255, 255, 0.14)',
                border: i === 0 ? `2px solid ${OG_KOPPAR.bas}` : `2px solid ${c.svag}`,
              }}
            >
              {i === 0 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 12.5l4 4 8-9" stroke={OG_KOPPAR.text} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>
            <div style={{ display: 'flex', marginLeft: 12, fontSize: 18, fontWeight: 500, lineHeight: 1.25, color: c.ink }}>{text}</div>
          </div>
        ))}
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* CV-MALLAR: tre ark i tre stilar                                     */
/* ------------------------------------------------------------------ */

function MallArk({ x, y, rot, children }: { x: number; y: number; rot: number; children: ReactNode }) {
  return (
    <Lage x={x} y={y} b={206} h={300} rot={rot}>
      <Platta yta="#FFFFFF" klack="rgba(6, 8, 26, 0.36)" radie={8} djup={9} pad={0} stil={{ overflow: 'hidden', color: OG_INK.ett }}>
        {children}
      </Platta>
    </Lage>
  )
}

export function OgCvMallarIllustration() {
  return (
    <OgYta>
      <OgKort farg="cv" x={14} y={22} b={532} h={506} rot={-1.5} namn="CV-mallar" namnStorlek={24} pad={22} />

      {/* Mall med färgat huvud */}
      <MallArk x={40} y={150} rot={-7}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 70, padding: '18px 18px 0', background: '#B5543A' }}>
          <Linje b="62%" h={11} farg="#FFFFFF" mt={0} />
          <Linje b="44%" h={6} farg="rgba(255, 255, 255, 0.7)" mt={9} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 18px' }}>
          <ArkRubrik mt={14} />
          <Linje />
          <Linje b="84%" />
          <Linje b="62%" />
          <ArkRubrik mt={14} b="46%" />
          <Linje b="84%" />
          <Linje />
          <ArkRubrik mt={14} b="30%" />
          <Linje b="62%" />
        </div>
      </MallArk>

      {/* Mall med sidofält och foto */}
      <MallArk x={176} y={118} rot={1}>
        <div style={{ display: 'flex', flexGrow: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70, padding: '18px 12px', background: '#1E5F5F' }}>
            <div style={{ display: 'flex', width: 42, height: 42, borderRadius: 21, background: '#D7ECEA' }} />
            <Linje h={5} farg="rgba(255, 255, 255, 0.75)" mt={16} />
            <Linje b="80%" h={5} farg="rgba(255, 255, 255, 0.5)" mt={7} />
            <Linje h={5} farg="rgba(255, 255, 255, 0.75)" mt={22} />
            <Linje b="70%" h={5} farg="rgba(255, 255, 255, 0.5)" mt={7} />
            <Linje b="86%" h={5} farg="rgba(255, 255, 255, 0.5)" mt={7} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '20px 16px' }}>
            <Linje b="78%" h={11} farg="#2B2B33" mt={0} />
            <Linje b="52%" h={6} farg="#B9B6C2" mt={9} />
            <ArkRubrik mt={18} b="50%" />
            <Linje />
            <Linje b="84%" />
            <Linje b="62%" />
            <ArkRubrik mt={16} b="42%" />
            <Linje b="84%" />
            <Linje />
            <ArkRubrik mt={16} b="34%" />
            <Linje b="62%" />
          </div>
        </div>
      </MallArk>

      {/* Enkel mall med kopparlinje */}
      <MallArk x={312} y={150} rot={8}>
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '22px 20px' }}>
          <Linje b="66%" h={12} farg="#2B2B33" mt={0} />
          <Linje b="48%" h={6} farg="#B9B6C2" mt={9} />
          <Linje h={3} farg={OG_KOPPAR.bas} mt={14} />
          <Linje b="34%" h={7} farg="#8E8A99" mt={16} />
          <Linje />
          <Linje b="84%" />
          <Linje b="62%" />
          <Linje b="40%" h={7} farg="#8E8A99" mt={18} />
          <Linje b="84%" />
          <Linje />
          <Linje b="30%" h={7} farg="#8E8A99" mt={18} />
          <Linje b="62%" />
        </div>
      </MallArk>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* PERSONLIGT BREV: brevet och annonsens krav                          */
/* ------------------------------------------------------------------ */

export function OgPersonligtBrevIllustration() {
  const krav: [string, boolean][] = [
    ['Offentlig upphandling, LOU', true],
    ['Budgetansvar', true],
    ['Tidplan och uppföljning', true],
    ['PMP-certifiering', false],
  ]
  return (
    <OgYta>
      <OgKort farg="brev" x={0} y={22} b={404} rot={-2} namn="Personligt brev" namnStorlek={24} pad={20}>
        <OgBlad pad="24px 24px 28px">
          <BrevInnehall />
        </OgBlad>
        <OgRad farg="brev" fet="3 av 4 krav" text="har fått svar" storlek={20} mt={16} />
      </OgKort>

      {/* Lappen står till höger om raden under brevet, så att den aldrig täcker den */}
      <OgSvav x={288} y={324} b={270} rot={4} pad="16px 16px 18px">
        <div style={{ display: 'flex', fontSize: 20, fontWeight: 800, letterSpacing: -0.2 }}>Annonsens krav</div>
        {krav.map(([text, pa]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <OgBock s={22} pa={pa} />
            <div style={{ display: 'flex', marginLeft: 9, fontSize: 16, fontWeight: 500, color: OG_INK.tva, whiteSpace: 'nowrap' }}>{text}</div>
          </div>
        ))}
      </OgSvav>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* JOBBMATCHNING: träffen med matchgrad och skälen                     */
/* ------------------------------------------------------------------ */

function Matchring({ varde, s = 68 }: { varde: number; s?: number }) {
  const r = 16
  const omkrets = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: s, height: s }}>
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx="20" cy="20" r={r} stroke={OG_FARG.jobb.ton} strokeWidth="5" />
        <circle
          cx="20"
          cy="20"
          r={r}
          stroke={OG_FARG.jobb.tonInk}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(omkrets * varde) / 100} ${omkrets}`}
          transform="rotate(-90 20 20)"
        />
      </svg>
      <div style={{ display: 'flex', fontSize: Math.round(s * 0.36), fontWeight: 800, letterSpacing: -0.5, color: OG_FARG.jobb.vagg }}>{varde}</div>
    </div>
  )
}

export function OgJobbmatchningIllustration() {
  const skal = ['1 av dina 3 roller', 'Fyra av dina kompetenser nämns i annonsen', 'Göteborg, en av orterna du har valt']
  return (
    <OgYta>
      <OgKort farg="jobb" x={10} y={50} b={484} rot={-2} namn="Matchade jobb" namnStorlek={24} pad={20}>
        <OgBlad pad="20px 20px 22px" radie={16}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Matchring varde={91} />
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 14 }}>
              <div style={{ display: 'flex', fontSize: 25, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                Projektledare, bygg
              </div>
              <div style={{ display: 'flex', marginTop: 5, fontSize: 17, fontWeight: 500, color: OG_INK.tre, whiteSpace: 'nowrap' }}>
                Nordhaga Bygg, Göteborg
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 17, fontWeight: 800, color: OG_FARG.jobb.tonInk }}>Därför passar du</div>
          {skal.map((text) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
              <OgBock s={24} />
              <div style={{ display: 'flex', marginLeft: 10, fontSize: 16, fontWeight: 500, color: OG_INK.tva, whiteSpace: 'nowrap' }}>{text}</div>
            </div>
          ))}
        </OgBlad>
      </OgKort>
      <Lage x={352} y={400} b={190} rot={3}>
        <KopparKnapp storlek={24}>Skriv brev</KopparKnapp>
      </Lage>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* SÖKTA TJÄNSTER: vägen från Ska sökas till Erbjudande                */
/* ------------------------------------------------------------------ */

function Bol({ x, y, text, nu }: { x: number; y: number; text: string; nu?: boolean }) {
  const j = OG_FARG.jobb
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        width: 44,
        height: 49,
        borderRadius: 13,
        background: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 13,
          border: nu ? `4px solid ${OG_KOPPAR.bas}` : `4px solid ${j.ink}`,
          background: j.ink,
          color: j.vagg,
          fontSize: 16,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </div>
  )
}

function Etikett({ x, y, namn, under, hoger }: { x: number; y: number; namn: string; under?: string; hoger?: boolean }) {
  const j = OG_FARG.jobb
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: hoger ? 'flex-end' : 'flex-start',
        width: 170,
      }}
    >
      <div style={{ display: 'flex', fontSize: 19, fontWeight: 800, letterSpacing: -0.2, lineHeight: 1.1, color: j.ink, whiteSpace: 'nowrap' }}>{namn}</div>
      {under ? (
        <div style={{ display: 'flex', marginTop: 3, fontSize: 14, fontWeight: 500, color: j.mjuk, whiteSpace: 'nowrap' }}>{under}</div>
      ) : null}
    </div>
  )
}

export function OgSoktaTjansterIllustration() {
  const j = OG_FARG.jobb
  return (
    <OgYta>
      <OgKort farg="jobb" x={14} y={56} b={532} rot={-1.5} namn="Sökta tjänster" namnStorlek={24} pad={22}>
        <div style={{ position: 'relative', display: 'flex', width: 484, height: 318 }}>
          <svg width="484" height="318" viewBox="0 0 484 318" fill="none" style={{ position: 'absolute', left: 0, top: 0 }}>
            <path
              d="M40 262 C 120 262, 130 202, 200 192 S 290 162, 340 132 S 420 86, 446 62"
              stroke={j.ink}
              strokeOpacity="0.6"
              strokeWidth="4"
              strokeDasharray="1 11"
              strokeLinecap="round"
            />
            <circle cx="40" cy="262" r="10" fill={j.vagg2} stroke={j.ink} strokeWidth="4" />
            <circle cx="200" cy="192" r="13" fill={OG_KOPPAR.bas} stroke={j.ink} strokeWidth="4" />
            <circle cx="340" cy="132" r="10" fill={j.vagg2} stroke={j.ink} strokeWidth="4" />
            <path d="M446 62V14" stroke={j.ink} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M448 14l34 12-34 13z" fill={OG_KOPPAR.bas} />
            <circle cx="446" cy="62" r="7.5" fill={j.ink} />
          </svg>

          <Bol x={18} y={192} text="IL" />
          <Bol x={150} y={118} text="DA" nu />
          <Bol x={204} y={110} text="CO" />
          <Bol x={318} y={62} text="PO" />

          <div style={{ position: 'absolute', left: 104, top: 76, display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                padding: '6px 13px',
                borderRadius: 999,
                background: OG_KOPPAR.bas,
                color: OG_KOPPAR.text,
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
              }}
            >
              tyst i 12 dagar
            </div>
          </div>

          <Etikett x={8} y={284} namn="Ska sökas" />
          <Etikett x={168} y={218} namn="Sökt" under="2 väntar på svar" />
          <Etikett x={310} y={156} namn="Intervju" under="tisdag 10.00" />
          <Etikett x={262} y={4} namn="Erbjudande" hoger />
        </div>
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* BLI UPPTÄCKT: kandidatkortet utan namn, och kontaktförfrågan        */
/* ------------------------------------------------------------------ */

export function OgBliUpptacktIllustration() {
  const j = OG_FARG.jobb
  return (
    <OgYta>
      <OgBakplatta farg="jobb" x={70} y={30} b={440} h={420} rot={5} />
      <OgSvav x={10} y={62} b={430} rot={-2} pad="22px 24px 24px" radie={22}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: 60,
              height: 60,
              borderRadius: 18,
              background: j.ton,
              color: j.tonInk,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 14 }}>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.1 }}>Projektledare</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
              <div style={{ display: 'flex', fontSize: 17, fontWeight: 500, color: OG_INK.tre, whiteSpace: 'nowrap' }}>Västra Götaland</div>
              <div style={{ display: 'flex', marginLeft: 8 }}>
                <Chip yta={j.ton} farg={j.tonInk} storlek={14}>
                  Anonym
                </Chip>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: 16, fontSize: 18, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', fontWeight: 800 }}>8 års erfarenhet,</div>
          <div style={{ display: 'flex', marginLeft: 5, fontWeight: 500, color: OG_INK.tva }}>senast projektledare</div>
        </div>
        <div style={{ display: 'flex', marginTop: 14 }}>
          <Chip yta="#DFE3F6" farg="#3B4790" storlek={15}>
            Matrislogik, topp 15 %
          </Chip>
        </div>
        <div style={{ display: 'flex', marginTop: 8 }}>
          <Chip yta="#EFEDF2" farg={OG_INK.tva} storlek={15}>
            Strukturerad
          </Chip>
          <div style={{ display: 'flex', marginLeft: 8 }}>
            <Chip yta="#EFEDF2" farg={OG_INK.tva} storlek={15}>
              Lugn under press
            </Chip>
          </div>
        </div>
      </OgSvav>

      <OgKort farg="jobb" x={206} y={316} b={348} rot={3} namn="Kontaktförfrågan" namnStorlek={21} pad={20}>
        <div style={{ display: 'flex', fontSize: 19, fontWeight: 500, lineHeight: 1.3, color: j.ink }}>En rekryterare vill prata med dig</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 14 }}>
          <KopparKnapp storlek={18}>Tacka ja</KopparKnapp>
          <div style={{ display: 'flex', marginLeft: 10 }}>
            <Chip yta="rgba(255, 255, 255, 0.14)" farg={j.ink} storlek={18}>
              Nej tack
            </Chip>
          </div>
        </div>
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* JOBBCOACHEN: ett samtal                                             */
/* ------------------------------------------------------------------ */

export function OgJobbcoachenIllustration() {
  return (
    <OgYta>
      <OgKort farg="jobb" x={16} y={50} b={528} rot={-1.5} namn="Jobbcoachen" namnStorlek={24} pad={22}>
        <Bubbla fran="du" farg="jobb">
          Jag sökte en tjänst för tolv dagar sedan och har inte hört något. Ska jag höra av mig?
        </Bubbla>
        <Bubbla fran="coach" farg="jobb" under="Vill du att vi skriver utkastet?">
          Ja. Efter en till två veckor är det rimligt att fråga. Skriv kort vilken tjänst det gäller.
        </Bubbla>
        <div style={{ display: 'flex', marginTop: 16 }}>
          <Chip yta="rgba(255, 255, 255, 0.14)" farg={OG_FARG.jobb.ink} storlek={16}>
            Vad skriver jag i ett uppföljningsmejl?
          </Chip>
        </div>
      </OgKort>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* LINKEDIN: profilen med orden rekryteraren söker på utmärkta         */
/* ------------------------------------------------------------------ */

export function OgLinkedinIllustration() {
  const c = OG_FARG.cv
  const rubrik: [string, boolean][] = [
    ['Projektledare', true],
    ['inom', false],
    ['energi', true],
    ['och', false],
    ['bygg', true],
    ['|', false],
    ['Offentlig upphandling', true],
    ['enligt', false],
    ['LOU', true],
  ]
  return (
    <OgYta>
      <OgBakplatta farg="cv" x={64} y={70} b={450} h={430} rot={5} />

      <Lage x={12} y={118} b={452} rot={-2}>
        <Platta yta="#FFFFFF" klack="rgba(6, 8, 26, 0.36)" radie={20} djup={9} pad={0} stil={{ overflow: 'hidden', color: OG_INK.ett }}>
          <div style={{ display: 'flex', height: 92, background: c.tonInk }} />
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 26px 28px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 92,
                height: 92,
                marginTop: -46,
                borderRadius: 46,
                border: '6px solid #FFFFFF',
                background: c.ton,
                color: c.tonInk,
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              SL
            </div>
            <div style={{ display: 'flex', marginTop: 10, fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>Sara Lindström</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 8 }}>
              {rubrik.map(([ord, sokord], i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    marginRight: 5,
                    marginTop: 5,
                    padding: sokord ? '1px 6px' : '1px 0',
                    borderRadius: 6,
                    background: sokord ? OG_KOPPAR.mjuk : 'transparent',
                    color: sokord ? OG_KOPPAR.text : OG_INK.tva,
                    fontSize: 19,
                    fontWeight: sokord ? 800 : 500,
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ord}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: 12, fontSize: 16, fontWeight: 500, color: OG_INK.tre }}>Göteborg, Västra Götalands län</div>
            <Linje h={7} mt={20} />
            <Linje b="84%" h={7} mt={9} />
            <Linje b="52%" h={7} mt={9} />
          </div>
        </Platta>
      </Lage>

      <OgSvav x={236} y={28} b={318} rot={3} pad="14px 16px 16px">
        <div style={{ display: 'flex', fontSize: 15, fontWeight: 800, color: OG_INK.tre }}>Rekryteraren söker</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 8,
            padding: '9px 12px',
            borderRadius: 12,
            border: '2px solid #CADFDD',
            background: '#F3F8F8',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="10.5" cy="10.5" r="6.5" stroke={c.tonInk} strokeWidth="3" />
            <path d="M15.5 15.5L21 21" stroke={c.tonInk} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div style={{ display: 'flex', marginLeft: 9, fontSize: 18, fontWeight: 800, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
            projektledare LOU Göteborg
          </div>
        </div>
      </OgSvav>
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* ARTIKLAR: tre artiklar ur de olika delarna                          */
/* ------------------------------------------------------------------ */

function ArtikelKort({ x, y, rot, farg, etikett, b = 316 }: { x: number; y: number; rot: number; farg: OgFarg; etikett: string; b?: number }) {
  const f = OG_FARG[farg]
  return (
    <Lage x={x} y={y} b={b} rot={rot}>
      <Platta yta="#FFFFFF" klack="rgba(6, 8, 26, 0.36)" radie={20} djup={9} pad={0} stil={{ overflow: 'hidden', color: OG_INK.ett }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 92, background: f.vagg2 }}>
          <OgDorr farg={farg} s={58} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px 20px 22px' }}>
          <Chip yta={f.ton} farg={f.tonInk} storlek={15}>
            {etikett}
          </Chip>
          <Linje b="92%" h={12} farg="#2B2B33" mt={14} />
          <Linje b="64%" h={12} farg="#2B2B33" mt={9} />
          <Linje b="38%" h={7} farg="#B9B6C2" mt={14} />
        </div>
      </Platta>
    </Lage>
  )
}

export function OgArticlesListIllustration() {
  return (
    <OgYta>
      <ArtikelKort x={232} y={-8} rot={5} farg="brev" etikett="Personligt brev" />
      <ArtikelKort x={6} y={166} rot={-4} farg="cv" etikett="CV" />
      <ArtikelKort x={214} y={322} rot={2} farg="tran" etikett="Rekryteringstester" b={336} />
    </OgYta>
  )
}

/* ------------------------------------------------------------------ */
/* EXEMPEL: ett CV och ett personligt brev                             */
/* ------------------------------------------------------------------ */

export function OgExempelIllustration() {
  return (
    <OgYta>
      <OgKort farg="cv" x={0} y={18} b={292} rot={-3} namn="CV">
        <OgBlad pad="20px 20px 24px">
          <CvInnehall namn={18} />
        </OgBlad>
      </OgKort>
      <OgKort farg="brev" x={268} y={128} b={290} rot={3} namn="Personligt brev">
        <OgBlad pad="20px 20px 26px">
          <BrevInnehall tat />
        </OgBlad>
      </OgKort>
    </OgYta>
  )
}
