import { useEffect, useState } from 'react';

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check connection type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const type = connection.effectiveType;
      setIsSlowConnection(type === 'slow-2g' || type === '2g' || type === '3g');

      const updateConnection = () => {
        const type = connection.effectiveType;
        setIsSlowConnection(type === 'slow-2g' || type === '2g' || type === '3g');
      };

      connection.addEventListener('change', updateConnection);

      return () => {
        window.removeEventListener('resize', checkMobile);
        connection.removeEventListener('change', updateConnection);
      };
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isSlowConnection };
}
