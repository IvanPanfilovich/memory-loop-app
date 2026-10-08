import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { passwordFieldValidation, passwordConfirmFieldValidation } from '@/shared';
import { Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '@/features/reset-password/hooks';

type FormValues = {
  password: string;
  confirmPassword: string;
};

interface ResetPasswordFormProps {
  token: string;
  onBack: () => void;
}

export const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ token, onBack }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onChange' });
  const password = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate, isPending } = useResetPassword();

  const onSubmit = (data: FormValues) => {
    mutate({ token, newPassword: data.password });
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <ScrollArea className='flex-1 min-h-0'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='flex flex-col items-start gap-2'>
          <div className='relative w-full'>
            <Input
              data-testid='sign-up-password-input'
              type={showPassword ? 'text' : 'password'}
              className={
                errors?.password
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
          {errors.password && (
            <p data-testid='sign-up-password-error' className='text-destructive text-sm'>
              {errors.password.message}
            </p>
          )}
        </div>
        <div className='flex flex-col items-start gap-2'>
          <div className='relative w-full'>
            <Input
              data-testid='sign-up-confirm-password-input'
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
              {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p data-testid='sign-up-confirm-password-error' className='text-destructive text-sm'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className='grid grid-cols-[auto_1fr] max-[550px]:grid-cols-1 gap-2'>
          <Button
            size='lg'
            variant='outline'
            className='w-full whitespace-normal'
            type='button'
            onClick={onBack}
            disabled={isPending}
          >
            {t('home.dialogs.resetPassword.buttons.back')}
          </Button>
          <Button
            data-testid='sign-up-reset-password-submit-button'
            size='lg'
            className='w-full whitespace-normal'
            type='submit'
            disabled={isPending}
          >
            {isPending
              ? t('common.loading', 'Loading...')
              : t('home.dialogs.resetPassword.buttons.save')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};
