import { SERVER_URL } from '@/shared/constants/server';

export const requestPasswordReset = async (email: string): Promise<void> => {
  const response = await fetch(`${SERVER_URL}/api/auth/request-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for CORS requests
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to request password reset!';
    try {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(errorMessage);
  }
};
