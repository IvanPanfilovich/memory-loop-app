import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { useEffect } from 'react';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRequestPasswordReset } from '@/features/reset-password/hooks';
import { emailFieldValidation } from '@/shared';

interface RequestResetPasswordFormProps {
  onBack: () => void;
}

export const RequestResetPasswordForm: FC<RequestResetPasswordFormProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<{ email: string }>();
  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset();

  const onSubmit = (data: { email: string }) => {
    requestPasswordReset(data.email);
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <ScrollArea className='flex-1 min-h-0'>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4 text-card-foreground'>
        <div className='flex flex-col items-start gap-2'>
          <Input
            data-testid='sign-in-forgot-password-email-input'
            id='email'
            placeholder={t('globalFields.email.label')}
            className={errors?.email ? 'border-destructive' : ''}
            {...register('email', {
              ...emailFieldValidation,
              onChange: e => {
                setValue('email', e.target.value.replace(/\s+/g, ''));
              },
            })}
            inputMode='email'
          />
          {errors.email && (
            <p data-testid='sign-up-email-error' className='text-destructive text-sm'>
              {errors.email.message}
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
            data-testid='sign-in-forgot-password-submit-button'
            size='lg'
            className='w-full whitespace-normal'
            type='submit'
            disabled={isPending}
          >
            {isPending
              ? t('common.loading', 'Loading...')
              : t('home.dialogs.resetPassword.buttons.send')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};
