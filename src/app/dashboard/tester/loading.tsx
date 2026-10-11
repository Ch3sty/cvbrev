/**
 * Skelett för testhubben. Visas av Next.js under navigeringen, innan
 * server-komponenten hunnit läsa statistiken. Formen följer sidan: väggen,
 * sedan tre gruppaneler på golvet.
 */
import { SkeletonPage, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton';

export default function Loading() {
  return (
    <SkeletonPage>
      <div className="w-full max-w-3xl space-y-4 sm:space-y-6">
        <SkeletonBlock height={232} thread />
        <SkeletonBlock height={232} />
        <SkeletonBlock height={232} />
      </div>
    </SkeletonPage>
  );
}
