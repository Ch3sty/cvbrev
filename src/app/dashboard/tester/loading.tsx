/**
 * Skelett för testhubben. Visas av Next.js under navigeringen, innan
 * server-komponenten hunnit läsa statistiken. Formen följer sidan: sidhuvud
 * med tal, sedan tre gruppaneler.
 */
import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <SkeletonPage>
        <SkeletonHero />
        <SkeletonBlock height={232} />
        <SkeletonBlock height={232} />
        <SkeletonBlock height={232} />
      </SkeletonPage>
    </div>
  );
}
