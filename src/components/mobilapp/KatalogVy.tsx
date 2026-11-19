'use client';

/**
 * Tester (konceptets V.tester och arket testDetalj, med innehållet och
 * reglerna ur webbens Tester v4): Mitt test överst, provets delar som kort
 * med figur och nivåstaplar, övningsprovet, resten och personligheten. Ett
 * tryck på ett kort öppnar typens ark med v4:s indelning: Träna, Testa dig
 * på en nivå och Mät dig, mönstren och senaste resultat.
 *
 * Arket läggs i historiken, så Android-tillbaka stänger arket i stället för
 * att lämna fliken (konceptet, Android och iOS). ?typ=<id> i adressen öppnar
 * arket direkt, också då med ett steg i historiken att stänga.
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArkRad, KatalogKortV4, KatalogV4 } from '@/lib/mobilapp/vyer';
import { MONSTER_RUBRIK } from '@/lib/mobilapp/vyer';
import type { NivaLage, TestTypId } from '@/lib/tester/v4/typer';
import { IkonBock, IkonChev, IkonKlocka, IkonLas, TypFigur, TypIkon, tonFor } from './ikoner';
import { Topprad } from './Topprad';
import { haptik } from './skal';

function Kort({ k, onOppna }: { k: KatalogKortV4; onOppna: (k: KatalogKortV4) => void }) {
  const { bg, ink } = tonFor(k.typ);
  return (
    <button type="button" className="tk-tkort tk-tryck" onClick={() => onOppna(k)} aria-haspopup="dialog" data-testtyp={k.typ}>
      <span className="bild" style={{ background: bg, color: ink }}>
        <TypFigur typ={k.typ} size={44} />
      </span>
      <span className="t">
        <b>{k.namn}</b>
        <span>{k.meta}</span>
        {k.nivaer && (
          <span className="tk-nivaer" aria-hidden="true">
            {k.nivaer.map((nadd, i) => (
              <i key={i} className={nadd ? 'kop' : undefined} />
            ))}
          </span>
        )}
      </span>
      {k.nivaTal && (
        <span className="tk-disp" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }} aria-label={`Nivå ${k.nivaTal}`}>
          {k.nivaTal}
        </span>
      )}
      <IkonChev />
    </button>
  );
}

function Chip({ c }: { c: ArkRad['chip'] }) {
  if (!c) return <IkonChev />;
  if (c.ton === 'gjord')
    return (
      <span className="tk-chip gjord">
        <IkonBock size={13} />
        {c.text}
      </span>
    );
  if (c.ton === 'las')
    return (
      <span className="tk-chip las">
        <IkonLas />
        {c.text}
      </span>
    );
  return <span className="tk-chip fri">{c.text}</span>;
}

function Rad({ r }: { r: ArkRad }) {
  const inre = (
    <>
      <span className="t">
        <b>{r.titel}</b>
        <span>{r.meta}</span>
      </span>
      {r.href ? <Chip c={r.chip} /> : r.chip ? <span className="tk-chip las">{r.chip.text}</span> : null}
    </>
  );
  if (!r.href) return <div className="tk-rad">{inre}</div>;
  return (
    <Link href={r.href} className="tk-rad tk-tryck" onClick={() => haptik('latt')} data-las={r.chip?.ton === 'las' ? '' : undefined}>
      {inre}
    </Link>
  );
}

/** Nivåbandet i liten form: skalan 1 till 10 med zonerna, fyllt till nivån och taket streckat. */
function NivaBand({ lage, namn }: { lage: NivaLage; namn: string }) {
  const v = lage.niva;
  const pos = (x: number) => `${((Math.min(10, Math.max(1, x)) - 1) / 9) * 100}%`;
  const text =
    lage.status === 'matt' && v != null
      ? null
      : lage.status === 'paborjad' && lage.svar
        ? `${lage.svar.besvarade} av ${lage.svar.antal} svar`
        : 'Inte mätt än';
  return (
    <div style={{ display: 'grid', gap: 6 }} aria-label={v != null && lage.status !== 'omatt' ? `${namn}, nivå ${v.toFixed(1).replace('.', ',')} av 10` : `${namn}, ${text}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span className="tk-ey">Din nivå</span>
        {v != null && lage.status !== 'omatt' ? (
          <span className="tk-disp" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {v.toFixed(1).replace('.', ',')}
          </span>
        ) : (
          <span className="tk-meta">{text}</span>
        )}
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'var(--a-papper-2)', overflow: 'hidden' }} aria-hidden="true">
        {v != null && lage.status !== 'omatt' && (
          <i style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: pos(v), background: 'var(--kop)', borderRadius: 4 }} />
        )}
        <i style={{ position: 'absolute', top: 0, bottom: 0, left: pos(4), width: 2, background: 'var(--a-papper)' }} />
        <i style={{ position: 'absolute', top: 0, bottom: 0, left: pos(7), width: 2, background: 'var(--a-papper)' }} />
        <i style={{ position: 'absolute', top: 0, bottom: 0, left: pos(lage.tak), right: 0, background: 'repeating-linear-gradient(135deg, transparent 0 3px, rgba(20,20,30,.08) 3px 5px)' }} />
      </div>
      <div className="tk-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 11.5 }} aria-hidden="true">
        <span>Grund</span>
        <span style={{ textAlign: 'center' }}>Avancerad</span>
        <span style={{ textAlign: 'right' }}>Expert</span>
      </div>
    </div>
  );
}

function Ark({ k, onStang }: { k: KatalogKortV4; onStang: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const a = k.ark;
  return (
    <div className="tk-ark-lager" onClick={onStang}>
      <div
        ref={ref}
        className="tk-ark"
        role="dialog"
        aria-modal="true"
        aria-label={k.namn}
        tabIndex={-1}
        data-ark={k.typ}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onStang();
        }}
      >
        <div className="handtag" />
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <TypIkon typ={k.typ} px={56} />
            <div style={{ minWidth: 0 }}>
              <h2 className="tk-h2">{k.namn}</h2>
              <p className="tk-meta">{a.rad}</p>
            </div>
          </div>

          <NivaBand lage={a.niva} namn={k.namn} />

          <section aria-label={a.trana.eyebrow} data-trana style={{ display: 'grid', gap: 10, background: 'var(--kop-mjuk)', borderRadius: 20, padding: '14px 16px' }}>
            <div>
              <p className="tk-ey kop">{a.trana.eyebrow}</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: '21px', marginTop: 2 }}>{a.trana.rubrik}</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--a-ink-2)' }}>{a.trana.text}</p>
            <Link
              href={a.trana.knapp.href}
              className={`tk-knapp tk-tryck ${a.trana.knapp.las ? 'morkt' : 'kop'}`}
              style={{ height: 48 }}
              onClick={() => haptik('latt')}
              data-las={a.trana.knapp.las ? '' : undefined}
            >
              {a.trana.knapp.las && <IkonLas />}
              {a.trana.knapp.text}
            </Link>
          </section>

          {a.monster.length > 0 && (
            <section aria-label={MONSTER_RUBRIK} style={{ display: 'grid', gap: 8 }}>
              <p className="tk-ey" style={{ padding: '0 2px' }}>
                {MONSTER_RUBRIK}
              </p>
              <div className="tk-rader">
                {a.monster.map((r) => (
                  <Rad key={r.titel} r={r} />
                ))}
              </div>
            </section>
          )}

          <div
            aria-hidden="true"
            style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--a-ink-3)' }}
          >
            <i style={{ flex: 1, height: 1, background: 'var(--a-kant-stark)' }} />
            eller
            <i style={{ flex: 1, height: 1, background: 'var(--a-kant-stark)' }} />
          </div>

          <section aria-label={a.testa.eyebrow} data-testa style={{ display: 'grid', gap: 10, background: 'var(--a-ton)', borderRadius: 20, padding: '14px 16px' }}>
            <div>
              <p className="tk-ey" style={{ color: 'var(--a-ton-ink)' }}>
                {a.testa.eyebrow}
              </p>
              <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: '21px', marginTop: 2 }}>{a.testa.rubrik}</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--a-ink-2)' }}>{a.testa.text}</p>
            <div className="tk-rader" style={{ border: 0 }}>
              {a.testa.rader.map((r) => (
                <Rad key={r.titel} r={r} />
              ))}
            </div>
          </section>

          <section aria-label={a.matDig.eyebrow} data-matdig style={{ display: 'grid', gap: 8 }}>
            <p className="tk-ey" style={{ padding: '0 2px' }}>
              {a.matDig.eyebrow}
            </p>
            <div className="tk-rader">
              {a.matDig.rader.map((r) => (
                <Rad key={r.titel} r={r} />
              ))}
            </div>
          </section>

          {a.senaste.rader.length > 0 && (
            <section aria-label={a.senaste.eyebrow} data-senaste style={{ display: 'grid', gap: 6 }}>
              <p className="tk-ey" style={{ padding: '0 2px' }}>
                {a.senaste.eyebrow}
              </p>
              <div>
                {a.senaste.rader.map((s) => {
                  const inre = (
                    <>
                      <span>{s.dag}</span>
                      <span>{s.slag}</span>
                      <b style={{ textAlign: 'right', fontWeight: 600, color: 'var(--a-ink)' }}>{s.varde}</b>
                    </>
                  );
                  const stil = {
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr auto',
                    alignItems: 'center',
                    gap: 10,
                    minHeight: 40,
                    borderTop: '1px solid var(--a-kant)',
                    fontSize: 13,
                    color: 'var(--a-ink-3)',
                    fontVariantNumeric: 'tabular-nums',
                    padding: '0 2px',
                  } as const;
                  return s.href ? (
                    <Link key={s.id} href={s.href} style={stil}>
                      {inre}
                    </Link>
                  ) : (
                    <div key={s.id} style={stil}>
                      {inre}
                    </div>
                  );
                })}
              </div>
              <Link href={a.senaste.historik.href} className="tk-lank" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', justifySelf: 'start' }}>
                {a.senaste.historik.text}
              </Link>
            </section>
          )}

          <button type="button" className="tk-knapp ljus tk-tryck" style={{ height: 46 }} onClick={onStang}>
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}

/** Adressen med eller utan ?typ=, resten orört. */
function adressMed(typ: TestTypId | null): string {
  const url = new URL(window.location.href);
  if (typ) url.searchParams.set('typ', typ);
  else url.searchParams.delete('typ');
  return `${url.pathname}${url.search}${url.hash}`;
}

export default function KatalogVy({ katalog, startTyp = null, initial }: { katalog: KatalogV4; startTyp?: TestTypId | null; initial: string }) {
  const { mittTest, ingarRubrik, ingar, ovningsprov, flerRubrik, fler, personlighet, gratis } = katalog;
  const alla = [...ingar, ...fler];
  const [oppen, setOppen] = useState<KatalogKortV4 | null>(null);

  // Arket i historiken: tillbaka stänger det.
  useEffect(() => {
    const pop = () => {
      const st = window.history.state as { tkArk?: TestTypId } | null;
      setOppen(st?.tkArk ? alla.find((k) => k.typ === st.tkArk) ?? null : null);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
    // Korten byts bara med en ny sida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [katalog]);

  const oppna = useCallback((k: KatalogKortV4) => {
    haptik('latt');
    try {
      window.history.pushState({ ...(window.history.state ?? {}), tkArk: k.typ }, '', adressMed(k.typ));
    } catch {
      // Adressen är en bekvämlighet; arket fungerar utan den.
    }
    setOppen(k);
  }, []);

  const stang = useCallback(() => {
    if ((window.history.state as { tkArk?: string } | null)?.tkArk) window.history.back();
    else setOppen(null);
  }, []);

  // ?typ= (Idag, Din utveckling, tillbaka från ett test): adressen utan typ
  // under, arket som ett steg ovanpå, så att tillbaka stänger det.
  useEffect(() => {
    if (!startTyp) return;
    const k = alla.find((x) => x.typ === startTyp);
    if (!k) return;
    try {
      const st = { ...(window.history.state ?? {}) } as Record<string, unknown>;
      delete st.tkArk;
      window.history.replaceState(st, '', adressMed(null));
      window.history.pushState({ ...st, tkArk: k.typ }, '', adressMed(k.typ));
    } catch {
      // Utan historiken stänger Stäng arket ändå.
    }
    setOppen(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTyp, katalog]);

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
              <span>{mittTest?.meta ?? 'Namnet står i kallelsen. Vi lägger upp träningen efter det.'}</span>
            </span>
            <span className="tk-lank" style={{ fontSize: 13 }}>
              {mittTest ? mittTest.andra : 'Välj'}
            </span>
          </Link>
        </div>

        {ingar.length > 0 && (
          <>
            <p className="tk-ey kop" style={{ padding: '4px 2px 0' }}>
              {ingarRubrik}
            </p>
            <div className="tk-katalog">
              {ingar.map((k) => (
                <Kort key={k.typ} k={k} onOppna={oppna} />
              ))}
              {ovningsprov && (
                <Link href={ovningsprov.href} className="tk-tkort tk-tryck" data-ovningsprov>
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

        <p className="tk-ey" style={{ padding: '8px 2px 0' }}>
          {flerRubrik}
        </p>
        <div className="tk-katalog">
          {fler.map((k) => (
            <Kort key={k.typ} k={k} onOppna={oppna} />
          ))}
          <Link href={personlighet.href} className="tk-tkort tk-tryck" data-personlighet>
            <span className="bild" style={{ background: tonFor('personlighet').bg, color: tonFor('personlighet').ink }}>
              <TypFigur typ="personlighet" size={44} />
            </span>
            <span className="t">
              <b>{personlighet.titel}</b>
              <span>{personlighet.meta}</span>
            </span>
            {personlighet.gjord ? (
              <span className="tk-chip gjord">
                <IkonBock size={13} />
                Gjord
              </span>
            ) : (
              <IkonChev />
            )}
          </Link>
        </div>

        {gratis && (
          <section className="tk-kort" aria-label={gratis.rubrik} data-gratisrad style={{ display: 'grid', gap: 8, marginTop: 4 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, lineHeight: '22px' }}>{gratis.rubrik}</h2>
            <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--a-ink-2)' }}>{gratis.text}</p>
            <Link href={gratis.href} className="tk-knapp kop tk-tryck" style={{ height: 46, marginTop: 4 }}>
              {gratis.knapp}
            </Link>
          </section>
        )}
      </div>
      {oppen && <Ark k={oppen} onStang={stang} />}
    </>
  );
}
