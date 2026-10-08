import { SERVER_URL } from '@/shared/constants/server';
import { getAuthToken } from '@/services/reduxTokenService';

export interface ReferralCodeResponse {
  code: string;
  invite_url: string;
  referred_count: number;
}

/**
 * Get referral code and invite URL
 */
export const getReferralCode = async (): Promise<ReferralCodeResponse> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Missing auth token');
  }

  const response = await fetch(`${SERVER_URL}/api/referrals/code`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (errorData && errorData.message) ||
      (errorData && errorData.error) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
};
