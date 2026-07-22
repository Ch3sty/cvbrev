// src/lib/blog.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// --- TYPDEFINITIONER ---
export type FaqItemData = {
  question: string;
  answer: string;
};

// Ett steg i en HowTo-guide. `text` är obligatoriskt; `name` (kort rubrik)
// är valfritt och faller tillbaka på en avkortad text om det saknas.
export type HowToStepData = {
  name?: string;
  text: string;
};

// HowTo-data för artiklar som innehåller en äkta stegguide.
export type HowToData = {
  name: string; // Vad guiden lär ut, t.ex. "Så skapar du ett CV i PDF"
  description?: string;
  steps: HowToStepData[];
};

export type Frontmatter = {
  title: string;
  seoTitle?: string; // Kortare titel för <title>-taggen (annars title + suffix)
  date: string;
  description: string;
  author?: string;
  tags?: string[];
  image?: string;
  faq?: FaqItemData[]; // <-- FAQ-fältet är nu inkluderat
  howto?: HowToData; // <-- HowTo-schema för artiklar med stegguider
};

export type PostMeta = {
  slug: string;
  wordCount?: number;
} & Frontmatter;

export type Post = {
  slug: string;
  frontmatter: Frontmatter;
  content: string;
};
// --- SLUT PÅ TYPDEFINITIONER ---


const postsDirectory = path.join(process.cwd(), 'content/artiklar');

// Funktion för att hämta metadata och slug för ALLA blogginlägg
export function getAllPostsMeta(): PostMeta[] { // Uppdaterad returtyp
  try {
    // Check if directory exists
    if (!fs.existsSync(postsDirectory)) {
      console.warn(`Posts directory does not exist: ${postsDirectory}`);
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        try {
          const slug = fileName.replace(/\.mdx$/, '');
          const fullPath = path.join(postsDirectory, fileName);

          if (!fs.existsSync(fullPath)) {
            console.warn(`File does not exist: ${fullPath}`);
            return null;
          }

          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const matterResult = matter(fileContents);

          // Calculate word count from the actual content
          const contentWordCount = matterResult.content
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[#*_`\[\]()]/g, ' ') // Remove markdown formatting
            .split(/\s+/)
            .filter(word => word.length > 0).length;

          // Validate required fields
          const frontmatter = matterResult.data as Frontmatter;
          if (!frontmatter.title || !frontmatter.date) {
            console.warn(`Missing required frontmatter fields in ${fileName}:`, {
              title: !!frontmatter.title,
              date: !!frontmatter.date
            });
            return null;
          }

          // Kombinera metadata och slug med korrekt typ
          const postMetaData: PostMeta = {
            slug,
            title: frontmatter.title,
            date: frontmatter.date,
            description: frontmatter.description || '',
            author: frontmatter.author,
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
            image: frontmatter.image,
            faq: Array.isArray(frontmatter.faq) ? frontmatter.faq : [],
            wordCount: contentWordCount,
          };
          return postMetaData;
        } catch (error) {
          console.error(`Error processing file ${fileName}:`, error);
          return null;
        }
      })
      .filter((post): post is PostMeta => post !== null); // Remove null entries

    // Sortera inläggen efter datum (nyast först) med säker datumjämförelse
    return allPostsData.sort((a, b) => {
      try {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        // Check if dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn('Invalid date found during sorting:', { a: a.date, b: b.date });
          // Fallback to string comparison if dates are invalid
          return a.date < b.date ? 1 : -1;
        }

        return dateB.getTime() - dateA.getTime(); // Newest first
      } catch (error) {
        console.error('Error during date sorting:', error);
        return 0; // Keep original order if comparison fails
      }
    });
  } catch (error) {
    console.error("Error reading blog posts metadata:", error);
    return [];
  }
}

// Funktion för att hämta data för ETT specifikt inlägg baserat på slug
export function getPostBySlug(slug: string): Post | null { // Uppdaterad returtyp
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Blog post not found for slug: ${slug}`);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Returnera allt med korrekt typ
    const postData: Post = {
      slug,
      frontmatter: matterResult.data as Frontmatter, // Använd Frontmatter-typen
      content: matterResult.content,
    };
    return postData;
  } catch (error) {
     console.error(`Error reading blog post with slug "${slug}":`, error);
     return null;
  }
}
// --- INSIKTER FÖR REKRYTERARE (content/rekryterare) ---
const insikterDirectory = path.join(process.cwd(), 'content/rekryterare');

export function getAllInsikterMeta(): PostMeta[] {
  try {
    if (!fs.existsSync(insikterDirectory)) return [];
    const fileNames = fs.readdirSync(insikterDirectory);
    const all = fileNames
      .filter((f) => f.endsWith('.mdx'))
      .map((fileName) => {
        try {
          const slug = fileName.replace(/\.mdx$/, '');
          const fileContents = fs.readFileSync(path.join(insikterDirectory, fileName), 'utf8');
          const matterResult = matter(fileContents);
          const frontmatter = matterResult.data as Frontmatter;
          if (!frontmatter.title || !frontmatter.date) return null;
          const wordCount = matterResult.content
            .replace(/<[^>]*>/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 0).length;
          const meta: PostMeta = {
            slug,
            title: frontmatter.title,
            seoTitle: frontmatter.seoTitle,
            date: frontmatter.date,
            description: frontmatter.description || '',
            author: frontmatter.author,
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
            image: frontmatter.image,
            faq: Array.isArray(frontmatter.faq) ? frontmatter.faq : [],
            wordCount,
          };
          return meta;
        } catch {
          return null;
        }
      })
      .filter((p): p is PostMeta => p !== null);
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading insikter metadata:', error);
    return [];
  }
}

export function getInsiktBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(insikterDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) return null;
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    return { slug, frontmatter: matterResult.data as Frontmatter, content: matterResult.content };
  } catch (error) {
    console.error(`Error reading insikt "${slug}":`, error);
    return null;
  }
}
