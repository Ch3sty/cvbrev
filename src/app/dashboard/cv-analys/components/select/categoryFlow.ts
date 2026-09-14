import type { SelectCategory } from './CategorySegments';

/** Etiketterna som används i flikarna och i fotens knapp. */
export const CATEGORY_LABEL: Record<SelectCategory, string> = {
  profile: 'Profil',
  roles: 'Roller',
  skills: 'Kompetenser',
  auto: 'Automatiskt',
};

export interface CategoryFlowStep {
  /** Kategorin fliken visar. */
  id: SelectCategory;
  /** Antal förslag i kategorin, det tal som står inom parentes. */
  count: number;
}

/**
 * Vad primärknappen ska heta när man står på en viss kategori.
 *
 * Foten går igenom kategorierna i stället för att stå spärrad: på alla flikar
 * utom den sista pekar knappen mot nästa kategori och dess antal förslag, på
 * den sista säger den "Fortsätt" och lämnar steget.
 */
export function nextCategoryLabel(
  categories: CategoryFlowStep[],
  active: SelectCategory
): string {
  const index = categories.findIndex((c) => c.id === active);
  // Okänd eller sista kategorin: nästa handling är att lämna steget.
  if (index < 0 || index >= categories.length - 1) return 'Fortsätt';
  const next = categories[index + 1];
  return `Nästa: ${CATEGORY_LABEL[next.id]} (${next.count})`;
}

/** Kategorin efter den aktiva, eller null när man står sist. */
export function nextCategory(
  categories: CategoryFlowStep[],
  active: SelectCategory
): SelectCategory | null {
  const index = categories.findIndex((c) => c.id === active);
  if (index < 0 || index >= categories.length - 1) return null;
  return categories[index + 1].id;
}

/** Kategorin före den aktiva, eller null när man står först. */
export function previousCategory(
  categories: CategoryFlowStep[],
  active: SelectCategory
): SelectCategory | null {
  const index = categories.findIndex((c) => c.id === active);
  if (index <= 0) return null;
  return categories[index - 1].id;
}

/** Står man på sista fliken är nästa handling att lämna steget. */
export function isLastCategory(
  categories: CategoryFlowStep[],
  active: SelectCategory
): boolean {
  const index = categories.findIndex((c) => c.id === active);
  return index < 0 || index >= categories.length - 1;
}

/** Raden under flikarna: "Kategori 1 av 4 · 1 av 16 valda". */
export function categoryProgressText(
  categories: CategoryFlowStep[],
  active: SelectCategory,
  totalSelected: number,
  totalAvailable: number
): string {
  const index = categories.findIndex((c) => c.id === active);
  const position = index < 0 ? 1 : index + 1;
  const total = Math.max(categories.length, 1);
  return `Kategori ${position} av ${total} · ${totalSelected} av ${totalAvailable} valda`;
}
