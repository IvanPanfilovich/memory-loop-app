import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/entities/user/types/User';

interface AuthState {
  user: User | null;
  token: string | null; // Keep in memory only, not persisted
  refreshToken: string | null; // Keep in memory only, not persisted
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDeletingAccount: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent redirects during auth check
  error: null,
  isDeletingAccount: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    setDeletingAccount: (state, action: PayloadAction<boolean>) => {
      state.isDeletingAccount = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  logout,
  updateUser,
  clearError,
  setDeletingAccount,
} = authSlice.actions;

export default authSlice.reducer;
