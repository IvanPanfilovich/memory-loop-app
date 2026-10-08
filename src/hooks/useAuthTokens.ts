import { useAppSelector } from '@/store/hooks';

/**
 * Hook to get authentication tokens from Redux state
 * This replaces direct localStorage access throughout the app
 */
export const useAuthTokens = () => {
  const { token, refreshToken, isAuthenticated } = useAppSelector(state => state.auth);

  return {
    token,
    refreshToken,
    isAuthenticated,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
  };
};
