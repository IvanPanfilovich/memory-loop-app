import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppSidebar } from '@/widgets/sidebar';
import { AppHeader } from '@/widgets/header';
import { SidebarProvider } from '@/shadcn/components/ui/sidebar';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { AuthProvider } from '@/contexts/AuthProvider';
import { useSignInDialog } from '@/contexts/SignInDialogContext';
import { SignInDialogProvider } from '@/contexts/SignInDialogProvider';
import { NoCreditsDialogProvider } from '@/contexts/NoCreditsDialogProvider';
import { AppLoader } from '@/components/AppLoader';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Router } from './router';
import { StateBasedSignInDialog } from '@/widgets/auth-form/ui/sign-in-dialog/state-based-sign-in-dialog';
import { Footer } from '@/components/Footer';
import './index.css';
import './i18n';
import { Notifications } from '@/shared/ui/notifications';
import { CookieConsent } from '@/features/cookie-consent';
import { handleFetchError } from '@/utils/fetchErrorHandler';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  initializeBackgroundTracking,
  cleanupOldRequests,
} from '@/services/backgroundRequestTracker';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

const AppInner = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isSignInDialogOpen, closeSignInDialog } = useSignInDialog();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { defaultMode } = useSelector((state: RootState) => state.theme);

  // Initialize theme mode on app load
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(defaultMode);
  }, [defaultMode]);

  // Apply custom theme colors from Redux
  useThemeColors();

  // Global error handler for unhandled promise rejections (fetch errors, etc.)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if it's a fetch error
      const error = event.reason;
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        handleFetchError(error);
        event.preventDefault(); // Prevent default browser error message
      } else if (error instanceof Error) {
        // Handle other errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          handleFetchError(error);
          event.preventDefault();
        }
      }
    };

    const handleError = (event: ErrorEvent) => {
      // Handle general JavaScript errors that might be network-related
      if (event.error instanceof TypeError && event.error.message === 'Failed to fetch') {
        handleFetchError(event.error);
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Initialize background request tracking
  useEffect(() => {
    cleanupOldRequests(); // Clean up old requests first
    initializeBackgroundTracking(); // Start tracking active requests
  }, []);

  // Loading state management
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Disable browser's scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    document.title = t('title');
  }, [t]);

  // Force scroll to top on every route change
  useLayoutEffect(() => {
    // Multiple attempts to ensure scroll to top
    const scrollToTop = () => {
      // Try the ScrollArea viewport first
      const scrollArea = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement;
      if (scrollArea) {
        scrollArea.scrollTop = 0;
        scrollArea.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }

      // Also try the document element as fallback
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }

      // Try the body element as well
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    // Immediate scroll
    scrollToTop();

    // Multiple delayed attempts to handle any async content loading
    const timeout1 = setTimeout(scrollToTop, 50);
    const timeout2 = setTimeout(scrollToTop, 200);
    const timeout3 = setTimeout(scrollToTop, 500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [location.pathname]);

  const onSuccessfulAuth = () => {
    closeSignInDialog();
  };

  // Check if we're on the landing page - render without sidebar/header
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <>
        <LoadingScreen isVisible={isLoading} />
        <AppLoader />
        <Router />
        <Notifications />
        <CookieConsent />
      </>
    );
  }

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <AppLoader />
      <SidebarProvider defaultOpen={false}>
        <div className='relative w-full h-screen'>
          <AppSidebar />
          <div className='flex flex-col h-screen'>
            <AppHeader />
            <ScrollArea ref={scrollAreaRef} className='flex-1 w-full main-content min-h-0'>
              <main className='w-full flex flex-col flex-1 min-h-0'>
                <div className='flex-1 min-h-0'>
                  <Router />
                </div>
                <Footer />
              </main>
            </ScrollArea>
            <Notifications />
          </div>
        </div>
      </SidebarProvider>

      {/* Sign In Dialog */}
      <StateBasedSignInDialog
        isOpen={isSignInDialogOpen}
        onOpenChange={closeSignInDialog}
        onSuccessfulAuth={onSuccessfulAuth}
        defaultMode='signin'
      />
      <CookieConsent />
    </>
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CookiesProvider>
        <AuthProvider>
          <SignInDialogProvider>
            <NoCreditsDialogProvider>
              <AppInner />
            </NoCreditsDialogProvider>
          </SignInDialogProvider>
        </AuthProvider>
      </CookiesProvider>
    </QueryClientProvider>
  );
};
