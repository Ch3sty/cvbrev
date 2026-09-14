/**
 * Laddningen for /admin/innehall.
 *
 * LoadingSkeleton, aldrig animate-pulse: skelettblocken star stilla och bara
 * traden ror sig (docs/designsystem.md, Tillstand). Skelettet har samma form
 * som sidan, alltsa en kortrad och en lista, sa att inget hoppar nar riktiga
 * rader kommer in.
 */

import LoadingSkeleton from '@/components/shell/LoadingSkeleton';

export default function InnehallLaddar() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton variant="text" count={2} />
      <LoadingSkeleton variant="card" count={4} />
      <LoadingSkeleton variant="list" count={8} label="Innehållet hämtas" />
    </div>
  );
}
