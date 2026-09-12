import { describe, expect, it } from 'vitest';
import { maskForModel, detectNameInCv, looksLikeName, PLACEHOLDERS } from '@/lib/privacy/pii';
import { extractContactLocally } from '@/lib/privacy/extractContact';

/**
 * Två uppställningar som båda förekommer i verkliga CV:n. Löftet på
 * profilsidan ("uppgifterna går aldrig till någon AI") vilar på att båda
 * maskas innan texten lämnar vår server, så testet bevakar just det.
 */

/** Fall 1: namnet överst, kontaktraden direkt under. */
const CV_NAMN_OVERST = `Anna Lindqvist
Sveavägen 12
114 35 Stockholm
anna.lindqvist@example.com
070-123 45 67

PROFIL
Systemutvecklare med åtta års erfarenhet av backend i Java och Kotlin.

ARBETSLIVSERFARENHET
Senior utvecklare, Klarna, 2019 till 2024
Byggde betaltjänster som hanterade 40 000 transaktioner per dygn.

UTBILDNING
Civilingenjör datateknik, KTH, 2011 till 2016`;

/** Fall 2: rubrik först, namnet längre ned, personnummer med. */
const CV_NAMN_EFTER_RUBRIK = `MERITFÖRTECKNING

Kontaktuppgifter
Erik Bergström
erik.bergstrom@example.se
+46 73 987 65 43
Personnummer: 850412-1234
Storgatan 5
412 50 Göteborg

KOMPETENSER
Projektledning, upphandling, Agila metoder

ARBETSLIVSERFARENHET
Projektledare, Volvo Cars, 2018 till 2024`;

describe('looksLikeName', () => {
  it('godkänner tvåordiga och treordiga namn', () => {
    expect(looksLikeName('Anna Lindqvist')).toBe(true);
    expect(looksLikeName('Erik Bergström')).toBe(true);
    expect(looksLikeName('Anna-Lena Nord Svensson')).toBe(true);
  });

  it('avvisar rubriker, titlar med siffror och kontaktrader', () => {
    expect(looksLikeName('MERITFÖRTECKNING')).toBe(false);
    expect(looksLikeName('Kontaktuppgifter')).toBe(false);
    expect(looksLikeName('Storgatan 5')).toBe(false);
    expect(looksLikeName('anna.lindqvist@example.com')).toBe(false);
    // Ett ord räcker inte, och hela meningar ska inte fångas.
    expect(looksLikeName('Anna')).toBe(false);
    expect(looksLikeName('Systemutvecklare med lång erfarenhet av backend')).toBe(false);
  });
});

describe('detectNameInCv', () => {
  it('hittar namnet när det står överst', () => {
    expect(detectNameInCv(CV_NAMN_OVERST)).toBe('Anna Lindqvist');
  });

  it('hittar namnet när det står efter en rubrik', () => {
    expect(detectNameInCv(CV_NAMN_EFTER_RUBRIK)).toBe('Erik Bergström');
  });
});

describe('maskForModel', () => {
  it('maskar alla personuppgifter i CV med namnet överst', () => {
    const { text, warnings } = maskForModel(CV_NAMN_OVERST);

    expect(text).not.toContain('Anna');
    expect(text).not.toContain('Lindqvist');
    expect(text).not.toContain('anna.lindqvist@example.com');
    expect(text).not.toContain('070-123 45 67');
    expect(text).not.toContain('Sveavägen 12');
    expect(warnings).toEqual([]);
  });

  it('maskar alla personuppgifter i CV med namnet efter rubrik', () => {
    const { text, warnings } = maskForModel(CV_NAMN_EFTER_RUBRIK);

    expect(text).not.toContain('Erik');
    expect(text).not.toContain('Bergström');
    expect(text).not.toContain('erik.bergstrom@example.se');
    expect(text).not.toContain('+46 73 987 65 43');
    expect(text).not.toContain('850412-1234');
    expect(warnings).toEqual([]);
  });

  it('behåller det yrkesmässiga innehållet intakt', () => {
    const { text } = maskForModel(CV_NAMN_OVERST);

    expect(text).toContain('Systemutvecklare');
    expect(text).toContain('Klarna');
    expect(text).toContain('40 000 transaktioner');
    expect(text).toContain('Civilingenjör datateknik');
    expect(text).toContain('KTH');
  });

  it('sätter stabila platshållare så modellen ser att fälten finns', () => {
    const { text } = maskForModel(CV_NAMN_OVERST);

    expect(text).toContain(PLACEHOLDERS.name);
    expect(text).toContain(PLACEHOLDERS.email);
    expect(text).toContain(PLACEHOLDERS.phone);
  });

  it('använder profilens namn när det är känt', () => {
    const { text } = maskForModel('Kontakta Sven Persson för referens.', {
      fullName: 'Sven Persson',
    });

    expect(text).not.toContain('Sven');
    expect(text).toContain(PLACEHOLDERS.name);
  });

  it('är idempotent: en andra körning ändrar ingenting', () => {
    const once = maskForModel(CV_NAMN_EFTER_RUBRIK).text;
    const twice = maskForModel(once).text;
    expect(twice).toBe(once);
  });

  it('lämnar aldrig tillbaka originaltexten när något maskerats', () => {
    const { text } = maskForModel(CV_NAMN_OVERST);
    expect(text).not.toBe(CV_NAMN_OVERST);
  });
});

describe('extractContactLocally', () => {
  it('plockar ut kontaktuppgifter ur CV med namnet överst', () => {
    const contact = extractContactLocally(CV_NAMN_OVERST);

    expect(contact.fullName).toBe('Anna Lindqvist');
    expect(contact.email).toBe('anna.lindqvist@example.com');
    expect(contact.phone).toBe('070-123 45 67');
    expect(contact.address).toBe('Sveavägen 12');
    expect(contact.postalCode).toBe('114 35');
    expect(contact.city).toBe('Stockholm');
  });

  it('plockar ut kontaktuppgifter ur CV med namnet efter rubrik', () => {
    const contact = extractContactLocally(CV_NAMN_EFTER_RUBRIK);

    expect(contact.fullName).toBe('Erik Bergström');
    expect(contact.email).toBe('erik.bergstrom@example.se');
    expect(contact.phone).toBe('+46 73 987 65 43');
    expect(contact.address).toBe('Storgatan 5');
    expect(contact.city).toBe('Göteborg');
  });

  it('ger tomma strängar i stället för att kasta när inget finns', () => {
    const contact = extractContactLocally('ARBETSLIVSERFARENHET\nUtvecklare, 2020 till 2024');

    expect(contact.fullName).toBe('');
    expect(contact.email).toBe('');
    expect(contact.phone).toBe('');
  });
});
