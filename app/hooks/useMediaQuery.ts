import React from 'react';

export const useMediaQuery = (query = '(max-width: 639px)') => {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    setIsMobile(mediaQuery.matches);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
};
