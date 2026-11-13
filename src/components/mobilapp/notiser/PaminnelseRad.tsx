'use client';

/**
 * Påminnelsen i kontot (konceptets kontoVy): vippan slår på och av, och
 * tiderna från notisfrågan väljs under den när den är på. Sparas i
 * app_enheter för alla kontots telefoner. Har telefonen ingen rad än (frågan
 * besvarades med Inte nu) går ett tryck på vippan genom samma steg som
 * notisfrågans ja: systemets dialog och registreringen.
 */
import { useEffect, useState } from 'react';
import { PAMINNELSE_STANDARD, PAMINNELSE_TIDER } from '@/lib/mobilapp/notis';
import { IkonBell } from '../ikoner';
import { haptik } from '../skal';
import { andraPaminnelse, harPush, slaPaPaminnelse } from '../skal-notiser';
import '../kop/kop.css';

export interface PaminnelseRadProps {
  /** null: ingen telefon registrerad för kontot. */
  aktiv: boolean | null;
  tid: string | null;
  /** false när app_enheter inte går att läsa (migreringen inte körd). */
  tillganglig: boolean;
}

export default function PaminnelseRad({ aktiv, tid, tillganglig }: PaminnelseRadProps) {
  const [pa, setPa] = useState(!!aktiv);
  const [harRad, setHarRad] = useState(aktiv !== null);
  const [vald, setVald] = useState(tid ?? PAMINNELSE_STANDARD);
  const [arbetar, setArbetar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  // Skalets plugin syns först i webbläsaren; servern ritar utan det.
  const [push, setPush] = useState(false);
  useEffect(() => setPush(harPush()), []);
  const gar = tillganglig && (harRad || push);

  const vaxla = async () => {
    if (!gar || arbetar) return;
    setFel(null);
    setArbetar(true);
    haptik('latt');
    if (!pa && !harRad) {
      const utfall = await slaPaPaminnelse(vald);
      setArbetar(false);
      if (utfall === 'pa') {
        setHarRad(true);
        setPa(true);
      } else if (utfall === 'nekad') setFel('Notiser är avstängda för Testklar. Slå på dem i telefonens inställningar.');
      else setFel('Påminnelsen gick inte att slå på. Försök igen.');
      return;
    }
    const ny = !pa;
    setPa(ny);
    const ok = await andraPaminnelse({ aktiv: ny });
    setArbetar(false);
    if (!ok) {
      setPa(!ny);
      setFel('Ändringen sparades inte. Försök igen.');
    }
  };

  const valjTid = async (t: string) => {
    if (t === vald || arbetar) return;
    const fore = vald;
    setVald(t);
    setFel(null);
    const ok = await andraPaminnelse({ paminnelse_tid: t });
    if (!ok) {
      setVald(fore);
      setFel('Tiden sparades inte. Försök igen.');
    }
  };

  const under = !gar ? 'Finns i appen Testklar från Google Play' : pa ? `Varje dag kl ${vald}` : 'Av';

  return (
    <div className="tk-rad" style={{ flexWrap: 'wrap' }}>
      <span className="tk-sym" style={{ background: 'var(--kop-mjuk)', color: 'var(--kop-ink)' }}>
        <IkonBell />
      </span>
      <span className="t">
        <b>Påminnelse</b>
        <span>{under}</span>
      </span>
      <button
        type="button"
        className="tk-vippa"
        role="switch"
        aria-checked={pa}
        aria-disabled={!gar || arbetar}
        aria-label="Påminnelse"
        onClick={vaxla}
      />
      {pa && gar && (
        <div className="tk-tidchips liten" style={{ flexBasis: '100%', marginTop: 4 }} role="radiogroup" aria-label="Tid för påminnelsen">
          {PAMINNELSE_TIDER.map((t) => (
            <button key={t} type="button" role="radio" aria-checked={vald === t} className={`tk-tryck${vald === t ? ' vald' : ''}`} onClick={() => valjTid(t)}>
              {t}
            </button>
          ))}
        </div>
      )}
      {fel && (
        <p className="tk-meta" role="alert" style={{ flexBasis: '100%', color: 'var(--fel)' }}>
          {fel}
        </p>
      )}
    </div>
  );
}
