import { getAllPostsMeta } from '@/lib/blog';

/**
 * Server-side tag-aggregator för artikel-listsidan.
 * Returnerar top-10 mest populära kategorier med count.
 */
export const generateTagsData = (): { tag: string; count: number }[] => {
  try {
    const posts = getAllPostsMeta();
    const tagCounts: Record<string, number> = {};

    posts.forEach((post) => {
      try {
        if (post?.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag) => {
            if (typeof tag === 'string' && tag.trim()) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          });
        }
      } catch (error) {
        console.warn('Error processing tags for post:', post?.slug, error);
      }
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  } catch (error) {
    console.error('Error generating tags data:', error);
    return [];
  }
};
