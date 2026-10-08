import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Button } from '@/shadcn/components/ui/button';
import { CreditCard, UserPlus, X } from 'lucide-react';

interface NoCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteFriend?: () => void;
}

export const NoCreditsDialog = ({ isOpen, onClose, onInviteFriend }: NoCreditsDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    onClose();
    navigate('/paywall');
  };

  const handleInviteFriend = () => {
    onClose();
    if (onInviteFriend) {
      onInviteFriend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CreditCard className='w-5 h-5 text-primary' />
            {t('credits.noCreditsTitle', 'No Credits Available')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'credits.noCreditsDescription',
              'You have run out of credits. Get more credits by subscribing to Premium or inviting friends!'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3'>
            <div className='flex items-start gap-3'>
              <CreditCard className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <h3 className='font-semibold text-sm mb-1'>
                  {t('credits.subscribeOption', 'Subscribe to Premium')}
                </h3>
                <p className='text-xs text-muted-foreground'>
                  {t(
                    'credits.subscribeDescription',
                    'Get unlimited credits and access to all premium features.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3'>
            <div className='flex items-start gap-3'>
              <UserPlus className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <h3 className='font-semibold text-sm mb-1'>
                  {t('credits.inviteOption', 'Invite Friends')}
                </h3>
                <p className='text-xs text-muted-foreground'>
                  {t(
                    'credits.inviteDescription',
                    'Earn credits when your friends sign up using your referral link.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='flex-col sm:flex-row gap-2'>
          <Button variant='outline' onClick={onClose} className='w-full sm:w-auto'>
            <X className='w-4 h-4 mr-2' />
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant='outline' onClick={handleInviteFriend} className='w-full sm:w-auto'>
            <UserPlus className='w-4 h-4 mr-2' />
            {t('credits.inviteFriends', 'Invite Friends')}
          </Button>
          <Button onClick={handleSubscribe} className='w-full sm:w-auto'>
            <CreditCard className='w-4 h-4 mr-2' />
            {t('credits.subscribe', 'Subscribe')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
