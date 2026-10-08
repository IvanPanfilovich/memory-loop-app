import { Input } from '@/shadcn/components/ui/input';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { ReferralCodeDialog } from '@/components/ReferralCodeDialog';
import type { FC } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Loader2, Eye, EyeOff, Gift } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router';
import { ResendButton } from '../resend-button';
import type { AuthResponse } from '@/entities/user/types/User';
import { emailFieldValidation, passwordFieldValidation } from '@/shared';

const LOGIN_ERRORS: Record<string, string> = {
  'invalid email or password': 'home.dialogs.signIn.errors.invalidCredentials',
  'invalid email': 'home.dialogs.signIn.errors.invalidCredentials',
  'invalid password': 'home.dialogs.signIn.errors.invalidCredentials',
  'invalid credentials': 'home.dialogs.signIn.errors.invalidCredentials',
  'user not found': 'home.dialogs.signIn.errors.invalidCredentials',
  'incorrect password': 'home.dialogs.signIn.errors.invalidCredentials',
  'account not verified': 'home.dialogs.signIn.errors.accountNotVerified',
  'email not verified': 'home.dialogs.signIn.errors.emailVerification.text1',
  'account locked': 'home.dialogs.signIn.errors.accountLocked',
  'network error': 'home.dialogs.signIn.errors.networkError',
  'server error': 'home.dialogs.signIn.errors.serverError',
  timeout: 'home.dialogs.signIn.errors.timeout',
};

interface ISignInFormProps {
  onSuccessfulAuth: (data: AuthResponse) => void;
  onForgotPassword?: () => void;
}

interface FormValues {
  email: string;
  password: string;
}

export const SignInForm: FC<ISignInFormProps> = ({
  onSuccessfulAuth: _onSuccessfulAuth,
  onForgotPassword,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const loginError = error
    ? (LOGIN_ERRORS[error.toLowerCase()] ?? 'home.dialogs.signIn.errors.unexpected')
    : null;
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormValues>({ mode: 'onChange' });

  const email = watch('email');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    clearError();

    try {
      await login(data.email, data.password);
      if (_onSuccessfulAuth) {
        _onSuccessfulAuth({} as AuthResponse);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className='grid gap-4 text-card-foreground' onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-col items-start gap-2'>
        <Input
          data-testid='sign-in-email-input'
          id='email'
          className={
            errors.email || error === 'invalid email or password' ? 'border-destructive' : ''
          }
          placeholder={t('globalFields.email.label')}
          {...register('email', emailFieldValidation)}
          inputMode='email'
        />
        {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
      </div>

      <div className='flex flex-col items-start gap-2'>
        <div className='relative w-full'>
          <Input
            data-testid='sign-in-password-input'
            id='password'
            type={showPassword ? 'text' : 'password'}
            className={
              errors.password || error === 'invalid email or password'
                ? 'border-destructive focus-visible:ring-destructive pr-10'
                : 'pr-10'
            }
            placeholder={t('globalFields.password.label')}
            {...register('password', passwordFieldValidation)}
          />
          <button
            type='button'
            className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground'
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
          </button>
        </div>
        {errors.password && <p className='text-destructive text-sm'>{errors.password.message}</p>}
      </div>

      <AnimatePresence>
        {error && error === 'Email not verified' ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='flex gap-2 items-center justify-between w-full max-[450px]:flex-col max-[450px]:items-start'
          >
            <div className='flex flex-col gap-1'>
              <h1
                className='text-sm font-medium'
                dangerouslySetInnerHTML={{
                  __html: t('home.dialogs.signIn.errors.emailVerification.text1', { email }),
                }}
              />
              <h3 className='text-sm text-primary/60'>
                {t('home.dialogs.signIn.errors.emailVerification.text2')}
              </h3>
            </div>

            <ResendButton email={email ?? ''} />
          </motion.div>
        ) : (
          loginError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='text-sm font-medium text-destructive text-center'
            >
              {t(loginError)}
            </motion.div>
          )
        )}
      </AnimatePresence>

      <div
        data-testid='sign-in-forgot-password-button'
        className='ml-auto w-fit text-sm font-medium opacity-80 transition-opacity duration-300 hover:opacity-100 cursor-pointer'
        onClick={() => {
          if (onForgotPassword) {
            onForgotPassword();
          } else {
            navigate('/?reset-password=true');
          }
        }}
      >
        {t('home.dialogs.signIn.buttons.forgotPassword')}
      </div>

      <div className='w-full grid grid-cols-2 max-[500px]:grid-rows-2 max-[500px]:grid-cols-1 items-center gap-2'>
        <Button
          data-testid='dialog-sign-in-button'
          type='submit'
          disabled={
            isLoading ||
            isSubmitting ||
            !isValid ||
            errors.email !== undefined ||
            errors.password !== undefined
          }
          size='lg'
          className='w-full'
        >
          {isLoading || isSubmitting ? (
            <Loader2 className='animate-spin h-5 w-5' />
          ) : (
            t('home.dialogs.signIn.buttons.signIn')
          )}
        </Button>

        <Button
          type='button'
          data-testid='dialog-sign-up-button'
          size='lg'
          variant='outline'
          className='w-full'
          onClick={() => {
            // Preserve current path when switching to sign-up
            const currentPath = location.pathname;
            navigate(`${currentPath}?register=true`, { replace: true });
          }}
        >
          {t('home.dialogs.signIn.buttons.signUp')}
        </Button>
      </div>

      <div className='grid grid-cols-[1fr_auto_1fr] gap-2 items-center my-4'>
        <div className='w-full h-px bg-border rounded-full' />
        <h4 className='text-xs text-muted-foreground'>{t('home.dialogs.signIn.buttons.or')}</h4>
        <div className='w-full h-px bg-border rounded-full' />
      </div>

      <div className='w-full space-y-2'>
        <GoogleLoginButton
          data-testid='dialog-google-button'
          variant='outline'
          size='lg'
          fullWidth
        />

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='w-full text-xs text-muted-foreground hover:text-foreground'
          onClick={() => setShowReferralDialog(true)}
        >
          <Gift className='w-3 h-3 mr-1.5' />
          {t('referrals.haveCode', 'Have a referral code?')}
        </Button>
      </div>

      <ReferralCodeDialog open={showReferralDialog} onOpenChange={setShowReferralDialog} />
    </form>
  );
};
