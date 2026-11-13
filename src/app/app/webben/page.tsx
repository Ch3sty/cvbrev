import Link from 'next/link';

/**
 * Det som inte finns i appen (CV, brev, jobbmatchning, webbens priser).
 * Provisorisk text tills appens design är godkänd (docs/plan-app.md).
 */
export default function BaraPaWebben() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-ink">Det här finns på jobbcoach.ai</h1>
      <p className="max-w-sm text-sm text-ink-2">
        Appen innehåller rekryteringstesterna. CV, personliga brev och jobbmatchning når du på
        jobbcoach.ai med samma konto.
      </p>
      <Link
        href="/dashboard/tester"
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-5 text-sm font-medium text-papper"
      >
        Till testerna
      </Link>
    </div>
  );
}
