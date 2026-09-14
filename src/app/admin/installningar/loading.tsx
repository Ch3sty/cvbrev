/**
 * Laddningen for /admin/installningar.
 *
 * Samma form som sidan: en kortrad och tre listblock. LoadingSkeleton, aldrig
 * animate-pulse (docs/designsystem.md, Tillstand).
 */

import LoadingSkeleton from '@/components/shell/LoadingSkeleton';

export default function InstallningarLaddar() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton variant="text" count={2} />
      <LoadingSkeleton variant="card" count={4} />
      <LoadingSkeleton variant="list" count={6} label="Inställningarna hämtas" />
    </div>
  );
}
