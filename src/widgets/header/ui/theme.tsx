import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/shadcn/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { setDefaultMode, updateDefaultMode } from '@/store/slices/themeSlice';
import { useAuth } from '@/contexts/AuthContext';

export const ThemeToggle = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { defaultMode } = useAppSelector(state => state.theme);
  const { isAuthenticated, token } = useAuth();
  const isDark = defaultMode === 'dark';

  // Apply theme mode to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(defaultMode);
  }, [defaultMode]);

  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';

    // Update Redux state immediately for responsive UI
    dispatch(setDefaultMode(newMode));

    // Save to backend if authenticated
    if (isAuthenticated && token) {
      try {
        await dispatch(updateDefaultMode(newMode)).unwrap();
      } catch (error) {
        console.error('[ThemeToggle] Failed to update default mode on backend:', error);
        // State is already updated locally, so UI will still work
      }
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      className='w-8 h-8 text-foreground hover:text-foreground'
      aria-label={t('accessibility.toggleTheme')}
    >
      {isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
    </Button>
  );
};
