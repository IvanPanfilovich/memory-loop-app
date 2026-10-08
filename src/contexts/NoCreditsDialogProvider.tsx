import React, { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NoCreditsDialog } from '@/components/NoCreditsDialog';
import { showToast } from '@/shared/ui';
import { NoCreditsDialogContext } from './NoCreditsDialogContext';

interface NoCreditsDialogProviderProps {
  children: ReactNode;
}

export const NoCreditsDialogProvider: React.FC<NoCreditsDialogProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const openNoCreditsDialog = () => {
    setIsOpen(true);
  };

  const closeNoCreditsDialog = () => {
    setIsOpen(false);
  };

  const handleInviteFriend = () => {
    showToast(
      t(
        'credits.inviteInstructions',
        'Click the "Invite" button in the header to invite friends and earn credits!'
      ),
      'info'
    );
  };

  return (
    <NoCreditsDialogContext.Provider value={{ openNoCreditsDialog, closeNoCreditsDialog }}>
      {children}
      <NoCreditsDialog
        isOpen={isOpen}
        onClose={closeNoCreditsDialog}
        onInviteFriend={handleInviteFriend}
      />
    </NoCreditsDialogContext.Provider>
  );
};
