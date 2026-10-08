import React, { useEffect, useRef, type ReactNode } from 'react';
import { useCookies } from 'react-cookie';
import { SERVER_URL } from '@/shared';
import { initiateGoogleLogin } from '@/services/authService';
import { getCreditsBalance } from '@/services/creditsService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginSuccess, logout, setError, setLoading, updateUser } from '@/store/slices/authSlice';
import { fetchThemeFromBackend } from '@/store/slices/themeSlice';
import { AuthContext, type AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const {
    user,
    token,
    refreshToken: reduxRefreshToken,
    isAuthenticated,
    isLoading,
    error,
    isDeletingAccount,
  } = useAppSelector(state => state.auth);
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'refreshToken']);
  const authCheckRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const creditsFetchingRef = useRef(false);
  const themeFetchingRef = useRef(false);
  const hasAttemptedInitialRefresh = useRef(false);

  // Fetch credits balance when user is authenticated
  useEffect(() => {
    const fetchCredits = async () => {
      if (!isAuthenticated || !token || !user || creditsFetchingRef.current) {
        return;
      }

      try {
        creditsFetchingRef.current = true;
        const creditsData = await getCreditsBalance(token);

        // Update user's credits_balance
        if (user.credits_balance !== creditsData.credits_balance) {
          dispatch(
            updateUser({
              ...user,
              credits_balance: creditsData.credits_balance,
            })
          );
        }
      } catch (error) {
        console.error('AuthContext - Failed to fetch credits balance:', error);
        // Don't block the app if credits fetch fails
      } finally {
        creditsFetchingRef.current = false;
      }
    };

    // Fetch credits when user becomes authenticated
    if (isAuthenticated && token && user) {
      fetchCredits();
    }
    // Only depend on user.id to avoid re-fetching when user object changes due to credits update
  }, [isAuthenticated, token, user?.id, dispatch]);

  // Fetch theme from backend when user is authenticated
  useEffect(() => {
    const fetchTheme = async () => {
      if (!isAuthenticated || !token || !user || themeFetchingRef.current) {
        return;
      }

      try {
        themeFetchingRef.current = true;
        await dispatch(fetchThemeFromBackend()).unwrap();
      } catch (error) {
        console.error('[AuthContext] Failed to fetch theme from backend:', error);
        // Don't block the app if theme fetch fails - will use cookies/defaults
      } finally {
        themeFetchingRef.current = false;
      }
    };

    // Fetch theme when user becomes authenticated
    if (isAuthenticated && token && user) {
      fetchTheme();
    }
  }, [isAuthenticated, token, user?.id, dispatch]);

  // Initial auth check on mount - always attempt refresh on page load
  useEffect(() => {
    const checkAuth = async () => {
      // Only run once on initial mount
      if (hasAttemptedInitialRefresh.current) {
        return;
      }

      // If there's already a refresh in progress, wait for it
      if (refreshPromiseRef.current) {
        await refreshPromiseRef.current;
        return;
      }

      const userLoggedOut = localStorage.getItem('user_logged_out');
      if (userLoggedOut === 'true') {
        dispatch(setLoading(false));
        hasAttemptedInitialRefresh.current = true;
        return;
      }

      // Always attempt refresh on page load using HTTP-only cookies
      // This ensures we validate the session even if user was restored from Redux Persist
      const attemptRefresh = async (isRetry: boolean): Promise<void> => {
        // Prevent concurrent refresh calls - if one is in progress, wait for it
        if (authCheckRef.current && !isRetry) {
          if (refreshPromiseRef.current) {
            await refreshPromiseRef.current;
          }
          return;
        }

        // Mark as attempted immediately to prevent duplicate calls
        if (!isRetry) {
          hasAttemptedInitialRefresh.current = true;
          authCheckRef.current = true;
        }

        try {
          // Get refresh token from cookies first (most up-to-date), then Redux
          // According to API spec, refresh_token must be sent in request body
          // Prefer cookies over Redux since cookies are updated immediately after rotation
          const refreshToken = cookies.refreshToken || reduxRefreshToken || '';

          if (!refreshToken) {
            dispatch(setLoading(false));
            dispatch(logout());
            authCheckRef.current = false;
            refreshPromiseRef.current = null;
            return;
          }

          // API spec: POST /api/auth/refresh with refresh_token in body
          const response = await fetch(`${SERVER_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();

            // Validate response structure according to API spec
            // Response should have: token, access_token, refresh_token, user
            if (!data.user) {
              console.error('AuthProvider - Invalid response: missing user object');
              dispatch(setLoading(false));
              dispatch(logout());
              authCheckRef.current = false;
              refreshPromiseRef.current = null;
              return;
            }

            localStorage.removeItem('user_logged_out');

            // Get new tokens from response - API returns access_token, refresh_token, and token (same as access_token)
            // According to spec: token and access_token are the same, refresh_token is rotated
            const newToken = data.access_token || data.token;
            const newRefreshToken = data.refresh_token;

            // Update cookies with new tokens IMMEDIATELY to prevent using stale tokens
            // Note: If backend uses HTTP-only cookies, these won't be accessible,
            // but we still store them in Redux for reference
            if (newToken) {
              setCookie('token', newToken, {
                path: '/',
                maxAge: 3600, // 1 hour
                secure: true,
                sameSite: 'lax',
              });
            }

            if (newRefreshToken) {
              setCookie('refreshToken', newRefreshToken, {
                path: '/',
                maxAge: 3600 * 24 * 7, // 7 days
                secure: true,
                sameSite: 'lax',
              });
            }

            dispatch(
              loginSuccess({
                user: data.user,
                token: newToken || '',
                refreshToken: newRefreshToken || '',
              })
            );

            // Reset credits fetch flag to allow fetching after refresh
            creditsFetchingRef.current = false;
          } else if (response.status === 400) {
            // 400 Bad Request - Missing or invalid request body
            console.error('AuthProvider - Refresh returned 400: Invalid request body');
            dispatch(setLoading(false));
            dispatch(logout());
            removeCookie('token');
            removeCookie('refreshToken');
          } else if (response.status === 401) {
            // 401 Unauthorized - Invalid, expired, or revoked refresh token
            // This can happen if the token was already used (token rotation)
            dispatch(setLoading(false));
            dispatch(logout());
            removeCookie('token');
            removeCookie('refreshToken');
          } else if (!isRetry) {
            authCheckRef.current = false;
            setTimeout(() => {
              attemptRefresh(true);
            }, 5000);
          } else {
            dispatch(setLoading(false));
            dispatch(logout());
          }
        } catch {
          if (!isRetry) {
            authCheckRef.current = false;
            setTimeout(() => {
              attemptRefresh(true);
            }, 5000);
          } else {
            dispatch(setLoading(false));
            dispatch(logout());
          }
        } finally {
          authCheckRef.current = false;
          refreshPromiseRef.current = null;
        }
      };

      // Create and store the promise to prevent concurrent calls
      refreshPromiseRef.current = attemptRefresh(false);
      await refreshPromiseRef.current;
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  const login = async (email: string, password: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.removeItem('user_logged_out');

        setCookie('token', data.token, {
          path: '/',
          maxAge: data.expiresAt || 3600,
          secure: true, // Always use secure cookies in production
          sameSite: 'lax',
        });

        setCookie('refreshToken', data.refresh_token, {
          path: '/',
          maxAge: data.expiresAt || 3600,
          secure: true, // Always use secure cookies in production
          sameSite: 'lax',
        });

        dispatch(
          loginSuccess({
            user: data.user,
            token: data.token,
            refreshToken: data.refresh_token,
          })
        );

        // Reset credits fetch flag to allow fetching after login
        creditsFetchingRef.current = false;
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }
    } catch (error) {
      console.error('AuthContext - Login error details:', error);

      // Handle HTTP errors
      if (error instanceof TypeError && error.message.includes('HTTP error!')) {
        // Error already handled by fetch wrapper, just set loading to false
        dispatch(setLoading(false));
        throw error;
      }

      // Handle network errors (Failed to fetch)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        dispatch(
          setError(
            'Unable to connect to server. Please check your internet connection or try again later.'
          )
        );
        console.error('AuthContext - Network error: Server may be unreachable or CORS issue');
        console.error('AuthContext - Attempted URL:', `${SERVER_URL}/api/auth/login`);
      } else if (error instanceof Error) {
        dispatch(setError(error.message || 'Login failed'));
      } else {
        dispatch(setError('Login failed'));
      }

      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    dispatch(setLoading(true));

    try {
      await fetch(`${SERVER_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.warn('AuthContext - Backend logout failed, continuing with frontend cleanup:', error);
    }

    localStorage.setItem('user_logged_out', 'true');

    removeCookie('token');
    removeCookie('refreshToken');

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');

    dispatch(logout());
    dispatch(setLoading(false));

    // Reset credits fetch flag on logout
    creditsFetchingRef.current = false;
  };

  const loginWithGoogle = () => {
    initiateGoogleLogin();
  };

  const clearError = () => {
    dispatch(setError(null));
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isDeletingAccount,
    login,
    loginWithGoogle,
    logout: handleLogout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
