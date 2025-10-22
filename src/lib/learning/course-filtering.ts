// src/lib/learning/course-filtering.ts
/**
 * Course Filtering Utility
 *
 * Filters out gymnasium courses since all users have already completed gymnasium.
 * Only keeps relevant adult education:
 * - YH (Yrkeshögskola)
 * - Komvux (Vuxenutbildning)
 * - Högskola/Universitet
 * - Private education providers
 */

import type { Course } from './course-prioritization';

/**
 * Detects if a course is a gymnasium (high school) course
 * @param course - Course to check
 * @returns true if course is a gymnasium course (should be filtered out)
 */
export function isGymnasiumCourse(course: Course): boolean {
  const title = (course.title || '').toLowerCase();
  const provider = (course.provider || '').toLowerCase();
  const duration = (course.duration || '').toLowerCase();

  // Gymnasium keywords in provider
  const gymnasiumProviders = [
    'gymnasium',
    'gymnasiet',
    'praktiska gymnasiet',
    'jensen gymnasium',
    'thorildsplans gymnasium',
    'nti gymnasium',
  ];

  if (gymnasiumProviders.some(keyword => provider.includes(keyword))) {
    return true;
  }

  // Programs ending with "-programmet" and duration "3 år" are typically gymnasium
  if (title.endsWith('-programmet') && (duration.includes('3 år') || duration.includes('3år'))) {
    return true;
  }

  // Specific gymnasium program names
  const gymnasiumPrograms = [
    'el- och energiprogrammet',
    'vvs- och fastighetsprogrammet',
    'fordonsprogrammet',
    'teknikprogrammet',
    'naturvetenskapsprogrammet',
    'ekonomiprogrammet',
    'samhällsvetenskapsprogrammet',
    'barn- och fritidsprogrammet',
    'vård- och omsorgsprogrammet',
    'hotell- och turismprogrammet',
    'restaurang- och livsmedelsprogrammet',
    'handels- och administrationsprogrammet',
    'industritekniska programmet',
    'bygg- och anläggningsprogrammet',
  ];

  if (gymnasiumPrograms.some(program => title.includes(program))) {
    return true;
  }

  return false;
}

/**
 * Checks if a course is relevant adult education
 * @param course - Course to check
 * @returns true if course is for adults (YH/Komvux/Högskola/Private)
 */
export function isAdultEducation(course: Course): boolean {
  const provider = (course.provider || '').toLowerCase();
  const title = (course.title || '').toLowerCase();

  // YH (Yrkeshögskola) keywords
  const yhKeywords = [
    'yh',
    'yrkeshögskola',
    'jensen yh',
    'prakticum yh',
    'tuc yrkeshögskola',
    'lexicon yh',
    'medieinstitutet',
    'ec utbildning',
    'hermods yh',
  ];

  // Komvux (Vuxenutbildning) keywords
  const komvuxKeywords = [
    'komvux',
    'vuxenutbildning',
    'vuxengymnasium',
    'folkuniversitetet',
    'medborgarskolan',
    'studieförbund',
  ];

  // University/Högskola keywords
  const universityKeywords = [
    'universitet',
    'högskola',
    'university',
    'college',
    'kth',
    'lund',
    'uppsala',
    'göteborg',
    'stockholm',
    'chalmers',
    'karolinska',
  ];

  // Private education providers
  const privateProviders = [
    'berghs',
    'hyper island',
    'yrgo',
    'chas academy',
    'nackademin',
    'teknikhögskolan',
    'it-högskolan',
  ];

  // CSN-berättigad is a strong indicator of adult education
  if (title.includes('csn') || provider.includes('csn')) {
    return true;
  }

  // Check all keywords
  const allKeywords = [
    ...yhKeywords,
    ...komvuxKeywords,
    ...universityKeywords,
    ...privateProviders,
  ];

  return allKeywords.some(keyword =>
    provider.includes(keyword) || title.includes(keyword)
  );
}

/**
 * Filters courses to remove gymnasium education
 * @param courses - Array of courses to filter
 * @returns Filtered array containing only relevant adult education
 */
export function filterRelevantCourses(courses: Course[]): Course[] {
  return courses.filter(course => {
    // Remove gymnasium courses
    if (isGymnasiumCourse(course)) {
      return false;
    }

    // Keep adult education courses
    if (isAdultEducation(course)) {
      return true;
    }

    // For courses that don't match specific criteria, keep them by default
    // (better to show too many than filter out valid courses)
    return true;
  });
}

/**
 * Categorizes a course by education type
 * @param course - Course to categorize
 * @returns Category string
 */
export function getCourseCategory(course: Course): string {
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
 * Gets a priority score for adult education types
 * Lower score = higher priority
 * @param course - Course to score
 * @returns Priority score (lower is better)
 */
export function getAdultEducationPriority(course: Course): number {
  const category = getCourseCategory(course);

  const priorityMap: Record<string, number> = {
    'Komvux': 1, // Free, government-funded
    'Högskola/Universitet': 2, // CSN-eligible
    'Yrkeshögskola': 3, // CSN-eligible, vocational focus
    'CSN-berättigad': 4, // CSN-eligible but unspecified
    'Privat utbildning': 5, // May require payment
  };

  return priorityMap[category] || 6;
}
