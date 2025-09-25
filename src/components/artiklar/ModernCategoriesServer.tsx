import React from 'react';
import { getAllPostsMeta } from '@/lib/blog';
import ModernCategorySidebar from './ModernCategorySidebar';

export const generateTagsData = () => {
  const posts = getAllPostsMeta();
  const tagCounts: Record<string, number> = {};

  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        if (typeof tag === 'string') {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });

  const sortedTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10 most popular tags

  return sortedTags;
};

const ModernCategoriesServer = () => {
  const tagsData = generateTagsData();
  return <ModernCategorySidebar categories={tagsData} />;
};

export default ModernCategoriesServer;