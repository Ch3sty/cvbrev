import React from 'react';
import { getAllPostsMeta } from '@/lib/blog';
import ModernCategorySidebar from './ModernCategorySidebar';

export const generateTagsData = () => {
  try {
    const posts = getAllPostsMeta();
    const tagCounts: Record<string, number> = {};

    posts.forEach(post => {
      try {
        if (post?.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (typeof tag === 'string' && tag.trim()) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          });
        }
      } catch (error) {
        console.warn('Error processing tags for post:', post?.slug, error);
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 most popular tags

    return sortedTags;
  } catch (error) {
    console.error('Error generating tags data:', error);
    return []; // Return empty array instead of crashing
  }
};

const ModernCategoriesServer = () => {
  const tagsData = generateTagsData();
  return <ModernCategorySidebar categories={tagsData} />;
};

export default ModernCategoriesServer;