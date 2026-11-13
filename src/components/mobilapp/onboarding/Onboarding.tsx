'use client';

/**
 * Appens första start (konceptet docs/design/app-koncept-2026-11-13.html):
 * fyra steg (löftet, välj ditt test, provdatumet, samtycket), Nivåkollens
 * start, Nivåkollen själv (webbens PassFlode), nivåögonblicket och Spara din
 * nivå. Proxyn skickar appens /register hit.
 *
 * Valen sparas i appen (onboarding.ts) tills kontot finns. Nivåkollen görs i
 * en anonym Supabase-session; planen sparas på den med webbens PUT
 * /api/traning/plan, och kontot skapas efter nivåögonblicket. Går det inte
 * att starta en anonym session (Supabase-inställningen är av) skapas kontot
 * före Nivåkollen i stället, med samma vy.
 *
 * Stegen ligger i historiken (?steg=), så Android-tillbaka går ett steg i
 * taget. Posterna bär tkArk, som Skalet läser som "tillbaka går bakåt i
 * historiken" i stället för "tryck igen för att stänga".
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MITT_TEST_KORT, synligaVal, type MittTest } from '@/lib/traning/mittTest';
import { matningResultat, type MatningResultat } from '@/lib/traning/resultat';
import { passHref, sessionHref } from '@/lib/traning/rutter';
import type { Avslut, Traningsstatus } from '@/lib/traning/klient';
import { dagSthlm, laggTill } from '@/lib/traning/datum';
import {
  arSteg,
  DATUMVAL_TEXT,
  datumText,
  lasMinne,
  planremsa,
  planSammanfattning,
  provdatumFor,
  sparaMinne,
  STANDARD,
  stegRad,
  skrivSamtycke,
  type Datumval,
  type OnboardingMinne,
  type Steg,
} from '@/lib/mobilapp/onboarding';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import type { AppTyp } from '@/lib/mobilapp/vyer';
import { IkonBock, IkonTillbaka, TypIkon } from '../ikoner';
import { haptik, statusfalt } from '../skal';
import KontoVy, { type KontoLage } from '../inloggning/KontoVy';
import { sessionLage, sparaPlan, startaAnonym } from '../inloggning/konto';
import { NivakollBild, OnbScen1, Ordmarke, Planremsa, SamtyckeBild } from './Bilder';
import NivakollPass from './NivakollPass';
import Nivaogonblick from './Nivaogonblick';
import './onboarding.css';

/** Figuren per val (konceptets MITT_TEST). */
const FIGUR: Record<MittTest, AppTyp> = {
  matrigma: 'matris',
  iprov: 'spatial',
  alva: 'matris',
  shl: 'deduktiv',
  aon: 'figurserie',
  lokforare: 'numerisk',
  personlighet: 'personlighet',
  annat: 'plan',
};
/** Ordningen i konceptet: två och två, de breda sist. */
const ORDNING: MittTest[] = ['matrigma', 'iprov', 'alva', 'shl', 'aon', 'lokforare', 'personlighet', 'annat'];
const KORT_RAD: Partial<Record<MittTest, string>> = { iprov: 'I-provet. Även mönstring, Tullverket', lokforare: 'TCC, ProTrain, MTR' };

type Resultat = { vm: MatningResultat; antal: number; sessionId: string };

function StegRad({ steg }: { steg: Steg }) {
  return (
    <div className="tk-steg-rad" aria-hidden="true">
      {stegRad(steg).map((s, i) => (
        <i key={i} className={s === 'kvar' ? undefined : s} />
      ))}
    </div>
  );
}

export default function Onboarding({ startSteg, inloggad }: { startSteg: Steg; inloggad: 'ingen' | 'anonym' | 'konto' }) {
  const router = useRouter();
  const [steg, setSteg] = useState<Steg>(startSteg);
  const [minne, setMinne] = useState<OnboardingMinne>(STANDARD);
  const [lage, setLage] = useState(inloggad);
  const [kontoLage, setKontoLage] = useState<KontoLage>('spara');
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [arbetar, setArbetar] = useState(false);
  const idag = useMemo(() => dagSthlm(), []);

  // Minnet finns bara i klienten. Steg som kräver data utan data går till början av sin del.
  useEffect(() => {
    const m = lasMinne();
    setMinne(m);
    if ((startSteg === 'niva' || startSteg === 'matning') && !resultat) setSteg('nivakoll');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tillbaka i historiken: stegen ur adressen.
  useEffect(() => {
    const pop = () => {
      const s = new URLSearchParams(window.location.search).get('steg');
      if ((window.history.state as { tkEpost?: boolean } | null)?.tkEpost) return;
      setSteg(arSteg(s) ? s : 'start');
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  useEffect(() => {
    statusfalt(steg === 'niva' ? 'morkt' : 'ljust');
    const rot = document.querySelector<HTMLElement>('[data-mobilapp]');
    if (rot && steg !== 'matning') rot.style.backgroundColor = steg === 'niva' ? 'var(--natt)' : 'var(--a-bg)';
  }, [steg]);

  const ga = useCallback((ny: Steg, ersatt = false) => {
    const url = `${window.location.pathname.startsWith('/dashboard/') ? '/register' : window.location.pathname}?steg=${ny}`;
    // Nivåögonblicket ligger utan tkArk: tillbaka därifrån ska inte göra om Nivåkollen.
    const state = { ...(window.history.state ?? {}), tkArk: ny !== 'niva', tkEpost: false };
    if (ersatt) window.history.replaceState(state, '', url);
    else window.history.pushState(state, '', url);
    setSteg(ny);
    window.scrollTo?.(0, 0);
    document.querySelector('[data-mobilapp] main')?.scrollTo?.(0, 0);
  }, []);

  const uppdatera = (m: Partial<OnboardingMinne>) => setMinne(sparaMinne(m));

  const prov = provdatumFor(minne.datum, minne.kalender, idag);
  const plan = planSammanfattning(prov, idag);
  const remsa = planremsa(prov, idag);
  const planText = prov ? `planen till ${datumText(prov)}` : 'planen';

  /** Onboardingen klar: Idag. */
  const tillIdag = useCallback(
    (mal: string = APP_FLIK.idag) => {
      sparaMinne({ klar: true });
      router.replace(mal);
      router.refresh();
    },
    [router],
  );

  const startaNivakollen = async () => {
    if (arbetar) return;
    haptik('latt');
    setArbetar(true);
    const nu = await sessionLage();
    if (nu === 'konto') {
      await sparaPlan(minne);
      setLage('konto');
      setArbetar(false);
      ga('matning');
      return;
    }
    if (await startaAnonym()) {
      await sparaPlan(minne, true);
      setLage('anonym');
      setArbetar(false);
      ga('matning');
      return;
    }
    // Inga anonyma sessioner: kontot först, Nivåkollen direkt efter.
    setKontoLage('forst');
    setArbetar(false);
    ga('konto');
  };

  const nivakollKlar = (avslut: Avslut, status: Traningsstatus | null, sessionId: string) => {
    const vm = matningResultat(avslut, status, false);
    setResultat({ vm, antal: avslut.antal, sessionId });
    uppdatera({ niva: vm.heltal });
    haptik('framgang');
    ga('niva', true);
  };

  const kontoKlart = async () => {
    setArbetar(true);
    // "Jag har redan ett konto" direkt från början: inga val gjorda, inget att spara.
    if (minne.samtycke !== null || resultat) await sparaPlan(minne);
    if (kontoLage === 'forst' && !resultat) {
      setLage('konto');
      setArbetar(false);
      ga('matning', true);
      return;
    }
    tillIdag();
  };

  /* ------------------------------------------------------------ vyerna */

  if (steg === 'matning') {
    return <NivakollPass onKlar={nivakollKlar} onAvbryt={() => ga('nivakoll', true)} />;
  }

  if (steg === 'niva' && resultat) {
    const anonym = lage !== 'konto';
    return (
      <Nivaogonblick
        vm={resultat.vm}
        antal={resultat.antal}
        anonym={anonym}
        provText={planText}
        remsa={remsa}
        remsaRubrik={prov ? `Planen till ${datumText(prov)}` : 'Planen, en vecka framåt'}
        genomgangHref={sessionHref(resultat.sessionId)}
        onStang={() => (anonym ? (setKontoLage('spara'), ga('konto')) : tillIdag())}
        onSpara={() => {
          haptik('latt');
          setKontoLage('spara');
          ga('konto');
        }}
        onGrundpass={() => tillIdag(passHref('pass'))}
      />
    );
  }

  if (steg === 'konto') {
    return (
      <KontoVy
        key={kontoLage}
        lage={kontoLage}
        niva={minne.niva}
        planText={planText}
        onKlar={() => void kontoKlart()}
        onTillbaka={() => window.history.back()}
      />
    );
  }

  return (
    <div className="tk">
      <div className="tk-onb tk-onb-in" key={steg}>
        {steg === 'start' && (
          <>
            <div className="tk-steg-rad" style={{ justifyContent: 'space-between' }}>
              <Ordmarke size={19} />
              <span className="tk-meta">från jobbcoach.ai</span>
            </div>
            <div style={{ padding: '6px 0 18px' }}>
              <OnbScen1 />
            </div>
            <h1 className="tk-h1">Träna inför ditt rekryteringstest</h1>
            <p className="tk-p" style={{ marginTop: 10 }}>
              Ett pass om dagen i samma format som provet. Regeln efter varje svar, och nivån som stiger vecka för vecka fram till provdagen.
            </p>
            <div className="tk-onb-fot">
              <p className="tk-meta" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--kop-ink)', flex: '0 0 auto' }}>
                  <IkonBock size={18} />
                </span>
                <span>Nivåkollen och första passet är gratis. Premium 149 kr i månaden. Säg upp när du vill.</span>
              </p>
              <button type="button" className="tk-knapp kop tk-tryck" onClick={() => (haptik('latt'), ga('test'))}>
                Kom igång
              </button>
              <button
                type="button"
                className="tk-lank"
                onClick={() => {
                  setKontoLage('logga-in');
                  ga('konto');
                }}
              >
                Jag har redan ett konto
              </button>
            </div>
          </>
        )}

        {steg === 'test' && (
          <>
            <StegRad steg={steg} />
            <h1 className="tk-h1">Vad ska du göra för test?</h1>
            <p className="tk-p" style={{ margin: '8px 0 16px' }}>
              Namnet står i kallelsen eller mejlet. Går att ändra när som helst.
            </p>
            <div className="tk-val">
              {ORDNING.filter((v) => synligaVal().includes(v)).map((v) => {
                const bred = v === 'personlighet' || v === 'annat';
                const valt = minne.test === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={valt}
                    className={`tk-tryck${bred ? ' bred' : ''}`}
                    onClick={() => {
                      haptik('latt');
                      uppdatera({ test: v });
                    }}
                  >
                    <TypIkon typ={FIGUR[v]} px={34} />
                    {bred ? (
                      <span className="t">
                        <b>{MITT_TEST_KORT[v].titel}</b>
                        <span className="rad">{KORT_RAD[v] ?? MITT_TEST_KORT[v].rad}</span>
                      </span>
                    ) : (
                      <>
                        <b>{MITT_TEST_KORT[v].titel}</b>
                        <span className="rad">{KORT_RAD[v] ?? MITT_TEST_KORT[v].rad}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: '18px 0 14px' }}>
              <button type="button" className="tk-knapp kop tk-tryck" onClick={() => (haptik('latt'), ga('datum'))}>
                Fortsätt med {MITT_TEST_KORT[minne.test].titel}
              </button>
            </div>
          </>
        )}

        {steg === 'datum' && (
          <>
            <StegRad steg={steg} />
            <h1 className="tk-h1">När är provet?</h1>
            <p className="tk-p" style={{ margin: '8px 0 16px' }}>
              Vi lägger passen fram till dagen, med ny nivåkoll varje vecka och övningsprov de sista dagarna.
            </p>
            <div className="tk-datumval">
              {(['1v', '2v', '3v', '1m'] as const).map((d) => (
                <button key={d} type="button" className="tk-tryck" aria-pressed={minne.datum === d} onClick={() => (haptik('latt'), uppdatera({ datum: d }))}>
                  {DATUMVAL_TEXT[d]}
                </button>
              ))}
              <button
                type="button"
                className="bred tk-tryck"
                aria-pressed={minne.datum === 'kal'}
                onClick={() => {
                  haptik('latt');
                  uppdatera({ datum: 'kal' as Datumval, kalender: minne.kalender ?? laggTill(idag, 21) });
                }}
              >
                {minne.datum === 'kal' && prov ? `Provet ${datumText(prov)}` : 'Välj datum i kalendern'}
              </button>
              {minne.datum === 'kal' && (
                <input
                  className="tk-falt"
                  type="date"
                  aria-label="Provdatum"
                  min={idag}
                  max={laggTill(idag, 366)}
                  value={minne.kalender ?? ''}
                  onChange={(e) => uppdatera({ kalender: e.target.value || null })}
                />
              )}
              <button type="button" className="bred vet-inte tk-tryck" aria-pressed={minne.datum === 'ej'} onClick={() => (haptik('latt'), uppdatera({ datum: 'ej' }))}>
                Vet inte än
              </button>
            </div>
            <div className="tk-kort" style={{ marginTop: 16 }}>
              <p className="tk-ey">{plan.rubrik}</p>
              <p style={{ fontWeight: 600, margin: '4px 0 12px' }}>{plan.text}</p>
              <Planremsa dagar={remsa} />
            </div>
            <div style={{ padding: '16px 0 14px' }}>
              <button type="button" className="tk-knapp kop tk-tryck" onClick={() => (haptik('latt'), ga('samtycke'))}>
                Fortsätt
              </button>
            </div>
          </>
        )}

        {steg === 'samtycke' && (
          <>
            <StegRad steg={steg} />
            <div style={{ padding: '14px 0 22px' }}>
              <SamtyckeBild />
            </div>
            <h1 className="tk-h1">Får vi se hur appen används?</h1>
            <p className="tk-p" style={{ marginTop: 10 }}>
              Anonym statistik om vilka vyer som öppnas och var folk fastnar. Aldrig dina svar, aldrig din nivå. Du kan ändra dig när som helst under Konto.
            </p>
            <div className="tk-onb-fot" style={{ gap: 10 }}>
              {/* data-samtycke: PostHogs lyssnare läser samma attribut som i webbens kakbanner. */}
              <button
                type="button"
                data-samtycke="true"
                className="tk-knapp kop tk-tryck"
                onClick={() => {
                  haptik('latt');
                  skrivSamtycke(true);
                  uppdatera({ samtycke: true });
                  ga('nivakoll');
                }}
              >
                Ja, det går bra
              </button>
              <button
                type="button"
                data-samtycke="false"
                className="tk-knapp ljus tk-tryck"
                onClick={() => {
                  haptik('latt');
                  skrivSamtycke(false);
                  uppdatera({ samtycke: false });
                  ga('nivakoll');
                }}
              >
                Nej tack
              </button>
            </div>
          </>
        )}

        {steg === 'nivakoll' && (
          <>
            <div style={{ height: 44, display: 'flex', alignItems: 'center', marginLeft: -14 }}>
              <button type="button" className="tk-ik tk-tryck" aria-label="Tillbaka" onClick={() => window.history.back()}>
                <IkonTillbaka />
              </button>
            </div>
            <div style={{ padding: '6px 0 18px' }}>
              <NivakollBild />
            </div>
            <p className="tk-ey kop">{lage === 'konto' ? 'Gratis' : 'Gratis, inget konto behövs än'}</p>
            <h1 className="tk-h1" style={{ marginTop: 6 }}>
              Nivåkollen
            </h1>
            <p className="tk-p" style={{ marginTop: 10 }}>
              Tolv uppgifter som följer dina svar: rätt ger svårare, fel ger lättare. Ingen förklaring under tiden, allt efteråt. Du får en nivå mellan 1 och 10 och passen
              börjar där.
            </p>
            <div className="tk-fakta">
              {[
                ['12', 'uppgifter'],
                ['8 min', 'ungefär'],
                ['1 till 10', 'din nivå'],
              ].map(([v, t]) => (
                <div key={t} className="tk-kort">
                  <b>{v}</b>
                  <span className="tk-meta">{t}</span>
                </div>
              ))}
            </div>
            <div className="tk-onb-fot" style={{ gap: 10 }}>
              <button type="button" className="tk-knapp kop tk-tryck" onClick={startaNivakollen} disabled={arbetar}>
                {arbetar ? 'Startar …' : 'Starta Nivåkollen'}
              </button>
              <p className="tk-meta" style={{ textAlign: 'center' }}>
                {lage === 'konto' ? 'Du kan pausa. Svaren sparas efter varje fråga.' : 'Du kan pausa. Svaren sparas efter varje fråga, kontot skapar du efteråt.'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
