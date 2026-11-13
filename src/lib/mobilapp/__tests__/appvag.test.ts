import { describe, expect, it } from 'vitest';
import { appFlik, appPlattform, appVag, arAppen, arAppSida, WEBBEN_VAG } from '../appvag';

const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) Chrome/131 Mobile JobbcoachApp/0.1 (android)';

describe('appvag', () => {
  it('känner igen appen och plattformen', () => {
    expect(arAppen(UA)).toBe(true);
    expect(appPlattform(UA)).toBe('android');
    expect(arAppen('Mozilla/5.0 Chrome/131')).toBe(false);
    expect(appPlattform(null)).toBe(null);
  });

  it('skickar testerna till appens ram med samma undersida', () => {
    expect(appVag('/dashboard/tester/pass/abc')).toBe('/app/tester/pass/abc');
    expect(appVag('/dashboard/tester/ovningsprov/verbal/x')).toBe('/app/tester/ovningsprov/verbal/x');
    expect(appVag('/dashboard/testerna')).toBe(WEBBEN_VAG);
  });

  it('flikarna och kontot är appens egna vyer, undersidorna tvillingar', () => {
    expect(appVag('/dashboard/tester')).toBe('/app/katalog');
    expect(appVag('/dashboard/tester/')).toBe('/app/katalog');
    expect(appVag('/dashboard/tester/kurvan')).toBe('/app/utveckling');
    expect(appVag('/dashboard/installningar')).toBe('/app/konto');
    expect(appVag('/dashboard/tester/installningar')).toBe('/app/tester/installningar');
    expect(appVag('/dashboard/tester/alla')).toBe('/app/tester/alla');
    expect(appVag('/dashboard/installningar/annat')).toBe(WEBBEN_VAG);
  });

  it('flikraden står bara i de tre flikarna', () => {
    expect(appFlik('/dashboard')).toBe('idag');
    expect(appFlik('/dashboard/tester')).toBe('tester');
    expect(appFlik('/dashboard/tester/kurvan')).toBe('utveckling');
    expect(appFlik('/dashboard/tester/pass')).toBe(null);
    expect(appFlik('/dashboard/installningar')).toBe(null);
  });

  it('startsidan blir appens start, resten av Mitt jobbsök finns bara på webben', () => {
    expect(appVag('/dashboard')).toBe('/app');
    expect(appVag('/dashboard/skapa-brev')).toBe(WEBBEN_VAG);
    expect(appVag('/dashboard/tester/forhandsvisning/grund')).toBe(WEBBEN_VAG);
    expect(appVag('/priser')).toBe('/app/premium');
  });

  it('inloggningen i appens ram, API och appens egna sidor orörda', () => {
    expect(appVag('/api/traning/pass/svar')).toBe(null);
    expect(appVag('/login')).toBe('/app/logga-in');
    expect(appVag('/auth/callback')).toBe(null);
    expect(appVag('/app/webben')).toBe(null);
    expect(arAppSida('/app')).toBe(true);
    expect(arAppSida('/app/tester')).toBe(true);
    expect(arAppSida('/appar')).toBe(false);
  });
});

describe('köpen i appen', () => {
  it('skickar priser och registrering till appens egna vyer', async () => {
    const { appVag: vag, APP_PREMIUM, arStripeKassa } = await import('../appvag');
    expect(vag('/priser')).toBe(APP_PREMIUM);
    expect(vag('/register')).toBe('/app/valkommen');
    expect(vag('/dashboard/valj-spar')).toBe(APP_PREMIUM);
    expect(vag('/dashboard/profil/prenumeration')).toBe(APP_PREMIUM);
    expect(arStripeKassa('/api/stripe/create-plan-session')).toBe(true);
    expect(arStripeKassa('/api/stripe/create-upgrade-session')).toBe(true);
    expect(arStripeKassa('/api/stripe/webhooks')).toBe(false);
    expect(arStripeKassa('/api/stripe/create-portal-session')).toBe(false);
  });
});
