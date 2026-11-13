import { describe, expect, it } from 'vitest';
import { anonymTillaten } from '../anonym';

describe('spärren för anonyma konton', () => {
  it('släpper igenom det Nivåkollen behöver', () => {
    for (const p of [
      '/api/traning/pass/session',
      '/api/traning/pass/svar',
      '/api/traning/plan',
      '/api/app/anonym/overfor',
      '/api/auth/confirm-email',
      '/dashboard',
      '/dashboard/tester',
      '/dashboard/tester/pass/abc',
      '/app/valkommen',
      '/register',
      '/login',
      '/auth/callback',
    ]) {
      expect(anonymTillaten(p), p).toBe(true);
    }
  });

  it('nekar AI-funktionerna, köp, konto och resten av Mitt jobbsök', () => {
    for (const p of [
      '/api/cv/parse',
      '/api/letters',
      '/api/jobbcoachen/chat',
      '/api/linkedin/optimize',
      '/api/stripe/create-plan-session',
      '/api/app/konto',
      '/api/app/enheter',
      '/dashboard/skapa-brev',
      '/dashboard/installningar',
      '/dashboard/testerna',
      '/appar',
      '/registerx',
    ]) {
      expect(anonymTillaten(p), p).toBe(false);
    }
  });
});
