import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export const AppLoader: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading } = useAuth();

  if (!isLoading) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
        <p className='text-lg text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
      </div>
    </div>
  );
};
