import { redirect } from 'next/navigation'

// Legacy-route: redirectas permanent till motsvarande dashboard-sida.
export default function Page() {
  redirect('/dashboard/skapa-brev')
}
