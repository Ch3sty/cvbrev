/**
 * Datumcellerna pa Innehall (spec-admin-tydlighet 2026-09-22, sida 7 till 10).
 *
 * Ett streck i en datumcell laser som "trasigt". Ett saknat datum ar
 * "aldrig" som standard, eller den orsak anroparen skickar med.
 */

import { describe, it, expect } from 'vitest';
import { byggUrl, datum, datumtid } from '../Delar';

describe('datum och datumtid', () => {
  it('skriver aldrig ett streck for ett saknat datum', () => {
    expect(datum(null)).toBe('aldrig');
    expect(datum(undefined)).toBe('aldrig');
    expect(datumtid(null)).toBe('aldrig');
    expect(datum('inte ett datum')).toBe('okänt datum');
    expect(datumtid('inte ett datum')).toBe('okänt datum');
  });

  it('tar anroparens orsak nar matningen borjade senare', () => {
    expect(datum(null, 'okänt, före 12 sep')).toBe('okänt, före 12 sep');
  });

  it('formaterar ett riktigt datum', () => {
    expect(datum('2026-09-14T13:44:22Z')).toMatch(/14 sep\.? 2026/);
    expect(datumtid('2026-09-14T13:44:22Z')).toMatch(/14 sep/);
  });
});

describe('byggUrl', () => {
  it('hoppar over tomma parametrar', () => {
    expect(byggUrl('/admin/innehall', { flik: 'cv', sok: '', sida: undefined })).toBe(
      '/admin/innehall?flik=cv'
    );
  });
});
