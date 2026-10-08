import { SERVER_URL } from '@/shared/constants/server';

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${SERVER_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for CORS requests
    body: JSON.stringify({
      token,
      password: newPassword,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to reset password';

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_parseError) {
      try {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      } catch {
        /* ignore parse errors */
      }
    }

    switch (errorMessage.toLowerCase()) {
      case 'invalid token':
      case 'token not found':
      case 'token expired':
        throw new Error('INVALID_TOKEN');
      case 'token already used':
        throw new Error('TOKEN_USED');
      case 'password too weak':
        throw new Error('WEAK_PASSWORD');
      case 'user not found':
        throw new Error('USER_NOT_FOUND');
      default:
        throw new Error(errorMessage);
    }
  }
};
