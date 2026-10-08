import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { SERVER_URL } from '@/shared';
import { Loader2, XCircle } from 'lucide-react';

type VerificationStatus = 'processing' | 'error';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasHandledRef = useRef(false);

  useLayoutEffect(() => {
    if (hasHandledRef.current) {
      return;
    }
    hasHandledRef.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setErrorMessage(
        'Verification token is missing. Please check your email for the correct link.'
      );
      setStatus('error');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return;
    }

    // Legacy route: send user to backend confirmation endpoint, backend will redirect back
    window.location.href = `${SERVER_URL}/api/auth/confirm?token=${encodeURIComponent(token)}`;
  }, [navigate, searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8 bg-background'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg'>
              <Loader2 className='animate-spin h-12 w-12 text-primary mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-foreground mb-2'>Verifying your email...</h2>
              <p className='text-muted-foreground'>Redirecting...</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className='flex flex-col items-center justify-center min-h-screen p-8 bg-background'>
            <div className='bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg'>
              <XCircle className='h-16 w-16 text-destructive mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-foreground mb-2'>Verification failed</h2>
              <p className='text-muted-foreground mb-4'>
                {errorMessage || 'Something went wrong during email verification.'}
              </p>
              <div className='animate-pulse text-sm text-muted-foreground'>Redirecting...</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
};
