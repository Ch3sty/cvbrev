// /auth/epost-bytt
// Landningen efter en följd länk i mejlen om byte av e-postadress
// (/api/konto/byt-epost, /auth/confirm). Med säkert e-postbyte måste båda
// adresserna bekräfta: ?steg=halvvags efter den första, ?steg=klart när
// adressen är bytt. Knappen går till kontot, som i appen är kontovyn.

import type { Metadata } from 'next';
import Link from 'next/link';
import { MailCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Byte av e-postadress',
  robots: { index: false, follow: false },
};

const GRADIENT = 'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)';

export default async function EpostByttPage({ searchParams }: { searchParams: Promise<{ steg?: string }> }) {
  const { steg } = await searchParams;
  const klart = steg !== 'halvvags';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl text-center border border-orange-100 shadow-[0_24px_48px_-16px_rgba(249,115,22,0.18)]">
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: GRADIENT }}>
          <MailCheck className="w-7 h-7" strokeWidth={2.2} />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">{klart ? 'Klart, adressen är bytt' : 'En bekräftelse kvar'}</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            {klart
              ? 'Från och med nu loggar du in med den nya e-postadressen.'
              : 'Tack! Vi har skickat ett mejl till den andra adressen också. Öppna länken i det, så går bytet igenom.'}
          </p>
        </div>

        {klart ? (
          <Link
            href="/dashboard/installningar"
            className="group inline-flex items-center justify-center gap-1.5 w-full px-6 py-3.5 rounded-2xl text-white font-black text-sm min-h-[52px] active:scale-[0.98] transition-all"
            style={{ background: GRADIENT, boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.4)' }}
          >
            Till ditt konto
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.8} />
          </Link>
        ) : (
          <p className="text-xs text-slate-400">Ser du inget mejl? Kontrollera skräppostmappen.</p>
        )}
      </div>
    </div>
  );
}
