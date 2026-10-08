import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { setDeletingAccount } from '@/store/slices/authSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Button } from '@/shadcn/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { showToast } from '@/shared/ui';
import { deleteUserAccount } from '@/entities';
import { clearAuthTokens } from '@/services/reduxTokenService';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  email: string;
  isOAuthUser: boolean;
}

export const ConfirmDeleteDialog = ({
  isOpen,
  onClose,
  password,
  email,
  isOAuthUser,
}: ConfirmDeleteDialogProps) => {
  const { t } = useTranslation();
  const { user, logout, token } = useAuth();
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      showToast(t('profile.deleteAccount.errorMessage'), 'error');
      return;
    }

    setIsDeleting(true);

    try {
      dispatch(setDeletingAccount(true));

      if (!token) {
        throw new Error('No authentication token found');
      }

      const verificationData = isOAuthUser ? { email: email } : { password: password };

      await deleteUserAccount(user.id, verificationData, token);

      showToast(t('profile.deleteAccount.successMessage'), 'success');

      clearAuthTokens();

      await logout();
      // Use full page reload
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('profile.deleteAccount.errorMessage');
      showToast(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
      dispatch(setDeletingAccount(false));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-destructive'>
            {t('profile.deleteAccount.confirmTitle')}
          </DialogTitle>
          <DialogDescription>{t('profile.deleteAccount.confirmDescription')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='bg-destructive/10 border border-destructive/20 rounded-md p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='w-5 h-5 text-destructive mt-0.5 flex-shrink-0' />
              <div className='space-y-2'>
                <p className='text-sm font-medium text-destructive'>
                  {t('profile.deleteAccount.finalWarning')}
                </p>
                <ul className='text-xs text-destructive/80 space-y-1'>
                  <li>• {t('profile.deleteAccount.warning1')}</li>
                  <li>• {t('profile.deleteAccount.warning2')}</li>
                  <li>• {t('profile.deleteAccount.warning3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isDeleting} className='flex-1'>
            {t('common.cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className='flex items-center gap-2 flex-1'
          >
            {isDeleting ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                {t('profile.deleteAccount.deleting')}
              </>
            ) : (
              t('profile.deleteAccount.deletePermanently')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
