import LandingNavbar from '@/components/landing/LandingNavbar';

/**
 * Layout för alla publika sidor (besokare som inte är inloggade i dashboard).
 * Monterar LandingNavbar högst upp så alla sidor i denna route group ärver den
 * automatiskt.
 *
 * Route group `(public)` påverkar inte URL:en — src/app/(public)/funktioner/page.tsx
 * är fortfarande /funktioner.
 */
// Default för hela den publika delen: exempel, mallar, verktygssidor och
// insikter byggs alla av innehåll i repot. Ett dygn räcker, och en enskild
// sida kan sätta ett eget värde om den behöver kortare. Utan detta renderade
// varje publik sida om per besök, vilket är det som drev ISR-läsningarna och
// origin-trafiken.
export const revalidate = 86400;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNavbar />
      {children}
    </>
  );
}
