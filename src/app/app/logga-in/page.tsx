// Appens egen inloggning (docs/plan-app.md, avsnitt 2.5 och 3 punkt 2).
// Proxyn skriver om appens /login hit. Första start går vidare till
// onboardingen; annars inloggningen i appens design (LoggaIn.tsx).
import LoggaIn from '@/components/mobilapp/inloggning/LoggaIn';

function sakerRelativ(v: string | null): string | null {
  return v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : null;
}

export default async function LoggaInSida({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const r = typeof sp.redirect === 'string' ? sp.redirect : null;
  return <LoggaIn redirect={sakerRelativ(r)} />;
}
