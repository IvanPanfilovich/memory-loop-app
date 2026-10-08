import { SERVER_URL } from '@/shared/constants/server';
import { useAuthTokens } from '@/hooks/useAuthTokens';

/**
 * Subscription status from the API
 */
export interface SubscriptionStatus {
  user_id: number;
  subscription_status: 'none' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  is_premium: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
}

/**
 * Create subscription checkout request
 */
export interface CreateCheckoutRequest {
  price_id: string;
  success_url: string;
  cancel_url: string;
}

/**
 * Create subscription checkout response
 */
export interface CreateCheckoutResponse {
  url: string;
}

/**
 * Cancel subscription response
 */
export interface CancelSubscriptionResponse {
  status: string;
  message: string;
  current_period_end: string;
  stripe_subscription_id: string;
}

/**
 * Hook to access subscription service methods
 */
export const useSubscriptionService = () => {
  const { token } = useAuthTokens();

  const getAuthHeaders = () => {
    if (!token) {
      throw new Error('Missing auth token');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  /**
   * Get subscription status for the current user
   */
  const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
    const response = await fetch(`${SERVER_URL}/api/subscriptions/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
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

  /**
   * Create a subscription checkout session
   */
  const createCheckout = async (
    request: CreateCheckoutRequest
  ): Promise<CreateCheckoutResponse> => {
    const response = await fetch(`${SERVER_URL}/api/subscriptions/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
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

  /**
   * Cancel the user's subscription (at period end)
   */
  const cancelSubscription = async (): Promise<CancelSubscriptionResponse> => {
    const response = await fetch(`${SERVER_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error cases
      if (errorData?.error === 'no_subscription') {
        throw new Error('You do not have an active subscription to cancel.');
      }

      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  };

  return {
    getSubscriptionStatus,
    createCheckout,
    cancelSubscription,
  };
};
