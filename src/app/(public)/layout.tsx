import LandingNavbar from '@/components/landing/LandingNavbar';

/**
 * Layout för alla publika sidor (besokare som inte är inloggade i dashboard).
 * Monterar LandingNavbar högst upp så alla sidor i denna route group ärver den
 * automatiskt.
 *
 * Route group `(public)` påverkar inte URL:en — src/app/(public)/funktioner/page.tsx
 * är fortfarande /funktioner.
 */
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
