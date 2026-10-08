import { SERVER_URL } from '@/shared/constants/server';

export const OAUTH_CONFIG = {
  GOOGLE_LOGIN_URL: `${SERVER_URL}/api/auth/google/login`,

  // Hardcoded callback URL - always use production domain
  CALLBACK_URL: 'https://app.memoryloop.co/auth/callback',

  PROVIDERS: {
    GOOGLE: {
      name: 'Google',
      icon: 'google',
      enabled: true,
    },
    MICROSOFT: {
      name: 'Microsoft',
      icon: 'microsoft',
      enabled: false,
    },
  },
} as const;

export type OAuthProvider = keyof typeof OAUTH_CONFIG.PROVIDERS;
