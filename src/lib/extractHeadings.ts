/**
 * Utility functions for extracting headings from MDX content
 * Used for server-side Table of Contents generation for SEO optimization
 */

export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * Extracts headings from MDX content for server-side rendering
 * This ensures TOC is visible to search engines
 */
export function extractHeadingsFromContent(content: string): Heading[] {
  const headings: Heading[] = [];

  // Match both ## and ### headings for comprehensive TOC
  // Using a more robust regex that handles edge cases
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // 2 for ##, 3 for ###
    const text = match[2].trim();

    // Generate SEO-friendly ID from heading text
    const id = generateHeadingId(text);

    headings.push({
      id,
      text,
      level
    });
  }

  return headings;
}

/**
 * Generates SEO-friendly and Swedish-compatible IDs for headings
 * Handles special characters, Swedish letters, and ensures uniqueness
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    // Keep Swedish characters for better SEO in Swedish market
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    // Remove special characters but keep hyphens and underscores
    .replace(/[^\w\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove multiple hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Ensure we have a valid ID
    || 'section';
}

/**
 * Adds IDs to headings in the MDX content for anchor linking
 * This ensures headings have proper IDs for TOC navigation
 */
export function addHeadingIds(content: string): string {
  const headings = extractHeadingsFromContent(content);
  let modifiedContent = content;

  headings.forEach(heading => {
    // Replace heading with version that has an ID
    const originalHeading = new RegExp(
      `^(${'#'.repeat(heading.level)}\\s+)(${escapeRegex(heading.text)})$`,
      'gm'
    );

    // Add {#id} syntax for MDX heading IDs
    const replacement = `$1$2 {#${heading.id}}`;

    // Only add ID if it doesn't already exist
    if (!content.includes(`{#${heading.id}}`)) {
      modifiedContent = modifiedContent.replace(originalHeading, replacement);
    }
  });

  return modifiedContent;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates structured data for TOC to enhance SEO
 * This helps search engines understand the article structure
 */
export function generateTOCStructuredData(
  headings: Heading[],
  articleUrl: string
): object {
  return {
    "@type": "Table",
    "name": "Innehållsförteckning",
    "about": {
      "@type": "Article",
      "url": articleUrl
    },
    "hasPart": headings.map(heading => ({
      "@type": "WebPageElement",
      "name": heading.text,
      "url": `${articleUrl}#${heading.id}`,
      "isPartOf": {
        "@type": "Article",
        "url": articleUrl
      }
    }))
  };
}

/**
 * Filters headings to only include H2s for simpler TOC
 * Use this if you want a cleaner TOC with only main sections
 */
export function filterH2Headings(headings: Heading[]): Heading[] {
  return headings.filter(h => h.level === 2);
}

/**
 * Creates a nested structure for hierarchical TOC
 * Useful for articles with subsections
 */
export interface NestedHeading extends Heading {
  children: NestedHeading[];
}

export function createNestedHeadings(headings: Heading[]): NestedHeading[] {
  const nested: NestedHeading[] = [];
  const stack: NestedHeading[] = [];

  headings.forEach(heading => {
    const nestedHeading: NestedHeading = {
      ...heading,
      children: []
    };

    // Find the appropriate parent based on heading level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top level heading
      nested.push(nestedHeading);
    } else {
      // Child heading
      stack[stack.length - 1].children.push(nestedHeading);
    }

    stack.push(nestedHeading);
  });

  return nested;
}