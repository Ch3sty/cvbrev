// src/lib/blog.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// --- TYPDEFINITIONER ---
export type FaqItemData = {
  question: string;
  answer: string;
};

export type Frontmatter = {
  title: string;
  date: string;
  description: string;
  author?: string;
  tags?: string[];
  image?: string;
  faq?: FaqItemData[]; // <-- FAQ-fältet är nu inkluderat
};

export type PostMeta = {
  slug: string;
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
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        // Kombinera metadata och slug med korrekt typ
        const postMetaData: PostMeta = {
          slug,
          ...(matterResult.data as Frontmatter), // Använd Frontmatter-typen
        };
        return postMetaData;
      });

    // Sortera inläggen efter datum (nyast först)
    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
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