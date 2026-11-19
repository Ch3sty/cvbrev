/**
 * Idag (konceptets V.hem) på testernas v4-modell: samma data och regler som
 * webbens Hem (hamtaTesterV4), i appens design.
 *
 *   Dagkortet         Nästa steg, första hinten, vyns enda starka yta
 *   Dagar i rad       veckoraden ur dagarna med slutfört test och dagsmålet
 *   Så ligger du till nivåbandet per testtyp, med taket
 *   Fortsätt          det senaste testet med resultat
 *   Mitt test         planens prov och datum
 *   Fler steg         hint två till fyra som rader
 *   Gratisraden       ett grundnivåtest om dagen, ur v4:s gratisläge
 *
 * Serverrenderad; öarna i IdagKlient lägger bara till mätningen, så inget
 * här väntar på JS och inget flyttar sig när sidan blir interaktiv.
 */
import Link from 'next/link';
import type { Hint, NivaLage, TestTypId, TesterV4Data } from '@/lib/tester/v4/typer';
import { GRATISRAD } from '@/lib/tester/v4/copy';
import { PROVDATUM_HREF, menyHref, omattMeta } from '@/lib/tester/v4/rutter';
import { fortsattMeta } from '@/components/tester-v4/hem/FortsattDarDuSlutade';
import { HintVisad, type HintKontext } from '@/components/tester-v4/hem/HintSparning';
import { datumText } from '@/lib/traning/rubrik';
import { kopstegHref } from '@/lib/onboarding/steps';
import { SALD_PLAN } from '@/lib/plans/plans';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import type { Dag } from '@/lib/traning/datum';
import { IDAG, dagkortVariant, dagsmalText, gratisLage, hintMal, idagRubrik, typerAttVisa, veckaV4, visaVecka } from '@/lib/mobilapp/idag';
import { DagkortIllu, IkonChev, IkonLas, Ring, TypIkon } from './ikoner';
import { DagTopprad } from './Topprad';
import { HintLank, KvotKop } from './IdagKlient';

const KOP_HREF = kopstegHref(SALD_PLAN, 'kvot');

function Dagkort({ hint, variant, kontext }: { hint: Hint; variant: 'koppar' | 'natt'; kontext: HintKontext }) {
  const las = hint.knapp.las;
  return (
    <section className={`tk-dagkort${variant === 'natt' ? ' natt' : ''}`} aria-label="Nästa steg" data-hint-typ={hint.typ}>
      <p className="tk-ey">{hint.eyebrow}</p>
      <div className="rad2">
        <div>
          <h2 className="tk-h2">{hint.rubrik}</h2>
          {hint.skal && <p className="text">{hint.skal}</p>}
        </div>
        <DagkortIllu />
      </div>
      <HintLank
        hint={hint}
        plats={0}
        kontext={kontext}
        href={hintMal(hint)}
        className="tk-knapp vit tk-tryck"
        ariaLabel={las ? `${hint.knapp.etikett}. ${IDAG.las}.` : undefined}
      >
        {las ? <IkonLas /> : null}
        {las ? IDAG.las : hint.knapp.etikett}
      </HintLank>
      {hint.tips && (
        <p className="fot">
          {IDAG.tips} {hint.tips}
        </p>
      )}
    </section>
  );
}

const talText = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');

/** Nivåbandet i appens färger: skala 1 till 10, osäkerheten som ljusare band, taket som streck. */
function Band({ typ, namn, lage, ton }: { typ: TestTypId; namn: string; lage: NivaLage; ton: 'koppar' | 'neutral' }) {
  const W = 240;
  const x = (v: number) => 10 + ((Math.min(10, Math.max(1, v)) - 1) / 9) * (W - 20);
  const y = 13;
  const matt = lage.status === 'matt' && lage.niva != null;
  const farg = ton === 'koppar' ? 'var(--kop)' : 'var(--a-ink-3)';
  const mjuk = ton === 'koppar' ? 'var(--kop-mjuk)' : 'var(--a-papper-2)';
  const aria = matt
    ? `${namn}: nivå ${talText(lage.niva as number)} av 10, tak i dag ${talText(lage.tak)}`
    : lage.status === 'paborjad' && lage.svar
      ? `${namn}: nivåkoll påbörjad, ${lage.svar.besvarade} av ${lage.svar.antal} svar`
      : `${namn}: inte mätt än`;
  return (
    <svg viewBox={`0 0 ${W} 26`} role="img" aria-label={aria} data-status={lage.status} style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible', marginTop: 4 }}>
      <line x1={x(1)} y1={y} x2={x(10)} y2={y} stroke="var(--a-kant)" strokeWidth={6} strokeLinecap="round" strokeDasharray={matt || lage.status === 'paborjad' ? undefined : '3 5'} />
      {lage.tak < 10 && <line x1={x(lage.tak)} y1={y - 7} x2={x(lage.tak)} y2={y + 7} stroke="var(--a-kant-stark)" strokeWidth={1.5} strokeDasharray="2 2" />}
      {matt ? (
        <>
          <rect x={x((lage.niva as number) - lage.osakerhet)} y={y - 6} width={x((lage.niva as number) + lage.osakerhet) - x((lage.niva as number) - lage.osakerhet)} height={12} rx={6} fill={mjuk} />
          <line x1={x(1)} y1={y} x2={x(lage.niva as number)} y2={y} stroke={farg} strokeWidth={6} strokeLinecap="round" />
          <circle cx={x(lage.niva as number)} cy={y} r={11} fill={farg} />
          <text x={x(lage.niva as number)} y={y + 3.5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fff" style={{ fontFamily: 'var(--tk-text)' }}>
            {talText(lage.niva as number)}
          </text>
        </>
      ) : (
        <>
          <rect x={x(5.5) - 52} y={y - 9} width={104} height={18} rx={9} fill="var(--a-papper)" />
          <text x={x(5.5)} y={y + 3.5} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--a-ink-3)" style={{ fontFamily: 'var(--tk-text)' }}>
            {lage.status === 'paborjad' && lage.svar ? `${lage.svar.besvarade} av ${lage.svar.antal} svar` : omattMeta(typ)}
          </text>
        </>
      )}
    </svg>
  );
}

export default function IdagVy({ data, aktivaDagar, dag, initial }: { data: TesterV4Data; aktivaDagar: readonly Dag[]; dag: string; initial: string }) {
  const { plan, hintar, gratis } = data;
  const kontext: HintKontext = { planTest: plan?.mittTest ?? null, planTyper: plan?.typer ?? [], plattform: 'app' };
  const forsta = hintar[0] ?? null;
  const fler = hintar.slice(1, 4);
  const variant = dagkortVariant(plan, forsta);
  const vecka = visaVecka(data, aktivaDagar) ? veckaV4(data.idag, aktivaDagar) : null;
  const saLigger = typerAttVisa(data.typer, plan);
  const gl = gratisLage(gratis);
  const forstaTyp = plan?.typer[0] ?? 'matris';

  return (
    <>
      <HintVisad hintar={hintar.slice(0, 4).map(({ id, typ, testtyp }) => ({ id, typ, testtyp }))} idag={data.idag} kontext={kontext} />
      <DagTopprad dag={dag} rubrik={idagRubrik(plan)} initial={initial} />
      <div className="tk-pad tk-stack" data-idag-v4>
        {forsta && variant !== 'vit' && <Dagkort hint={forsta} variant={variant} kontext={kontext} />}

        {vecka && (
          <section className="tk-kort" aria-label={IDAG.dagarIRad}>
            <div className="tk-rubrik">
              <p className="tk-ey">{data.dagsmal.mal ? IDAG.dagsmal : IDAG.dagarIRad}</p>
              {plan && (
                <Link href={PROVDATUM_HREF} className="tk-lank" style={{ fontSize: 13 }}>
                  {data.dagsmal.mal ? IDAG.andra : IDAG.valj}
                </Link>
              )}
            </div>
            <div className="tk-vecka" style={{ marginTop: 12 }}>
              {vecka.map((d) => (
                <div key={d.etikett} className={d.idag ? 'idag' : undefined}>
                  <Ring status={d.status} />
                  <span>{d.etikett}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }} data-dagsmal>
              {dagsmalText(data.dagsmal)}
            </p>
          </section>
        )}

        {saLigger.length > 0 && (
          <section className="tk-kort" aria-label={IDAG.saLigger} data-sa-ligger>
            <div className="tk-rubrik">
              <p className="tk-ey">{IDAG.saLigger}</p>
              <Link href={APP_FLIK.utveckling} className="tk-lank" style={{ fontSize: 13 }}>
                {IDAG.utveckling}
              </Link>
            </div>
            <div style={{ display: 'grid', gap: 4, marginTop: 6 }}>
              {saLigger.map((t) => (
                <Link key={t.id} href={menyHref(t.id)} className="tk-tryck" style={{ display: 'flex', gap: 12, alignItems: 'center', minHeight: 56 }} data-typ={t.id}>
                  <TypIkon typ={t.id} px={36} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>{t.namn}</b>
                    <Band typ={t.id} namn={t.namn} lage={t.niva} ton={!plan || t.ingarIPlan ? 'koppar' : 'neutral'} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data.fortsatt && (
          <div className="tk-rader" data-fortsatt>
            <Link href={menyHref(data.fortsatt.punkt.typ)} className="tk-rad tk-tryck" aria-label={`${IDAG.fortsatt}: ${data.fortsatt.rubrik}`}>
              <span className="tk-sym">
                <TypIkon typ={data.fortsatt.punkt.typ} px={40} />
              </span>
              <span className="t">
                <b>{data.fortsatt.rubrik}</b>
                <span>{fortsattMeta(data.fortsatt, data.idag)}</span>
              </span>
              <IkonChev />
            </Link>
          </div>
        )}

        {plan && (
          <div className="tk-rader">
            <Link href={APP_FLIK.tester} className="tk-rad tk-tryck">
              <span className="tk-sym">
                <TypIkon typ={forstaTyp} px={40} />
              </span>
              <span className="t">
                <b>{IDAG.mittTest(plan.namn)}</b>
                <span>
                  {plan.provdatum && plan.dagarKvar != null && plan.dagarKvar >= 0
                    ? `${datumText(plan.provdatum)}, ${plan.dagarKvar === 1 ? '1 dag' : `${plan.dagarKvar} dagar`} kvar`
                    : IDAG.ingetDatum}
                </span>
              </span>
              <IkonChev />
            </Link>
          </div>
        )}

        {fler.length > 0 && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div className="tk-rubrik" style={{ padding: '4px 2px 0' }}>
              <p className="tk-ey">{IDAG.flerSteg}</p>
            </div>
            <div className="tk-rader">
              {fler.map((h, i) => (
                <HintLank key={h.id} hint={h} plats={i + 1} kontext={kontext} href={hintMal(h)} className="tk-rad tk-tryck">
                  {h.testtyp && (
                    <span className="tk-sym">
                      <TypIkon typ={h.testtyp} px={40} />
                    </span>
                  )}
                  <span className="t">
                    <b>{h.rubrik}</b>
                    <span>{h.skal}</span>
                  </span>
                  {h.knapp.las ? (
                    <span className="tk-chip las">
                      <IkonLas />
                      Premium
                    </span>
                  ) : (
                    <IkonChev />
                  )}
                </HintLank>
              ))}
            </div>
          </div>
        )}

        {gl === 'kvar' && (
          <p className="tk-status" data-gratis="kvar">
            {IDAG.gratisKvar}
          </p>
        )}
        {gl === 'slut' && (
          <section className="tk-kort" aria-labelledby="gratis-rubrik" data-gratis="gjord">
            <h2 id="gratis-rubrik" className="tk-h2" style={{ fontSize: 17 }}>
              {GRATISRAD.rubrikSlut}
            </h2>
            <p className="tk-meta" style={{ marginTop: 4 }} data-gratisrad>
              {GRATISRAD.text(false, gratis.pris.prisrad, gratis.pris.namn)}
            </p>
            <KvotKop href={KOP_HREF} planTest={plan?.mittTest ?? null} className="tk-knapp morkt tk-tryck" style={{ marginTop: 14, height: 46 }}>
              {gratis.pris.knapp}
            </KvotKop>
          </section>
        )}
      </div>
    </>
  );
}
