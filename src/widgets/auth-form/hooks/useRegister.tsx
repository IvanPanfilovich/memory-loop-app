import { useMutation } from '@tanstack/react-query';
import { register } from '../api/authService';
import { showToast } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

export const useRegister = (onSuccessfulRegistration: (userId: string) => void) => {
  const { t } = useTranslation();

  return useMutation<
    { data: { userId: string } },
    Error,
    {
      fullName: string;
      email: string;
      password: string;
      locale: string;
      country: string;
      date_of_birth: string;
      inviteCode?: string;
    }
  >({
    mutationFn: async ({
      fullName,
      email,
      password,
      locale,
      country,
      date_of_birth,
      inviteCode,
    }) => {
      return await register({
        fullName,
        email,
        password,
        locale,
        country,
        date_of_birth,
        inviteCode,
      });
    },
    onSuccess: data => {
      if (window.gtag) {
        window.gtag('event', 'sign-up form completed', {
          method: 'email',
          user_id: data.data.userId,
          page_path: location.pathname,
        });
      }

      onSuccessfulRegistration(data.data.userId);
    },
    onError: (error: Error) => {
      // Map error messages to translation keys
      const errorMessage = error.message;
      let translationKey = 'auth.errors.unexpected';

      if (
        errorMessage.includes('Please enter a valid email address') ||
        errorMessage.includes('invalid email')
      ) {
        translationKey = 'auth.errors.invalidEmail';
      } else if (
        errorMessage.includes('Password must be 8-50 characters') ||
        errorMessage.includes('invalid password')
      ) {
        translationKey = 'auth.errors.invalidPassword';
      } else if (
        errorMessage.includes('Display name must be 3-20 characters') ||
        errorMessage.includes('invalid display_name')
      ) {
        translationKey = 'auth.errors.invalidDisplayName';
      } else if (
        errorMessage.includes('Date of birth must be in YYYY-MM-DD format') ||
        errorMessage.includes('invalid date_of_birth')
      ) {
        translationKey = 'auth.errors.invalidDateOfBirth';
      } else if (
        errorMessage.includes('An account with this email already exists') ||
        errorMessage.includes('email already registered')
      ) {
        translationKey = 'auth.errors.emailAlreadyRegistered';
      } else if (
        errorMessage.includes('Please check your information') ||
        errorMessage.includes('invalid request')
      ) {
        translationKey = 'auth.errors.invalidRequest';
      } else if (
        errorMessage.includes('Server error') ||
        errorMessage.includes('Server error. Please try again later')
      ) {
        translationKey = 'auth.errors.serverError';
      } else if (errorMessage.includes('Failed to register')) {
        translationKey = 'auth.errors.failedToRegister';
      }

      showToast(t(translationKey, errorMessage), 'error');
    },
  });
};
