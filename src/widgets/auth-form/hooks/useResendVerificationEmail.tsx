import { useMutation } from '@tanstack/react-query';
import { resendVerificationEmail } from '../api';

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationEmail({ email }),
  });
};
