/**
 * Utveckling (konceptets V.utveckling och V.tomUtv) på v4:s modell: kurvan
 * för en testtyp i ett nattkort som hjälte, nivån per testtyp, mönstren i
 * figurer och mönster, tempot och märkena. ?typ= väljer typen; raderna i
 * Nivå per testtyp är länkar dit, så allt ritas på servern.
 *
 * Gratis: bara senaste punkten per typ syns, och kortet säger ärligt att
 * historiken ingår i Premium. Utan punkter: kurvans tomma papper och en knapp
 * som börjar typen gratis, aldrig ett streck och aldrig en betalvägg.
 */
import Link from 'next/link';
import type { TestTypId, UtvecklingV4Data, MonsterLage } from '@/lib/tester/v4/typer';
import { NIVA_TEST_ANTAL, typNamnSmall } from '@/lib/tester/v4/copy';
import { slagEtikett } from '@/components/tester-v4/utveckling/copy';
import { kortDatum } from '@/lib/traning/rubrik';
import type { MilstolpeNyckel } from '@/lib/traning/milstolpar';
import {
  axelPunkter,
  dagAv,
  kurvaFor,
  nivaText,
  startFor,
  tempoFor,
  type Start,
  type TypRad,
} from '@/lib/mobilapp/utveckling';
import { IkonLas, Marke, TypIkon, type MarkeTyp } from './ikoner';
import { Kurva, KurvTecken, Skala } from './Kurva';
import { Topprad } from './Topprad';

/** Köp kopplas till Google Play i nästa steg; tills dess går knappen till priserna. */
const KOP_HREF = '/priser';

const MARKEN: { nyckel: MilstolpeNyckel; typ: MarkeTyp; text: string }[] = [
  { nyckel: 'forsta_matningen', typ: 'matning', text: 'Första nivåkollen' },
  { nyckel: 'forsta_veckan', typ: 'vecka', text: 'Första veckan' },
  { nyckel: 'nivan_upp', typ: 'niva', text: 'Nivån upp' },
  { nyckel: 'generalrepetitionen', typ: 'general', text: 'Övningsprovet' },
  { nyckel: 'provdagen', typ: 'prov', text: 'Provdagen' },
];

const TAL = ['Ingen', 'En', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta', 'Nio', 'Tio', 'Elva', 'Tolv'];
const tal = (n: number) => (n < TAL.length ? TAL[n] : String(n));
const talLitet = (n: number) => (n < TAL.length ? TAL[n].toLowerCase() : String(n));

/** Knappens och textens ord per start. */
function startText(s: Start, typ: TestTypId, harPremium: boolean): { rubrik: string; text: string; knapp: string } {
  const gratisNivakoll = harPremium ? '' : ' Gratis.';
  const gratisNivatest = harPremium ? '' : ' Ett grundnivåtest om dagen är gratis.';
  if (s.slag === 'nivakoll')
    return {
      rubrik: 'Kurvan börjar med Nivåkollen',
      text: `Tolv uppgifter i ${typNamnSmall(typ)}, cirka åtta minuter. Du får din nivå och första punkten på kurvan.${gratisNivakoll}`,
      knapp: 'Gör Nivåkollen',
    };
  if (s.slag === 'nivatest')
    return {
      rubrik: 'Kurvan börjar med ett nivåtest',
      text: `Grundnivån i ${typNamnSmall(typ)}, ${NIVA_TEST_ANTAL[typ].grund} uppgifter. Du får din nivå och första punkten på kurvan.${gratisNivatest}`,
      knapp: 'Gör nivåtestet',
    };
  return {
    rubrik: 'Kurvan börjar med din första nivå',
    text: `Öppna ${typNamnSmall(typ)} i Tester och välj hur du vill börja.`,
    knapp: 'Öppna testtypen',
  };
}

function Tomt({ initial, start, premium }: { initial: string; start: Start & { typ: TestTypId }; premium: boolean }) {
  const t = startText(start, start.typ, premium);
  return (
    <>
      <Topprad titel="Utveckling" initial={initial} />
      <div className="tk-tomt" data-tomt={start.slag}>
        <svg viewBox="0 0 220 150" style={{ width: 220, height: 'auto' }} aria-hidden="true">
          <rect x="10" y="10" width="200" height="130" rx="18" fill="#FFFFFF" stroke="#16151C" strokeWidth="3" />
          <path d="M34 110h152M34 80h152M34 50h152" stroke="#E3E2DC" strokeWidth="2" />
          <path d="M40 112c20-6 30-30 50-32" fill="none" stroke="#C9C8C0" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
          <circle cx="40" cy="112" r="9" fill="#E8732A" stroke="#fff" strokeWidth="3" />
          <text x="150" y="60" fontFamily="var(--tk-disp)" fontSize="30" fontWeight="800" fill="#E3E2DC">
            ?
          </text>
        </svg>
        <h2 className="tk-h2">{t.rubrik}</h2>
        <p className="tk-p">{t.text}</p>
        <Link href={start.href} className="tk-knapp kop tk-tryck" style={{ marginTop: 8, maxWidth: 280 }}>
          {t.knapp}
        </Link>
      </div>
    </>
  );
}

/** Mönsterrutan i fyra lägen (webbens Monsterrutor), i appens färger. */
function Ruta({ lage, ratt, antal, size = 32 }: { lage: MonsterLage; ratt?: number; antal?: number; size?: number }) {
  let inre: React.ReactNode;
  if (lage === 'omott') {
    inre = <rect x="4" y="4" width="32" height="32" rx="8" fill="none" stroke="var(--a-ink-3)" strokeWidth="1.5" strokeDasharray="3 3" />;
  } else if (lage === 'mott') {
    const h = antal ? 32 * Math.min(1, (ratt ?? 0) / antal) : 0;
    inre = (
      <>
        <rect x="4" y="4" width="32" height="32" rx="8" fill="none" stroke="var(--a-ink-2)" strokeWidth="1.5" />
        <rect x="4" y={36 - h} width="32" height={h} rx={h > 8 ? 0 : 2} fill="var(--kop-mjuk)" />
      </>
    );
  } else {
    inre = (
      <>
        {lage === 'snabb' && <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="none" stroke="var(--kop)" strokeWidth="2" />}
        <rect x={lage === 'snabb' ? 6 : 4} y={lage === 'snabb' ? 6 : 4} width={lage === 'snabb' ? 28 : 32} height={lage === 'snabb' ? 28 : 32} rx="8" fill="var(--kop)" />
        <path d="M13 20.5l5 5 9-10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" style={{ flex: '0 0 auto' }}>
      {inre}
    </svg>
  );
}

const MONSTER_LAGE: Record<MonsterLage, string> = { omott: 'inte mött', mott: 'mött', saker: 'säker', snabb: 'snabb' };

function Monster({ monster, premium }: { monster: NonNullable<UtvecklingV4Data['matrisMonster']>; premium: boolean }) {
  const saker = monster.filter((m) => m.lage === 'saker' || m.lage === 'snabb').length;
  return (
    <section className="tk-kort" aria-label="Mönstren i figurer och mönster" data-sektion="monster">
      <div className="tk-rubrik">
        <p className="tk-ey">Mönstren</p>
        <span className="tk-meta">
          {saker} av {monster.length} säkra
        </span>
      </div>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2px 10px', listStyle: 'none', padding: 0, margin: '10px 0 0' }}>
        {monster.map((m) => {
          const under = m.lage === 'mott' && m.antal ? `${m.ratt ?? 0} av ${m.antal} rätt` : MONSTER_LAGE[m.lage];
          const inne = (
            <>
              <Ruta lage={m.lage} ratt={m.ratt} antal={m.antal} />
              <span style={{ minWidth: 0, fontSize: 13, lineHeight: '16px' }}>
                {m.namn}
                <small style={{ display: 'block', fontSize: 12, color: 'var(--a-ink-3)', marginTop: 1 }}>{under}</small>
              </span>
            </>
          );
          const stil = { display: 'flex', alignItems: 'center', gap: 8, minHeight: 48, padding: '4px 0' } as const;
          return (
            <li key={m.family}>
              {premium ? (
                <Link href={m.href} className="tk-tryck" style={{ ...stil, color: 'inherit' }} aria-label={`Träna på mönstret ${m.namn}, ${under}`}>
                  {inne}
                </Link>
              ) : (
                <div style={stil}>{inne}</div>
              )}
            </li>
          );
        })}
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8, fontSize: 12, color: 'var(--a-ink-3)' }} aria-hidden="true">
        {(['omott', 'mott', 'saker', 'snabb'] as const).map((l) => (
          <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Ruta lage={l} ratt={1} antal={2} size={14} />
            {MONSTER_LAGE[l]}
          </span>
        ))}
      </div>
      {!premium && (
        <Link href={KOP_HREF} className="tk-tryck" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 44, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--a-kant)', fontSize: 14, color: 'var(--a-ink-2)' }}>
          <span>Träna på mönstren ingår i Premium</span>
          <span className="tk-chip las">
            <IkonLas />
            Premium
          </span>
        </Link>
      )}
    </section>
  );
}

export interface UtvecklingVyProps {
  data: UtvecklingV4Data;
  /** Typen i kurvan, null utan punkter (tomläget). */
  typ: TestTypId | null;
  rader: TypRad[];
  tom: Start & { typ: TestTypId };
  marken: Set<MilstolpeNyckel>;
  /** Matrisens mål ur planen, bara när kurvan visar matrisen. */
  sikte?: number | null;
  /** En ny punkt sedan sist: linjen ritar sig. */
  rita?: boolean;
  initial: string;
}

export default function UtvecklingVy({ data, typ, rader, tom, marken, sikte = null, rita = false, initial }: UtvecklingVyProps) {
  const premium = data.gratis.premium;
  if (data.punkter.length === 0 || !typ) return <Tomt initial={initial} start={tom} premium={premium} />;

  const plan = data.plan;
  const lage = data.typer.find((t) => t.id === typ)?.niva ?? null;
  const namn = data.typer.find((t) => t.id === typ)?.namn ?? typ;
  const niva = lage?.status === 'matt' ? lage.niva : null;
  const modell = kurvaFor(data, typ);
  const axel = axelPunkter(data.punkter, typ);
  const forsta = axel[0] ?? null;
  const senaste = axel[axel.length - 1] ?? null;
  const forandring = niva != null && forsta && axel.length > 1 ? Math.round((niva - (forsta.niva as number)) * 10) / 10 : null;
  const dag = dagAv(plan, data.idag);
  const vidTaket = niva != null && lage != null && niva >= lage.tak;
  const ingenNiva = niva == null ? startFor(typ, data.gratis) : null;
  const tempo = tempoFor(data.punkter, typ);
  const visaMonster = typ === 'matris' && !!data.matrisMonster?.length;
  const ariaKurva =
    niva != null
      ? `Nivån i ${typNamnSmall(typ)} över tid${forsta && axel.length > 1 ? `, från ${nivaText(forsta.niva as number)}` : ''} till ${nivaText(niva)}${sikte != null ? `, mål ${nivaText(sikte)}` : ''}.`
      : `Resultaten i ${typNamnSmall(typ)} över tid. Ingen nivå än.`;

  return (
    <>
      <Topprad titel="Utveckling" initial={initial} />
      <div className="tk-pad tk-stack" style={{ paddingTop: 0 }}>
        <section className="tk-kort natt" aria-label="Nivån över tid" data-typ={typ}>
          <div className="tk-rubrik">
            <p className="tk-ey">Nivån, {typNamnSmall(typ)}</p>
            {dag && (
              <span className="tk-meta">
                dag {dag.dag} av {dag.av}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 4, minHeight: 56 }}>
            {niva != null ? (
              <>
                <div className="tk-tal-stor">{nivaText(niva)}</div>
                <p className="tk-meta" style={{ paddingBottom: 8 }}>
                  {forandring != null && forandring > 0
                    ? `upp ${nivaText(forandring)} sedan starten`
                    : forandring != null && forandring < 0
                      ? `ned ${nivaText(-forandring)} sedan starten`
                      : senaste
                        ? `${slagEtikett(senaste)} ${kortDatum(senaste.dag)}`
                        : 'startpunkten'}
                  {vidTaket && lage ? `, taket i dag ${nivaText(lage.tak)}` : ''}
                </p>
              </>
            ) : (
              <div style={{ paddingBottom: 6 }}>
                <p style={{ fontWeight: 600, fontSize: 18 }}>
                  {lage?.status === 'paborjad' && lage.svar ? `Nivåkollen, ${lage.svar.besvarade} av ${lage.svar.antal} svar` : 'Ingen nivå än'}
                </p>
                {ingenNiva && (
                  <Link href={ingenNiva.href} className="tk-chip kop tk-tryck" style={{ marginTop: 8, height: 32, padding: '0 12px' }}>
                    {lage?.status === 'paborjad' ? 'Fortsätt Nivåkollen' : ingenNiva.slag === 'nivakoll' ? 'Gör Nivåkollen' : 'Gör nivåtestet'}
                  </Link>
                )}
              </div>
            )}
          </div>
          <div style={{ marginTop: 8, position: 'relative' }}>
            <Kurva modell={modell} sikte={sikte} natt rita={rita && axel.length > 1} aria={ariaKurva} />
            {data.historikLast && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: '30%', display: 'flex', justifyContent: 'center' }}>
                <Link href={KOP_HREF} className="tk-chip" style={{ background: 'rgba(255,255,255,.12)', color: 'var(--natt-ink)', height: 32, padding: '0 12px' }}>
                  <IkonLas />
                  Hela historiken ingår i Premium
                </Link>
              </div>
            )}
          </div>
          <KurvTecken modell={modell} natt />
        </section>

        <section className="tk-kort" aria-label="Nivå per testtyp">
          <div className="tk-rubrik">
            <p className="tk-ey">Nivå per testtyp</p>
            {plan && <span className="tk-meta">{plan.namn} först</span>}
          </div>
          <ul style={{ display: 'grid', gap: 4, marginTop: 8, listStyle: 'none', padding: 0 }}>
            {rader.map((r) => {
              const inne = (
                <>
                  <TypIkon typ={r.id} px={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14 }}>
                      <b style={{ fontWeight: 600 }}>{r.namn}</b>
                      <span className="tk-meta" style={r.niva.status === 'matt' ? { color: 'var(--a-ink)', fontWeight: 600 } : undefined}>
                        {r.text}
                      </span>
                    </div>
                    <Skala nu={r.niva.status === 'matt' ? r.niva.niva : null} tak={r.niva.tak} />
                  </div>
                </>
              );
              const stil = {
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                minHeight: 48,
                padding: '4px 8px',
                margin: '0 -8px',
                borderRadius: 12,
                color: 'inherit',
                background: r.vald ? 'var(--a-papper-2)' : undefined,
                boxShadow: plan && r.ingarIPlan ? 'inset 3px 0 0 var(--kop)' : undefined,
              } as const;
              return (
                <li key={r.id} data-typ={r.id}>
                  {r.href ? (
                    <Link href={r.href} replace={r.href.startsWith('?')} scroll={!r.href.startsWith('?')} className="tk-tryck" style={stil} aria-current={r.vald ? 'true' : undefined}>
                      {inne}
                    </Link>
                  ) : (
                    <div style={stil}>{inne}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {visaMonster && data.matrisMonster && <Monster monster={data.matrisMonster} premium={premium} />}

        {tempo && (
          <section className="tk-kort" aria-label="Tempo">
            <div className="tk-rubrik">
              <p className="tk-ey">Tempo</p>
              <span className="tk-meta">{slagEtikett(tempo.punkt).toLowerCase()} {tempo.punkt.dag === data.idag ? 'i dag' : kortDatum(tempo.punkt.dag)}</span>
            </div>
            <p style={{ fontWeight: 600, marginTop: 4 }}>
              {tempo.antal < TAL.length ? `${tal(tempo.over)} av ${talLitet(tempo.antal)}` : `${tempo.over} av ${tempo.antal}`} över provets tid
            </p>
            <div style={{ display: 'flex', gap: 3, marginTop: 10 }} aria-hidden="true">
              {Array.from({ length: tempo.antal }, (_, i) => (
                <i key={i} style={{ flex: 1, height: 10, borderRadius: 3, background: i < tempo.over ? 'var(--kop)' : 'var(--a-kant)' }} />
              ))}
            </div>
          </section>
        )}

        <section className="tk-kort" aria-label="Märken">
          <p className="tk-ey">Märken</p>
          <div className="tk-marken" style={{ marginTop: 12 }}>
            {MARKEN.map((m) => (
              <div key={m.nyckel} className={marken.has(m.nyckel) ? 'nadd' : undefined} data-marke={m.nyckel}>
                <Marke typ={m.typ} nadd={marken.has(m.nyckel)} />
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
