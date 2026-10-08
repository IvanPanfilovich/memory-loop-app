import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shadcn/components/ui/dialog';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';
import { RequestResetPasswordForm } from '../reset-password/RequestResetPasswordForm';
import { ResetPasswordForm } from '../reset-password/ResetPasswordForm';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router';
import type { AuthResponse } from '@/entities/user/types/User';

interface IStateBasedSignInDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessfulAuth: (data: AuthResponse) => void;
  defaultMode?: 'signin' | 'signup';
  preventClose?: boolean; // If true, dialog cannot be closed
}

type AuthMode = 'signin' | 'signup' | 'requestReset' | 'resetPassword';

export const StateBasedSignInDialog = ({
  isOpen,
  onOpenChange,
  onSuccessfulAuth,
  defaultMode = 'signin',
  preventClose = false,
}: IStateBasedSignInDialogProps) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [activeStep, setActiveStep] = useState(1);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const register = searchParams.get('register');
  const login = searchParams.get('login');
  const resetPassword = searchParams.get('reset-password');
  const token = searchParams.get('token');

  const handleOpenChange = (open: boolean) => {
    // Prevent closing if preventClose is true
    if (!open && preventClose) {
      return;
    }

    if (!open) {
      setMode(defaultMode);
      setActiveStep(1);

      // Remove all auth-related query parameters from URL
      const newSearchParams = new URLSearchParams(searchParams);
      if (newSearchParams.has('register')) {
        newSearchParams.delete('register');
      }
      if (newSearchParams.has('login')) {
        newSearchParams.delete('login');
      }
      if (newSearchParams.has('reset-password')) {
        newSearchParams.delete('reset-password');
      }
      if (newSearchParams.has('token')) {
        newSearchParams.delete('token');
      }

      // Preserve current path when closing dialog
      const currentPath = window.location.pathname;
      const newSearch = newSearchParams.toString();
      const newUrl = newSearch ? `${currentPath}?${newSearch}` : currentPath;

      if (currentPath === '/' || currentPath === '') {
        window.location.href = '/';
      } else {
        navigate(newUrl, { replace: true });
      }
    }
    onOpenChange(open);
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('reset-password');
    newSearchParams.delete('token');
    newSearchParams.set('login', 'true');
    // Preserve current path when switching back to sign-in
    const currentPath = window.location.pathname;
    navigate(`${currentPath}?${newSearchParams.toString()}`, { replace: true });
  };

  useEffect(() => {
    if (login === 'true') {
      setMode('signin');
    }

    if (register === 'true') {
      setMode('signup');
      setActiveStep(1);
    }

    if (resetPassword === 'true') {
      if (token) {
        setMode('resetPassword');
      } else {
        setMode('requestReset');
      }
    }
  }, [login, register, resetPassword, token]);

  const getDialogTitle = () => {
    switch (mode) {
      case 'signup':
        return t('home.dialogs.signUp.title');
      case 'requestReset':
      case 'resetPassword':
        return t('home.dialogs.resetPassword.title');
      default:
        return t('home.dialogs.signIn.title');
    }
  };

  const getDialogDescription = () => {
    if (mode === 'requestReset') {
      return t('home.dialogs.resetPassword.description');
    }
    return null;
  };

  const getDialogWidth = () => {
    if (mode === 'requestReset' || mode === 'resetPassword') {
      return 'sm:max-w-md';
    }
    return 'sm:max-w-2xl';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${getDialogWidth()} bg-card max-h-[90vh] overflow-hidden flex flex-col`}
        onOpenAutoFocus={e => e.preventDefault()}
        showCloseButton={!preventClose}
        onInteractOutside={e => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={e => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
        data-testid={
          mode === 'signup'
            ? 'sign-up-dialog'
            : mode === 'requestReset' || mode === 'resetPassword'
              ? 'reset-password-dialog'
              : 'sign-in-dialog'
        }
      >
        <DialogHeader className='mb-4 flex-shrink-0'>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          {getDialogDescription() && (
            <DialogDescription className='text-sm !text-foreground'>
              {getDialogDescription()}
            </DialogDescription>
          )}
        </DialogHeader>

        {mode === 'signup' ? (
          <ScrollArea className='max-h-[calc(90vh-12rem)]'>
            <div className='p-1'>
              <SignUpForm activeStep={activeStep} setActiveStep={setActiveStep} />
            </div>
          </ScrollArea>
        ) : mode === 'requestReset' ? (
          <div className='p-1 flex-1 min-h-0'>
            <RequestResetPasswordForm onBack={handleBackToSignIn} />
          </div>
        ) : mode === 'resetPassword' ? (
          <div className='p-1 flex-1 min-h-0'>
            <ResetPasswordForm token={token || ''} onBack={handleBackToSignIn} />
          </div>
        ) : (
          <div className='p-1'>
            <SignInForm
              onSuccessfulAuth={onSuccessfulAuth}
              onForgotPassword={() => setMode('requestReset')}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
