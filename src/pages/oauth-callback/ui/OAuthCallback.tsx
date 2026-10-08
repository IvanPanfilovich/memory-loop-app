import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCookies } from 'react-cookie';
import { googleOAuthService } from '@/services/googleOAuthService';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { SERVER_URL } from '@/shared';

type CallbackStatus = 'processing' | 'success' | 'error';

let isProcessingOAuth = false;

export const OAuthCallback: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [, setCookie] = useCookies(['token', 'refreshToken']);
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      if (isProcessingOAuth) {
        return;
      }

      isProcessingOAuth = true;
      try {
        const result = googleOAuthService.handleCallback();

        if (result.success && result.token && result.refreshToken) {
          setStatus('processing');

          // Set cookies first
          setCookie('token', result.token, {
            path: '/',
            maxAge: 3600, // 1 hour
            secure: true, // Always use secure cookies in production
            sameSite: 'lax',
          });

          setCookie('refreshToken', result.refreshToken, {
            path: '/',
            maxAge: 3600 * 24 * 7, // 7 days
            secure: true, // Always use secure cookies in production
            sameSite: 'lax',
          });

          // Fetch user data using the refresh token
          // This ensures we get the actual user data from the backend
          const refreshResponse = await fetch(`${SERVER_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ refresh_token: result.refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Failed to fetch user data after OAuth login');
          }

          const refreshData = await refreshResponse.json();

          if (!refreshData.user) {
            throw new Error('Invalid response: missing user object');
          }

          // Update cookies with new tokens from refresh response (token rotation)
          const newToken = refreshData.access_token || refreshData.token;
          const newRefreshToken = refreshData.refresh_token;

          if (newToken) {
            setCookie('token', newToken, {
              path: '/',
              maxAge: 3600, // 1 hour
              secure: true,
              sameSite: 'lax',
            });
          }

          if (newRefreshToken) {
            setCookie('refreshToken', newRefreshToken, {
              path: '/',
              maxAge: 3600 * 24 * 7, // 7 days
              secure: true,
              sameSite: 'lax',
            });
          }

          // Update Redux store with user data
          dispatch(
            loginSuccess({
              user: refreshData.user,
              token: newToken || result.token,
              refreshToken: newRefreshToken || result.refreshToken,
            })
          );

          // Clear the user_logged_out flag to allow authentication
          localStorage.removeItem('user_logged_out');

          setStatus('success');

          // Wait a bit longer to ensure cookies and Redux state are fully set
          // Then redirect with full page reload to ensure AuthContext properly initializes
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        } else {
          console.error('OAuthCallback - OAuth callback failed:', result.error);
          setErrorMessage(result.error || 'OAuth callback failed');
          setStatus('error');

          setTimeout(() => {
            // Use full page reload
            window.location.href = '/';
          }, 3000);
        }
      } catch (error) {
        console.error('OAuthCallback - Error during callback processing:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        setStatus('error');

        setTimeout(() => {
          // Use full page reload to get SSR version of landing page
          window.location.href = '/';
        }, 3000);
      } finally {
        isProcessingOAuth = false;
      }
    };

    handleCallback();
  }, [dispatch, setCookie]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
              <h2 className='text-2xl font-bold text-foreground mb-2'>
                {t('oauth.callback.processing.title', 'Completing sign in...')}
              </h2>
              <p className='text-muted-foreground'>
                {t(
                  'oauth.callback.processing.description',
                  'Please wait while we complete your Google sign in.'
                )}
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center'>
              <div className='text-green-500 text-6xl mb-4'>✅</div>
              <h2 className='text-2xl font-bold text-foreground mb-2'>
                {t('oauth.callback.success.title', 'Sign in successful!')}
              </h2>
              <p className='text-muted-foreground mb-4'>
                {t(
                  'oauth.callback.success.description',
                  'Welcome! Redirecting to your dashboard...'
                )}
              </p>
              <div className='animate-pulse text-sm text-muted-foreground'>
                {t('oauth.callback.success.redirecting', 'Redirecting...')}
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center'>
              <div className='text-red-500 text-6xl mb-4'>❌</div>
              <h2 className='text-2xl font-bold text-foreground mb-2'>
                {t('oauth.callback.error.title', 'Sign in failed')}
              </h2>
              <p className='text-muted-foreground mb-4'>
                {errorMessage ||
                  t(
                    'oauth.callback.error.description',
                    'Something went wrong during the sign in process.'
                  )}
              </p>
              <div className='animate-pulse text-sm text-muted-foreground'>
                {t('oauth.callback.error.redirecting', 'Redirecting to login page...')}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
};
