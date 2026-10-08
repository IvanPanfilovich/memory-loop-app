import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

/**
 * Hook to apply custom theme colors to CSS variables
 */
export const useThemeColors = () => {
  const { lightColors, darkColors, customized } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Always apply colors if customized flag is set
    if (!customized) {
      return;
    }

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    // Apply colors based on current theme mode
    const colors = isDark ? darkColors : lightColors;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Listen for theme mode changes (light/dark toggle)
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isCurrentlyDark = root.classList.contains('dark');
          const currentColors = isCurrentlyDark ? darkColors : lightColors;

          Object.entries(currentColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
          });
        }
      });
    });

    observer.observe(root, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, [lightColors, darkColors, customized]);
};
