import { SERVER_URL } from '@/shared/constants/server';

export interface CreditsBalance {
  credits_balance: number; // Credits balance in cents (100 credits = 100 cents = $1.00)
  balance_usd: number; // Balance converted to USD
  user_id: number; // User ID
}

/**
 * Fetch the current user's credits balance
 */
export const getCreditsBalance = async (token: string): Promise<CreditsBalance> => {
  if (!token) {
    throw new Error('Missing auth token');
  }

  const response = await fetch(`${SERVER_URL}/api/credits/balance`, {
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

  const data = await response.json();
  return data;
};
