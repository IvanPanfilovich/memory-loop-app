import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { useForm } from 'react-hook-form';
import {
  calculatePasswordStrength,
  passwordFieldValidation,
  passwordConfirmFieldValidation,
} from '@/shared';
import { Progress } from '@/shadcn/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shadcn/components/ui/tooltip';
import { Info, Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '@/features/reset-password/hooks';
import { useMemo } from 'react';

type FormValues = {
  password: string;
  confirmPassword: string;
};

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordStrengthTooltip, setShowPasswordStrengthTooltip] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onChange' });

  const password = watch('password');
  const { percentage, strength, colorClass } = useMemo(
    () => calculatePasswordStrength(password ?? ''),
    [password]
  );

  const { mutate: resetPassword, isPending } = useResetPassword();

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    } else {
      setIsValidToken(true);
    }
  }, [token]);

  const onSubmit = (data: FormValues) => {
    if (token) {
      resetPassword({ token, newPassword: data.password });
    }
  };

  if (isValidToken === null) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-center text-destructive'>
              {t('home.dialogs.resetPassword.messages.invalidToken')}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-muted-foreground mb-4'>
              {t('home.dialogs.resetPassword.messages.userNotFound')}
            </p>
            <Button
              onClick={() => {
                window.location.href = '/';
              }}
              className='w-full'
            >
              {t('common.backToHome', 'Back to Home')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center'>{t('home.dialogs.resetPassword.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <div className='relative'>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  className={
                    errors?.password
                      ? 'border-destructive focus-visible:ring-destructive pr-10'
                      : 'pr-10'
                  }
                  placeholder={t('globalFields.password.label')}
                  {...register('password', {
                    ...passwordFieldValidation,
                    validate: (v: string) =>
                      calculatePasswordStrength(v).percentage >= Math.round((3 / 6) * 100) ||
                      t('globalFields.password.validation.weakStrength'),
                  })}
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
                <p className='text-destructive text-sm'>{errors.password.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <div className='relative'>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={
                    errors?.confirmPassword
                      ? 'border-destructive focus-visible:ring-destructive pr-10'
                      : 'pr-10'
                  }
                  placeholder={t('globalFields.confirmPassword.label')}
                  {...register('confirmPassword', passwordConfirmFieldValidation(password))}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-destructive text-sm'>{errors.confirmPassword.message}</p>
              )}
            </div>

            {password && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <TooltipProvider>
                    <Tooltip
                      open={showPasswordStrengthTooltip}
                      onOpenChange={setShowPasswordStrengthTooltip}
                    >
                      <TooltipTrigger asChild>
                        <div
                          className='flex items-center justify-center gap-2 cursor-pointer'
                          onClick={() => setShowPasswordStrengthTooltip(true)}
                        >
                          <Info className='size-4 text-primary/60' />
                          <h3 className='text-primary/60 text-xs'>
                            {t('globals.passwordStrength.title')}
                          </h3>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent align='start' className='max-w-xs'>
                        <p>{t('globals.passwordStrength.tooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <h4 className='text-xs font-medium' style={{ color: `var(--${colorClass})` }}>
                    {t(strength)}
                  </h4>
                </div>
                <Progress value={percentage} className='w-full h-1.5' />
              </div>
            )}

            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending
                ? t('common.loading', 'Loading...')
                : t('home.dialogs.resetPassword.buttons.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
