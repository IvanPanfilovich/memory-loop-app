import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Copy, Check, Share2, Loader2, Gift } from 'lucide-react';
import { getReferralCode, type ReferralCodeResponse } from '@/services/referralService';
import { showToast } from '@/shared/ui';

interface InviteFriendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Check if Web Share API is available and supported
 */
const canUseWebShare = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};

/**
 * Check if we're on a mobile device
 */
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const InviteFriendDialog = ({ isOpen, onClose }: InviteFriendDialogProps) => {
  const { t } = useTranslation();
  const [referralData, setReferralData] = useState<ReferralCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchReferralCode();
    } else {
      // Reset state when dialog closes
      setReferralData(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  const fetchReferralCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReferralCode();
      setReferralData(data);
    } catch (err) {
      console.error('Failed to fetch referral code:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('referrals.fetchError', 'Failed to load referral information')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!referralData?.invite_url) return;

    try {
      await navigator.clipboard.writeText(referralData.invite_url);
      setCopied(true);
      showToast(t('referrals.copied', 'Invite link copied to clipboard!'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast(t('referrals.copyError', 'Failed to copy link'), 'error');
    }
  };

  const handleShare = async () => {
    if (!referralData?.invite_url) return;

    // Check if Web Share API is available (mobile devices)
    if (canUseWebShare()) {
      try {
        await navigator.share({
          title: t('referrals.shareTitle', 'Join Memory Loop'),
          text: t(
            'referrals.shareText',
            'Join Memory Loop and start creating personalized recaps! Use my invite link:'
          ),
          url: referralData.invite_url,
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          // Fallback to copy on error
          handleCopy();
        }
      }
    } else {
      // Fallback to copy on desktop
      handleCopy();
    }
  };

  const showShareButton = isMobileDevice() && canUseWebShare();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <Gift className='w-5 h-5 text-primary' />
            <DialogTitle>{t('referrals.title', 'Invite a Friend')}</DialogTitle>
          </div>
          <DialogDescription>
            {t(
              'referrals.description',
              'Share your referral link and earn credits when friends sign up!'
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-8 space-y-4'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>
              {t('referrals.loading', 'Loading referral information...')}
            </p>
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center py-8 space-y-4'>
            <p className='text-sm text-destructive text-center'>{error}</p>
            <Button onClick={fetchReferralCode} variant='outline'>
              {t('referrals.tryAgain', 'Try Again')}
            </Button>
          </div>
        ) : referralData ? (
          <div className='space-y-4'>
            {/* Referral stats */}
            <div className='bg-primary/10 rounded-lg p-4 text-center'>
              <p className='text-2xl font-bold text-primary'>{referralData.referred_count}</p>
              <p className='text-sm text-muted-foreground mt-1'>
                {t('referrals.referredCount', 'Friends Referred')}
              </p>
            </div>

            {/* Referral code */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                {t('referrals.referralCode', 'Your Referral Code')}
              </label>
              <div className='flex items-center gap-2'>
                <Input value={referralData.code} readOnly className='font-mono font-semibold' />
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => {
                    navigator.clipboard.writeText(referralData.code);
                    showToast(t('referrals.codeCopied', 'Referral code copied!'), 'success');
                  }}
                >
                  <Copy className='w-4 h-4' />
                </Button>
              </div>
            </div>

            {/* Invite URL */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                {t('referrals.inviteLink', 'Invite Link')}
              </label>
              <div className='flex items-center gap-2'>
                <Input
                  value={referralData.invite_url}
                  readOnly
                  className='flex-1 font-mono text-xs'
                />
                {showShareButton ? (
                  <Button onClick={handleShare} className='flex items-center gap-2'>
                    <Share2 className='w-4 h-4' />
                    <span>{t('referrals.share', 'Share')}</span>
                  </Button>
                ) : (
                  <Button onClick={handleCopy} className='flex items-center gap-2'>
                    {copied ? (
                      <>
                        <Check className='w-4 h-4' />
                        <span>{t('referrals.copied', 'Copied!')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className='w-4 h-4' />
                        <span>{t('referrals.copy', 'Copy')}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
