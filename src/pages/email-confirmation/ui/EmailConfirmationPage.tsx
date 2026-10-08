import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useCookies } from 'react-cookie';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

type ConfirmationStatus = 'processing' | 'success' | 'error';

export const EmailConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [, setCookie] = useCookies(['token', 'refreshToken']);

  const [status, setStatus] = useState<ConfirmationStatus>('processing');
  const [message, setMessage] = useState<string>('Confirming your email...');

  const hasHandledRef = useRef(false);

  useLayoutEffect(() => {
    if (hasHandledRef.current) {
      return;
    }
    hasHandledRef.current = true;

    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const accessToken = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');

    const isHttps = window.location.protocol === 'https:';
    const shouldAutoLogin = Boolean(accessToken && refreshToken);

    if (success === 'true' || error === 'already_verified') {
      localStorage.removeItem('user_logged_out');

      // Allow auto-login by storing tokens for AuthProvider refresh flow
      if (shouldAutoLogin) {
        setCookie('token', accessToken!, {
          path: '/',
          maxAge: 3600, // 1 hour
          secure: isHttps,
          sameSite: 'lax',
        });

        setCookie('refreshToken', refreshToken!, {
          path: '/',
          maxAge: 3600 * 24 * 7, // 7 days
          secure: isHttps,
          sameSite: 'lax',
        });
      }

      // Remove sensitive query params from the URL
      navigate('/email-confirmation?success=true', { replace: true });

      setStatus('success');
      setMessage('Your email has been confirmed. Redirecting...');

      const timeout = window.setTimeout(() => {
        if (shouldAutoLogin) {
          // Full page reload ensures AuthProvider initializes from the freshly set cookies.
          window.location.href = '/dashboard';
          return;
        }

        window.location.href = '/auth?login=true&verified=true';
      }, 1500);

      return () => window.clearTimeout(timeout);
    }

    let errorMessage = 'Email confirmation failed.';
    switch (error) {
      case 'missing_token':
        errorMessage = 'Confirmation link is invalid. Please request a new one.';
        break;
      case 'invalid_or_expired':
        errorMessage = 'Confirmation link is invalid or has expired. Please request a new one.';
        break;
      case 'server_error':
      default:
        errorMessage = 'An error occurred while confirming your email. Please try again later.';
        break;
    }

    // Remove any token from URL, keep only the error code for debugging
    const cleanError = error || 'server_error';
    navigate(`/email-confirmation?success=false&error=${encodeURIComponent(cleanError)}`, {
      replace: true,
    });

    setStatus('error');
    setMessage(errorMessage);

    const timeout = window.setTimeout(() => {
      navigate('/auth?login=true', { replace: true });
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [navigate, searchParams, setCookie]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8 bg-background'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg'>
              <Loader2 className='animate-spin h-12 w-12 text-primary mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-foreground mb-2'>Confirming your email...</h2>
              <p className='text-muted-foreground'>{message}</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8 bg-background'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg'>
              <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-foreground mb-2'>Email confirmed</h2>
              <p className='text-muted-foreground mb-4'>{message}</p>
              <div className='animate-pulse text-sm text-muted-foreground'>Redirecting...</div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8 bg-background'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg'>
              <XCircle className='h-16 w-16 text-destructive mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-foreground mb-2'>Email confirmation</h2>
              <p className='text-muted-foreground mb-4'>{message}</p>
              <div className='animate-pulse text-sm text-muted-foreground'>
                Redirecting to sign in...
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
