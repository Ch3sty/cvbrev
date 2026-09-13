'use client';

import Segment from '@/components/shell/Segment';

export type SelectCategory = 'profile' | 'roles' | 'skills' | 'auto';

export interface CategoryDef {
  id: SelectCategory;
  label: string;
  selectedCount: number;
  totalCount: number;
  /** Auto-kategorin är "klar" så fort den finns */
  isAuto?: boolean;
}

interface CategorySegmentsProps {
  categories: CategoryDef[];
  active: SelectCategory;
  onChange: (id: SelectCategory) => void;
}

/**
 * Kategorierna i steg 3.
 *
 * Bort: den sticky stapeln med orange fylld flik, gradient bakom och en
 * grön bock i hörnet. Det är fyra likvärdiga alternativ, alltså Segment.
 */
export default function CategorySegments({
  categories,
  active,
  onChange,
}: CategorySegmentsProps) {
  const options = categories.map((cat) => ({
    value: cat.id,
    label: cat.isAuto
      ? `${cat.label} (${cat.totalCount})`
      : `${cat.label} ${cat.selectedCount}/${cat.totalCount}`,
  }));

  return (
    <Segment<SelectCategory>
      label="Kategori att gå igenom"
      value={active}
      onChange={onChange}
      options={options}
    />
  );
}
