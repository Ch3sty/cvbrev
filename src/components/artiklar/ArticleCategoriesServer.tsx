// src/components/artiklar/ArticleCategoriesServer.tsx
import React from 'react';
import { getAllPostsMeta } from '@/lib/blog';
import ArticleCategories from './ArticleCategories'; // Förutsätter att ArticleCategories finns i samma mapp

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
    // *** ÄNDRING HÄR: Visa färre taggar ***
    .slice(0, 8); // Visa de 8 mest populära

  return sortedTags;
};

const ArticleCategoriesServer = () => {
  const tagsData = generateTagsData();
  return <ArticleCategories categories={tagsData} />;
};

export default ArticleCategoriesServer;