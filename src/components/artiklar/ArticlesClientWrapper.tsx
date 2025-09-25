'use client';

import React from 'react';

interface ArticlesClientWrapperProps {
  children: React.ReactNode;
}

export default function ArticlesClientWrapper({ children }: ArticlesClientWrapperProps) {
  return <>{children}</>;
}