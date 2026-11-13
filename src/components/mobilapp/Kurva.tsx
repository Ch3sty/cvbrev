/**
 * Kurvan och nivåskalan som i konceptet (kurva() och skala()), ritade ur
 * motorns punkter. Ren SVG, serverrenderad. Linjen ritar sig bara när en ny
 * punkt kommit sedan sist (traning_sedd_at), annars står den stilla.
 */
import type { KurvPunkt } from '@/lib/mobilapp/vyer';

function komma(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace('.', ',');
}

export function Kurva({
  punkter,
  dagar,
  provX,
  sikte,
  natt = false,
  rita = false,
  startEtikett,
  aria,
}: {
  punkter: KurvPunkt[];
  dagar: number;
  provX: number | null;
  sikte: number | null;
  natt?: boolean;
  rita?: boolean;
  startEtikett: string;
  aria: string;
}) {
  const W = 360;
  const H = 150;
  const L = 28;
  const R = 46;
  const T = 18;
  const B = 26;
  const varden = [...punkter.map((p) => p.niva), ...(sikte != null ? [sikte] : [])];
  const yMin = Math.max(1, Math.floor(Math.min(...varden) - 1));
  const yMax = Math.min(10, Math.max(yMin + 3, Math.ceil(Math.max(...varden) + 1)));
  const X = (d: number) => L + (d / Math.max(dagar, 1)) * (W - L - R);
  const Y = (n: number) => T + (1 - (n - yMin) / (yMax - yMin)) * (H - T - B);
  const mjuk = natt ? 'var(--natt-mjuk)' : 'var(--a-ink-3)';
  const ink = natt ? 'var(--natt-ink)' : 'var(--a-ink)';
  const grid = natt ? 'rgba(255,255,255,.1)' : 'var(--a-kant)';
  const mal = natt ? '#8FA3F0' : 'var(--himmel-ink)';
  const bakgrund = natt ? 'var(--natt)' : 'var(--a-papper)';
  const linjer: number[] = [];
  for (let n = yMin + 1; n < yMax; n++) linjer.push(n);
  const sista = punkter[punkter.length - 1];
  const d = punkter.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.niva).toFixed(1)}`).join(' ');

  return (
    <svg className={`tk-kurva${natt ? ' natt' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
      {linjer.map((n) => (
        <g key={n}>
          <line x1={L} y1={Y(n)} x2={W - R} y2={Y(n)} stroke={grid} strokeWidth="1" />
          <text x={L - 8} y={Y(n) + 4} textAnchor="end">
            {n}
          </text>
        </g>
      ))}
      {sikte != null && (
        <>
          <line x1={L} y1={Y(sikte)} x2={W - R} y2={Y(sikte)} stroke={mal} strokeWidth="1.5" strokeDasharray="4 4" />
          <text x={W - R + 6} y={Y(sikte) + 4} style={{ fill: mal, fontWeight: 600 }}>
            mål {komma(sikte)}
          </text>
        </>
      )}
      {provX != null && (
        <>
          <line x1={X(provX)} y1={T - 4} x2={X(provX)} y2={H - B + 4} stroke={mjuk} strokeWidth="1.5" strokeDasharray="3 4" />
          <text x={X(provX)} y={H - 6} textAnchor="middle">
            provet
          </text>
        </>
      )}
      {punkter.length > 1 && (
        <>
          <path d={d} fill="none" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" className={rita ? 'tk-kurva-rita' : undefined} />
          {punkter.slice(0, -1).map((p, i) =>
            p.matning ? <circle key={i} cx={X(p.x)} cy={Y(p.niva)} r="4" fill={bakgrund} stroke={ink} strokeWidth="2" /> : null,
          )}
        </>
      )}
      {sista && (
        <>
          <circle cx={X(sista.x)} cy={Y(sista.niva)} r="6.5" fill="var(--kop)" stroke={bakgrund} strokeWidth="3" />
          <text className="du" x={X(sista.x) + 10} y={Y(sista.niva) - 9}>
            {komma(sista.niva)}
          </text>
        </>
      )}
      <text x={L} y={H - 6}>
        {startEtikett}
      </text>
    </svg>
  );
}

/** Nivåskalan 1 till 10 utan siffror: en rad per testtyp i Utveckling. */
export function Skala({ nu }: { nu: number | null }) {
  const x = (n: number) => 16 + (n - 1) * 38.667;
  return (
    <svg viewBox="0 0 380 40" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }} aria-hidden="true">
      <line x1={x(1)} y1="26" x2={x(10)} y2="26" stroke="var(--a-kant)" strokeWidth="6" strokeLinecap="round" />
      {nu != null && <line x1={x(1)} y1="26" x2={x(nu)} y2="26" stroke="var(--kop)" strokeWidth="6" strokeLinecap="round" />}
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const h = n === 1 || n === 5 || n === 10 ? 7 : 4;
        return <line key={n} x1={x(n)} y1={26 - h} x2={x(n)} y2={26 + h} stroke="var(--a-ink-3)" strokeWidth="1.5" opacity=".7" />;
      })}
      {nu != null && <circle cx={x(nu)} cy="26" r="9" fill="var(--kop)" stroke="var(--a-bg)" strokeWidth="3" />}
    </svg>
  );
}
