/**
 * Flikarnas topprad (konceptets toppradApp och Idags datumrad) med
 * profilbilden uppe till höger, som leder till kontot.
 */
import Link from 'next/link';
import { APP_FLIK } from '@/lib/mobilapp/appvag';

export function initialer(namn: string | null | undefined, epost: string | null | undefined): string {
  const n = (namn ?? '').trim();
  if (n) {
    const delar = n.split(/\s+/);
    return ((delar[0]?.[0] ?? '') + (delar.length > 1 ? delar[delar.length - 1][0] : '')).toUpperCase();
  }
  return (epost?.[0] ?? '?').toUpperCase();
}

export function ProfilKnapp({ initial }: { initial: string }) {
  return (
    <Link href={APP_FLIK.konto} className="tk-avatar-yta tk-tryck" aria-label="Konto och inställningar">
      <span className="tk-avatar">{initial}</span>
    </Link>
  );
}

export function Topprad({ titel, initial }: { titel: string; initial: string }) {
  return (
    <div className="tk-topprad">
      <h1 className="brand">{titel}</h1>
      <ProfilKnapp initial={initial} />
    </div>
  );
}

/** Idags topprad: dagen som eyebrow, rubriken under. */
export function DagTopprad({ dag, rubrik, initial }: { dag: string; rubrik: string; initial: string }) {
  return (
    <div className="tk-topprad" style={{ paddingTop: 6, paddingBottom: 6 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="tk-ey">{dag}</p>
        <h1 className="rubrik">{rubrik}</h1>
      </div>
      <ProfilKnapp initial={initial} />
    </div>
  );
}
