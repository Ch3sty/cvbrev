import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inaktivera strict mode under utveckling för att undvika dubbla renderingar
  reactStrictMode: false,
  
  // Anpassa webpack för att bättre hantera vissa moduler
  webpack: (config, { isServer, dev }) => {
    // Specifik hantering för PDF.js
    if (isServer) {
      // @ts-ignore - config.externals kan vara undefined
      config.externals = [...(config.externals || []), 'pdfjs-dist', 'mammoth'];
    }
    
    // Optimera watchOptions för utveckling för att förhindra onödiga rebuilds
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // Undvik att reagera på ändringar i node_modules
        ignored: ['**/node_modules/**', '**/.git/**'],
        // Aggregera alla ändringar under en kort period
        aggregateTimeout: 300,
        // Ändra till 'false' för att undvika polling
        poll: false,
      };
    }
    
    return config;
  },
  
  // Förhindra att statiska bilder optimeras under utveckling (kan orsaka onödiga rebuilds)
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Ta bort swcMinify eftersom det inte längre känns igen i din version av Next.js
  // Minifiering hanteras numera automatiskt av Next.js
};

export default nextConfig;