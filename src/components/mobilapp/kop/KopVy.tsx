'use client';

/**
 * Köpvyn (konceptets ark "kop" och "play", docs/design/app-koncept-2026-11-13.html).
 * Ett erbjudande: Premium, 149 kr i månaden via Google Play. Ingen
 * provperiod, inget Dagspasset (ägarens beslut 2026-11-13). Google Plays eget
 * ark ritas av systemet; vi visar bara knappen som öppnar det.
 *
 * Efter köpet skriver RevenueCats webhook Premium i premium_grants. Vyn
 * frågar servern igen (router.refresh) tills Premium syns, högst cirka 15
 * sekunder, och går sedan tillbaka dit användaren kom ifrån, som konceptet
 * säger: "det du tryckte på öppnas direkt".
 *
 * Utan skalets plugin eller nyckel (webbläsare, nyckeln inte satt) står
 * vyn kvar med en text om att köpet bara går i appen från Google Play.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import { IkonBock } from '../ikoner';
import { haptik } from '../skal';
import { aterstallKop, kanKopa, kopPremium, oppnaPlayPrenumerationer } from '../skal-kop';
import './kop.css';

export interface KopVyProps {
  userId: string;
  nyckel: string | null;
  premium: boolean;
  kalla: 'play' | 'app_store' | 'webben' | null;
  /** "13 december", när slutdatumet är känt. */
  tillText: string | null;
  /** Webbens eller butikens prenumeration som förnyas. */
  prenumeration: boolean;
  mittTest: string | null;
  pris: number;
}

export default function KopVy(p: KopVyProps) {
  const router = useRouter();
  const [kan, setKan] = useState<boolean | null>(null);
  const [arbetar, setArbetar] = useState<'kop' | 'aterstall' | 'vantar' | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const forsok = useRef(0);

  useEffect(() => setKan(kanKopa(p.nyckel)), [p.nyckel]);

  // Efter köpet: vänta in webhooken, sedan tillbaka till det som var låst.
  useEffect(() => {
    if (arbetar !== 'vantar') return;
    if (p.premium) {
      setArbetar(null);
      const t = setTimeout(() => {
        if (window.history.length > 1) router.back();
        else router.replace(APP_FLIK.idag);
      }, 900);
      return () => clearTimeout(t);
    }
    if (forsok.current >= 10) {
      setArbetar(null);
      setFel('Köpet är klart i Google Play. Premium syns om en liten stund; öppna appen igen om det dröjer.');
      return;
    }
    const t = setTimeout(() => {
      forsok.current += 1;
      router.refresh();
    }, 1500);
    return () => clearTimeout(t);
  }, [arbetar, p.premium, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const kop = async () => {
    if (!p.nyckel) return;
    setFel(null);
    setArbetar('kop');
    const utfall = await kopPremium(p.nyckel, p.userId);
    if (utfall === 'klart') {
      haptik('framgang');
      setToast('Premium aktivt');
      forsok.current = 0;
      setArbetar('vantar');
      router.refresh();
      return;
    }
    setArbetar(null);
    if (utfall === 'fel') setFel('Köpet gick inte igenom. Försök igen om en stund.');
  };

  const aterstall = async () => {
    if (!p.nyckel) return;
    setFel(null);
    setArbetar('aterstall');
    const ok = await aterstallKop(p.nyckel, p.userId);
    if (ok) {
      setToast('Köpet hittades');
      forsok.current = 0;
      setArbetar('vantar');
      router.refresh();
    } else {
      setArbetar(null);
      setFel('Vi hittade inget köp på det här Google-kontot.');
    }
  };

  if (p.premium) {
    const via = p.kalla === 'play' ? 'Via Google Play' : p.kalla === 'app_store' ? 'Via App Store' : 'Via jobbcoach.ai';
    const datum = p.tillText ? (p.prenumeration && p.kalla !== 'webben' ? `förnyas ${p.tillText}` : `gäller till ${p.tillText}`) : null;
    return (
      <div className="tk-stack">
        <section className="tk-kort lyft" aria-label="Premium">
          <p className="tk-ey kop">Premium</p>
          <h2 className="tk-h2" style={{ marginTop: 4 }}>
            Du har Premium
          </h2>
          <p style={{ fontWeight: 600, marginTop: 6 }}>{[via, datum].filter(Boolean).join(', ')}</p>
          <p className="tk-meta">
            {p.kalla === 'webben'
              ? 'Köpt på jobbcoach.ai. Prenumerationen hanteras där, under Prenumeration.'
              : `${p.pris} kr i månaden. Gäller även på jobbcoach.ai, med samma konto.`}
          </p>
          {p.kalla === 'play' && (
            <button type="button" className="tk-knapp ljus liten tk-tryck" style={{ marginTop: 12 }} onClick={oppnaPlayPrenumerationer}>
              Hantera i Google Play
            </button>
          )}
        </section>
        <button type="button" className="tk-knapp kop tk-tryck" onClick={() => router.replace(APP_FLIK.idag)}>
          Till dagens pass
        </button>
        {toast && <Toast text={toast} />}
      </div>
    );
  }

  const rader = [
    'Ett pass om dagen nära din nivå, extrapass på det du tappar',
    'Ny nivåkoll varje vecka och hela kurvan',
    p.mittTest ? `Övningsprov i samma format som ${p.mittTest}` : 'Övningsprov i samma format som riktiga rekryteringstester',
    'Samma Premium på jobbcoach.ai, med personliga brev och Jobbcoachen',
  ];

  return (
    <div className="tk-stack">
      <div>
        <p className="tk-ey kop">Ingår i Premium</p>
        <h2 className="tk-h2" style={{ marginTop: 4 }}>
          Passen på din nivå, varje dag
        </h2>
      </div>
      <ul className="tk-ingar">
        {rader.map((r) => (
          <li key={r}>
            <IkonBock />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <div className="tk-prisrad vald" style={{ marginTop: 6 }}>
        <span className="t">
          <b>Premium</b>
          <span>Månadsvis. Säg upp när du vill i Google Play.</span>
        </span>
        <span className="pris">
          {p.pris} kr<small>i månaden</small>
        </span>
      </div>

      {kan === false ? (
        <p className="tk-kop-not" role="note">
          Köpet görs i appen Testklar från Google Play. Har du redan Premium på jobbcoach.ai gäller det här också, med samma konto.
        </p>
      ) : (
        <>
          <button type="button" className="tk-knapp kop tk-tryck" disabled={kan !== true || arbetar !== null} onClick={kop}>
            {arbetar === 'kop' ? 'Öppnar Google Play' : arbetar === 'vantar' ? 'Aktiverar Premium' : 'Fortsätt till Google Play'}
          </button>
          <p className="tk-meta" style={{ textAlign: 'center' }}>
            Betalningen går genom Google Play. Samma pris och samma Premium som på jobbcoach.ai.
          </p>
        </>
      )}
      {fel && (
        <p className="tk-meta" role="alert" style={{ color: 'var(--fel)', textAlign: 'center' }}>
          {fel}
        </p>
      )}
      {kan === true && (
        <button type="button" className="tk-lank" style={{ display: 'block', margin: '0 auto' }} disabled={arbetar !== null} onClick={aterstall}>
          {arbetar === 'aterstall' ? 'Letar efter köp' : 'Återställ köp'}
        </button>
      )}
      {toast && <Toast text={toast} />}
    </div>
  );
}

export function Toast({ text }: { text: string }) {
  return (
    <div className="tk-toast" role="status">
      <IkonBock size={16} />
      {text}
    </div>
  );
}
