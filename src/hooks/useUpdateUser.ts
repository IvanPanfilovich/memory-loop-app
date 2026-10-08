import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser, transformBackendUser, type UpdateUserRequest } from '@/services/userService';
import { useAppDispatch } from '@/store/hooks';
import { updateUser as updateUserAction } from '@/store/slices/authSlice';
import { getAuthToken } from '@/services/reduxTokenService';

export const useUpdateUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const updateUserData = async (userData: UpdateUserRequest) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = getAuthToken();

    if (!token) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await updateUser(user.id, userData, token);

      const transformedUser = transformBackendUser(updatedUser);

      dispatch(updateUserAction(transformedUser));

      return transformedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      console.error('Error updating user:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    updateUserData,
    isLoading,
    error,
    clearError,
  };
};
