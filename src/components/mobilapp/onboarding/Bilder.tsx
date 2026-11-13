/**
 * Onboardingens bilder, ritade som i konceptet
 * (docs/design/app-koncept-2026-11-13.html: ONB_SCEN1, samtyckets stapelkort,
 * NK_ILLU, skala, planremsa och startskärmens märke). Rena SVG utan
 * tillstånd. Talen i scenerna är illustration, aldrig någons riktiga nivå.
 */
import type { CSSProperties } from 'react';

function Bild({ svg, viewBox, max, style }: { svg: string; viewBox: string; max: number; style?: CSSProperties }) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      style={{ width: '100%', maxWidth: max, height: 'auto', display: 'block', margin: '0 auto', ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const SCEN1 = `<defs><linearGradient id="tkOg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1D38"/><stop offset="1" stop-color="#0B0C19"/></linearGradient></defs>
<rect x="28" y="22" width="190" height="190" rx="24" fill="url(#tkOg1)"/>
<g stroke="rgba(255,255,255,.3)" stroke-width="2" fill="none"><path d="M91 22v190M155 22v190M28 85h190M28 149h190"/></g>
<g fill="#F4F3FA"><circle cx="60" cy="54" r="10"/><rect x="111" y="42" width="24" height="24" rx="5"/><path d="M186 40l14 24h-28z"/><rect x="48" y="105" width="24" height="24" rx="5"/><path d="M123 103l14 24h-28z"/><circle cx="186" cy="117" r="10"/><path d="M60 167l14 24h-28z"/><circle cx="123" cy="181" r="10"/></g>
<rect x="168" y="162" width="36" height="36" rx="8" fill="none" stroke="#E8732A" stroke-width="3" stroke-dasharray="6 5"/>
<g transform="translate(206 96)"><rect x="0" y="0" width="118" height="116" rx="18" fill="#FFFFFF" stroke="#16151C" stroke-width="3"/><path d="M18 80c14-4 22-30 36-32s22 10 46 0" fill="none" stroke="#E8732A" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="48" r="7" fill="#E8732A"/><path d="M20 26h40M20 38h26" stroke="#C9C8C0" stroke-width="4" stroke-linecap="round"/><text x="18" y="104" style="font-family:var(--tk-disp)" font-size="13" font-weight="800" fill="#16151C">nivå 5 → 6,5</text></g>
<g transform="translate(236 12)"><g class="tk-dyk"><rect x="0" y="0" width="64" height="64" rx="16" fill="#D5E9DC"/><text x="32" y="40" text-anchor="middle" style="font-family:var(--tk-disp)" font-size="20" font-weight="800" fill="#1F6A45">2 5 9</text></g></g>`;

export const OnbScen1 = () => <Bild svg={SCEN1} viewBox="0 0 340 230" max={330} />;

const SAMTYCKE = `<rect x="40" y="24" width="220" height="140" rx="20" fill="#FFFFFF" stroke="#16151C" stroke-width="3"/><g fill="#E4E7F3"><rect x="70" y="104" width="26" height="36" rx="6"/><rect x="110" y="78" width="26" height="62" rx="6"/><rect x="150" y="92" width="26" height="48" rx="6"/></g><rect x="190" y="56" width="26" height="84" rx="6" fill="#E8732A"/><path d="M62 144h180" stroke="#C9C8C0" stroke-width="3" stroke-linecap="round"/><g transform="translate(218 12)"><circle cx="30" cy="30" r="28" fill="#16151C"/><path d="M18 31l8 8 16-17" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g><path d="M70 50h40M70 60h24" stroke="#16151C" stroke-width="3" stroke-linecap="round" opacity=".3"/>`;

export const SamtyckeBild = () => <Bild svg={SAMTYCKE} viewBox="0 0 300 190" max={290} />;

const NK = `<rect x="60" y="20" width="180" height="160" rx="20" fill="#FFFFFF" stroke="#16151C" stroke-width="3"/><g stroke="#E3E2DC" stroke-width="2"><path d="M120 20v160M180 20v160M60 73h180M60 127h180"/></g><g fill="#16151C"><circle cx="90" cy="47" r="9"/><rect x="139" y="36" width="22" height="22" rx="4"/><path d="M210 35l12 22h-24z"/><rect x="79" y="90" width="22" height="22" rx="4"/><path d="M150 89l12 22h-24z"/><circle cx="210" cy="100" r="9"/><path d="M90 143l12 22h-24z"/><circle cx="150" cy="154" r="9"/></g><rect x="194" y="138" width="32" height="32" rx="6" fill="none" stroke="#E8732A" stroke-width="3" stroke-dasharray="6 4"/><g transform="translate(14 120)"><g class="tk-dyk"><rect width="78" height="56" rx="14" fill="#D9E4FA"/><text x="39" y="36" text-anchor="middle" style="font-family:var(--tk-disp)" font-size="22" font-weight="800" fill="#2C4A98">8 min</text></g></g>`;

export const NivakollBild = () => <Bild svg={NK} viewBox="0 0 300 200" max={280} />;

/** Märket: matrisen med luckan i koppar (startskärmen och ikonen). */
export function Marke({ px }: { px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 96 96" aria-hidden="true">
      <rect width="96" height="96" rx="22" fill="#121325" stroke="rgba(255,255,255,.12)" />
      <g fill="#F4F3FA">
        <circle cx="30" cy="30" r="6" />
        <rect x="42" y="24" width="12" height="12" rx="2.5" />
        <path d="M66 23l7 13H59z" />
        <rect x="24" y="42" width="12" height="12" rx="2.5" />
        <path d="M48 41l7 13H41z" />
        <circle cx="66" cy="48" r="6" />
        <path d="M30 59l7 13H23z" />
        <circle cx="48" cy="66" r="6" />
      </g>
      <rect x="57" y="57" width="18" height="18" rx="4" fill="#E8732A" />
    </svg>
  );
}

export function Ordmarke({ size, natt }: { size: number; natt?: boolean }) {
  return (
    <span className="tk-ordmarke" style={{ fontSize: size, color: natt ? 'var(--natt-ink)' : 'var(--a-ink)' }}>
      Testklar
      <i />
    </span>
  );
}

/** Startskärmen i nattens rum, medan appen väljer onboarding eller inloggning. */
export function Startskarm() {
  return (
    <div className="tk-natt" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }} aria-busy="true" aria-label="Testklar startar">
      <Marke px={88} />
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <Ordmarke size={30} natt />
        <span className="tk-meta">från jobbcoach.ai</span>
      </div>
    </div>
  );
}

/**
 * Nivåskalan 1 till 10 i natten (konceptets skala): kopparspåret fram till
 * nivån, målet som en blå triangel ovanför.
 */
export function NattSkala({ nu, sikte, aria }: { nu: number; sikte: number | null; aria: string }) {
  const x = (n: number) => 16 + (n - 1) * 38.667;
  const mjuk = 'var(--natt-mjuk)';
  return (
    <svg viewBox="0 0 380 60" style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block' }} role="img" aria-label={aria}>
      <line x1={x(1)} y1="26" x2={x(10)} y2="26" stroke="rgba(255,255,255,.16)" strokeWidth="6" strokeLinecap="round" />
      <line className="tk-skala-rita" x1={x(1)} y1="26" x2={x(nu)} y2="26" stroke="var(--kop)" strokeWidth="6" strokeLinecap="round" />
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const h = n === 1 || n === 5 || n === 10 ? 7 : 4;
        return <line key={n} x1={x(n)} y1={26 - h} x2={x(n)} y2={26 + h} stroke={mjuk} strokeWidth="1.5" opacity=".7" />;
      })}
      {sikte != null && <path d={`M${x(sikte) - 6} 8l6 8 6-8z`} fill="#8FA3F0" />}
      <circle cx={x(nu)} cy="26" r="9" fill="var(--kop)" stroke="var(--natt)" strokeWidth="3" />
      {[1, 5, 10].map((n) => (
        <text key={n} x={x(n)} y="52" style={{ fontFamily: 'var(--tk-text)' }} fontSize="11" fontWeight="500" fill={mjuk} textAnchor="middle">
          {n}
        </text>
      ))}
      {sikte != null && (
        <text x={x(sikte)} y="4" style={{ fontFamily: 'var(--tk-text)' }} fontSize="10.5" fontWeight="600" fill="#8FA3F0" textAnchor="middle">
          mål {String(sikte).replace('.', ',')}
        </text>
      )}
    </svg>
  );
}

type Dagtyp = 'matning' | 'pass' | 'vila' | 'ommatning' | 'general' | 'prov';

/** Planremsan: en stapel per dag fram till provet (konceptets planremsa, dagarna ur byggPlan). */
export function Planremsa({ dagar, natt }: { dagar: readonly Dagtyp[]; natt?: boolean }) {
  const farg: Record<Dagtyp, string> = {
    matning: 'var(--kop)',
    pass: natt ? 'rgba(255,255,255,.55)' : 'var(--a-ink)',
    vila: 'transparent',
    ommatning: 'var(--kop)',
    general: natt ? '#8FA3F0' : 'var(--himmel-ink)',
    prov: natt ? '#fff' : 'var(--a-ink)',
  };
  const hojd: Record<Dagtyp, number> = { matning: 16, pass: 10, vila: 10, ommatning: 16, general: 16, prov: 22 };
  const harProv = dagar.includes('prov');
  return (
    <div aria-hidden="true">
      <div className="tk-remsa">
        {dagar.map((t, i) => (
          <i
            key={i}
            style={{
              height: hojd[t],
              background: farg[t],
              border: t === 'vila' ? `1.5px dashed ${natt ? 'rgba(255,255,255,.35)' : 'var(--a-kant-stark)'}` : undefined,
            }}
          />
        ))}
      </div>
      <div className="tk-remsa-forklaring">
        <span>
          <i style={{ background: farg.pass }} />
          pass
        </span>
        <span>
          <i style={{ background: 'var(--kop)' }} />
          nivåkoll
        </span>
        {harProv && (
          <span>
            <i style={{ background: farg.general }} />
            övningsprov
          </span>
        )}
        <span>
          <i style={{ border: `1.5px dashed ${natt ? 'rgba(255,255,255,.35)' : 'var(--a-kant-stark)'}` }} />
          vila
        </span>
      </div>
    </div>
  );
}
