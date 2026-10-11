import Vagg from '@/components/rum/Vagg';
import Topprad from '@/components/rum/Topprad';
import Lagesrad from '@/components/rum/Lagesrad';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';

/** Alla tester laddar: väggen står med lägesraden, inget hoppar. */
export default function Loading() {
  return (
    <Vagg tat>
      <Topprad lagen={<Lagesrad aktiv="alla" plats="topprad" />} />
      <Lagesrad aktiv="alla" />
      <LoadingSkeleton variant="vagg" label="Laddar" />
    </Vagg>
  );
}
