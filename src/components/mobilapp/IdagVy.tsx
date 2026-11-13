/**
 * Idag (konceptets V.hem): dagkortet med dagens handling, dagarna i rad,
 * nivån som bild och raderna under. Ritar webbens hemvymodell (byggHemvy)
 * i appens design, så tillstånden och reglerna är desamma som på webben.
 * Serverrenderad; inget här väntar på JS.
 */
import Link from 'next/link';
import type { HemModell, LyftModell, RadModell, Sektion } from '@/lib/traning/hemvy';
import type { Traningsstatus } from '@/lib/traning/motor.server';
import { nivaKort } from '@/lib/traning/pass-copy';
import { datumText } from '@/lib/traning/rubrik';
import { deltesterForPlan, mittTestNamn, mittTestUrPlan } from '@/lib/traning/mittTest';
import { APP_FLIK, WEBBEN_VAG, appVag } from '@/lib/mobilapp/appvag';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { kurvPunkter, serieText, typForSymbol, veckaFor } from '@/lib/mobilapp/vyer';
import { DagkortIllu, Dagsring, IkonChev, IkonLas, Ring, TypIkon } from './ikoner';
import { Kurva } from './Kurva';
import { DagTopprad } from './Topprad';

/** Länkar som bara finns på webben (CV, brev, Jobbsöket) står inte i appen. */
function iAppen(href: string | undefined): boolean {
  if (!href) return false;
  return appVag(href.split('?')[0]) !== WEBBEN_VAG;
}

/** Webbens katalog heter Tester-fliken i appen. */
function appHref(href: string): string {
  return href === TRANING_RUTT.alla ? APP_FLIK.tester : href;
}

/** Köp kopplas till Google Play i nästa steg; tills dess går knappen till priserna (proxyn: finns på webben). */
const KOP_HREF = '/priser';

function Dagkort({ lyft, variant }: { lyft: LyftModell; variant: 'koppar' | 'natt' | 'vit' }) {
  const h = lyft.handling;
  const knapp =
    h?.typ === 'lank' ? (
      <Link href={h.href} className={`tk-knapp ${variant === 'vit' ? 'morkt' : 'vit'} tk-tryck`} style={variant === 'vit' ? { marginTop: 14, height: 46 } : undefined}>
        {h.text}
      </Link>
    ) : h?.typ === 'kop' ? (
      <Link href={KOP_HREF} className={`tk-knapp ${variant === 'vit' ? 'morkt' : 'vit'} tk-tryck`} style={variant === 'vit' ? { marginTop: 14, height: 46 } : undefined}>
        {h.text}
      </Link>
    ) : h?.typ === 'forsok' ? (
      <a href={APP_FLIK.idag} className="tk-knapp morkt tk-tryck" style={{ marginTop: 14, height: 46 }}>
        {h.text}
      </a>
    ) : null;
  const sekundar = lyft.sekundar && iAppen(lyft.sekundar.href) ? lyft.sekundar : null;

  if (variant === 'vit') {
    return (
      <section className="tk-kort lyft" style={{ padding: 18 }} aria-label={lyft.label} role={lyft.alert ? 'alert' : undefined}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {lyft.tal ? <Dagsring px={56} /> : null}
          <div style={{ minWidth: 0 }}>
            <p className={`tk-ey${lyft.eyebrowTon === 'koppar' ? ' kop' : ''}`}>{lyft.eyebrow}</p>
            <h2 className="tk-h2" style={{ marginTop: 2 }}>
              {lyft.tal ? `${lyft.tal.varde} ${lyft.tal.etikett}` : lyft.titel}
            </h2>
          </div>
        </div>
        {(lyft.tal || lyft.text) && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--a-kant)' }}>
            {lyft.tal && <p style={{ fontWeight: 600 }}>{lyft.titel}</p>}
            {lyft.text && <p className="tk-meta">{lyft.text}</p>}
            {knapp}
          </div>
        )}
        {!lyft.tal && !lyft.text && knapp}
        {sekundar && (
          <Link href={sekundar.href} className="tk-lank" style={{ display: 'inline-block', marginTop: 12 }}>
            {sekundar.text}
          </Link>
        )}
        {lyft.fot && <p className="tk-meta" style={{ marginTop: 10 }}>{lyft.fot}</p>}
      </section>
    );
  }

  return (
    <section className={`tk-dagkort${variant === 'natt' ? ' natt' : ''}`} aria-label={lyft.label}>
      <p className="tk-ey">{lyft.eyebrow}</p>
      <div className="rad2">
        <div>
          <h2 className="tk-h2">{lyft.tal ? `${lyft.tal.varde} ${lyft.tal.etikett}` : lyft.titel}</h2>
          {lyft.text && <p className="text">{lyft.text}</p>}
        </div>
        <DagkortIllu />
      </div>
      {knapp}
      {sekundar && (
        <Link href={sekundar.href} className="tk-lank" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,.86)', textDecorationColor: 'rgba(255,255,255,.4)' }}>
          {sekundar.text}
        </Link>
      )}
      {lyft.fot && <p className="fot">{lyft.fot}</p>}
    </section>
  );
}

function Hoger({ r }: { r: RadModell }) {
  const h = r.hoger;
  if (!h || h.typ === 'chev') return <IkonChev />;
  if (h.typ === 'bock') return <span className="tk-chip gjord">{h.text}</span>;
  if (h.typ === 'las')
    return (
      <span className="tk-chip las">
        <IkonLas />
        Premium
      </span>
    );
  return <span className="tk-lank" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{h.text}</span>;
}

function Rad({ r }: { r: RadModell }) {
  const href = r.href ?? (r.hoger?.typ === 'lank' ? r.hoger.href : r.hoger?.typ === 'las' ? KOP_HREF : undefined);
  const inne = (
    <>
      {r.symbol && (
        <span className="tk-sym" style={{ opacity: r.svag ? 0.75 : 1 }}>
          <TypIkon typ={typForSymbol(r.symbol)} px={40} />
        </span>
      )}
      <span className="t">
        <b>{r.titel}</b>
        {r.meta && <span>{r.meta}</span>}
      </span>
      <Hoger r={r} />
    </>
  );
  return href ? (
    <Link href={appHref(href)} className="tk-rad tk-tryck" aria-label={r.label}>
      {inne}
    </Link>
  ) : (
    <div className="tk-rad">{inne}</div>
  );
}

function SektionVy({ s }: { s: Sektion }) {
  if (s.typ === 'tempo') return null;
  if (s.typ === 'status') {
    const lank = s.lank && iAppen(s.lank.href) ? s.lank : null;
    return (
      <p className={`tk-status${s.ton === 'koppar' ? ' koppar' : ''}`}>
        {s.text}{' '}
        {lank && (
          <Link href={lank.href} className="tk-lank" style={{ fontSize: 13 }}>
            {lank.text}
          </Link>
        )}
      </p>
    );
  }
  const rader = s.rader.filter((r) => {
    const mal = r.href ?? (r.hoger?.typ === 'lank' ? r.hoger.href : undefined);
    return !mal || iAppen(mal);
  });
  if (rader.length === 0) return null;
  const lank = s.lank && iAppen(s.lank.href) ? s.lank : null;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {s.rubrik && (
        <div className="tk-rubrik" style={{ padding: '4px 2px 0' }}>
          <p className="tk-ey">{s.rubrik}</p>
          {lank && (
            <Link href={appHref(lank.href)} className="tk-lank" style={{ fontSize: 13 }}>
              {lank.text}
            </Link>
          )}
        </div>
      )}
      <div className="tk-rader">
        {rader.map((r, i) => (
          <Rad key={i} r={r} />
        ))}
      </div>
    </div>
  );
}

export default function IdagVy({ m, s, dag, initial }: { m: HemModell; s: Traningsstatus | null; dag: string; initial: string }) {
  const variant: 'koppar' | 'natt' | 'vit' =
    m.tillstand === 'infor' || m.tillstand === 'provdag'
      ? 'natt'
      : m.tillstand === 'efter_pass' || m.tillstand === 'efter' || m.tillstand === 'fel' || !m.lyft.handling
        ? 'vit'
        : 'koppar';

  const vecka = s && m.tillstand !== 'personlighet' ? veckaFor(s) : null;
  const plan = s?.plan ?? null;
  const val = mittTestUrPlan(plan);
  const prov = plan?.provdatum ?? null;
  const forstaTyp = deltesterForPlan(plan)?.[0] ?? 'matris';

  // Nivån som bild: kurvan från två punkter med historik, annars en mening.
  const niva = s?.niva ?? null;
  const visaKurva = !!s && niva != null && !!s.start && s.punkter.length >= 2 && !s.historikLast;
  const kp = visaKurva && s?.start ? kurvPunkter(s.punkter, s.start.dag, prov, s.idag) : null;
  const sikte = plan?.sikte ?? null;

  return (
    <>
      <DagTopprad dag={dag} rubrik={m.vagg.rubrik} initial={initial} />
      <div className="tk-pad tk-stack">
        <Dagkort lyft={m.lyft} variant={variant} />

        {vecka && s && (
          <section className="tk-kort" aria-label="Dagar i rad">
            <div className="tk-rubrik">
              <p className="tk-ey">Dagar i rad</p>
              <span className="tk-meta">{vecka.some((d) => d.status === 'paus') ? 'paus runt provet' : 'söndag fri'}</span>
            </div>
            <div className="tk-vecka" style={{ marginTop: 12 }}>
              {vecka.map((d) => (
                <div key={d.etikett} className={d.idag ? 'idag' : undefined}>
                  <Ring status={d.status} />
                  <span>{d.etikett}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>{serieText(s.serie)}</p>
          </section>
        )}

        {s && niva != null && (
          <section className="tk-kort" aria-label="Din nivå">
            <div className="tk-rubrik">
              <p className="tk-ey">Din nivå</p>
              <Link href={APP_FLIK.utveckling} className="tk-lank" style={{ fontSize: 13 }}>
                Kurvan
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 8 }}>
              <div className="tk-niva-tal">{nivaKort(niva)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {kp && s.start ? (
                  <Kurva
                    punkter={kp.punkter}
                    dagar={kp.dagar}
                    provX={kp.provX}
                    sikte={sikte}
                    startEtikett={datumText(s.start.dag)}
                    aria={m.vagg.kurva?.ariaLabel ?? `Nivån över tid, nu ${nivaKort(niva)}`}
                  />
                ) : (
                  <p className="tk-meta">
                    {s.historikLast && s.aktivitet.pass + s.aktivitet.ommatningar + s.aktivitet.generalrepetitioner > 0
                      ?'Senaste punkten på kurvan. Hela kurvan över tid ingår i Premium.'
                      : 'Första punkten på kurvan. Varje pass och varje nivåkoll bygger vidare på den.'}
                    {sikte != null && prov ? ` Mål till provet: ${nivaKort(sikte)}.` : ''}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {val && val !== 'personlighet' && (
          <div className="tk-rader">
            <Link href={APP_FLIK.tester} className="tk-rad tk-tryck">
              <span className="tk-sym">
                <TypIkon typ={forstaTyp} px={40} />
              </span>
              <span className="t">
                <b>Mitt test: {mittTestNamn(val, plan?.mitt_test_variant ?? null)}</b>
                <span>
                  {prov && s?.dagarKvar != null && s.dagarKvar >= 0
                    ? `${datumText(prov)}, ${s.dagarKvar === 1 ? '1 dag' : `${s.dagarKvar} dagar`} kvar`
                    : 'Inget datum satt'}
                </span>
              </span>
              <IkonChev />
            </Link>
          </div>
        )}

        {m.sektioner
          .filter((x) => !(x.typ === 'rader' && x.nyckel === 'jobbsok'))
          .map((x, i) => (
            <SektionVy key={x.typ === 'tempo' ? `t${i}` : x.nyckel} s={x} />
          ))}
      </div>
    </>
  );
}
