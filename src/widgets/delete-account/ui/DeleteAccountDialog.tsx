import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { validateEmail } from '@/shared/constants/validation';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  password: string;
  email: string;
}

export const DeleteAccountDialog = ({ isOpen, onClose }: DeleteAccountDialogProps) => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isOAuthUser = user?.oauth === 'google';
  const isPasswordUser = user?.oauth === null || user?.oauth === undefined;
  const isAuthMethodDetected = isOAuthUser || isPasswordUser;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      password: '',
      email: '',
    },
  });

  const watchedPassword = watch('password');
  const watchedEmail = watch('email');

  const onSubmit = (_data: FormData) => {
    setIsConfirmDialogOpen(true);
  };

  const handleClose = () => {
    reset();
    setIsLoading(false);
    onClose();
  };

  const handleConfirmClose = () => {
    setIsConfirmDialogOpen(false);
    handleClose();
  };

  const isFormValid = isPasswordUser
    ? watchedPassword && watchedPassword.trim().length > 0
    : isOAuthUser
      ? watchedEmail && watchedEmail.trim().length > 0 && validateEmail(watchedEmail)
      : false; // Fallback for unknown auth types

  if (authLoading || !user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='w-5 h-5' />
              {t('profile.deleteAccount.title')}
            </DialogTitle>
            <DialogDescription>{t('profile.deleteAccount.description')}</DialogDescription>
          </DialogHeader>
          <div className='py-4 text-center'>
            <p className='text-muted-foreground'>{t('common.loading')}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='w-5 h-5' />
              {t('profile.deleteAccount.title')}
            </DialogTitle>
            <DialogDescription>{t('profile.deleteAccount.description')}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-4 py-4'>
              {isPasswordUser ? (
                <div className='space-y-2'>
                  <Label htmlFor='password'>{t('profile.deleteAccount.enterPassword')}</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: t('validation.password.required'),
                        minLength: {
                          value: 6,
                          message: t('validation.password.minLength'),
                        },
                      })}
                      placeholder={t('profile.deleteAccount.passwordPlaceholder')}
                      className={`w-full pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className='text-sm text-destructive'>{errors.password.message}</p>
                  )}
                </div>
              ) : isOAuthUser ? (
                <div className='space-y-2'>
                  <Label htmlFor='email'>{t('profile.deleteAccount.enterEmail')}</Label>
                  <Input
                    id='email'
                    type='email'
                    {...register('email', {
                      required: t('validation.email.required'),
                      validate: value => {
                        const validation = validateEmail(value);
                        if (!validation.isValid) {
                          return t('validation.email.invalid');
                        }
                        return true;
                      },
                    })}
                    placeholder={t('profile.deleteAccount.emailPlaceholder')}
                    className={`w-full ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.email && (
                    <p className='text-sm text-destructive'>{errors.email.message}</p>
                  )}
                </div>
              ) : !isAuthMethodDetected ? (
                <div className='text-center text-muted-foreground'>
                  <p>{t('profile.deleteAccount.unsupportedAuthType')}</p>
                  <p className='text-xs mt-2'>
                    {t('profile.deleteAccount.debugInfo', 'Debug: oauth={{oauth}}, user={{user}}', {
                      oauth: String(user?.oauth),
                      user: user ? 'exists' : 'null',
                    })}
                  </p>
                </div>
              ) : null}
            </div>
          </form>

          <DialogFooter className='flex gap-2'>
            <Button variant='outline' onClick={handleClose} className='flex-1'>
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              variant='destructive'
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading || !isFormValid || !isAuthMethodDetected}
              className='flex-1'
            >
              {t('profile.deleteAccount.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleConfirmClose}
        password={watchedPassword || ''}
        email={watchedEmail || ''}
        isOAuthUser={isOAuthUser}
      />
    </>
  );
};
