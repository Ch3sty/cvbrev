'use client';

import { motion } from 'framer-motion';
import {
  MatrixCategoryIllustration,
  VerbalCategoryIllustration,
  NumericalCategoryIllustration,
  PersonalityCategoryIllustration,
} from './illustrations/TesterHubIcons';

export type CategoryKind = 'matrix' | 'verbal' | 'numerical' | 'personality';

interface TestCategorySectionProps {
  kind: CategoryKind;
  eyebrow: string;
  title: string;
  description: string;
  index?: number;
  children: React.ReactNode;
}

export default function TestCategorySection({
  kind,
  eyebrow,
  title,
  description,
  index = 0,
  children,
}: TestCategorySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="flex-shrink-0">
          <CategoryIcon kind={kind} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1 text-orange-700">
            {eyebrow}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {children}
      </div>
    </motion.section>
  );
}

function CategoryIcon({ kind }: { kind: CategoryKind }) {
  if (kind === 'matrix') return <MatrixCategoryIllustration className="w-11 h-11 sm:w-12 sm:h-12" />;
  if (kind === 'verbal') return <VerbalCategoryIllustration className="w-11 h-11 sm:w-12 sm:h-12" />;
  if (kind === 'personality') return <PersonalityCategoryIllustration className="w-11 h-11 sm:w-12 sm:h-12" />;
  return <NumericalCategoryIllustration className="w-11 h-11 sm:w-12 sm:h-12" />;
}
