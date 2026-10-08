import { useState, type ReactNode } from 'react';
import { SignInDialogContext } from './SignInDialogContext';

interface SignInDialogProviderProps {
  children: ReactNode;
}

export const SignInDialogProvider = ({ children }: SignInDialogProviderProps) => {
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);

  const openSignInDialog = () => {
    setIsSignInDialogOpen(true);
  };

  const closeSignInDialog = () => {
    setIsSignInDialogOpen(false);
  };

  return (
    <SignInDialogContext.Provider
      value={{
        isSignInDialogOpen,
        openSignInDialog,
        closeSignInDialog,
      }}
    >
      {children}
    </SignInDialogContext.Provider>
  );
};
