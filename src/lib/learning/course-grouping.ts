// src/lib/learning/course-grouping.ts
/**
 * Course Grouping Utility
 *
 * Groups identical or very similar courses (e.g., same YH program at different locations)
 * to avoid showing "VVS-programmet" 5 times when it's really just 5 different locations.
 */

import type { Course } from './course-prioritization';

export interface CourseGroup {
  id: string;
  title: string; // Normalized title
  baseTitle: string; // Original title
  count: number;
  courses: Course[];
  category: string; // YH, Komvux, Högskola, etc.
  duration?: string;
  cost?: string;
  isFree: boolean;
  locations: string[]; // Different providers/locations
}

/**
 * Normalizes a course title by removing location-specific info
 * E.g., "Projektledning - Prakticum YH Stockholm" → "projektledning"
 */
export function normalizeCourseName(title: string): string {
  let normalized = title.toLowerCase().trim();

  // Remove common suffixes and location info
  normalized = normalized
    .replace(/\s*-\s*(yh|komvux|högskola|universitet).*$/i, '')
    .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
    .replace(/\s*,.*$/,'') // Remove everything after comma
    .replace(/\s+(i|på|vid)\s+\w+$/i, '') // Remove "i Stockholm", "på KTH", etc.
    .trim();

  return normalized;
}

/**
 * Checks if two courses should be grouped together
 * Same title + same duration + same general cost tier = group them
 */
export function shouldGroupCourses(course1: Course, course2: Course): boolean {
  const title1 = normalizeCourseName(course1.title);
  const title2 = normalizeCourseName(course2.title);

  // Must have same normalized title
  if (title1 !== title2) {
    return false;
  }

  // Should have similar duration (or both undefined)
  const duration1 = (course1.duration || '').toLowerCase().trim();
  const duration2 = (course2.duration || '').toLowerCase().trim();

  if (duration1 && duration2 && duration1 !== duration2) {
    // Allow minor variations like "2 år" vs "2år" vs "24 månader"
    const extractMonths = (d: string) => {
      if (d.includes('år')) {
        const years = parseInt(d.match(/\d+/)?.[0] || '0');
        return years * 12;
      }
      if (d.includes('månad')) {
        return parseInt(d.match(/\d+/)?.[0] || '0');
      }
      if (d.includes('vecka')) {
        return parseInt(d.match(/\d+/)?.[0] || '0') / 4;
      }
      return 0;
    };

    const months1 = extractMonths(duration1);
    const months2 = extractMonths(duration2);

    // Allow ±10% duration variance
    if (Math.abs(months1 - months2) > Math.max(months1, months2) * 0.1) {
      return false;
    }
  }

  // Should have similar cost tier (free vs paid)
  const cost1 = (course1.cost || '').toLowerCase();
  const cost2 = (course2.cost || '').toLowerCase();

  const isFree1 = cost1.includes('gratis') || cost1.includes('free') || cost1 === '0' || cost1.includes('csn');
  const isFree2 = cost2.includes('gratis') || cost2.includes('free') || cost2 === '0' || cost2.includes('csn');

  // Must both be free or both be paid
  return isFree1 === isFree2;
}

/**
 * Groups identical courses together
 * Returns array of CourseGroups
 */
export function groupIdenticalCourses(courses: Course[]): CourseGroup[] {
  const groups: Map<string, CourseGroup> = new Map();

  courses.forEach(course => {
    const normalizedTitle = normalizeCourseName(course.title);

    // Try to find existing group this course belongs to
    let foundGroup: CourseGroup | null = null;

    for (const [_, group] of groups) {
      if (group.id === normalizedTitle && shouldGroupCourses(group.courses[0], course)) {
        foundGroup = group;
        break;
      }
    }

    if (foundGroup) {
      // Add to existing group
      foundGroup.courses.push(course);
      foundGroup.count++;
      if (course.provider) {
        foundGroup.locations.push(course.provider);
      }
    } else {
      // Create new group
      const costStr = (course.cost || '').toLowerCase();
      const isFree = costStr.includes('gratis') ||
                     costStr.includes('free') ||
                     costStr === '0' ||
                     costStr.includes('csn');

      const category = getCourseGroupCategory(course);

      groups.set(normalizedTitle + groups.size, {
        id: normalizedTitle + '-' + groups.size,
        title: normalizedTitle,
        baseTitle: course.title,
        count: 1,
        courses: [course],
        category,
        duration: course.duration,
        cost: course.cost,
        isFree,
        locations: course.provider ? [course.provider] : []
      });
    }
  });

  return Array.from(groups.values());
}

/**
 * Gets category for a course group
 */
export function getCourseGroupCategory(course: Course): string {
  const provider = (course.provider || '').toLowerCase();
  const title = (course.title || '').toLowerCase();

  if (provider.includes('yh') || provider.includes('yrkeshögskola')) {
    return 'Yrkeshögskola';
  }

  if (provider.includes('komvux') || provider.includes('vuxenutbildning')) {
    return 'Komvux';
  }

  if (
    provider.includes('universitet') ||
    provider.includes('högskola') ||
    provider.includes('university')
  ) {
    return 'Högskola/Universitet';
  }

  if (title.includes('csn') || provider.includes('csn')) {
    return 'CSN-berättigad';
  }

  return 'Privat utbildning';
}

/**
 * Gets all course variants from a group
 * Sorted by provider name for consistent display
 */
export function getCourseVariants(group: CourseGroup): Course[] {
  return [...group.courses].sort((a, b) => {
    const providerA = (a.provider || '').toLowerCase();
    const providerB = (b.provider || '').toLowerCase();
    return providerA.localeCompare(providerB, 'sv');
  });
}

/**
 * Determines if a group should be displayed as grouped or individual
 * Rule: If 2+ courses with same title, duration, and cost → group them
 */
export function shouldDisplayAsGroup(group: CourseGroup): boolean {
  return group.count >= 2;
}

/**
 * Formats group display text
 * E.g., "Välj EN av 5 platser" or "Finns på 3 orter"
 */
export function getGroupDisplayText(group: CourseGroup): string {
  if (group.count === 1) {
    return group.courses[0].provider || '';
  }

  if (group.count === 2) {
    return `Välj EN av ${group.count} alternativ`;
  }

  return `Välj EN av ${group.count} platser`;
}

/**
 * Main function to process courses and return grouped structure
 * Usage: const groups = groupCourses(courses);
 */
export function groupCourses(courses: Course[]): CourseGroup[] {
  const groups = groupIdenticalCourses(courses);

  // Sort groups:
  // 1. Free first
  // 2. By count (more variants first)
  // 3. Alphabetically
  return groups.sort((a, b) => {
    // Free first
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;

    // More variants first (if 5 variants vs 2 variants, show 5 first)
    if (a.count !== b.count) return b.count - a.count;

    // Alphabetically
    return a.title.localeCompare(b.title, 'sv');
  });
}
