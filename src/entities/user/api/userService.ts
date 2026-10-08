import { SERVER_URL } from '@/shared';

export const deleteUserAccount = async (
  userId: number,
  verificationData: { password?: string; email?: string },
  token?: string
): Promise<void> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${SERVER_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
    body: JSON.stringify(verificationData),
  });

  if (response.status === 401) {
    throw new Error('Unauthorized - token expired or invalid');
  }

  if (response.status === 404) {
    throw new Error('User not found');
  }

  if (response.status === 400) {
    const errorText = await response.text();
    throw new Error(`Invalid verification data: ${errorText}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete account: ${errorText}`);
  }

  if (response.status !== 204) {
    throw new Error('Unexpected response from server');
  }
};
