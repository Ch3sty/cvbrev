import { describe, expect, it } from 'vitest';
import * as node from '../pii';
// Deno-modulen är ren TypeScript utan imports, så vitest kan ladda den direkt.
// Det är hela poängen med att hålla den import-fri: paritet går att testa.
import * as deno from '../../../../supabase/functions/_shared/pii';

/**
 * Edge Function-porten är en kopia, och kopior glider isär. Testet kör båda
 * modulerna mot samma texter och failar så fort en regel ändrats på ena
 * sidan men inte den andra.
 */

const CV_NAMN_OVERST = `Anna Lindqvist
Sveavägen 12
114 35 Stockholm
anna.lindqvist@example.com
070-123 45 67

PROFIL
Systemutvecklare med åtta års erfarenhet av backend i Java och Kotlin.

ARBETSLIVSERFARENHET
Senior utvecklare, Klarna, 2019 till 2024`;

const CV_NAMN_EFTER_RUBRIK = `MERITFÖRTECKNING

Kontaktuppgifter
Erik Bergström
erik.bergstrom@example.se
+46 73 987 65 43
Personnummer: 850412-1234
Storgatan 5
412 50 Göteborg

KOMPETENSER
Projektledning, upphandling`;

const CV_MED_REFERENS = `Sara Ahmed
sara.ahmed@example.com

ARBETSLIVSERFARENHET
Projektledare, Ericsson, 2020 till 2024
Referens: Bengt Karlsson, 08-555 12 34, bengt.karlsson@ericsson.se
Portfolio: https://sara-ahmed.example.com`;

const TEXTS: Array<{ label: string; text: string }> = [
  { label: 'namn överst', text: CV_NAMN_OVERST },
  { label: 'namn efter rubrik', text: CV_NAMN_EFTER_RUBRIK },
  { label: 'referensperson och portfolio', text: CV_MED_REFERENS },
];

describe('paritet mellan Node- och Deno-modulen', () => {
  it('exporterar samma platshållare', () => {
    expect(deno.PLACEHOLDERS).toEqual(node.PLACEHOLDERS);
  });

  for (const { label, text } of TEXTS) {
    it(`maskForModel ger identiskt resultat: ${label}`, () => {
      const a = node.maskForModel(text);
      const b = deno.maskForModel(text);

      expect(b.text).toBe(a.text);
      expect(b.detectedName).toBe(a.detectedName);
      expect(b.warnings).toEqual(a.warnings);
      expect(b.usedSecondPass).toBe(a.usedSecondPass);
    });

    it(`maskForModel ger identiskt resultat med känt namn: ${label}`, () => {
      const known = node.detectNameInCv(text);
      const a = node.maskForModel(text, { fullName: known, maskUrls: false });
      const b = deno.maskForModel(text, { fullName: known, maskUrls: false });

      expect(b.text).toBe(a.text);
    });

    it(`detectNameInCv ger samma namn: ${label}`, () => {
      expect(deno.detectNameInCv(text)).toBe(node.detectNameInCv(text));
    });

    it(`findRemainingPii ger samma varningar: ${label}`, () => {
      const masked = node.maskForModel(text).text;
      expect(deno.findRemainingPii(masked)).toEqual(node.findRemainingPii(masked));
    });
  }
});

describe('Deno-modulen maskar faktiskt', () => {
  it('lämnar inga personuppgifter i referens-CV:t', () => {
    const { text, warnings } = deno.maskForModel(CV_MED_REFERENS);

    expect(text).not.toContain('Sara');
    expect(text).not.toContain('sara.ahmed@example.com');
    expect(text).not.toContain('bengt.karlsson@ericsson.se');
    expect(text).not.toContain('08-555 12 34');
    expect(warnings).toEqual([]);
  });

  it('behåller det yrkesmässiga innehållet', () => {
    const { text } = deno.maskForModel(CV_MED_REFERENS);
    expect(text).toContain('Projektledare');
    expect(text).toContain('Ericsson');
  });
});
