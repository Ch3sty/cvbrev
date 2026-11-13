'use client';

/**
 * Tester (konceptets V.tester och arket testDetalj): Mitt test överst,
 * deltesterna som ingår som kort med figur och nivåstaplar, övningsprovet,
 * och resten under Fler tester. Ett tryck på ett kort öppnar arket med
 * Nivåkollen, passet, nivåtesten och övningsprovet för typen.
 *
 * Arket läggs i historiken, så Android-tillbaka stänger arket i stället för
 * att lämna fliken (konceptet, Android och iOS).
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Katalog, KatalogKort } from '@/lib/mobilapp/vyer';
import { IkonBock, IkonChev, IkonKlocka, IkonLas, TypFigur, TypIkon, tonFor } from './ikoner';
import { Topprad } from './Topprad';
import { haptik } from './skal';

function Kort({ k, onOppna }: { k: KatalogKort; onOppna: (k: KatalogKort) => void }) {
  const { bg, ink } = tonFor(k.typ);
  return (
    <button type="button" className="tk-tkort tk-tryck" onClick={() => onOppna(k)} aria-haspopup="dialog">
      <span className="bild" style={{ background: bg, color: ink }}>
        <TypFigur typ={k.typ} size={44} />
      </span>
      <span className="t">
        <b>{k.namn}</b>
        <span>{k.meta}</span>
        {k.nivaer && (
          <span className="tk-nivaer" aria-hidden="true">
            <i className="fri" />
            <i className={k.nivaer[1] ? 'kop' : undefined} />
            <i className={k.nivaer[2] ? 'kop' : undefined} />
          </span>
        )}
      </span>
      <IkonChev />
    </button>
  );
}

function Ark({ k, onStang }: { k: KatalogKort; onStang: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="tk-ark-lager" onClick={onStang}>
      <div
        ref={ref}
        className="tk-ark"
        role="dialog"
        aria-modal="true"
        aria-label={k.namn}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onStang();
        }}
      >
        <div className="handtag" />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <TypIkon typ={k.typ} px={56} />
          <div>
            <h2 className="tk-h2">{k.namn}</h2>
            <p className="tk-meta">{k.alias}</p>
          </div>
        </div>
        <div className="tk-rader" style={{ marginTop: 16 }}>
          {k.rader.map((r) => (
            <Link key={r.href + r.titel} href={r.href} className="tk-rad tk-tryck" onClick={() => haptik('latt')}>
              <span className="t">
                <b>{r.titel}</b>
                <span>{r.meta}</span>
              </span>
              {r.chip?.ton === 'gjord' ? (
                <span className="tk-chip gjord">
                  <IkonBock size={13} />
                  {r.chip.text}
                </span>
              ) : r.chip?.ton === 'fri' ? (
                <span className="tk-chip fri">{r.chip.text}</span>
              ) : r.chip?.ton === 'las' ? (
                <span className="tk-chip las">
                  <IkonLas />
                  {r.chip.text}
                </span>
              ) : (
                <IkonChev />
              )}
            </Link>
          ))}
        </div>
        <button type="button" className="tk-knapp ljus tk-tryck" style={{ marginTop: 14, height: 46 }} onClick={onStang}>
          Stäng
        </button>
      </div>
    </div>
  );
}

export default function KatalogVy({ katalog, initial }: { katalog: Katalog; initial: string }) {
  const [oppen, setOppen] = useState<KatalogKort | null>(null);

  // Arket i historiken: tillbaka stänger det.
  useEffect(() => {
    const pop = () => setOppen(null);
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const oppna = useCallback((k: KatalogKort) => {
    haptik('latt');
    window.history.pushState({ ...(window.history.state ?? {}), tkArk: true }, '');
    setOppen(k);
  }, []);
  const stang = useCallback(() => {
    if ((window.history.state as { tkArk?: boolean } | null)?.tkArk) window.history.back();
    else setOppen(null);
  }, []);

  const { mittTest, ingar, ovningsprov, fler } = katalog;
  return (
    <>
      <Topprad titel="Tester" initial={initial} />
      <div className="tk-pad tk-stack" style={{ paddingTop: 0 }}>
        <div className="tk-rader">
          <Link href={mittTest?.href ?? '/dashboard/tester/installningar'} className="tk-rad tk-tryck">
            <span className="tk-sym" style={{ background: 'var(--kop-mjuk)', color: 'var(--kop-ink)' }}>
              <TypFigur typ="plan" size={26} />
            </span>
            <span className="t">
              <b>{mittTest?.titel ?? 'Välj ditt test'}</b>
              <span>{mittTest?.meta ?? 'Namnet står i kallelsen. Vi lägger upp passen efter det.'}</span>
            </span>
            <span className="tk-lank" style={{ fontSize: 13 }}>
              {mittTest ? mittTest.andra : 'Välj'}
            </span>
          </Link>
        </div>

        {ingar.length > 0 && (
          <>
            <p className="tk-ey" style={{ padding: '4px 2px 0' }}>
              Ingår i ditt test
            </p>
            <div className="tk-katalog">
              {ingar.map((k) => (
                <Kort key={k.typ} k={k} onOppna={oppna} />
              ))}
              {ovningsprov && (
                <Link href={ovningsprov.href} className="tk-tkort tk-tryck">
                  <span className="bild" style={{ background: 'var(--a-ink)', color: '#fff' }}>
                    <IkonKlocka size={28} />
                  </span>
                  <span className="t">
                    <b>{ovningsprov.titel}</b>
                    <span>{ovningsprov.meta}</span>
                  </span>
                  {ovningsprov.las ? (
                    <span className="tk-chip las">
                      <IkonLas />
                      Premium
                    </span>
                  ) : (
                    <IkonChev />
                  )}
                </Link>
              )}
            </div>
          </>
        )}

        {fler.length > 0 && (
          <>
            <p className="tk-ey" style={{ padding: '8px 2px 0' }}>
              {ingar.length ? 'Fler tester' : 'Alla tester'}
            </p>
            <div className="tk-katalog">
              {fler.map((k) => (
                <Kort key={k.typ} k={k} onOppna={oppna} />
              ))}
            </div>
          </>
        )}
      </div>
      {oppen && <Ark k={oppen} onStang={stang} />}
    </>
  );
}
