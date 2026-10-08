import { createContext, useContext } from 'react';

interface NoCreditsDialogContextType {
  openNoCreditsDialog: () => void;
  closeNoCreditsDialog: () => void;
}

export const NoCreditsDialogContext = createContext<NoCreditsDialogContextType | undefined>(
  undefined
);

export const useNoCreditsDialog = (): NoCreditsDialogContextType => {
  const context = useContext(NoCreditsDialogContext);
  if (!context) {
    throw new Error('useNoCreditsDialog must be used within a NoCreditsDialogProvider');
  }
  return context;
};
