import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { StateBasedSignInDialog } from '@/widgets/auth-form/ui/sign-in-dialog/state-based-sign-in-dialog';
import type { AuthResponse } from '@/entities/user/types/User';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

const REFERRAL_COOKIE_NAME = 'referral_code';

export const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Capture referral code from URL and store in cookie
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store referral code in cookie (expires in 30 days)
      Cookies.set(REFERRAL_COOKIE_NAME, refCode, {
        expires: 30,
        sameSite: 'lax',
        secure: window.location.protocol === 'https:',
      });

      // Remove ref parameter from URL to keep it clean
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('ref');
      const newSearch = newSearchParams.toString();
      navigate(`/signup${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
  }, [searchParams, navigate]);

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
    if (!open && !isAuthenticated) {
      // If dialog is closed and user is not authenticated, redirect to home
      window.location.href = '/';
      return;
    }
    setIsDialogOpen(open);
  };

  // Show loading while checking auth or redirecting
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
              {t('auth.signUpTitle', 'Create Account')}
            </h1>
            <p className='text-muted-foreground'>{t('auth.signUp', 'Sign up to get started')}</p>
          </div>
        </div>
      </div>
      <StateBasedSignInDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccessfulAuth={handleSuccessfulAuth}
        defaultMode='signup'
        preventClose={true}
      />
    </>
  );
};
