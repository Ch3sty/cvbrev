/**
 * Kurvan och nivåskalan i appens stil (konceptets kurva() och skala()),
 * ritade ur v4:s geometri (components/tester-v4/utveckling/geometri.ts) för
 * en typ i taget. Ren SVG med fast viewBox, serverrenderad, så inget hoppar.
 *
 *   ring      Nivåkoll
 *   punkt     träning, och nivån ur ett nivåtest (talserier, spatial, ordförråd)
 *   fyrkant   övningsprov, på tidslinjen under kurvan, aldrig som nivå
 *   tom ring  nivåkoll som inte räknas, på tidslinjen
 *
 * Linjen ritar sig bara när en ny punkt kommit sedan sist, annars står den stilla.
 */
import type { GrafModell, Markor } from '@/components/tester-v4/utveckling/geometri';
import { skalor } from '@/components/tester-v4/utveckling/geometri';
import { kortDatum } from '@/lib/traning/rubrik';

function komma(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
}

export function Kurva({
  modell,
  sikte = null,
  natt = false,
  rita = false,
  aria,
}: {
  modell: GrafModell;
  sikte?: number | null;
  natt?: boolean;
  rita?: boolean;
  aria: string;
}) {
  const { matt, linjer, markorer } = modell;
  const { Y } = skalor(matt, modell.granser);
  const mjuk = natt ? 'var(--natt-mjuk)' : 'var(--a-ink-3)';
  const ink = natt ? 'var(--natt-ink)' : 'var(--a-ink)';
  const grid = natt ? 'rgba(255,255,255,.1)' : 'var(--a-kant)';
  const mal = natt ? '#8FA3F0' : 'var(--himmel-ink)';
  const bakgrund = natt ? 'var(--natt)' : 'var(--a-papper)';
  const linje = linjer.find((l) => l.d) ?? null;
  const axel = markorer.filter((m) => m.paLinjen).sort((a, b) => a.x - b.x);
  const sista = axel[axel.length - 1] ?? null;
  const tidslinje = markorer.some((m) => !m.paLinjen);
  const plotH = matt.yTid + 10;

  const form = (m: Markor, i: number) => {
    if (m === sista) return null;
    switch (m.form) {
      case 'ring':
        return <circle key={i} cx={m.x} cy={m.y} r="4.5" fill={bakgrund} stroke={ink} strokeWidth="2" data-form="ring" />;
      case 'tomring':
        return <circle key={i} cx={m.x} cy={m.y} r="4" fill={bakgrund} stroke={mjuk} strokeWidth="1.5" strokeDasharray="2 2" data-form="tomring" />;
      case 'fyrkant':
        return <rect key={i} x={m.x - 5.5} y={m.y - 5.5} width="11" height="11" rx="2" fill={ink} stroke={bakgrund} strokeWidth="1.5" data-form="fyrkant" />;
      default:
        return <circle key={i} cx={m.x} cy={m.y} r="3.5" fill={ink} stroke={bakgrund} strokeWidth="1.5" data-form="punkt" />;
    }
  };

  return (
    <svg className={`tk-kurva${natt ? ' natt' : ''}`} viewBox={`0 0 ${matt.W} ${matt.H}`} role="img" aria-label={aria}>
      {modell.yTicks.map((t) => (
        <g key={t.v}>
          <line x1={matt.L} y1={t.y} x2={matt.W - matt.R} y2={t.y} stroke={grid} strokeWidth="1" />
          <text x={matt.L - 8} y={t.y + 4} textAnchor="end">
            {t.v}
          </text>
        </g>
      ))}
      {tidslinje && <line x1={matt.L} y1={matt.yTid} x2={matt.W - matt.R} y2={matt.yTid} stroke={grid} strokeWidth="1.5" strokeDasharray="2 4" />}
      {sikte != null && (
        <>
          <line x1={matt.L} y1={Y(sikte)} x2={matt.W - matt.R} y2={Y(sikte)} stroke={mal} strokeWidth="1.5" strokeDasharray="4 4" />
          <text x={matt.L + 4} y={Y(sikte) - 6} style={{ fill: mal, fontWeight: 600 }}>
            mål {komma(sikte)}
          </text>
        </>
      )}
      {modell.provX != null && (
        <>
          <line x1={modell.provX} y1={matt.T - 8} x2={modell.provX} y2={plotH} stroke={mjuk} strokeWidth="1.5" strokeDasharray="3 4" />
          <text x={modell.provX - 4} y={matt.T - 10} textAnchor="end">
            provet
          </text>
        </>
      )}
      {modell.datum.map((d) => (
        <text key={d.slag} x={d.x} y={matt.yDatum} textAnchor={d.anchor} style={d.slag === 'idag' ? { fill: ink, fontWeight: 600 } : undefined}>
          {d.slag === 'idag' ? 'i dag' : kortDatum(d.text)}
        </text>
      ))}
      {linje && (
        <path
          d={linje.d}
          fill="none"
          stroke={ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className={rita ? 'tk-kurva-rita' : undefined}
          data-linje={linje.typ}
        />
      )}
      {markorer.map(form)}
      {sista && (
        <>
          {sista.form === 'ring' ? (
            <circle cx={sista.x} cy={sista.y} r="6.5" fill={bakgrund} stroke="var(--kop)" strokeWidth="3" data-form="ring" data-sista />
          ) : (
            <circle cx={sista.x} cy={sista.y} r="6.5" fill="var(--kop)" stroke={bakgrund} strokeWidth="3" data-form="punkt" data-sista />
          )}
          <text className="du" x={sista.x > matt.W - matt.R - 40 ? sista.x - 10 : sista.x + 10} y={sista.y - 10} textAnchor={sista.x > matt.W - matt.R - 40 ? 'end' : 'start'}>
            {komma(sista.punkt.niva as number)}
          </text>
        </>
      )}
    </svg>
  );
}

/** Teckenförklaringen under kurvan: bara formerna som syns. */
export function KurvTecken({ modell, natt = false }: { modell: GrafModell; natt?: boolean }) {
  const ink = natt ? 'var(--natt-ink)' : 'var(--a-ink)';
  const mjuk = natt ? 'var(--natt-mjuk)' : 'var(--a-ink-3)';
  const bakgrund = natt ? 'var(--natt)' : 'var(--a-papper)';
  const m = modell.markorer;
  const delar: { nyckel: string; text: string; ikon: React.ReactNode }[] = [];
  if (m.some((x) => x.form === 'ring'))
    delar.push({ nyckel: 'ring', text: 'Nivåkoll', ikon: <circle cx="6" cy="6" r="4.2" fill={bakgrund} stroke={ink} strokeWidth="2" /> });
  if (m.some((x) => x.form === 'punkt' && x.punkt.kalla === 'nivatest'))
    delar.push({ nyckel: 'nivatest', text: 'Nivåtest', ikon: <circle cx="6" cy="6" r="3.5" fill={ink} /> });
  if (m.some((x) => x.form === 'punkt' && x.punkt.kalla !== 'nivatest'))
    delar.push({ nyckel: 'trana', text: 'Träning', ikon: <circle cx="6" cy="6" r="3.5" fill={ink} /> });
  if (m.some((x) => x.form === 'fyrkant'))
    delar.push({ nyckel: 'prov', text: 'Övningsprov', ikon: <rect x="1.5" y="1.5" width="9" height="9" rx="2" fill={ink} /> });
  if (m.some((x) => x.form === 'tomring'))
    delar.push({ nyckel: 'tomring', text: 'Övning, räknas inte', ikon: <circle cx="6" cy="6" r="4" fill="none" stroke={mjuk} strokeWidth="1.5" strokeDasharray="2 2" /> });
  if (!delar.length) return null;
  return (
    <ul aria-label="Teckenförklaring" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', listStyle: 'none', padding: 0, margin: '6px 0 0', fontSize: 12, color: mjuk }}>
      {delar.map((d) => (
        <li key={d.nyckel} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            {d.ikon}
          </svg>
          {d.text}
        </li>
      ))}
    </ul>
  );
}

/** Nivåskalan 1 till 10 utan siffror: en rad per testtyp. Taket som ett litet streck. */
export function Skala({ nu, tak = null }: { nu: number | null; tak?: number | null }) {
  const x = (n: number) => 16 + (n - 1) * 38.667;
  return (
    <svg viewBox="0 0 380 40" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }} aria-hidden="true">
      <line x1={x(1)} y1="26" x2={x(10)} y2="26" stroke="var(--a-kant)" strokeWidth="6" strokeLinecap="round" strokeDasharray={nu == null ? '3 7' : undefined} />
      {nu != null && <line x1={x(1)} y1="26" x2={x(nu)} y2="26" stroke="var(--kop)" strokeWidth="6" strokeLinecap="round" />}
      {[1, 4, 7, 10].map((n) => (
        <line key={n} x1={x(n)} y1={19} x2={x(n)} y2={33} stroke="var(--a-ink-3)" strokeWidth="1.5" opacity=".7" />
      ))}
      {tak != null && nu != null && <line x1={x(tak)} y1="12" x2={x(tak)} y2="17" stroke="var(--a-ink-3)" strokeWidth="1.5" data-tak />}
      {nu != null && <circle cx={x(nu)} cy="26" r="9" fill="var(--kop)" stroke="var(--a-bg)" strokeWidth="3" />}
    </svg>
  );
}
