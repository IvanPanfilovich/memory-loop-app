export interface User {
  // Identity & Authentication
  id: number; // Primary key (matches backend int32)
  email: string; // Unique, required
  password_hashed: string; // Required (can be empty for OAuth users)
  oauth: string | null; // OAuth provider (e.g., "google")
  refresh_token: string | null; // JWT refresh token

  // Profile Information
  created_at: string | null; // Account creation timestamp
  email_verified: boolean; // Email verification status
  locale: string | null; // User locale (default: 'en')
  currency: string | null; // Preferred currency
  display_name: string | null; // User's display name
  consent: unknown | null; // JSONB consent data
  date_of_birth: string | null; // Date of birth
  country: string | null; // User's country
  is_deleted: boolean | null; // Soft delete flag

  // Billing & Credits
  credits_balance: number; // Current credits (default: 0, matches backend int32)
  subscription_status: string; // 'none', 'active', 'canceled', 'trialing', 'past_due'
  is_premium: boolean; // Premium flag
  premium_expires_at: string | null; // Premium expiration date
  premium_canceled_at: string | null; // When premium was canceled

  // Stripe Integration
  stripe_customer_id: string | null; // Stripe customer ID
  stripe_subscription_id: string | null; // Stripe subscription ID

  // Computed fields (not from backend)
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
    refreshToken: string;
    expiresAt: number;
  };
}
