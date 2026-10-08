import { SERVER_URL } from '@/shared';

export const register = async ({
  fullName,
  email,
  password,
  locale,
  country,
  date_of_birth,
  inviteCode,
}: {
  fullName: string;
  email: string;
  password: string;
  locale?: string;
  country?: string;
  date_of_birth?: string;
  inviteCode?: string;
}): Promise<{ data: { userId: string } }> => {
  const requestBody: {
    email: string;
    password: string;
    display_name: string;
    locale: string | null;
    country: string | null;
    date_of_birth: string | null;
    invite_code?: string;
  } = {
    email,
    password,
    display_name: fullName,
    locale: locale || null,
    country: country || null,
    date_of_birth: date_of_birth || null,
  };

  if (inviteCode) {
    requestBody.invite_code = inviteCode;
  }

  const response = await fetch(`${SERVER_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to register the user!';
    try {
      const errorText = await response.text();

      switch (errorText) {
        case 'invalid email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'invalid password':
          errorMessage =
            'Password must be 8-50 characters and contain uppercase, lowercase, number, and special character';
          break;
        case 'invalid display_name':
          errorMessage = 'Display name must be 3-20 characters';
          break;
        case 'invalid date_of_birth':
          errorMessage = 'Date of birth must be in YYYY-MM-DD format';
          break;
        case 'email already registered':
          errorMessage = 'An account with this email already exists';
          break;
        case 'invalid request':
          errorMessage = 'Please check your information and try again';
          break;
        case 'unable to check existing user':
        case 'failed to hash password':
        case 'failed to create user':
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = errorText || errorMessage;
      }
    } catch {
      /* ignore parse errors */
    }

    throw new Error(errorMessage);
  }

  try {
    const result = await response.json();
    return { data: { userId: result.id?.toString() || 'unknown' } };
  } catch (error) {
    throw new Error('Failed to parse the response: ' + error);
  }
};

export const resendVerificationEmail = async ({
  email,
}: {
  email: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await fetch(`${SERVER_URL}/api/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to resend verification email. Please try again.');
  }

  const data = await response.json();

  return {
    success: true,
    message: data.message || 'Verification email resent successfully!',
  };
};
