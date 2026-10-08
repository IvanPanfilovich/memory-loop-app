import { SERVER_URL } from '@/shared/constants/server';
import type { User } from '@/entities/user/types/User';

export interface UpdateUserRequest {
  email?: string;
  display_name?: string;
  locale?: string;
  currency?: string;
  country?: string;
  date_of_birth?: string;
}

export interface UpdateUserResponse {
  id: number;
  email: string;
  display_name: string | null;
  locale: string | null;
  currency: string | null;
  country: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at?: string;
  // Additional fields that may be returned from backend
  oauth?: string | null;
  refresh_token?: string | null;
  email_verified?: boolean;
  consent?: unknown | null;
  is_deleted?: boolean | null;
  credits_balance?: number;
  subscription_status?: string;
  is_premium?: boolean;
  premium_expires_at?: string | null;
  premium_canceled_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

export const updateUser = async (
  userId: number,
  userData: UpdateUserRequest,
  token: string
): Promise<UpdateUserResponse> => {
  const response = await fetch(`${SERVER_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (response.status === 401) {
    throw new Error('Unauthorized - token expired or invalid');
  }

  if (response.status === 404) {
    throw new Error('User not found');
  }

  if (!response.ok) {
    let errorMessage = 'Failed to update user';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch {
      try {
        const responseClone = response.clone();
        const errorText = await responseClone.text();
        errorMessage = errorText || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Transform backend user response to frontend User type
 * Preserves all fields from backend, using defaults only when not provided
 */
export const transformBackendUser = (backendUser: UpdateUserResponse): User => {
  return {
    id: backendUser.id,
    email: backendUser.email,
    password_hashed: '', // Not returned by backend for security
    oauth: backendUser.oauth ?? null,
    refresh_token: backendUser.refresh_token ?? null,
    created_at: backendUser.created_at,
    email_verified: backendUser.email_verified ?? false,
    locale: backendUser.locale,
    currency: backendUser.currency,
    display_name: backendUser.display_name,
    consent: backendUser.consent ?? null,
    date_of_birth: backendUser.date_of_birth,
    country: backendUser.country,
    is_deleted: backendUser.is_deleted ?? false,
    credits_balance: backendUser.credits_balance ?? 0, // Preserve from backend if provided
    subscription_status: backendUser.subscription_status || 'inactive',
    is_premium: backendUser.is_premium ?? false,
    premium_expires_at: backendUser.premium_expires_at ?? null,
    premium_canceled_at: backendUser.premium_canceled_at ?? null,
    stripe_customer_id: backendUser.stripe_customer_id ?? null,
    stripe_subscription_id: backendUser.stripe_subscription_id ?? null,
    firstName: backendUser.display_name?.split(' ')[0] || '',
    lastName: backendUser.display_name?.split(' ').slice(1).join(' ') || '',
  };
};
