// src/lib/blog.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Definiera sökvägen till bloggmappen relativt till projektets rot
const postsDirectory = path.join(process.cwd(), 'content/artiklar');

// Funktion för att hämta metadata och slug för ALLA blogginlägg
export function getAllPostsMeta() {
  try {
    // Läs alla filnamn i bloggmappen
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
      // Filtrera bort allt som inte är .mdx-filer
      .filter((fileName) => fileName.endsWith('.mdx'))
      // Mappa över varje filnamn
      .map((fileName) => {
        // Ta bort ".mdx" från filnamnet för att få slugen
        const slug = fileName.replace(/\.mdx$/, '');

        // Skapa den fullständiga sökvägen till filen
        const fullPath = path.join(postsDirectory, fileName);
        // Läs innehållet i filen
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Använd gray-matter för att parsa postens metadata (frontmatter)
        const matterResult = matter(fileContents);

        // Kombinera metadata och slug
        return {
          slug,
          ...(matterResult.data as {
            title: string;
            date: string;
            description: string;
            author?: string;
            tags?: string[];
            image?: string;
          }), // Type assertion för bättre auto-completion
        };
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
    return []; // Returnera en tom array vid fel
  }
}

// Funktion för att hämta data för ETT specifikt inlägg baserat på slug
export function getPostBySlug(slug: string) {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    // Kontrollera om filen existerar
    if (!fs.existsSync(fullPath)) {
      console.warn(`Blog post not found for slug: ${slug}`);
      return null; // Eller kasta ett fel om du föredrar det
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Använd gray-matter för att parsa metadata och innehåll
    const matterResult = matter(fileContents);

    // Returnera allt: slug, metadata (frontmatter) och innehållssträngen
    return {
      slug,
      frontmatter: matterResult.data as {
        title: string;
        date: string;
        description: string;
        author?: string;
        tags?: string[];
        image?: string;
       }, // Type assertion
      content: matterResult.content,
    };
  } catch (error) {
     console.error(`Error reading blog post with slug "${slug}":`, error);
     return null; // Returnera null vid läsfel
  }
}