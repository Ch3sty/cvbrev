// Ägarbeslut 2026-11-22: före kandidatens ja skickas ingen fritext ur CV:t
// till rekryterarens webbläsare. Testet bygger en kandidat med en unik sträng
// i varje fritextfält och går igenom varje väg där kandidatuppgifter når en
// rekryterare. Före ja: ingen av strängarna i det serialiserade svaret.
// Efter ja: det samtycket säger (arbetsgivare, beskrivningar, lärosäte, namn
// och e-post) finns med, resten aldrig.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createFakeDb, fakeAdmin, type FakeDb } from './fakeAdmin';
import { __resetPublicIdState } from '../candidateAccess';

const KAND = '11111111-1111-4111-8111-111111111111';
const REK = '22222222-2222-4222-8222-222222222222';
const CV = '33333333-3333-4333-8333-333333333333';
const PROJEKT = '44444444-4444-4444-8444-444444444444';
/** Kandidatens id mot rekryterare (candidate_profiles.public_id). */
const PUBLIK = '55555555-5555-4555-8555-555555555555';

const PROFILKOLUMNER = [
  'user_id', 'public_id', 'cv_id', 'visibility', 'show_personality', 'show_full_workstyle',
  'context_tags', 'availability', 'workplace', 'extent', 'employment_types', 'regions',
  'drivers_license', 'salary_min', 'salary_max', 'pitch', 'consent_given_at', 'created_at',
  'updated_at',
];

let db: FakeDb;

vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => fakeAdmin(db) }));
vi.mock('@/lib/recruiter/auth', () => ({
  requireApprovedRecruiter: async () => ({
    ok: true,
    ctx: {
      user: { id: REK },
      recruiter: { user_id: REK, company_name: 'Rekryteringsbolaget', contact_name: 'Rut', status: 'approved' },
    },
  }),
}));
vi.mock('@/lib/recruiter/profileViews', () => ({ logProfileView: async () => undefined }));
vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => undefined }) }));
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: KAND } }, error: null }) },
  }),
}));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: async () => ({ data: { id: 'x' }, error: null }) };
  },
}));

/** Fält som ALDRIG får nå en rekryterare, varken före eller efter ja. */
const ALDRIG = [
  'KANNETECKEN_SAMMANFATTNING',
  'KANNETECKEN_CVNAMN',
  'kannetecken-cvepost@exempel.test',
  'KANNETECKEN_TELEFON',
  'KANNETECKEN_ADRESS',
  'KANNETECKEN_LANK',
  'KANNETECKEN_PROJEKT',
  'KANNETECKEN_REFERENS',
  'KANNETECKEN_FOTO',
  '45123',
  '55123',
];
/** Fält som hålls inne till kandidatens ja. */
const EFTER_JA = [
  'KANNETECKEN_ARBETSGIVARE_A',
  'KANNETECKEN_ARBETSGIVARE_B',
  'KANNETECKEN_BESKRIVNING_A',
  'KANNETECKEN_BESKRIVNING_B',
  'KANNETECKEN_LAROSATE',
  'KANNETECKEN_KONTONAMN',
];
const KONTOEPOST = 'kannetecken-konto@exempel.test';

function byggDb(intresse: 'inget' | 'pending' | 'accepted' | 'declined' = 'inget') {
  __resetPublicIdState();
  db = createFakeDb({
    candidate_profiles: [
      {
        user_id: KAND,
        public_id: PUBLIK,
        cv_id: CV,
        visibility: 'anonymous',
        show_personality: false,
        show_full_workstyle: false,
        context_tags: [],
        availability: 'one_month',
        workplace: ['hybrid'],
        extent: ['full_time'],
        employment_types: ['permanent'],
        regions: ['Västmanlands län'],
        drivers_license: true,
        salary_min: 45123,
        salary_max: 55123,
        pitch: 'Jag leder byggen från spade till nyckel.',
        consent_given_at: '2026-11-22T10:00:00.000Z',
        created_at: '2026-11-22T10:00:00.000Z',
        updated_at: '2026-11-22T10:00:00.000Z',
      },
    ],
    cv_texts: [
      {
        id: CV,
        user_id: KAND,
        updated_at: '2026-11-22T09:00:00.000Z',
        file_name: 'KANNETECKEN_CVNAMN-cv.pdf',
        structured_data: {
          personalInfo: {
            name: 'KANNETECKEN_CVNAMN',
            email: 'kannetecken-cvepost@exempel.test',
            phone: 'KANNETECKEN_TELEFON',
            address: 'KANNETECKEN_ADRESS',
            linkedin: 'https://example.test/KANNETECKEN_LANK',
            photo: 'KANNETECKEN_FOTO',
          },
          summary: 'KANNETECKEN_SAMMANFATTNING',
          experience: [
            {
              position: 'Projektledare',
              company: 'KANNETECKEN_ARBETSGIVARE_A',
              startDate: '2019-03',
              endDate: '',
              description: 'Ledde ombyggnaden för KANNETECKEN_BESKRIVNING_A.',
            },
            {
              position: 'Arbetsledare',
              company: 'KANNETECKEN_ARBETSGIVARE_B',
              startDate: '2015-01',
              endDate: '2019-02',
              description: ['Nära platschefen på KANNETECKEN_BESKRIVNING_B'],
            },
          ],
          education: [
            {
              institution: 'KANNETECKEN_LAROSATE',
              degree: 'Högskoleingenjör',
              field: 'byggteknik',
              graduationYear: '2014',
            },
          ],
          projects: [{ name: 'KANNETECKEN_PROJEKT', description: 'KANNETECKEN_PROJEKT' }],
          references: [{ name: 'KANNETECKEN_REFERENS', phone: 'KANNETECKEN_TELEFON' }],
          skills: ['Projektledning', 'Byggledning', 'AMA Anläggning'],
          languages: [{ language: 'Svenska', proficiency: 'Modersmål' }],
        },
      },
    ],
    active_cv_for_matching: [
      {
        user_id: KAND,
        cv_id: CV,
        parsed_at: '2026-11-22T09:00:00.000Z',
        extracted_skills: ['Projektledning', 'Byggledning'],
        extracted_occupations: [{ original: 'Projektledare', normalized: 'Projektledare' }],
      },
    ],
    profiles: [
      { id: KAND, full_name: 'KANNETECKEN_KONTONAMN', email: KONTOEPOST, quota_emails_opt_out: false },
      { id: REK, full_name: 'Rut Rekryterare', email: 'rut@exempel.test', quota_emails_opt_out: true },
    ],
    candidate_interests:
      intresse === 'inget'
        ? []
        : [
            {
              id: 'intresse-1',
              recruiter_user_id: REK,
              candidate_user_id: KAND,
              status: intresse,
              message: null,
              created_at: '2026-11-22T11:00:00.000Z',
              responded_at: null,
            },
          ],
    recruiter_projects: [
      { id: PROJEKT, recruiter_user_id: REK, name: 'Platschefer', created_at: 'x', updated_at: 'x' },
    ],
    recruiter_project_candidates: [
      { project_id: PROJEKT, candidate_user_id: KAND, status: 'ny', added_at: '2026-11-22T12:00:00.000Z' },
    ],
    recruiter_share_links: [
      {
        token: 'delad-token-123',
        recruiter_user_id: REK,
        candidate_user_id: KAND,
        expires_at: '2099-01-01T00:00:00.000Z',
        revoked_at: null,
      },
    ],
    recruiter_candidate_notes: [],
    logic_test_v4_sessions: [],
    user_personality_profile: [],
    message_threads: [],
    interest_messages: [],
    interest_thread_reads: [],
    notifications: [],
    email_log: [],
  }, { candidate_profiles: PROFILKOLUMNER });
}

/** Läget innan migreringen är körd: kolumnen public_id finns inte. */
function utanKolumnen() {
  __resetPublicIdState();
  db.schema.candidate_profiles = PROFILKOLUMNER.filter((k) => k !== 'public_id');
  for (const r of db.tables.candidate_profiles) delete r.public_id;
}

function utan(text: string, strangar: string[]) {
  for (const s of strangar) expect(text, `"${s}" fanns i svaret`).not.toContain(s);
}
function med(text: string, strangar: string[]) {
  for (const s of strangar) expect(text, `"${s}" saknades i svaret`).toContain(s);
}

async function json(res: Response): Promise<string> {
  expect(res.status).toBe(200);
  return JSON.stringify(await res.json());
}

async function poolen() {
  const { GET } = await import('@/app/api/recruiter/pool/route');
  return json(await GET(new NextRequest('http://localhost/api/recruiter/pool')));
}
async function sokning(q: string) {
  const { GET } = await import('@/app/api/recruiter/pool/route');
  return json(await GET(new NextRequest(`http://localhost/api/recruiter/pool?q=${encodeURIComponent(q)}`)));
}
async function detaljen(ref: string) {
  const { GET } = await import('@/app/api/recruiter/candidate/[candidateId]/route');
  return GET(new NextRequest(`http://localhost/api/recruiter/candidate/${ref}`), {
    params: Promise.resolve({ candidateId: ref }),
  });
}
async function inkorgen() {
  const { GET } = await import('@/app/api/recruiter/interests/route');
  return json(await GET());
}
async function projektet() {
  const { GET } = await import('@/app/api/recruiter/projects/[projectId]/route');
  return json(
    await GET(new NextRequest(`http://localhost/api/recruiter/projects/${PROJEKT}`), {
      params: Promise.resolve({ projectId: PROJEKT }),
    })
  );
}
async function delningen() {
  const { getSharedCandidate } = await import('@/lib/recruiter/shareLinks');
  return JSON.stringify(await getSharedCandidate('delad-token-123'));
}
async function bevakningsmejlet() {
  const { runPoolSearch } = await import('@/lib/recruiter/poolSearch');
  const { generateSavedSearchAlertEmail } = await import('@/lib/email/saved-search-alert');
  const { candidates } = await runPoolSearch(fakeAdmin(db), { q: 'projektledare' });
  // Samma fält som cronen i api/cron/pricing-sync lägger i mejlet.
  const mejl = generateSavedSearchAlertEmail({
    searchName: 'Projektledare',
    searchId: 's1',
    total: candidates.length,
    candidates: candidates.map((c) => ({
      role: c.role ?? 'Kandidat',
      region: c.regions[0] ?? null,
      years: c.yearsOfExperience,
      topBadge: c.testBadges[0]?.label ?? null,
    })),
  });
  return mejl.subject + mejl.html;
}
async function anteckningen() {
  const { PUT, GET } = await import('@/app/api/recruiter/notes/route');
  await PUT(
    new NextRequest('http://localhost/api/recruiter/notes', {
      method: 'PUT',
      body: JSON.stringify({ candidateId: PUBLIK, note: 'Ring på måndag' }),
    })
  );
  return json(await GET(new NextRequest(`http://localhost/api/recruiter/notes?candidateId=${PUBLIK}`)));
}

describe('före kandidatens ja: ingen fritext ur CV:t', () => {
  beforeEach(() => byggDb('pending'));

  it('poolen och sökningen', async () => {
    const svar = (await poolen()) + (await sokning('projektledare'));
    expect(svar).toContain('Projektledare');
    utan(svar, [...ALDRIG, ...EFTER_JA, KONTOEPOST, '2019-03', KAND]);
    expect(svar).toContain(PUBLIK);
  });

  it('detaljsidan (också förhandspanelen och jämförelsen, samma rutt)', async () => {
    const svar = await json(await detaljen(PUBLIK));
    utan(svar, [...ALDRIG, ...EFTER_JA, KONTOEPOST, '2019-03', '2015-01', '2014', KAND]);
    const { candidate } = JSON.parse(svar);
    // Titel och längd i år, inga datum.
    expect(candidate.experience.map((e: any) => [e.position, e.period])).toEqual([
      ['Projektledare', expect.stringMatching(/^\d+ år$/)],
      ['Arbetsledare', '4 år'],
    ]);
    expect(candidate.experience.every((e: any) => e.descriptionHidden && e.company === null)).toBe(true);
    expect(candidate.education).toEqual([
      { school: null, degree: 'Högskoleingenjör, byggteknik', year: null, schoolHidden: true },
    ]);
    expect(candidate.languages).toEqual(['Svenska (modersmål)']);
  });

  it('inkorgen', async () => {
    utan(await inkorgen(), [...ALDRIG, ...EFTER_JA, KONTOEPOST, KAND]);
  });

  it('projektet', async () => {
    utan(await projektet(), [...ALDRIG, ...EFTER_JA, KONTOEPOST, KAND]);
  });

  it('delningslänken', async () => {
    utan(await delningen(), [...ALDRIG, ...EFTER_JA, KONTOEPOST, '2019-03', KAND]);
  });

  it('sparade sökningar och bevakningsmejlet', async () => {
    utan(await bevakningsmejlet(), [...ALDRIG, ...EFTER_JA, KONTOEPOST]);
  });

  it('anteckningen', async () => {
    utan(await anteckningen(), [...ALDRIG, ...EFTER_JA, KONTOEPOST]);
  });
});

describe('efter kandidatens ja: det samtycket säger', () => {
  beforeEach(() => byggDb('accepted'));

  it('detaljsidan visar arbetsgivare, beskrivningar, lärosäte, namn och e-post', async () => {
    const svar = await json(await detaljen(PUBLIK));
    med(svar, [...EFTER_JA, KONTOEPOST, '2019-03']);
    utan(svar, ALDRIG);
  });

  it('delningslänken visar som rekryteraren, men aldrig e-posten', async () => {
    const svar = await delningen();
    med(svar, EFTER_JA);
    utan(svar, [...ALDRIG, KONTOEPOST]);
  });

  it('korten (pool, inkorg, projekt, mejl) bär aldrig CV-fritext, inte heller efter ja', async () => {
    const svar = (await poolen()) + (await inkorgen()) + (await projektet()) + (await bevakningsmejlet());
    utan(svar, [...ALDRIG, ...EFTER_JA, KONTOEPOST]);
  });
});

describe('öppen profil: arbetsgivare och namn utan ja, e-post aldrig utan ja', () => {
  beforeEach(() => {
    byggDb('inget');
    db.tables.candidate_profiles[0].visibility = 'open';
  });

  it('detaljsidan', async () => {
    const svar = await json(await detaljen(PUBLIK));
    med(svar, EFTER_JA);
    utan(svar, [...ALDRIG, KONTOEPOST]);
  });
});

describe('notiser och mejl till rekryteraren när kandidaten svarar', () => {
  async function svara(action: 'accept' | 'decline') {
    const { POST } = await import('@/app/api/candidate/interests/respond/route');
    const res = await POST(
      new Request('http://localhost/api/candidate/interests/respond', {
        method: 'POST',
        body: JSON.stringify({ interestId: 'intresse-1', action }),
      })
    );
    expect(res.status).toBe(200);
    return JSON.stringify(db.inserts.filter((i) => i.table === 'notifications'));
  }

  it('nej: notisen bär inget namn och ingen CV-text', async () => {
    byggDb('pending');
    utan(await svara('decline'), [...ALDRIG, ...EFTER_JA, KONTOEPOST]);
  });

  it('ja: notisen bär namnet, aldrig CV-text', async () => {
    byggDb('pending');
    const notis = await svara('accept');
    med(notis, ['KANNETECKEN_KONTONAMN']);
    utan(notis, [...ALDRIG, KONTOEPOST, 'KANNETECKEN_BESKRIVNING_A', 'KANNETECKEN_LAROSATE']);
  });
});

describe('kontots id når aldrig rekryteraren', () => {
  beforeEach(() => byggDb('accepted'));

  it('ett gammalt id (kontots) ger 404, inte en omdirigering', async () => {
    const res = await detaljen(KAND);
    expect(res.status).toBe(404);
    expect(res.headers.get('location')).toBeNull();
  });

  it('efter ja: inget av svaren bär kontots id', async () => {
    const svar = (await poolen()) + (await json(await detaljen(PUBLIK))) + (await inkorgen()) + (await projektet()) + (await delningen());
    utan(svar, [KAND]);
  });

  it('intresse, anteckning och projekt tar kandidatens id mot rekryterare, inte kontots', async () => {
    const { POST } = await import('@/app/api/recruiter/interest/route');
    const gammalt = await POST(new NextRequest('http://localhost/api/recruiter/interest', { method: 'POST', body: JSON.stringify({ candidateId: KAND }) }));
    expect(gammalt.status).toBe(404);
    const { POST: lagg } = await import('@/app/api/recruiter/projects/[projectId]/candidates/route');
    const med = await lagg(new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify({ candidateId: PUBLIK }) }), { params: Promise.resolve({ projectId: PROJEKT }) });
    expect(JSON.stringify(await med.json())).not.toContain(KAND);
  });

  it('innan migreringen är körd används kontots id som förut', async () => {
    utanKolumnen();
    const res = await detaljen(KAND);
    expect(res.status).toBe(200);
    const kort = JSON.parse(await poolen()).candidates;
    expect(kort[0].candidateId).toBe(KAND);
  });
});

describe('poolen visar aldrig en profil utan CV och yrkesroll', () => {
  beforeEach(() => byggDb('inget'));

  it('synlig rad utan valt CV: inte i poolen, detaljen ger 404', async () => {
    db.tables.candidate_profiles[0].cv_id = null;
    expect(JSON.parse(await poolen()).candidates).toEqual([]);
    expect((await detaljen(PUBLIK)).status).toBe(404);
    expect(JSON.parse(await inkorgen()).interests).toEqual([]);
  });

  it('CV utan yrkesroll: inte i poolen, detaljen ger 404', async () => {
    db.tables.active_cv_for_matching = [];
    const sd = db.tables.cv_texts[0].structured_data;
    sd.experience = sd.experience.map((e: any) => ({ ...e, position: '' }));
    expect(JSON.parse(await poolen()).candidates).toEqual([]);
    expect((await detaljen(PUBLIK)).status).toBe(404);
  });

  it('med CV och yrkesroll syns profilen', async () => {
    expect(JSON.parse(await poolen()).candidates).toHaveLength(1);
  });
});

describe('testens placering visas bara över mitten', () => {
  /** 100 andra sessioner med poäng 0..99, och kandidatens egen. */
  function medVerbalt(poang: number) {
    byggDb('inget');
    const andra = Array.from({ length: 100 }, (_, i) => ({
      user_id: `annan-${i}`,
      test_type: 'verbal-resonemang',
      score: i,
      completed_at: '2026-11-01T10:00:00.000Z',
      meta: null,
    }));
    db.tables.logic_test_v4_sessions = [
      ...andra,
      { user_id: KAND, test_type: 'verbal-resonemang', score: poang, completed_at: '2026-11-20T10:00:00.000Z', meta: null },
    ];
  }

  it('percentil 36: bara att testet är genomfört, inget tal någonstans', async () => {
    medVerbalt(36);
    const svar = (await poolen()) + (await json(await detaljen(PUBLIK)));
    expect(svar).toContain('Verbalt · Grundnivå');
    expect(svar).not.toMatch(/topp \d+ %|Topp \d+ %/);
    const kort = JSON.parse(await poolen()).candidates[0];
    expect(kort.testBadges[0]).toMatchObject({ percentile: null, sampleSize: null, label: 'Verbalt · Grundnivå' });
    expect(JSON.stringify(kort.matchReasons)).not.toMatch(/Topp/);
  });

  it('percentil 36 går inte att utläsa med filtret topp 70 %', async () => {
    medVerbalt(36);
    const { GET } = await import('@/app/api/recruiter/pool/route');
    const res = await GET(new NextRequest('http://localhost/api/recruiter/pool?minPercentile=30'));
    expect((await res.json()).candidates).toEqual([]);
  });

  it('percentil 80: placeringen visas', async () => {
    medVerbalt(80);
    const kort = JSON.parse(await poolen()).candidates[0];
    expect(kort.testBadges[0].label).toBe('Verbalt · Grundnivå · topp 21 %');
  });

  it('percentil 50 är topp 50 % och visas', async () => {
    medVerbalt(50);
    const kort = JSON.parse(await poolen()).candidates[0];
    expect(kort.testBadges[0].label).toBe('Verbalt · Grundnivå · topp 50 %');
  });
});

describe('personlighetsdelen följer kandidatens eget kryss', () => {
  function medPersonlighet(visa: boolean) {
    byggDb('accepted');
    db.tables.candidate_profiles[0].show_personality = visa;
    db.tables.user_personality_profile = [
      {
        user_id: KAND,
        openness: 58,
        conscientiousness: 81,
        extraversion: 47,
        agreeableness: 72,
        neuroticism: 35,
        facet_scores: null,
        updated_at: '2026-11-20T10:00:00.000Z',
      },
    ];
  }

  it('tom ruta: inget om personligheten når rekryteraren, inte ens efter ja', async () => {
    medPersonlighet(false);
    const svar = (await poolen()) + (await json(await detaljen(PUBLIK))) + (await delningen());
    utan(svar, ['Strukturerad', 'Samarbetsvillig']);
    const { candidate } = JSON.parse(await json(await detaljen(PUBLIK)));
    expect(candidate).toMatchObject({ personalityStrengths: [], workStyle: null, workStyleReport: null, personalityTestedAt: null });
  });

  it('kryssad ruta: styrkorna i ord, aldrig råvärden', async () => {
    medPersonlighet(true);
    const svar = (await poolen()) + (await json(await detaljen(PUBLIK)));
    med(svar, ['Strukturerad', 'Samarbetsvillig']);
    expect(svar).not.toMatch(/conscientiousness|neuroticism|"81"|:81\b/);
  });
});
