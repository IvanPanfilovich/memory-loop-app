import { SERVER_URL } from '@/shared/constants/server';
import type { ThemeColors } from '@/store/slices/themeSlice';

/**
 * Theme response from the API
 */
export interface ThemeResponse {
  lightColors: ThemeColors;
  darkColors: ThemeColors;
  defaultMode: 'light' | 'dark';
  customized: boolean;
}

/**
 * Update theme request
 */
export interface UpdateThemeRequest {
  lightColors: Partial<ThemeColors>;
  darkColors: Partial<ThemeColors>;
  defaultMode?: 'light' | 'dark';
  customized?: boolean;
}

/**
 * Get the user's theme from the backend
 */
export const getUserTheme = async (token: string): Promise<ThemeResponse> => {
  if (!token) {
    throw new Error('Missing auth token');
  }

  const response = await fetch(`${SERVER_URL}/api/theme`, {
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

/**
 * Update the user's theme on the backend
 */
export const updateUserTheme = async (
  token: string,
  request: UpdateThemeRequest
): Promise<ThemeResponse> => {
  if (!token) {
    throw new Error('Missing auth token');
  }

  const response = await fetch(`${SERVER_URL}/api/theme`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
 * Reset the user's theme to defaults on the backend
 */
export const resetUserTheme = async (token: string): Promise<ThemeResponse> => {
  if (!token) {
    throw new Error('Missing auth token');
  }

  const response = await fetch(`${SERVER_URL}/api/theme/reset`, {
    method: 'POST',
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
