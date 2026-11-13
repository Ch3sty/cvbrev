/**
 * Utveckling (konceptets V.utveckling och V.tomUtv): kurvan i ett nattkort
 * som hjälte med mål och provdag, nivån per testtyp, märkena och tempot i
 * senaste passet. Gratis: bara senaste punkten syns, och kortet säger ärligt
 * att historiken ingår i Premium. Utan nivåkoll: kurvans tomma papper och
 * en knapp till Nivåkollen, aldrig ett streck.
 */
import Link from 'next/link';
import type { Traningsstatus } from '@/lib/traning/motor.server';
import type { UtvecklingTempo } from '@/components/traning/utveckling/typer';
import { nivaKort } from '@/lib/traning/pass-copy';
import { datumText, kortDatum } from '@/lib/traning/rubrik';
import { dagarMellan } from '@/lib/traning/datum';
import { DELTYP_NAMN, deltesterForPlan, mittTestNamn, mittTestUrPlan, type Deltyp } from '@/lib/traning/mittTest';
import { kurvPunkter, nivaFor, typSynlig } from '@/lib/mobilapp/vyer';
import { IkonLas, Marke, TypIkon, type MarkeTyp } from './ikoner';
import { Kurva, Skala } from './Kurva';
import { Topprad } from './Topprad';

const MARKEN: { nyckel: string; typ: MarkeTyp; text: string }[] = [
  { nyckel: 'forsta_matningen', typ: 'matning', text: 'Första nivåkollen' },
  { nyckel: 'forsta_veckan', typ: 'vecka', text: 'Första veckan' },
  { nyckel: 'nivan_upp', typ: 'niva', text: 'Nivån upp' },
  { nyckel: 'generalrepetitionen', typ: 'general', text: 'Övningsprovet' },
  { nyckel: 'provdagen', typ: 'prov', text: 'Provdagen' },
];

const TAL = ['Ingen', 'En', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta', 'Nio', 'Tio', 'Elva', 'Tolv'];
const tal = (n: number) => (n < TAL.length ? TAL[n] : String(n));
const talLitet = (n: number) => (n < TAL.length ? TAL[n].toLowerCase() : String(n));

function Tomt({ initial, href }: { initial: string; href: string }) {
  return (
    <>
      <Topprad titel="Utveckling" initial={initial} />
      <div className="tk-tomt">
        <svg viewBox="0 0 220 150" style={{ width: 220, height: 'auto' }} aria-hidden="true">
          <rect x="10" y="10" width="200" height="130" rx="18" fill="#FFFFFF" stroke="#16151C" strokeWidth="3" />
          <path d="M34 110h152M34 80h152M34 50h152" stroke="#E3E2DC" strokeWidth="2" />
          <path d="M40 112c20-6 30-30 50-32" fill="none" stroke="#C9C8C0" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
          <circle cx="40" cy="112" r="9" fill="#E8732A" stroke="#fff" strokeWidth="3" />
          <text x="150" y="60" fontFamily="var(--tk-disp)" fontSize="30" fontWeight="800" fill="#E3E2DC">
            ?
          </text>
        </svg>
        <h2 className="tk-h2">Kurvan börjar med Nivåkollen</h2>
        <p className="tk-p">Tolv uppgifter, cirka åtta minuter. Du får din nivå och första punkten på kurvan. Gratis.</p>
        <Link href={href} className="tk-knapp kop tk-tryck" style={{ marginTop: 8, maxWidth: 280 }}>
          Gör Nivåkollen
        </Link>
      </div>
    </>
  );
}

export default function UtvecklingVy({
  s,
  tempo,
  initial,
  nivakollHref,
}: {
  s: Traningsstatus;
  tempo: UtvecklingTempo | null;
  initial: string;
  nivakollHref: string;
}) {
  const plan = s.plan;
  const val = mittTestUrPlan(plan);
  const planTyper = (deltesterForPlan(plan) ?? []).filter((t) => t !== 'personlighet' && typSynlig(t));
  const typer: Deltyp[] = planTyper.length ? planTyper : ['matris'];
  // Hjälten: matrisens nivå med kurvan, annars första typen med en nivåkoll.
  const hjalteTyp: Deltyp | null = s.niva != null ? 'matris' : (typer.find((t) => nivaFor(s, t) != null) ?? null);
  if (!hjalteTyp) return <Tomt initial={initial} href={nivakollHref} />;

  const niva = nivaFor(s, hjalteTyp)!;
  const prov = plan?.provdatum ?? null;
  const sikte = plan?.sikte ?? null;
  const start = hjalteTyp === 'matris' ? s.start : null;
  const kp = start ? kurvPunkter(s.punkter, start.dag, prov, s.idag) : null;
  const forandring = start ? Math.round((niva - start.niva) * 10) / 10 : 0;
  const namn = val && val !== 'annat' && hjalteTyp === typer[0] ? mittTestNamn(val, plan?.mitt_test_variant ?? null) : DELTYP_NAMN[hjalteTyp].toLowerCase();
  const nadda = new Set(s.milstolpar.map((m) => m.nyckel));
  const senaste = tempo?.senaste ?? null;
  const over = senaste ? senaste.fragor.filter((f) => f.tid_s > senaste.budget_s).length : 0;
  const maxTid = senaste ? Math.max(senaste.budget_s * 1.4, ...senaste.fragor.map((f) => f.tid_s)) : 1;

  return (
    <>
      <Topprad titel="Utveckling" initial={initial} />
      <div className="tk-pad tk-stack" style={{ paddingTop: 0 }}>
        <section className="tk-kort natt" aria-label="Nivån över tid">
          <div className="tk-rubrik">
            <p className="tk-ey">Nivån, {namn}</p>
            {start && prov && prov >= s.idag && (
              <span className="tk-meta">
                dag {dagarMellan(start.dag, s.idag)} av {dagarMellan(start.dag, prov)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 4 }}>
            <div className="tk-tal-stor">{nivaKort(niva)}</div>
            <p className="tk-meta" style={{ paddingBottom: 8 }}>
              {!start
                ? `Nivåkollen ${kortDatum(s.nivakoll?.[hjalteTyp as 'verbal']?.dag ?? s.idag)}`
                : forandring > 0
                  ? `upp ${nivaKort(forandring)} sedan starten`
                  : forandring < 0
                    ? `ned ${nivaKort(-forandring)} sedan starten`
                    : 'startpunkten'}
            </p>
          </div>
          {kp && start && (
            <div style={{ marginTop: 8, position: 'relative' }}>
              <Kurva
                punkter={kp.punkter}
                dagar={kp.dagar}
                provX={kp.provX}
                sikte={sikte}
                natt
                rita={s.nyPunkt && kp.punkter.length > 1}
                startEtikett={datumText(start.dag)}
                aria={`Nivån över tid från ${nivaKort(start.niva)} till ${nivaKort(niva)}${sikte != null ? `, mål ${nivaKort(sikte)}` : ''}.`}
              />
              {s.historikLast && (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center' }}>
                  <Link href="/priser" className="tk-chip" style={{ background: 'rgba(255,255,255,.12)', color: 'var(--natt-ink)', height: 32, padding: '0 12px' }}>
                    <IkonLas />
                    Hela kurvan ingår i Premium
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="tk-kort" aria-label="Nivå per testtyp">
          <p className="tk-ey">Nivå per testtyp</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            {typer.map((t) => {
              const n = nivaFor(s, t);
              return (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <TypIkon typ={t} px={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <b style={{ fontWeight: 600 }}>{DELTYP_NAMN[t]}</b>
                      <span className="tk-meta">{n != null ? nivaKort(n) : 'ej mätt'}</span>
                    </div>
                    <Skala nu={n} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="tk-kort" aria-label="Märken">
          <p className="tk-ey">Märken</p>
          <div className="tk-marken" style={{ marginTop: 12 }}>
            {MARKEN.map((m) => (
              <div key={m.nyckel} className={nadda.has(m.nyckel) ? 'nadd' : undefined}>
                <Marke typ={m.typ} nadd={nadda.has(m.nyckel)} />
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </section>

        {senaste && senaste.fragor.length > 0 && (
          <section className="tk-kort" aria-label="Tempo">
            <div className="tk-rubrik">
              <p className="tk-ey">Tempo</p>
              <span className="tk-meta">provet ger {Math.round(senaste.budget_s)} s</span>
            </div>
            <p style={{ fontWeight: 600, marginTop: 4 }}>
              {tal(over)} av {talLitet(senaste.fragor.length)} över provets tid {senaste.dag === s.idag ? 'i dag' : kortDatum(senaste.dag)}
            </p>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 48, marginTop: 10, position: 'relative' }} aria-hidden="true">
              <i style={{ position: 'absolute', left: 0, right: 0, bottom: `${(48 * senaste.budget_s) / maxTid}px`, borderTop: '1.5px dashed var(--a-kant-stark)' }} />
              {senaste.fragor.map((f, i) => (
                <i
                  key={i}
                  style={{
                    flex: 1,
                    height: Math.max(3, Math.round((48 * f.tid_s) / maxTid)),
                    borderRadius: '3px 3px 0 0',
                    background: f.tid_s > senaste.budget_s ? 'var(--kop)' : 'var(--a-ink)',
                    opacity: f.ratt ? 1 : 0.35,
                  }}
                />
              ))}
            </div>
            <p className="tk-meta" style={{ marginTop: 8 }}>
              Streckad linje: provets tid. Ljusa staplar: fel svar.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
