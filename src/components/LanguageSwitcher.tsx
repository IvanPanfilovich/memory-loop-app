import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { showToast } from '@/shared/ui';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { updateUserData } = useUpdateUser();

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);

    if (user) {
      try {
        await updateUserData({
          locale: lng,
          display_name: user.display_name || '',
          currency: user.currency || 'USD',
          email: user.email,
          country: user.country || undefined,
        });
      } catch (error) {
        console.error('Failed to update language preference:', error);
        showToast(t('languageSwitcher.saveError', 'Failed to save language preference'), 'error');
      }
    }
  };

  return (
    <div className='flex gap-2'>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded text-sm ${
          i18n.language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-3 py-1 rounded text-sm ${
          i18n.language === 'ru'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        RU
      </button>
    </div>
  );
};
