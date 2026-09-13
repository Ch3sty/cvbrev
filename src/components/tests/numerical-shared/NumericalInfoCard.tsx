'use client';

/**
 * Vad det numeriska testet är, innan man startar. En panel med löptext och en
 * lista över de fem områdena. Naken ikon 24 i ink-2 per rad, inga färgade kort.
 */

import {
  TableTopicIcon,
  ChartTopicIcon,
  SeriesTopicIcon,
  WordProblemTopicIcon,
  ConversionTopicIcon,
} from './illustrations/NumericalIcons';

interface NumericalInfoCardProps {
  variant: 'v1' | 'v2' | 'expert';
}

const TYPES = [
  {
    icon: TableTopicIcon,
    label: 'Tabeller',
    desc: 'Läs ut värden, beräkna totaler och tillväxt.',
  },
  {
    icon: ChartTopicIcon,
    label: 'Grafer',
    desc: 'Tolka stapel-, cirkel- och linjediagram.',
  },
  {
    icon: SeriesTopicIcon,
    label: 'Talserier',
    desc: 'Hitta mönstret och nästa tal.',
  },
  {
    icon: WordProblemTopicIcon,
    label: 'Lästal',
    desc: 'Lös problem med text och siffror.',
  },
  {
    icon: ConversionTopicIcon,
    label: 'Konvertering',
    desc: 'Procent, valuta, enheter och moms.',
  },
];

export default function NumericalInfoCard({ variant }: NumericalInfoCardProps) {
  const description =
    variant === 'v1'
      ? 'Du får 32 frågor över 8 passager. Allt från enkel tabelläsning till lite tuffare procentberäkningar. Ingen kalkylator behövs, räkna i huvudet eller på papper.'
      : variant === 'v2'
        ? 'Avancerade scenarier med flera steg och sammansatta beräkningar. Det här är testet för dig som siktar på topp 5 procent.'
        : 'Beslutsstödsmatte: investeringskalkyl, optimering och känslighetsanalys. Flera datakällor och beslut under osäkerhet. Den tuffaste numeriska nivån.';

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <p className="mb-1.5 text-steg uppercase text-ink-3">Vad du möter</p>
        <h2 className="text-fraga text-ink-1">Fem områden, en helhet</h2>
        <p className="mt-2 max-w-2xl text-sm leading-[22px] text-ink-2">{description}</p>
      </div>

      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
        {TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <li key={type.label} className="flex items-start gap-3 px-4 py-3">
              <Icon className="h-6 w-6 shrink-0 text-ink-2" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink-1">{type.label}</span>
                <span className="mt-0.5 block text-meta text-ink-3">{type.desc}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
