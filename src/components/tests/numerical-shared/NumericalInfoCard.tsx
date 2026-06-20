'use client';

import { motion } from 'framer-motion';
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
    desc: 'Lös problem med text + siffror.',
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
      ? 'Du får 32 frågor över 8 passager. Allt från enkel tabelläsning till lite tuffare procentberäkningar. Ingen kalkylator behövs — räkna i huvudet eller på papper.'
      : variant === 'v2'
      ? 'Avancerade scenarier med flera steg och sammansatta beräkningar. Det här är test för dig som siktar på topp 5%.'
      : 'Beslutsstödsmatte: investeringskalkyl, optimering och känslighetsanalys. Flera datakällor och beslut under osäkerhet. Den tuffaste numeriska nivån.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-6 sm:p-7 md:p-8"
      style={{
        boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
        Vad du möter
      </div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
        Fem områden, en helhet
      </h2>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 max-w-2xl">
        {description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.label}
              className="flex items-start gap-3 p-3 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-100"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
                }}
              >
                <Icon className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 leading-tight mb-0.5">
                  {type.label}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">{type.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
