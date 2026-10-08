import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/shadcn/components/ui/button';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { Sparkles, Headphones, Brain, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSignInDialog } from '@/contexts/SignInDialogContext';
import { useSubscriptionService } from '@/services/subscriptionService';
import { useState, useEffect } from 'react';
import { showToast } from '@/shared/ui';

// Stripe Price ID for subscription checkout
const STRIPE_PRICE_ID = 'price_1SZAPkF6VdnHNqRilC86WXjY';

export const PaywallPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openSignInDialog } = useSignInDialog();
  const navigate = useNavigate();
  const subscriptionService = useSubscriptionService();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Fetch subscription status when user is authenticated
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) return;

      setIsCheckingSubscription(true);
      try {
        const status = await subscriptionService.getSubscriptionStatus();
        setHasActiveSubscription(
          status.subscription_status === 'active' || status.subscription_status === 'trialing'
        );
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        setHasActiveSubscription(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  const handleUnlockClick = async () => {
    if (!user) {
      // Open sign-in dialog for non-authenticated users
      openSignInDialog();
      return;
    }

    // If user has active subscription, redirect to profile
    if (hasActiveSubscription) {
      navigate('/profile');
      return;
    }

    // Create checkout session and redirect to Stripe
    setIsLoading(true);
    try {
      const currentUrl = window.location.origin;
      const checkoutResponse = await subscriptionService.createCheckout({
        price_id: STRIPE_PRICE_ID,
        success_url: `${currentUrl}/profile?subscription=success`,
        cancel_url: `${currentUrl}/paywall?subscription=canceled`,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkoutResponse.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      showToast(
        error instanceof Error
          ? error.message
          : t('paywall.checkoutError', 'Failed to start checkout. Please try again.'),
        'error'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Hero Section */}
          <div className='text-center mb-6 sm:mb-8 md:mb-12'>
            <div className='inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4 md:mb-6'>
              <Sparkles className='w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary' />
            </div>
            <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 px-1 sm:px-2 leading-tight'>
              {t('paywall.headline', 'Turn every podcast into a mini-course you actually remember')}
            </h1>
            <p className='text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-1 sm:px-2 leading-relaxed'>
              {t(
                'paywall.subheadline',
                'Paste a YouTube link, pick the themes you care about, and get a short AI-generated recap podcast plus flashcards to lock in the key ideas.'
              )}
            </p>
          </div>

          {/* Features Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12'>
            <Card className='border-2 hover:border-primary/50 transition-colors'>
              <CardContent className='p-3 sm:p-4 md:p-6'>
                <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4'>
                  <div className='w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <Headphones className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary' />
                  </div>
                  <h3 className='text-base sm:text-lg md:text-xl font-semibold text-foreground leading-tight'>
                    {t('paywall.feature1.title', 'Personalised recap audio')}
                  </h3>
                </div>
                <p className='text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed'>
                  {t(
                    'paywall.feature1.description',
                    'a short "second podcast" with only the parts that matter to you'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className='border-2 hover:border-primary/50 transition-colors'>
              <CardContent className='p-3 sm:p-4 md:p-6'>
                <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4'>
                  <div className='w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <Brain className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary' />
                  </div>
                  <h3 className='text-base sm:text-lg md:text-xl font-semibold text-foreground leading-tight'>
                    {t('paywall.feature2.title', 'Theme-based summaries')}
                  </h3>
                </div>
                <p className='text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed'>
                  {t(
                    'paywall.feature2.description',
                    'choose topics you found interesting, skip the rest'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className='border-2 hover:border-primary/50 transition-colors'>
              <CardContent className='p-3 sm:p-4 md:p-6'>
                <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4'>
                  <div className='w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <BookOpen className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary' />
                  </div>
                  <h3 className='text-base sm:text-lg md:text-xl font-semibold text-foreground leading-tight'>
                    {t('paywall.feature3.title', 'Smart flashcards')}
                  </h3>
                </div>
                <p className='text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed'>
                  {t(
                    'paywall.feature3.description',
                    'key facts turned into bite-sized cards for faster learning and recall'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className='text-center px-1 sm:px-2'>
            <Button
              size='lg'
              className='w-full sm:w-auto text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 h-auto font-semibold whitespace-normal break-words'
              onClick={handleUnlockClick}
              disabled={isLoading || isCheckingSubscription}
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin' />
                  {t('paywall.loading', 'Loading...')}
                </>
              ) : hasActiveSubscription ? (
                t('paywall.goToProfile', 'Go to Profile')
              ) : (
                t('paywall.cta', 'Unlock personalised recaps & flashcards')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
