import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset } from '../api';
import { showToast } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

export const useRequestPasswordReset = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (email: string) => {
      return await requestPasswordReset(email);
    },
    onSuccess: () => {
      showToast(t('home.dialogs.resetPassword.messages.emailSent'), 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || t('home.dialogs.resetPassword.messages.error'), 'error');
    },
  });
};
