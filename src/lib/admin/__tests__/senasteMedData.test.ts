import { describe, it, expect } from 'vitest';
import {
  harVarde,
  senasteMedVarde,
  senasteDagMedVarde,
  radArTom,
  type MedDag,
  STRIPE_LEDARE,
  GSC_LEDARE,
} from '../senasteMedData';

/**
 * Buggen de har testerna hindrar: "Hamta nu" skrev en rad for i dag dar varje
 * tal var null, darfor att delstegen inte hann klart. Sidorna tog rad noll ur
 * fallande dagsordning och visade streck pa MRR, ARR och aktiva
 * prenumerationer, fast garsdagens rad lag kvar med riktiga siffror.
 */

const rad = (dag: string, varden: Record<string, number | null> = {}) => ({
  dag,
  mrr_ore: null,
  gsc_clicks: null,
  new_accounts: null,
  ...varden,
});

describe('harVarde', () => {
  it('ar falskt for null och undefined', () => {
    expect(harVarde(rad('2026-09-21'), 'mrr_ore')).toBe(false);
    expect(harVarde(rad('2026-09-21'), 'finns_inte')).toBe(false);
  });

  it('ar sant for noll', () => {
    // Noll ar en matning, inte en lucka. En dag utan nya betalande ar data.
    expect(harVarde(rad('2026-09-21', { mrr_ore: 0 }), 'mrr_ore')).toBe(true);
  });

  it('ar sant for tal som kommer som strang ur Postgres numeric', () => {
    expect(
      harVarde({ dag: '2026-09-21', ai_cost_sek: '12.5' } as MedDag, 'ai_cost_sek')
    ).toBe(
      true
    );
  });

  it('ar falskt for en rad som saknas', () => {
    expect(harVarde(undefined, 'mrr_ore')).toBe(false);
    expect(harVarde(null, 'mrr_ore')).toBe(false);
  });
});

describe('senasteMedVarde', () => {
  it('hoppar over den tomma dagsraden hogst upp', () => {
    const rader = [
      rad('2026-09-21'), // "Hamta nu" 19:14, alla delsteg tomma
      rad('2026-09-20', { mrr_ore: 480000, gsc_clicks: 311 }),
      rad('2026-09-19', { mrr_ore: 470000, gsc_clicks: 298 }),
    ];
    expect(senasteMedVarde(rader, STRIPE_LEDARE)?.dag).toBe('2026-09-20');
    expect(senasteMedVarde(rader, STRIPE_LEDARE)?.mrr_ore).toBe(480000);
  });

  it('valjer olika dag per matvarde', () => {
    // Stripe svarade i dag, GSC ligger tva dagar efter. Bada korten ska sta
    // pa sin egen senaste dag i stallet for att dras ner till den aldsta.
    const rader = [
      rad('2026-09-21', { mrr_ore: 490000 }),
      rad('2026-09-20', { mrr_ore: 480000 }),
      rad('2026-09-19', { mrr_ore: 470000, gsc_clicks: 298 }),
    ];
    expect(senasteDagMedVarde(rader, STRIPE_LEDARE)).toBe('2026-09-21');
    expect(senasteDagMedVarde(rader, GSC_LEDARE)).toBe('2026-09-19');
  });

  it('ger null nar ingen rad bar matvardet', () => {
    const rader = [rad('2026-09-21'), rad('2026-09-20')];
    expect(senasteMedVarde(rader, STRIPE_LEDARE)).toBeNull();
    expect(senasteDagMedVarde(rader, STRIPE_LEDARE)).toBeNull();
  });

  it('ger null for en tom lista', () => {
    expect(senasteMedVarde([], STRIPE_LEDARE)).toBeNull();
  });

  it('valjer forsta raden nar den bar vardet', () => {
    const rader = [rad('2026-09-21', { mrr_ore: 490000 }), rad('2026-09-20')];
    expect(senasteMedVarde(rader, STRIPE_LEDARE)?.dag).toBe('2026-09-21');
  });
});

describe('radArTom', () => {
  it('ar sant nar varje tal ar null', () => {
    expect(radArTom({ dag: '2026-09-21', mrr_ore: null, gsc_clicks: null })).toBe(
      true
    );
  });

  it('ar falskt nar ett enda tal finns, aven noll', () => {
    expect(radArTom({ dag: '2026-09-21', mrr_ore: null, new_paying: 0 })).toBe(false);
  });

  it('raknar inte dag och uppdaterad som data', () => {
    expect(
      radArTom({
        dag: '2026-09-21',
        uppdaterad: '2026-09-21T19:14:00Z',
        mrr_ore: null,
      } as never)
    ).toBe(true);
  });
});
