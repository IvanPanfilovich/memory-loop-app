import { createContext, useContext } from 'react';

interface SignInDialogContextType {
  isSignInDialogOpen: boolean;
  openSignInDialog: () => void;
  closeSignInDialog: () => void;
}

export const SignInDialogContext = createContext<SignInDialogContextType | undefined>(undefined);

export const useSignInDialog = () => {
  const context = useContext(SignInDialogContext);
  if (context === undefined) {
    throw new Error('useSignInDialog must be used within a SignInDialogProvider');
  }
  return context;
};
