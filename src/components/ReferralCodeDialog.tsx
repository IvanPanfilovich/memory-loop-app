import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { showToast } from '@/shared/ui';
import { Gift } from 'lucide-react';

interface ReferralCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REFERRAL_COOKIE_NAME = 'referral_code';

export const ReferralCodeDialog = ({ open, onOpenChange }: ReferralCodeDialogProps) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!code.trim()) {
      showToast(t('referrals.enterCode', 'Please enter a referral code'), 'error');
      return;
    }

    setIsSaving(true);

    try {
      // Store referral code in cookie (expires in 30 days)
      Cookies.set(REFERRAL_COOKIE_NAME, code.trim(), {
        expires: 30,
        sameSite: 'lax',
        secure: window.location.protocol === 'https:',
      });

      showToast(
        t(
          'referrals.codeSavedSuccessfully',
          'Referral code saved successfully! Proceed to sign up via email or OAuth.'
        ),
        'success'
      );

      // Close dialog and reset form
      setCode('');
      onOpenChange(false);
    } catch (error) {
      console.error('[ReferralCodeDialog] Error saving referral code:', error);
      showToast(
        t('referrals.saveError', 'Failed to save referral code. Please try again.'),
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCode('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <Gift className='w-5 h-5 text-primary' />
            <DialogTitle>{t('referrals.enterCodeTitle', 'Enter Referral Code')}</DialogTitle>
          </div>
          <DialogDescription>
            {t(
              'referrals.enterCodeDescription',
              'Enter your referral code to get credits when you sign up.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <label htmlFor='referral-code' className='text-sm font-medium text-foreground'>
              {t('referrals.referralCode', 'Referral Code')}
            </label>
            <Input
              id='referral-code'
              placeholder={t('referrals.codePlaceholder', 'Enter referral code')}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => {
                if (e.key === 'Enter' && code.trim()) {
                  handleSave();
                }
              }}
              disabled={isSaving}
              autoFocus
            />
          </div>

          <div className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={handleCancel} disabled={isSaving}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !code.trim()}>
              {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
