import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { showToast } from '@/shared/ui';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

let hasShownAuthNotification = false;

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = false }) => {
  const { isLoading, user, isDeletingAccount } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!isLoading && requireAuth && user === null) {
    if (!isDeletingAccount && !hasShownAuthNotification) {
      showToast(t('auth.loginRequiredMessage'), 'warning');
      hasShownAuthNotification = true;

      setTimeout(() => {
        hasShownAuthNotification = false;
      }, 2000);
    }

    // Use window.location for full page reload
    // This bypasses React Router and service worker cache
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
};
