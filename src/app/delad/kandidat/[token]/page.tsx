// Publik delningsvy för hiring managers: /delad/kandidat/[token].
// Server component utan auth. getSharedCandidate verifierar token, TTL och
// att kandidaten fortfarande är synlig, och bygger detaljen med SKAPARENS
// upplåsningsläge, så vyn aldrig visar mer än rekryteraren själv ser.
// Åtgärdsknappar finns inte här: ren läsvy.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import Logo from '@/components/Logo';
import { getSharedCandidate } from '@/lib/recruiter/shareLinks';
import ProfileSections from '@/app/rekryterare/components/profile/ProfileSections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Delad kandidatprofil | Jobbcoach.ai',
  robots: { index: false, follow: false },
};

export default async function DeladKandidatPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const shared = token ? await getSharedCandidate(token) : null;

  if (!shared) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 text-center overflow-hidden"
            style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
          >
            <div
              className="absolute top-0 inset-x-0 h-0.5"
              style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
              aria-hidden="true"
            />
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-2">Länken har upphört</h1>
            <p className="text-[13.5px] text-slate-500 leading-relaxed mb-6">
              Delningslänkar gäller i 14 dagar, och kandidaten kan när som
              helst dra tillbaka sin synlighet. Be personen som delade länken
              om en ny.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 55%, #BE185D 100%)',
              }}
            >
              Till Jobbcoach.ai
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <p className="mb-4 text-[12.5px] text-slate-500 bg-white border border-orange-100 rounded-xl px-4 py-3 leading-relaxed">
          Den här profilen har delats med dig av en rekryterare på Jobbcoach.ai.
          Uppgifterna är maskerade enligt kandidatens val, och vyn är skrivskyddad.
        </p>
        <ProfileSections candidate={shared.detail} interestStatus={null} readOnly />
        <p className="mt-6 text-[11.5px] text-slate-400 text-center leading-relaxed">
          Länken slutar gälla{' '}
          {new Intl.DateTimeFormat('sv-SE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(new Date(shared.expiresAt))}
          . Kandidaten ser exakt samma information som du.
        </p>
      </main>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-orange-50/30 flex flex-col">
      <header className="bg-white/90 border-b border-orange-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Logo variant="compact" href="/" height={30} />
          <span className="text-[11px] font-bold tracking-wide uppercase rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700">
            Delad profil
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
