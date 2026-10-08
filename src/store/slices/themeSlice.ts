import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import {
  getUserTheme,
  updateUserTheme,
  resetUserTheme,
  type UpdateThemeRequest,
} from '@/services/themeService';
import type { RootState } from '../index';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  muted: string;
  'muted-foreground': string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeState {
  lightColors: ThemeColors;
  darkColors: ThemeColors;
  defaultMode: 'light' | 'dark';
  customized: boolean;
  isLoading: boolean;
  error: string | null;
}

const THEME_COOKIE_NAME = 'theme-colors';
const THEME_COOKIE_MAX_AGE_DAYS = 365; // 1 year

// Default light theme colors (from index.css)
const defaultLightColors: ThemeColors = {
  background: 'oklch(98.5% 0.002 240)',
  foreground: 'oklch(15.0% 0.010 260)',
  card: 'oklch(100% 0 0)',
  'card-foreground': 'oklch(15.0% 0.010 260)',
  popover: 'oklch(100% 0 0)',
  'popover-foreground': 'oklch(15.0% 0.010 260)',
  primary: 'oklch(55% 0.22 280)',
  'primary-foreground': 'oklch(98% 0.005 280)',
  secondary: 'oklch(92% 0.008 280)',
  'secondary-foreground': 'oklch(25% 0.015 280)',
  accent: 'oklch(88% 0.015 280)',
  'accent-foreground': 'oklch(20% 0.015 280)',
  destructive: 'oklch(58% 0.24 15)',
  'destructive-foreground': 'oklch(98% 0.005 15)',
  muted: 'oklch(94% 0.005 250)',
  'muted-foreground': 'oklch(45% 0.010 260)',
  border: 'oklch(88% 0.005 260)',
  input: 'oklch(90% 0.005 260)',
  ring: 'oklch(55% 0.22 280)',
};

// Default dark theme colors (from index.css)
const defaultDarkColors: ThemeColors = {
  background: 'oklch(12% 0.015 260)',
  foreground: 'oklch(95% 0.005 280)',
  card: 'oklch(14% 0.015 260)',
  'card-foreground': 'oklch(95% 0.005 280)',
  popover: 'oklch(14% 0.015 260)',
  'popover-foreground': 'oklch(95% 0.005 280)',
  primary: 'oklch(65% 0.20 280)',
  'primary-foreground': 'oklch(98% 0.005 280)',
  secondary: 'oklch(28% 0.020 280)',
  'secondary-foreground': 'oklch(90% 0.010 280)',
  accent: 'oklch(25% 0.020 280)',
  'accent-foreground': 'oklch(95% 0.005 280)',
  destructive: 'oklch(62% 0.24 15)',
  'destructive-foreground': 'oklch(98% 0.005 15)',
  muted: 'oklch(20% 0.015 260)',
  'muted-foreground': 'oklch(75% 0.010 280)',
  border: 'oklch(25% 0.015 260)',
  input: 'oklch(22% 0.015 260)',
  ring: 'oklch(65% 0.20 280)',
};

// Helper to validate OKLCH color string
const isValidOklchColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') return false;
  // Check if it matches oklch pattern: oklch(L% C H) or oklch(L C H)
  const oklchPattern = /^oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+\s*\)$/;
  return oklchPattern.test(color.trim());
};

// Helper to validate and sanitize theme colors
const validateColors = (colors: Partial<ThemeColors>, defaults: ThemeColors): ThemeColors => {
  const validated: ThemeColors = { ...defaults };

  for (const key in colors) {
    if (Object.prototype.hasOwnProperty.call(colors, key)) {
      const colorKey = key as keyof ThemeColors;
      const value = colors[colorKey];

      if (value && isValidOklchColor(value)) {
        validated[colorKey] = value;
      } else {
        console.warn(
          `[ThemeSlice] Invalid color for ${key}: "${value}", using default: "${defaults[colorKey]}"`
        );
        // Use default value (already set above)
      }
    }
  }

  return validated;
};

// Helper to load theme from cookies
const loadThemeFromCookies = (): Omit<ThemeState, 'isLoading' | 'error'> => {
  try {
    const cookieValue = Cookies.get(THEME_COOKIE_NAME);

    if (cookieValue) {
      const parsed = JSON.parse(cookieValue);

      // Validate and sanitize colors
      const validatedLightColors = validateColors(parsed.lightColors || {}, defaultLightColors);
      const validatedDarkColors = validateColors(parsed.darkColors || {}, defaultDarkColors);

      // Validate defaultMode
      const defaultMode =
        parsed.defaultMode === 'light' || parsed.defaultMode === 'dark'
          ? parsed.defaultMode
          : 'dark'; // Default to dark if invalid

      return {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode,
        customized: parsed.customized ?? true, // If theme data exists in cookie, it's customized
      };
    }
  } catch (error) {
    console.error('[ThemeSlice] Failed to load theme from cookies:', error);
  }

  // Check localStorage for theme preference as fallback
  let defaultMode: 'light' | 'dark' = 'dark';
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-preference');
    if (stored === 'light' || stored === 'dark') {
      defaultMode = stored;
    }
  }

  return {
    lightColors: defaultLightColors,
    darkColors: defaultDarkColors,
    defaultMode,
    customized: false,
  };
};

// Helper to save theme to cookies
const saveThemeToCookies = (state: ThemeState) => {
  try {
    const value = JSON.stringify({
      lightColors: state.lightColors,
      darkColors: state.darkColors,
      defaultMode: state.defaultMode,
      customized: state.customized,
    });

    Cookies.set(THEME_COOKIE_NAME, value, {
      expires: THEME_COOKIE_MAX_AGE_DAYS,
      sameSite: 'lax',
      secure: window.location.protocol === 'https:',
    });

    // Also save to localStorage for ThemeToggle compatibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', state.defaultMode);
    }
  } catch (error) {
    console.error('[ThemeSlice] Failed to save theme to cookies:', error);
  }
};

// Async thunk to fetch theme from backend
export const fetchThemeFromBackend = createAsyncThunk(
  'theme/fetchFromBackend',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const themeData = await getUserTheme(token);

      // Validate and sanitize colors from backend
      const validatedLightColors = validateColors(themeData.lightColors, defaultLightColors);
      const validatedDarkColors = validateColors(themeData.darkColors, defaultDarkColors);

      // Validate defaultMode
      const defaultMode =
        themeData.defaultMode === 'light' || themeData.defaultMode === 'dark'
          ? themeData.defaultMode
          : 'dark';

      // Save to cookies as cache
      const themeState: ThemeState = {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode,
        customized: themeData.customized,
        isLoading: false,
        error: null,
      };
      saveThemeToCookies(themeState);

      return {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode,
        customized: themeData.customized,
      };
    } catch (error) {
      console.error('[ThemeSlice] Failed to fetch theme from backend:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch theme');
    }
  }
);

// Async thunk to save theme to backend
export const saveThemeToBackend = createAsyncThunk(
  'theme/saveToBackend',
  async (request: UpdateThemeRequest, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const themeData = await updateUserTheme(token, request);

      // Validate and sanitize colors from backend response
      const validatedLightColors = validateColors(themeData.lightColors, defaultLightColors);
      const validatedDarkColors = validateColors(themeData.darkColors, defaultDarkColors);

      // Validate defaultMode (use from request if provided, otherwise from response)
      const defaultMode =
        request.defaultMode === 'light' || request.defaultMode === 'dark'
          ? request.defaultMode
          : themeData.defaultMode === 'light' || themeData.defaultMode === 'dark'
            ? themeData.defaultMode
            : 'dark';

      // Save to cookies as cache
      const themeState: ThemeState = {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode,
        customized: themeData.customized,
        isLoading: false,
        error: null,
      };
      saveThemeToCookies(themeState);

      return {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode,
        customized: themeData.customized,
      };
    } catch (error) {
      console.error('[ThemeSlice] Failed to save theme to backend:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save theme');
    }
  }
);

// Async thunk to update defaultMode on backend
export const updateDefaultMode = createAsyncThunk(
  'theme/updateDefaultMode',
  async (defaultMode: 'light' | 'dark', { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      const themeState = state.theme;

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Update theme with new defaultMode
      const themeData = await updateUserTheme(token, {
        lightColors: themeState.lightColors,
        darkColors: themeState.darkColors,
        defaultMode,
        customized: themeState.customized,
      });

      // Validate and sanitize colors from backend response
      const validatedLightColors = validateColors(themeData.lightColors, defaultLightColors);
      const validatedDarkColors = validateColors(themeData.darkColors, defaultDarkColors);

      // Validate defaultMode
      const validatedDefaultMode =
        themeData.defaultMode === 'light' || themeData.defaultMode === 'dark'
          ? themeData.defaultMode
          : defaultMode;

      // Save to cookies as cache
      const updatedThemeState: ThemeState = {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode: validatedDefaultMode,
        customized: themeData.customized,
        isLoading: false,
        error: null,
      };
      saveThemeToCookies(updatedThemeState);

      return {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode: validatedDefaultMode,
        customized: themeData.customized,
      };
    } catch (error) {
      console.error('[ThemeSlice] Failed to update defaultMode on backend:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update default mode'
      );
    }
  }
);

// Async thunk to reset theme on backend
export const resetThemeOnBackend = createAsyncThunk(
  'theme/resetOnBackend',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const themeData = await resetUserTheme(token);

      // Validate and sanitize colors from backend response
      const validatedLightColors = validateColors(themeData.lightColors, defaultLightColors);
      const validatedDarkColors = validateColors(themeData.darkColors, defaultDarkColors);

      // Validate defaultMode
      const defaultMode =
        themeData.defaultMode === 'light' || themeData.defaultMode === 'dark'
          ? themeData.defaultMode
          : 'dark';

      // Clear cookies and save defaults
      Cookies.remove(THEME_COOKIE_NAME);
      const themeState: ThemeState = {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode,
        customized: themeData.customized,
        isLoading: false,
        error: null,
      };
      saveThemeToCookies(themeState);

      return {
        lightColors: validatedLightColors,
        darkColors: validatedDarkColors,
        defaultMode,
        customized: themeData.customized,
      };
    } catch (error) {
      console.error('[ThemeSlice] Failed to reset theme on backend:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reset theme');
    }
  }
);

const cookieTheme = loadThemeFromCookies();
const initialState: ThemeState = {
  ...cookieTheme,
  isLoading: false,
  error: null,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setLightColor: (state, action: PayloadAction<{ key: keyof ThemeColors; value: string }>) => {
      const { key, value } = action.payload;
      // Validate color before setting
      if (isValidOklchColor(value)) {
        state.lightColors[key] = value;
        state.customized = true;
        saveThemeToCookies(state);
      } else {
        console.warn(
          `[ThemeSlice] Invalid light color for ${key}: "${value}", keeping current value`
        );
        // Reset to default if completely invalid
        state.lightColors[key] = defaultLightColors[key];
      }
    },
    setDarkColor: (state, action: PayloadAction<{ key: keyof ThemeColors; value: string }>) => {
      const { key, value } = action.payload;
      // Validate color before setting
      if (isValidOklchColor(value)) {
        state.darkColors[key] = value;
        state.customized = true;
        saveThemeToCookies(state);
      } else {
        console.warn(
          `[ThemeSlice] Invalid dark color for ${key}: "${value}", keeping current value`
        );
        // Reset to default if completely invalid
        state.darkColors[key] = defaultDarkColors[key];
      }
    },
    setLightColors: (state, action: PayloadAction<Partial<ThemeColors>>) => {
      state.lightColors = { ...state.lightColors, ...action.payload };
      state.customized = true;
      saveThemeToCookies(state);
    },
    setDarkColors: (state, action: PayloadAction<Partial<ThemeColors>>) => {
      state.darkColors = { ...state.darkColors, ...action.payload };
      state.customized = true;
      saveThemeToCookies(state);
    },
    setBothColors: (
      state,
      action: PayloadAction<{ lightColors: Partial<ThemeColors>; darkColors: Partial<ThemeColors> }>
    ) => {
      // Validate and merge light colors
      const validatedLightColors = validateColors(action.payload.lightColors, state.lightColors);
      const validatedDarkColors = validateColors(action.payload.darkColors, state.darkColors);

      state.lightColors = validatedLightColors;
      state.darkColors = validatedDarkColors;
      state.customized = true;
      saveThemeToCookies(state);
    },
    resetToDefaults: state => {
      state.lightColors = defaultLightColors;
      state.darkColors = defaultDarkColors;
      state.customized = false;
      // Keep defaultMode when resetting (don't reset it)
      saveThemeToCookies(state);
    },
    setDefaultMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.defaultMode = action.payload;
      saveThemeToCookies(state);
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch theme from backend
    builder
      .addCase(fetchThemeFromBackend.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchThemeFromBackend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lightColors = action.payload.lightColors;
        state.darkColors = action.payload.darkColors;
        state.defaultMode = action.payload.defaultMode;
        state.customized = action.payload.customized;
      })
      .addCase(fetchThemeFromBackend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch theme';
        // Keep existing theme state on error (fallback to cookies/defaults)
      });

    // Save theme to backend
    builder
      .addCase(saveThemeToBackend.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveThemeToBackend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lightColors = action.payload.lightColors;
        state.darkColors = action.payload.darkColors;
        state.defaultMode = action.payload.defaultMode;
        state.customized = action.payload.customized;
      })
      .addCase(saveThemeToBackend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to save theme';
        // Keep local changes even if backend save fails
      });

    // Reset theme on backend
    builder
      .addCase(resetThemeOnBackend.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetThemeOnBackend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lightColors = action.payload.lightColors;
        state.darkColors = action.payload.darkColors;
        state.defaultMode = action.payload.defaultMode;
        state.customized = action.payload.customized;
      })
      .addCase(resetThemeOnBackend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to reset theme';
        // Fallback to local reset
        state.lightColors = defaultLightColors;
        state.darkColors = defaultDarkColors;
        state.customized = false;
        saveThemeToCookies(state);
      });

    // Update defaultMode
    builder
      .addCase(updateDefaultMode.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDefaultMode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lightColors = action.payload.lightColors;
        state.darkColors = action.payload.darkColors;
        state.defaultMode = action.payload.defaultMode;
        state.customized = action.payload.customized;
      })
      .addCase(updateDefaultMode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to update default mode';
        // Keep local defaultMode even if backend update fails
      });
  },
});

export const {
  setLightColor,
  setDarkColor,
  setLightColors,
  setDarkColors,
  setBothColors,
  resetToDefaults,
  setDefaultMode,
  clearError,
} = themeSlice.actions;

export default themeSlice.reducer;
