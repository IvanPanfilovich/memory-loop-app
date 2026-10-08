import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';

// Extend Window interface for Google Analytics and Smartlook
interface SmartlookAPI {
  api: unknown[][];
  init: (key: string, options: { region: string }) => void;
}

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    smartlook?: SmartlookAPI;
  }
}

// Helper function to read cookie directly from document.cookie
const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const CookieConsent = () => {
  const { t } = useTranslation();
  const [showConsent, setShowConsent] = useState(false);
  const [cookies, setCookie] = useCookies(['analytics-consent']);
  const hasCheckedConsentRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadGoogleAnalytics = useCallback(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Check if already loaded by checking if gtag is a function
    if (typeof window.gtag === 'function' && window.dataLayer) return;

    try {
      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-8J924NK5ZD';

      // Handle script loading errors (e.g., blocked by ad blocker)
      script1.onerror = () => {
        // Silently fail if script is blocked - this is expected with ad blockers
        console.debug('Google Analytics script blocked or failed to load');
      };

      document.head.appendChild(script1);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        if (window.dataLayer) {
          window.dataLayer.push(args);
        }
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-8J924NK5ZD');
    } catch (error) {
      // Silently handle errors (e.g., if script is blocked by ad blocker)
      console.debug('Google Analytics initialization failed:', error);
    }
  }, []);

  const loadSmartlook = useCallback(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Check if already loaded
    if (window.smartlook) return;

    try {
      // Initialize Smartlook
      const smartlookInit = function (d: Document) {
        const o: SmartlookAPI = {
          api: [],
          init: (key: string, options: { region: string }) => {
            o.api.push(['init', key, options]);
          },
        };

        // Set smartlook on window
        (window as Window & { smartlook: SmartlookAPI }).smartlook = o;

        const h = d.getElementsByTagName('head')[0];
        const c = d.createElement('script');
        c.async = true;
        c.type = 'text/javascript';
        c.charset = 'utf-8';
        c.src = 'https://web-sdk.smartlook.com/recorder.js';

        // Handle script loading errors (e.g., blocked by ad blocker)
        c.onerror = () => {
          // Silently fail if script is blocked - this is expected with ad blockers
          console.debug('Smartlook script blocked or failed to load');
        };

        h.appendChild(c);
      };

      smartlookInit(document);

      // Call init after a short delay to ensure script is loaded
      setTimeout(() => {
        if (window.smartlook) {
          try {
            window.smartlook.init('f68e171fdc61eabf24facbfc3035dfecc7d15ea4', { region: 'eu' });
          } catch (error) {
            // Silently handle errors
            console.debug('Smartlook initialization failed:', error);
          }
        }
      }, 100);
    } catch (error) {
      // Silently handle errors (e.g., if script is blocked by ad blocker)
      console.debug('Smartlook setup failed:', error);
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Only check once on mount
    if (hasCheckedConsentRef.current) return;

    // Small delay to ensure component is mounted and hydrated
    const timer = setTimeout(() => {
      try {
        // Check cookie from both react-cookie and document.cookie as fallback
        const consentFromHook = cookies['analytics-consent'];
        const consentFromDoc = getCookieValue('analytics-consent');
        const consent = consentFromHook || consentFromDoc;

        // Only show popover if consent hasn't been set (neither 'true' nor 'false')
        if (consent === undefined || consent === null || consent === '') {
          // No choice made yet, show popover
          setShowConsent(true);
          hasCheckedConsentRef.current = true;
        } else if (consent === 'true') {
          // User accepted, load analytics
          loadGoogleAnalytics();
          loadSmartlook();
          hasCheckedConsentRef.current = true;
        } else if (consent === 'false') {
          // User declined, don't show popover
          hasCheckedConsentRef.current = true;
        }
      } catch (_error) {
        // If cookies fail, show popover anyway
        console.warn('Cookie access not available, showing consent popover');
        setShowConsent(true);
        hasCheckedConsentRef.current = true;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [loadGoogleAnalytics, loadSmartlook, cookies]);

  const handleAccept = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        setCookie('analytics-consent', 'true', {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'lax',
          secure: true, // Always use secure cookies in production
        });
        // Mark as checked and hide popover immediately
        hasCheckedConsentRef.current = true;
        setShowConsent(false);
        loadGoogleAnalytics();
        loadSmartlook();
      } catch (error) {
        console.error('Error setting accept cookie:', error);
      }
    },
    [loadGoogleAnalytics, loadSmartlook, setCookie]
  );

  const handleDecline = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        setCookie('analytics-consent', 'false', {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'lax',
          secure: true, // Always use secure cookies in production
        });
        // Mark as checked and hide popover immediately
        hasCheckedConsentRef.current = true;
        setShowConsent(false);
      } catch (error) {
        console.error('Error setting decline cookie:', error);
      }
    },
    [setCookie]
  );

  if (!showConsent || !mounted) {
    return null;
  }

  const consentContent = (
    <div
      className='fixed bottom-4 left-4 max-w-sm md:max-w-md'
      style={{ zIndex: 999998, pointerEvents: 'auto' }}
    >
      <div
        className='bg-card border border-border rounded-lg shadow-xl p-3 sm:p-4 md:p-6'
        style={{ pointerEvents: 'auto' }}
      >
        <h3 className='text-sm sm:text-base md:text-lg font-bold text-foreground mb-1.5 sm:mb-2 md:mb-3'>
          {t('cookieConsent.title', 'Cookie & Analytics Consent')}
        </h3>
        <p className='text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 md:mb-6 leading-relaxed'>
          {t(
            'cookieConsent.description',
            'We use Google Analytics to understand how visitors interact with our website. This helps us improve your experience. You can choose to allow or decline analytics tracking.'
          )}
        </p>
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3' style={{ pointerEvents: 'auto' }}>
          <button
            type='button'
            onClick={handleAccept}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 999999,
            }}
            className='w-full sm:flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          >
            {t('cookieConsent.allow', 'Allow Analytics')}
          </button>
          <button
            type='button'
            onClick={handleDecline}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 999999,
            }}
            className='w-full sm:flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          >
            {t('cookieConsent.decline', 'Decline')}
          </button>
        </div>
      </div>
    </div>
  );

  // Render in a portal to ensure it's at the top level
  return createPortal(consentContent, document.body);
};
