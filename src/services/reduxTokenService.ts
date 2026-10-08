import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

export const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    return state.auth.token;
  } catch (error) {
    console.error('Error getting auth token from Redux:', error);
    return null;
  }
};

/**
 * Clear auth tokens from Redux state and localStorage.
 * This ensures a complete logout.
 */
export const clearAuthTokens = (): void => {
  try {
    store.dispatch(logout());

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  } catch (error) {
    console.error('Error clearing tokens from Redux:', error);
  }
};
