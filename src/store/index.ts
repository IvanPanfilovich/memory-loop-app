import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';

// Persist config for auth - only persist non-sensitive user data
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'], // Only persist user data, NOT tokens
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  theme: themeReducer, // Theme is handled via cookies, not persisted
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [], // Don't persist root level, use individual slice configs
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
