/**
 * Panelen "Så söker vi åt dig" ska visa alla fyra inställningarna.
 *
 * Förut ritades distans bara när den var påslagen och omfattning bara när den
 * var heltid eller deltid. Ett konto utan dem såg bara ort och lön, och kunde
 * tro att panelen inte kände till resten. Testet skyddar mot att chipsen
 * tystnar igen när ett värde är frånvalt.
 *
 * Här testas också klockan bakom "Senast sökt ...", som avgör om en sparad
 * sökning presenteras som sparad eller som färsk.
 */

import { describe, it, expect } from 'vitest';
import {
  jobPreferenceChips,
  jobPreferenceLocationChipCount,
} from '@/components/jobbmatchning/JobPreferencesFields';
import { senastSoktLabel } from '../match-reasons';
import { EMPTY_JOB_PREFERENCES, type JobPreferences } from '@/types/user.types';

const prefs = (over: Partial<JobPreferences> = {}): JobPreferences => ({
  ...EMPTY_JOB_PREFERENCES,
  ...over,
});

describe('jobPreferenceChips', () => {
  it('visar fyra chips även när ingenting är valt', () => {
    const chips = jobPreferenceChips(prefs());
    expect(chips).toEqual([
      'Ingen ort vald',
      'Distans: nej',
      'Omfattning: alla',
      'Lön: ej satt',
    ]);
  });

  it('säger nej och alla i stället för att utelämna chipset', () => {
    const chips = jobPreferenceChips(
      prefs({ locations: ['Stockholm'], remote: false, extent: '' })
    );
    expect(chips).toContain('Distans: nej');
    expect(chips).toContain('Omfattning: alla');
  });

  it('skriver ut de valda värdena', () => {
    const chips = jobPreferenceChips(
      prefs({
        locations: ['Göteborg'],
        remote: true,
        extent: 'deltid',
        min_salary: 32000,
      })
    );
    expect(chips).toEqual([
      'Göteborg',
      'Distans: ja',
      'Omfattning: deltid',
      'Lön: satt',
    ]);
  });

  it('avslöjar aldrig lönebeloppet', () => {
    const chips = jobPreferenceChips(prefs({ min_salary: 45000 }));
    expect(chips.join(' ')).not.toContain('45000');
  });

  it('behåller alla orter och räknar dem rätt', () => {
    const p = prefs({ locations: ['Stockholm', 'Uppsala', 'Västerås'] });
    const chips = jobPreferenceChips(p);
    expect(jobPreferenceLocationChipCount(p)).toBe(3);
    // Att klippa bort ortschipsen ska lämna exakt de tre övriga kvar.
    expect(chips.slice(jobPreferenceLocationChipCount(p))).toEqual([
      'Distans: nej',
      'Omfattning: alla',
      'Lön: ej satt',
    ]);
  });

  it('räknar platshållaren som ett ortschip', () => {
    expect(jobPreferenceLocationChipCount(prefs())).toBe(1);
  });
});

describe('senastSoktLabel', () => {
  const nu = new Date('2026-09-14T12:00:00Z').getTime();

  it('svarar null utan sparad sökning', () => {
    expect(senastSoktLabel(null, nu)).toBeNull();
    expect(senastSoktLabel(undefined, nu)).toBeNull();
  });

  it('räknar i minuter och timmar, inte i dagar', () => {
    expect(senastSoktLabel(nu - 30_000, nu)).toBe('nyss');
    expect(senastSoktLabel(nu - 60_000, nu)).toBe('för en minut sedan');
    expect(senastSoktLabel(nu - 20 * 60_000, nu)).toBe('för 20 minuter sedan');
    expect(senastSoktLabel(nu - 60 * 60_000, nu)).toBe('för en timme sedan');
    expect(senastSoktLabel(nu - 2 * 3_600_000, nu)).toBe('för 2 timmar sedan');
  });

  it('slutar räkna timmar efter ett dygn', () => {
    expect(senastSoktLabel(nu - 25 * 3_600_000, nu)).toBe(
      'för mer än ett dygn sedan'
    );
  });
});
