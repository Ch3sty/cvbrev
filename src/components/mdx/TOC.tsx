'use client';

import React from 'react';
import TableOfContents from './TableOfContents';

interface TOCProps {
  title?: string;
  maxLevel?: number;
}

/**
 * En enkel wrapper-komponent för att kunna använda TOC direkt i MDX-filer
 * Exempel användning i MDX: <TOC title="I detta avsnitt" maxLevel={3} />
 */
const TOC: React.FC<TOCProps> = ({ title, maxLevel }) => {
  return <TableOfContents title={title} maxLevel={maxLevel} />;
};

export default TOC;