import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to get the current user
 * This is an alias for the useAuth hook to match the expected API
 */
export const useUser = () => {
  const { user } = useAuth();
  return { user };
};
