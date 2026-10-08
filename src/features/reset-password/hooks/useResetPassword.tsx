import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../api';
import { useNavigate } from 'react-router';
import { showToast } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

export const useResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      return await resetPassword(token, newPassword);
    },
    onSuccess: () => {
      showToast(t('home.dialogs.resetPassword.messages.passwordReset'), 'success');
      // Navigation will be handled by the dialog state management
      navigate('/?login=true', { replace: true });
    },
    onError: (error: Error) => {
      let errorMessage = t('home.dialogs.resetPassword.messages.error');

      switch (error.message) {
        case 'INVALID_TOKEN':
          errorMessage = t('home.dialogs.resetPassword.messages.invalidToken');
          break;
        case 'TOKEN_USED':
          errorMessage = t('home.dialogs.resetPassword.messages.tokenUsed');
          break;
        case 'WEAK_PASSWORD':
          errorMessage = t('home.dialogs.resetPassword.messages.weakPassword');
          break;
        case 'USER_NOT_FOUND':
          errorMessage = t('home.dialogs.resetPassword.messages.userNotFound');
          break;
        default:
          errorMessage = error.message || t('home.dialogs.resetPassword.messages.error');
      }

      showToast(errorMessage, 'error');
    },
  });
};
