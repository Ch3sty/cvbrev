// Mailen kring rekryterarkontot och kontrollen av organisationsnumret.
// Inga mail går till riktiga personer: Resend är en attrapp här. Sätt
// MEJL_RITA till en mapp så skrivs mailen dit som html för granskning.

/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDb, fakeAdmin, type FakeDb } from '@/lib/recruiter/__tests__/fakeAdmin';

const skickade: any[] = [];
vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async (m: any) => {
        skickade.push(m);
        return { data: { id: `r-${skickade.length}` }, error: null };
      },
    };
  },
}));

import {
  genereraAnsokanMejl,
  genereraGodkantMejl,
  skickaAnsokanMejl,
  skickaGodkantMejl,
} from '../rekryterarMejl';
import { luhnStammer, orgnummerFel } from '@/lib/recruiter/orgnummer';

const REK = '22222222-2222-4222-8222-222222222222';
let db: FakeDb;

function rita(namn: string, html: string) {
  const mapp = process.env.MEJL_RITA;
  if (!mapp) return;
  fs.mkdirSync(mapp, { recursive: true });
  fs.writeFileSync(path.join(mapp, namn), html, 'utf8');
}

beforeEach(() => {
  skickade.length = 0;
  process.env.RESEND_API_KEY = 'test';
  delete process.env.KONTAKT_MOTTAGARE;
  db = createFakeDb({
    email_log: [],
    profiles: [{ id: REK, email: 'rut@exempel.test', full_name: 'Rut Rekryterare' }],
    recruiter_profiles: [
      { user_id: REK, contact_name: 'Rut Rekryterare', contact_email: 'rut@exempel.test', status: 'approved' },
    ],
  });
});

describe('mailet när kontot godkänns', () => {
  it('har ägarens ämne och text, förnamnet och knappen Logga in', () => {
    const { subject, html } = genereraGodkantMejl({ userId: REK, fullName: 'Rut Rekryterare' });
    rita('godkant.html', html);
    expect(subject).toBe('Ditt rekryterarkonto är godkänt');
    expect(html).toContain('Hej Rut,');
    expect(html).toContain(
      'Ditt konto hos Jobbcoach.ai är godkänt. Du kan nu logga in och söka bland kandidater som har valt att synas.'
    );
    expect(html).toContain(
      'Profilerna är anonyma tills kandidaten tackar ja till din kontaktförfrågan. Då delas namn och kontaktuppgifter, och ni kan skriva till varandra i tjänsten.'
    );
    expect(html).toContain('>Logga in</a>');
    expect(html).toContain('/login?redirect=%2Frekryterare');
    expect(html).not.toContain('—');
  });

  it('skickas en gång, aldrig två', async () => {
    expect(await skickaGodkantMejl(fakeAdmin(db), REK)).toBe(true);
    expect(await skickaGodkantMejl(fakeAdmin(db), REK)).toBe(false);
    expect(skickade).toHaveLength(1);
    expect(skickade[0].to).toEqual(['rut@exempel.test']);
    expect(db.tables.email_log).toHaveLength(1);
    expect(db.tables.email_log[0].email_type).toBe('recruiter_approved');
  });
});

describe('mailet till oss när en ansökan kommer in', () => {
  const ansokan = {
    userId: REK,
    foretag: 'Testbolaget <AB>',
    orgnummer: '556036-0793',
    namn: 'Rut Rekryterare',
    epost: 'rut@exempel.test',
  };

  it('bär företag, organisationsnummer, namn, e-post och länken till adminen', () => {
    const { subject, html } = genereraAnsokanMejl(ansokan);
    rita('ansokan.html', html);
    expect(subject).toBe('Ny rekryteraransökan: Testbolaget <AB>');
    expect(html).toContain('Testbolaget &lt;AB&gt;');
    expect(html).toContain('556036-0793');
    expect(html).toContain('Rut Rekryterare');
    expect(html).toContain('rut@exempel.test');
    expect(html).toContain('/admin/innehall?flik=rekryterare');
  });

  it('går till supportadressen, en gång per konto', async () => {
    expect(await skickaAnsokanMejl(fakeAdmin(db), ansokan)).toBe(true);
    expect(await skickaAnsokanMejl(fakeAdmin(db), ansokan)).toBe(false);
    expect(skickade).toHaveLength(1);
    expect(skickade[0].to).toEqual(['support@jobbcoach.ai']);
  });
});

describe('organisationsnumret', () => {
  it('godtar riktiga nummer med rätt kontrollsiffra', () => {
    // Publika nummer ur Bolagsverkets register.
    expect(orgnummerFel('556074-3089')).toBeNull();
    expect(orgnummerFel('5560743089')).toBeNull();
    expect(luhnStammer('5560360793')).toBe(true);
  });

  it('stoppar fel form, fel tredje siffra, fel kontrollsiffra och exempelnumret', () => {
    expect(orgnummerFel('55667-889')).toMatch(/tio siffror/);
    expect(orgnummerFel('551234-5678')).toMatch(/tredje siffran/);
    expect(orgnummerFel('556074-3088')).toMatch(/stämmer inte/);
    expect(orgnummerFel('556677-8899')).toMatch(/exempelnummer/);
  });
});
