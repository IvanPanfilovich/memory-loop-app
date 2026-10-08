import type { FC } from 'react';
import { useState } from 'react';
import { SidebarTrigger, useSidebar } from '@/shadcn/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from './theme';
import { Button } from '@/shadcn/components/ui/button';
import { User, Download, Info, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSignInDialog } from '@/contexts/SignInDialogContext';
import { useNavigate, useLocation } from 'react-router';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InviteFriendDialog } from '@/components/InviteFriendDialog';

export { ThemeToggle } from './theme';

export const AppHeader: FC<{
  title?: string;
  option?: 'sidebar' | 'shady';
}> = ({ title, option = 'sidebar' }) => {
  const { t } = useTranslation();
  const { open, isMobile } = useSidebar();
  const { user } = useAuth();
  const { openSignInDialog } = useSignInDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const { isInstalled, isInstallable, promptInstall } = usePWAInstall();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const getPageTitle = () => {
    if (title) return title;

    const pathname = location.pathname;

    // Handle exact matches first
    switch (pathname) {
      case '/':
        return t('landing.title', 'Welcome to Memory Loop');
      case '/dashboard':
        return t('dashboard.title', 'Dashboard');
      case '/profile':
        return t('profile.title');
      case '/privacy-policy':
        return t('sidebar.privacyPolicy', 'Privacy Policy');
      case '/terms-and-conditions':
        return t('sidebar.termsAndConditions', 'Terms & Conditions');
      case '/faq':
        return t('faq.title', 'Frequently Asked Questions');
      case '/reset-password':
        return t('resetPassword.title', 'Reset Password');
      default:
        return t('title', 'Memory Loop');
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    }
  };

  const handleSignInClick = () => {
    openSignInDialog();
  };

  const handleInstallClick = async () => {
    // Always try to trigger the install prompt first
    if (isInstallable) {
      const success = await promptInstall();
      // If prompt was shown, don't show dialog
      if (success) {
        return;
      }
    }
    // If prompt is not available or failed, show instructions dialog
    setShowInstallDialog(true);
  };

  return (
    <header
      className={cn(
        'w-full fixed top-0 left-0 right-0 z-50 p-5 flex items-center justify-between max-[1000px]:p-4',
        option === 'shady' ? 'bg-foreground text-background' : 'bg-sidebar border-b border-border'
      )}
      style={{
        paddingLeft: 'max(env(safe-area-inset-left), 1.25rem)',
        paddingRight: 'max(env(safe-area-inset-right), 1.25rem)',
      }}
    >
      <div className='flex items-center justify-start gap-4 flex-1 min-w-0'>
        <SidebarTrigger
          data-testid='sidebar-trigger'
          className={cn(
            `[&_svg]:size-6 hover:bg-transparent transition-opacity duration-300`,
            // Always show on mobile, hide on desktop when sidebar is open
            isMobile || !open ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none',
            option === 'shady'
              ? 'text-background hover:text-background'
              : 'text-foreground hover:text-foreground'
          )}
        />
        <div className='flex-1 min-w-0'>
          <h1 className='text-lg font-semibold truncate hidden md:block'>{getPageTitle()}</h1>
        </div>
      </div>
      <div className='flex items-center gap-2 flex-shrink-0'>
        <ThemeToggle />
        {/* <LanguageSwitcher /> */}
        {/* PWA Install Button - show if not installed */}
        {!isInstalled && (
          <>
            <Button
              variant='outline'
              onClick={handleInstallClick}
              className='flex items-center gap-2 h-8 min-w-0'
              title={t('header.install', 'Install App')}
            >
              <Download className='w-4 h-4 flex-shrink-0' />
              <span className='hidden sm:inline truncate'>{t('header.install', 'Install')}</span>
            </Button>
            <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t('header.installDialog.title', 'Install Memory Loop')}
                  </DialogTitle>
                  <DialogDescription>
                    {isInstallable
                      ? t(
                          'header.installDialog.description',
                          'Click the button below to install the app on your device.'
                        )
                      : t(
                          'header.installDialog.manualDescription',
                          'Follow these steps to install the app:'
                        )}
                  </DialogDescription>
                </DialogHeader>
                {isInstallable ? (
                  <div className='space-y-4'>
                    <Button
                      onClick={async () => {
                        await promptInstall();
                        setShowInstallDialog(false);
                      }}
                      className='w-full'
                    >
                      {t('header.installDialog.installButton', 'Install Now')}
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-semibold text-sm'>
                        {t('header.installDialog.chromeTitle', 'Chrome / Edge (Desktop):')}
                      </h4>
                      <ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
                        <li>
                          {t(
                            'header.installDialog.chromeStep1',
                            'Click the install icon in the address bar'
                          )}
                        </li>
                        <li>
                          {t(
                            'header.installDialog.chromeStep2',
                            'Or go to Menu → Install Memory Loop'
                          )}
                        </li>
                      </ol>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-semibold text-sm'>
                        {t('header.installDialog.mobileTitle', 'Mobile (Chrome / Safari):')}
                      </h4>
                      <ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
                        <li>
                          {t(
                            'header.installDialog.mobileStep1',
                            'Tap the menu button (three dots)'
                          )}
                        </li>
                        <li>
                          {t(
                            'header.installDialog.mobileStep2',
                            'Select "Add to Home Screen" or "Install App"'
                          )}
                        </li>
                      </ol>
                    </div>
                    <div className='flex items-start gap-2 p-3 bg-muted/50 rounded-md'>
                      <Info className='w-4 h-4 text-primary flex-shrink-0 mt-0.5' />
                      <p className='text-xs text-muted-foreground'>
                        {t(
                          'header.installDialog.note',
                          "The install option may appear in your browser's menu or address bar."
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
        {user && (
          <>
            <Button
              variant='ghost'
              onClick={() => setShowInviteDialog(true)}
              className='flex items-center gap-2 p-0 h-8 min-w-0'
              title={t('header.inviteFriend', 'Invite Friend')}
            >
              <UserPlus className='w-4 h-4 flex-shrink-0' />
              <span className='hidden sm:inline truncate'>
                {t('header.inviteFriend', 'Invite')}
              </span>
            </Button>
            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-sm font-medium text-foreground'>
              <span className='text-primary font-semibold'>{user.credits_balance ?? 0}</span>
              <span className='text-muted-foreground hidden sm:inline'>
                {t('header.credits', 'credits')}
              </span>
            </div>
          </>
        )}
        {user ? (
          <Button
            variant='ghost'
            onClick={handleProfileClick}
            className='flex items-center gap-2 p-0 h-8 min-w-0'
            title={t('header.profile')}
          >
            <User className='w-4 h-4 flex-shrink-0' />
            <span className='hidden sm:inline truncate'>{t('header.profile')}</span>
          </Button>
        ) : (
          <Button
            variant='default'
            onClick={handleSignInClick}
            className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 h-8 min-w-0'
            title={t('header.signIn')}
          >
            <User className='w-4 h-4 flex-shrink-0' />
            <span className='hidden sm:inline truncate'>{t('header.signIn')}</span>
          </Button>
        )}
      </div>

      {/* Invite Friend Dialog */}
      {user && (
        <InviteFriendDialog isOpen={showInviteDialog} onClose={() => setShowInviteDialog(false)} />
      )}
    </header>
  );
};
