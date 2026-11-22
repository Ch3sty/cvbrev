// Samma sida som webbens app/dashboard/tester/page.tsx, i appens ram (docs/plan-app.md).
// Ritas med iAppen: kortet "Vilken tjänst gäller provet?" visas aldrig i appen (byggspec 9.14).
import { TesterHemSida } from '@/app/dashboard/tester/HemSida'

export default async function AppTesterHem({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <TesterHemSida searchParams={searchParams} iAppen />
}
