import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inaktivera strict mode under utveckling för att undvika dubbla renderingar
  reactStrictMode: false,
  // Anpassa webpack för att bättre hantera vissa moduler
  webpack: (config, { isServer }) => {
    // Specifik hantering för PDF.js
    if (isServer) {
      // @ts-ignore - config.externals kan vara undefined
      config.externals = [...(config.externals || []), 'pdfjs-dist', 'mammoth'];
    }
    
    return config;
  },
};

export default nextConfig;