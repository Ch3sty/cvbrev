import { describe, it, expect } from 'vitest';

import {
  nextCategoryLabel,
  nextCategory,
  previousCategory,
  isLastCategory,
  categoryProgressText,
  type CategoryFlowStep,
} from './categoryFlow';

const ALLA: CategoryFlowStep[] = [
  { id: 'profile', count: 1 },
  { id: 'roles', count: 3 },
  { id: 'skills', count: 12 },
  { id: 'auto', count: 5 },
];

describe('nextCategoryLabel', () => {
  it('pekar mot nästa kategori med antal förslag', () => {
    expect(nextCategoryLabel(ALLA, 'profile')).toBe('Nästa: Roller (3)');
    expect(nextCategoryLabel(ALLA, 'roles')).toBe('Nästa: Skills (12)');
    expect(nextCategoryLabel(ALLA, 'skills')).toBe('Nästa: Automatiskt (5)');
  });

  it('säger Fortsätt på sista fliken', () => {
    expect(nextCategoryLabel(ALLA, 'auto')).toBe('Fortsätt');
  });

  it('säger Fortsätt när listan är tom eller kategorin okänd', () => {
    expect(nextCategoryLabel([], 'profile')).toBe('Fortsätt');
    expect(nextCategoryLabel([{ id: 'roles', count: 3 }], 'profile')).toBe('Fortsätt');
  });

  it('säger Fortsätt när det bara finns en kategori', () => {
    expect(nextCategoryLabel([{ id: 'roles', count: 3 }], 'roles')).toBe('Fortsätt');
  });
});

describe('nextCategory och previousCategory', () => {
  it('stegar framåt och bakåt', () => {
    expect(nextCategory(ALLA, 'profile')).toBe('roles');
    expect(nextCategory(ALLA, 'auto')).toBeNull();
    expect(previousCategory(ALLA, 'skills')).toBe('roles');
    expect(previousCategory(ALLA, 'profile')).toBeNull();
  });
});

describe('isLastCategory', () => {
  it('är sann bara på sista fliken', () => {
    expect(isLastCategory(ALLA, 'auto')).toBe(true);
    expect(isLastCategory(ALLA, 'skills')).toBe(false);
    expect(isLastCategory([], 'profile')).toBe(true);
  });
});

describe('categoryProgressText', () => {
  it('visar position och antal valda', () => {
    expect(categoryProgressText(ALLA, 'profile', 1, 16)).toBe(
      'Kategori 1 av 4 · 1 av 16 valda'
    );
    expect(categoryProgressText(ALLA, 'auto', 0, 16)).toBe(
      'Kategori 4 av 4 · 0 av 16 valda'
    );
  });
});
