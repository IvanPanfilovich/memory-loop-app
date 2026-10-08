import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { StateBasedSignInDialog } from '@/widgets/auth-form/ui/sign-in-dialog/state-based-sign-in-dialog';
import type { AuthResponse } from '@/entities/user/types/User';
import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'theme-preference';

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const isDark = stored ? stored === 'dark' : true; // Default to dark

      document.documentElement.classList.remove('light');
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  // Open dialog when page loads
  useEffect(() => {
    if (!authLoading) {
      setIsDialogOpen(true);
    }
  }, [authLoading]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleSuccessfulAuth = (_authData: AuthResponse) => {
    // After successful auth, close dialog and redirect to dashboard
    setIsDialogOpen(false);
    navigate('/dashboard', { replace: true });
  };

  const handleDialogClose = (open: boolean) => {
    // Prevent closing if user is not authenticated
    // The dialog will handle this with preventClose prop, but we keep this as a safeguard
    if (!open && !isAuthenticated) {
      // If dialog is closed and user is not authenticated, redirect to home with full page reload
      window.location.href = '/';
      return;
    }
    setIsDialogOpen(open);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  // If authenticated, the useEffect will redirect, but show loading in the meantime
  if (isAuthenticated && user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground'>{t('common.redirecting', 'Redirecting...')}</p>
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen bg-background flex items-center justify-center px-4'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              {t('auth.signInTitle', 'Welcome Back')}
            </h1>
            <p className='text-muted-foreground'>
              {t('auth.signIn', 'Sign in to your account to continue')}
            </p>
          </div>
        </div>
      </div>
      <StateBasedSignInDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccessfulAuth={handleSuccessfulAuth}
        defaultMode='signin'
        preventClose={true}
      />
    </>
  );
};
