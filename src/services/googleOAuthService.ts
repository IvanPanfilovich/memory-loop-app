import { SERVER_URL } from '@/shared';
import type { User } from '@/entities/user/types/User';
import Cookies from 'js-cookie';

export interface UserData {
  user: User;
  token: string;
  refreshToken: string;
}

export interface OAuthCallbackResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  error?: string;
}

class GoogleOAuthService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = SERVER_URL;
  }

  initiateGoogleLogin(): void {
    try {
      // Get referral code from cookie if available
      const referralCode = this.getReferralCodeFromCookie();

      // Use current origin for callback URL to ensure OAuth state cookie matches domain
      const callbackUrl = `${window.location.origin}/auth/callback`;
      let googleLoginUrl = `${this.apiBaseUrl}/api/auth/google/login?callback_url=${encodeURIComponent(callbackUrl)}`;

      // Add referral code to URL if available
      if (referralCode) {
        googleLoginUrl += `&invite_code=${encodeURIComponent(referralCode)}`;
      }

      // Use window.location.assign for better reliability than href
      window.location.assign(googleLoginUrl);
    } catch (error) {
      console.error('GoogleOAuthService - Error initiating Google login:', error);
      throw error;
    }
  }

  /**
   * Get referral code from cookie
   */
  private getReferralCodeFromCookie(): string | null {
    try {
      const referralCode = Cookies.get('referral_code');

      // Also try reading from document.cookie as fallback
      if (!referralCode && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'referral_code') {
            const decodedValue = decodeURIComponent(value);
            return decodedValue;
          }
        }
      }

      return referralCode || null;
    } catch (error) {
      console.error('GoogleOAuthService - Error reading referral code cookie:', error);
      return null;
    }
  }

  /**
   * Handle OAuth callback from URL parameters
   */
  handleCallback(): OAuthCallbackResult {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refresh_token');

    if (token && refreshToken) {
      this.clearUrlParameters();

      return {
        success: true,
        token,
        refreshToken,
      };
    } else {
      return {
        success: false,
        error: 'Missing tokens in callback URL',
      };
    }
  }

  /**
   * Complete OAuth login using refresh token
   * This just returns the tokens - AuthProvider will handle getting user data
   */
  async completeOAuthLoginWithCookies(token: string, refreshToken: string): Promise<UserData> {
    try {
      if (!token || !refreshToken) {
        throw new Error('Missing OAuth tokens');
      }

      const userData: UserData = {
        user: {
          id: 0, // Placeholder - will be filled by AuthProvider
          email: '', // Placeholder - will be filled by AuthProvider
          password_hashed: '',
          oauth: 'google',
          refresh_token: null,
          created_at: null,
          email_verified: false,
          locale: null,
          currency: null,
          display_name: null,
          consent: null,
          date_of_birth: null,
          country: null,
          is_deleted: false,
          credits_balance: 0,
          subscription_status: 'none',
          is_premium: false,
          premium_expires_at: null,
          premium_canceled_at: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          firstName: '',
          lastName: '',
        },
        token: token,
        refreshToken: refreshToken,
      };

      return userData;
    } catch (error) {
      console.error('GoogleOAuthService - Error completing OAuth:', error);
      throw error;
    }
  }

  /**
   * Complete OAuth login process
   */
  async completeOAuthLogin(token: string, refreshToken: string): Promise<UserData> {
    try {
      const userData = await this.completeOAuthLoginWithCookies(token, refreshToken);

      return userData;
    } catch (error) {
      console.error('GoogleOAuthService - Error completing OAuth login:', error);
      throw error;
    }
  }

  /**
   * Clear URL parameters after processing
   */
  private clearUrlParameters(): void {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, document.title, url.toString());
  }
}

export const googleOAuthService = new GoogleOAuthService();
