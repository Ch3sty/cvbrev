'use client';

/**
 * Nivåögonblicket (konceptets V.nkResultat): rummet släcks, talet räknar upp
 * från 1 till nivån med haptik när det landar, skalan fylls, meningen säger
 * vad nivån betyder. Tre tal, målet som förslag och en enda kopparknapp:
 * utan konto "Spara och fortsätt", med konto dagens grundpass. Var de
 * tappade som staplar och planen som remsa.
 *
 * Vymodellen är webbens egen (matningResultat i lib/traning/resultat.ts),
 * så talen och meningarna är desamma som efter Nivåkollen på webben.
 */
import { useEffect, useState } from 'react';
import type { MatningResultat } from '@/lib/traning/resultat';
import { IkonX } from '../ikoner';
import { haptik, statusfalt } from '../skal';
import { NattSkala, Planremsa } from './Bilder';

type Dagtyp = 'matning' | 'pass' | 'vila' | 'ommatning' | 'general' | 'prov';

function useRaknaUpp(mal: number, ms = 900): number {
  const [n, setN] = useState(1);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(mal);
      haptik('medel');
      return;
    }
    const start = performance.now();
    let raf = 0;
    const steg = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.max(1, Math.round(1 + (mal - 1) * (1 - Math.pow(1 - p, 3)))));
      if (p < 1) raf = requestAnimationFrame(steg);
      else haptik('medel');
    };
    raf = requestAnimationFrame(steg);
    return () => cancelAnimationFrame(raf);
  }, [mal, ms]);
  return n;
}

export default function Nivaogonblick({
  vm,
  antal,
  anonym,
  provText,
  remsa,
  remsaRubrik,
  onStang,
  onSpara,
  onGrundpass,
  genomgangHref,
}: {
  vm: MatningResultat;
  antal: number;
  /** Utan konto: knappen sparar nivån på ett konto. */
  anonym: boolean;
  /** "planen till 6 december" eller "planen". */
  provText: string;
  remsa: readonly Dagtyp[];
  remsaRubrik: string;
  onStang: () => void;
  onSpara: () => void;
  onGrundpass: () => void;
  genomgangHref: string | null;
}) {
  const tal = useRaknaUpp(vm.heltal);

  useEffect(() => {
    statusfalt('morkt');
  }, []);

  return (
    <div className="tk-natt tk-natt-in">
      <div className="tk-natt-topp">
        <button type="button" className="tk-ik tk-tryck" aria-label="Stäng" onClick={onStang}>
          <IkonX />
        </button>
        <span style={{ flex: 1 }}>Nivåkollen</span>
        <span className="tk-meta" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {antal} / {antal}
        </span>
      </div>

      <div className="tk-pad">
        <div className="tk-s1">
          <p className="tk-ey kop" style={{ marginTop: 6 }}>
            Din nivå
          </p>
          <p className="tk-tal-stor" style={{ marginTop: 4 }} aria-label={`Nivå ${vm.heltal} av 10`}>
            <span aria-hidden="true">{tal}</span>
            <span className="tk-disp" aria-hidden="true" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0, color: 'var(--natt-mjuk)', marginLeft: 8 }}>
              av 10
            </span>
          </p>
          <p className="tk-p" style={{ marginTop: 8, maxWidth: '36ch' }}>
            {vm.mening}
          </p>
        </div>
        <div className="tk-s2" style={{ marginTop: 14 }}>
          <NattSkala nu={vm.skala.nu} sikte={vm.skala.sikte} aria={vm.skala.aria} />
          <dl className="tk-tal-tre">
            {vm.tal.map((t) => (
              <div key={t.etikett}>
                <dt>{t.etikett}</dt>
                <dd>{t.varde}</dd>
              </div>
            ))}
          </dl>
          {vm.malRad && <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>{vm.malRad}</p>}
        </div>
      </div>

      <div className="tk-pad" style={{ marginTop: 22, display: 'grid', gap: 12, paddingBottom: 20 }}>
        <div className="tk-kort papper lyft tk-s3">
          {anonym ? (
            <>
              <p className="tk-ey kop">Spara nivån</p>
              <h2 className="tk-h2" style={{ marginTop: 4 }}>
                Ett konto, så står nivån kvar
              </h2>
              <p className="tk-p" style={{ marginTop: 6 }}>
                Nivå {vm.heltal}, {provText} och dagens grundpass, gratis i dag. Samma konto som på jobbcoach.ai.
              </p>
              <button type="button" className="tk-knapp kop tk-tryck" style={{ marginTop: 14 }} onClick={onSpara}>
                Spara och fortsätt
              </button>
            </>
          ) : (
            <>
              <p className="tk-ey kop">I dag, gratis</p>
              <h2 className="tk-h2" style={{ marginTop: 4 }}>
                Ett grundpass på din nivå
              </h2>
              <p className="tk-p" style={{ marginTop: 6 }}>
                Nio uppgifter, cirka tio minuter. Regeln efter varje svar. Från i morgon ingår passen i Premium.
              </p>
              <button type="button" className="tk-knapp kop tk-tryck" style={{ marginTop: 14 }} onClick={onGrundpass}>
                Gör dagens grundpass
              </button>
            </>
          )}
        </div>

        {vm.familjer.length > 0 && (
          <div className="tk-kort tk-s4">
            <p className="tk-ey">Var du tappade</p>
            {vm.familjer.map((f) => (
              <div key={f.titel} style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                  <b style={{ fontWeight: 600 }}>{f.titel}</b>
                  <span className="tk-meta" style={{ whiteSpace: 'nowrap' }}>
                    {f.meta}
                  </span>
                </div>
                {f.andel != null && (
                  <div className="tk-stapel">
                    <i
                      style={{
                        width: `${Math.round(f.andel * 100)}%`,
                        background: f.ton === 'koppar' ? 'var(--kop)' : 'var(--natt-mjuk)',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="tk-kort tk-s5">
          <p className="tk-ey">{remsaRubrik}</p>
          <div style={{ marginTop: 10 }}>
            <Planremsa dagar={remsa} natt />
          </div>
        </div>

        {genomgangHref && (
          <a className="tk-lank tk-s5" style={{ textAlign: 'center', minHeight: 40, display: 'grid', placeItems: 'center' }} href={genomgangHref}>
            Gå igenom de {antal === 12 ? 'tolv' : antal} frågorna
          </a>
        )}
      </div>
    </div>
  );
}
