import { OAUTH_CONFIG } from '@/config/oauth';
import { SERVER_URL } from '@/shared/constants/server';

/**
 * Redirect the user to the backend Google OAuth endpoint.
 *
 * The callback URL is derived from the current origin, so the OAuth state
 * cookie always matches the domain the user is actually browsing.
 */
export const initiateGoogleLogin = (): void => {
  const callbackUrl = `${window.location.origin}/auth/callback`;
  const googleLoginUrl = `${OAUTH_CONFIG.GOOGLE_LOGIN_URL}?callback_url=${encodeURIComponent(callbackUrl)}`;

  if (!googleLoginUrl.includes(SERVER_URL)) {
    console.error('ERROR: Google OAuth URL does not match SERVER_URL!');
    console.error('SERVER_URL:', SERVER_URL);
    console.error('GOOGLE_LOGIN_URL:', googleLoginUrl);
  }

  window.location.href = googleLoginUrl;
};
