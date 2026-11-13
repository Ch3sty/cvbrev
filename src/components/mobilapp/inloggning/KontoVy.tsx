'use client';

/**
 * Kontot i appen (konceptets V.konto och arket "Med e-post"): Spara din nivå
 * efter nivåögonblicket, Skapa konto före Nivåkollen när anonyma sessioner
 * inte finns, och Logga in. Skapa konto och logga in i samma vy.
 *
 * Android: Google och e-post. iOS: Apple-knappen överst (platsen finns, dold
 * på Android). Google-inloggningen är inbyggd (skal-inloggning.ts); i en
 * vanlig webbläsare finns den inte och knappen står inaktiv. Samma konto som
 * på jobbcoach.ai.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { IkonTillbaka } from '../ikoner';
import { haptik } from '../skal';
import { arIos, harGoogle } from '../skal-inloggning';
import { loggaInEpost, loggaInGoogle, MIN_LOSEN, skapaKontoEpost, type KontoSvar } from './konto';
import '../onboarding/onboarding.css';

export type KontoLage = 'spara' | 'forst' | 'logga-in';

const GoogleIkon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
    <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" />
    <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9z" />
  </svg>
);

const AppleIkon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
    <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-1.9c-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.9a4.8 4.8 0 0 0-4.1 2.5c-1.8 3-.5 7.5 1.2 10 .8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4a10 10 0 0 0 1.4-2.8 4.3 4.3 0 0 1-2.6-4.2zM14 5.4A4.3 4.3 0 0 0 15 2.2a4.4 4.4 0 0 0-2.9 1.5 4.1 4.1 0 0 0-1 3.1c1.1.1 2.2-.5 2.9-1.4z" />
  </svg>
);

function EpostArk({
  lage,
  onStang,
  onKlar,
  onBytTillLogin,
}: {
  lage: 'skapa' | 'logga-in';
  onStang: () => void;
  onKlar: (r: Extract<KontoSvar, { ok: true }>) => void;
  onBytTillLogin: () => void;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [epost, setEpost] = useState('');
  const [losen, setLosen] = useState('');
  const [arbetar, setArbetar] = useState(false);
  const [fel, setFel] = useState<Extract<KontoSvar, { ok: false }> | null>(null);
  const skapa = lage === 'skapa';

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const skicka = async (e: React.FormEvent) => {
    e.preventDefault();
    if (arbetar) return;
    haptik('latt');
    setArbetar(true);
    setFel(null);
    const r = skapa ? await skapaKontoEpost(epost, losen) : await loggaInEpost(epost, losen);
    if (r.ok) {
      onKlar(r);
      return;
    }
    setFel(r);
    setArbetar(false);
  };

  return (
    <div className="tk-ark-lager" onClick={onStang}>
      <div
        ref={ref}
        className="tk-ark"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-rubrik`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onStang();
        }}
      >
        <div className="handtag" />
        <h2 id={`${id}-rubrik`} className="tk-h2">
          {skapa ? 'Med e-post' : 'Logga in med e-post'}
        </h2>
        <p className="tk-p" style={{ marginTop: 4 }}>
          {skapa ? `Välj ett lösenord på minst ${MIN_LOSEN} tecken. Samma inloggning fungerar på jobbcoach.ai.` : 'Samma e-post och lösenord som på jobbcoach.ai.'}
        </p>
        {fel && (
          <div className="tk-onb-fel" role="alert" style={{ marginTop: 14 }}>
            <span>
              {fel.fel}
              {fel.finns && (
                <>
                  {' '}
                  <button type="button" className="tk-lank" style={{ color: 'var(--fel)' }} onClick={onBytTillLogin}>
                    Logga in
                  </button>
                </>
              )}
            </span>
          </div>
        )}
        <form onSubmit={skicka} noValidate style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div>
            <label className="tk-etikett" htmlFor={`${id}-epost`}>
              E-post
            </label>
            <input
              id={`${id}-epost`}
              className="tk-falt"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              enterKeyHint="next"
              placeholder="namn@exempel.se"
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              aria-invalid={fel?.falt === 'epost' || undefined}
            />
          </div>
          <div>
            <label className="tk-etikett" htmlFor={`${id}-losen`}>
              Lösenord
            </label>
            <input
              id={`${id}-losen`}
              className="tk-falt"
              type="password"
              autoComplete={skapa ? 'new-password' : 'current-password'}
              enterKeyHint="done"
              value={losen}
              onChange={(e) => setLosen(e.target.value)}
              aria-invalid={fel?.falt === 'losen' || undefined}
            />
          </div>
          <button type="submit" className="tk-knapp kop tk-tryck" disabled={arbetar} style={{ marginTop: 4 }}>
            {arbetar ? (skapa ? 'Skapar kontot …' : 'Loggar in …') : skapa ? 'Skapa konto' : 'Logga in'}
          </button>
          {!skapa && (
            <a href="/auth/forgot-password" className="tk-lank" style={{ textAlign: 'center', minHeight: 40, display: 'grid', placeItems: 'center' }}>
              Glömt lösenordet?
            </a>
          )}
        </form>
      </div>
    </div>
  );
}

export default function KontoVy({
  lage: startLage,
  niva,
  planText,
  onKlar,
  onTillbaka,
  nyHref,
}: {
  lage: KontoLage;
  niva: number | null;
  /** "planen till 6 december" eller "planen". */
  planText: string;
  onKlar: (r: { nytt: boolean }) => void;
  onTillbaka?: () => void;
  /** Logga in utan onboarding bakom: länken till appens början. */
  nyHref?: string;
}) {
  const [lage, setLage] = useState<KontoLage>(startLage);
  const [ark, setArk] = useState(false);
  const [google, setGoogle] = useState(false);
  const [ios, setIos] = useState(false);
  const [arbetar, setArbetar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const login = lage === 'logga-in';

  // Skalet finns bara i klienten; knapparna ritas inaktiva i första HTML.
  useEffect(() => {
    setGoogle(harGoogle());
    setIos(arIos());
  }, []);

  // Arket i historiken: Android-tillbaka stänger det (Skalet, tkArk).
  useEffect(() => {
    const pop = () => setArk(false);
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const oppnaArk = useCallback(() => {
    haptik('latt');
    window.history.pushState({ ...(window.history.state ?? {}), tkArk: true, tkEpost: true }, '');
    setArk(true);
  }, []);
  const stangArk = useCallback(() => {
    if ((window.history.state as { tkEpost?: boolean } | null)?.tkEpost) window.history.back();
    else setArk(false);
  }, []);

  const medGoogle = async () => {
    if (arbetar || !google) return;
    haptik('latt');
    setArbetar(true);
    setFel(null);
    const r = await loggaInGoogle();
    if (r?.ok) {
      onKlar(r);
      return;
    }
    if (r && !r.ok) setFel(r.fel);
    setArbetar(false);
  };

  const rubrik = login ? 'Logga in' : lage === 'forst' ? 'Skapa ditt konto' : 'Spara din nivå';
  const text = login
    ? 'Samma konto som på jobbcoach.ai. Nivå, pass och Premium följer med åt båda hållen.'
    : lage === 'forst'
      ? `Kontot sparar ${planText} och nivån från Nivåkollen, som börjar direkt efteråt. Samma konto som på jobbcoach.ai, så nivå, pass och Premium följer med åt båda hållen.`
      : `${niva != null ? `Nivå ${niva}, ` : 'Nivån, '}${planText} och dagens grundpass sparas på kontot. Samma konto som på jobbcoach.ai, så nivå, pass och Premium följer med åt båda hållen.`;

  return (
    <div className="tk">
      <div className="tk-onb tk-onb-in" key={lage}>
        <div style={{ height: 44, display: 'flex', alignItems: 'center', marginLeft: -14 }}>
          {onTillbaka && (
            <button type="button" className="tk-ik tk-tryck" aria-label="Tillbaka" onClick={onTillbaka}>
              <IkonTillbaka />
            </button>
          )}
        </div>
        <h1 className="tk-h1" style={{ marginTop: 8 }}>
          {rubrik}
        </h1>
        <p className="tk-p" style={{ marginTop: 10 }}>
          {text}
        </p>

        {fel && (
          <div className="tk-onb-fel" role="alert" style={{ marginTop: 16 }}>
            {fel}
          </div>
        )}

        <div style={{ display: 'grid', gap: 10, marginTop: 26 }}>
          {ios && (
            <div style={{ position: 'relative' }}>
              {/* Inloggning med Apple kommer med iOS-skalet (plan 2.5); platsen är reserverad här. */}
              <button type="button" className="tk-knapp morkt tk-tryck" disabled aria-describedby="tk-apple-snart">
                <AppleIkon />
                Fortsätt med Apple
              </button>
              <span id="tk-apple-snart" className="tk-bara-ios">
                snart
              </span>
            </div>
          )}
          <button
            type="button"
            className="tk-knapp ljus tk-tryck"
            onClick={medGoogle}
            disabled={!google || arbetar}
            title={google ? undefined : 'Finns i appen'}
          >
            <GoogleIkon />
            {arbetar ? 'Öppnar Google …' : 'Fortsätt med Google'}
          </button>
          <div className="tk-eller">eller</div>
          <button type="button" className="tk-knapp ljus tk-tryck" onClick={oppnaArk} disabled={arbetar}>
            {login ? 'Logga in med e-post' : 'Fortsätt med e-post'}
          </button>
        </div>

        {!login && (
          <p className="tk-meta" style={{ marginTop: 18, textAlign: 'center' }}>
            Genom att fortsätta godkänner du{' '}
            <a href="/anvandarvillkor" style={{ textDecoration: 'underline' }}>
              villkoren
            </a>{' '}
            och{' '}
            <a href="/integritetspolicy" style={{ textDecoration: 'underline' }}>
              integritetspolicyn
            </a>
            .
          </p>
        )}

        <div className="tk-onb-fot" style={{ textAlign: 'center' }}>
          {login ? (
            nyHref ? (
              <a className="tk-lank" href={nyHref} style={{ display: 'grid', placeItems: 'center' }}>
                Ny här? Börja med Nivåkollen
              </a>
            ) : startLage !== 'logga-in' ? (
              <button type="button" className="tk-lank" onClick={() => setLage(startLage)}>
                Inget konto än? Skapa ett
              </button>
            ) : null
          ) : (
            <button type="button" className="tk-lank" onClick={() => setLage('logga-in')}>
              Har du redan ett konto? Logga in
            </button>
          )}
        </div>
      </div>

      {ark && (
        <EpostArk
          key={`ark-${lage}`}
          lage={login ? 'logga-in' : 'skapa'}
          onStang={stangArk}
          onKlar={(r) => {
            setArk(false);
            onKlar(r);
          }}
          onBytTillLogin={() => setLage('logga-in')}
        />
      )}
    </div>
  );
}
