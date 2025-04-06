// app/auth/verify-email/page.tsx
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950 text-white p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-navy-900 rounded-lg text-center">
        <h1 className="text-2xl font-semibold">Bekräfta din e-postadress</h1>
        <p className="text-gray-300">
          Tack för att du registrerade dig! Vi har skickat ett e-postmeddelande till dig.
        </p>
        <p className="text-gray-300">
          Klicka på verifieringslänken i meddelandet för att aktivera ditt konto och logga in.
        </p>
        <p className="text-sm text-gray-400">
          Om du inte ser meddelandet, kontrollera din skräppostmapp.
        </p>
        <div className="pt-4">
          <Link href="/login" className="text-pink-500 hover:text-pink-400">
            Tillbaka till inloggning
          </Link>
        </div>
      </div>
    </div>
  );
}