import { redirect } from 'next/navigation'

// Legacy-route: redirectas permanent till dashboard CV-listan.
export default function Page() {
  redirect('/dashboard/profil/cv')
}
