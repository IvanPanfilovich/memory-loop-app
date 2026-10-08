import { useResendVerificationEmail } from '../hooks';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/shared/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shadcn/components/ui/tooltip';

interface IResendButtonProps {
  email: string;
  activeStep?: number;
}

export const ResendButton: FC<IResendButtonProps> = ({ email, activeStep }) => {
  const { t } = useTranslation();
  const [resendTimeout, setResendTimeout] = useState(activeStep === 3 ? 30 : 0);
  const [resendAllowed, setResendAllowed] = useState(activeStep === 3 ? false : true);
  const { mutate: resendVerificationEmail, isPending: isResendLoading } =
    useResendVerificationEmail();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startResendInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setResendAllowed(false);
    setResendTimeout(30);
    intervalRef.current = setInterval(() => {
      setResendTimeout(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setResendAllowed(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (activeStep === 3) {
      startResendInterval();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeStep, startResendInterval]);

  const resendButton = (
    <button
      data-testid='resend-button'
      className='w-fit px-4 py-2 rounded-md border border-primary/60 text-sm cursor-pointer transition-colors duration-300 hover:bg-primary/10 text-primary disabled:opacity-20 disabled:cursor-not-allowed whitespace-nowrap'
      onClick={() => {
        resendVerificationEmail(email, {
          onSuccess: () => {
            showToast(t('home.dialogs.signUp.fields.complete.resend.success'), 'success');
            startResendInterval();
          },
          onError: () => {
            showToast(t('home.dialogs.signUp.fields.complete.resend.error'), 'error');
          },
        });
      }}
      disabled={isResendLoading || !resendAllowed}
      type='button'
    >
      {resendAllowed
        ? t('home.dialogs.signUp.fields.complete.resend.button')
        : t('home.dialogs.signUp.fields.complete.resend.disabled', {
            time: resendTimeout,
          })}
    </button>
  );

  if (resendAllowed) return resendButton;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{resendButton}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {t('home.dialogs.signUp.fields.complete.resend.tooltip', {
              time: resendTimeout,
            })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
