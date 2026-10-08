import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { Button } from '@/shadcn/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shadcn/components/ui/card';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import {
  User,
  Mail,
  Calendar as CalendarIcon,
  Settings,
  LogOut,
  Crown,
  CreditCard,
  Loader2,
  AlertCircle,
  Palette,
} from 'lucide-react';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { useForm } from 'react-hook-form';
import { showToast } from '@/shared/ui';
import { displayNameFieldValidation } from '@/shared/constants/validation';
import { DeleteAccountWidget } from '@/widgets/delete-account';
import { useSubscriptionService, type SubscriptionStatus } from '@/services/subscriptionService';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';

// Stripe Price ID for subscription checkout
const STRIPE_PRICE_ID = 'price_1SZAPkF6VdnHNqRilC86WXjY';

interface ProfileFormData {
  display_name: string;
  locale: string;
}

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { updateUserData, clearError } = useUpdateUser();
  const subscriptionService = useSubscriptionService();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const hasFetchedSubscriptionRef = useRef<number | null>(null);

  const {
    register,
    formState: { errors, isDirty },
    watch,
    setValue,
    trigger,
  } = useForm<ProfileFormData>({
    defaultValues: {
      display_name: user?.display_name || '',
      locale: user?.locale || i18n.language || 'en',
    },
  });

  // Check for Stripe redirect parameters
  useEffect(() => {
    const subscriptionParam = searchParams.get('subscription');

    if (subscriptionParam === 'success') {
      setIsSuccessDialogOpen(true);
      // Remove the parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('subscription');
      setSearchParams(newSearchParams, { replace: true });

      // Note: Subscription status will be refreshed by the main useEffect when user is available
      // No need to call getSubscriptionStatus here to avoid duplicate requests
    } else if (subscriptionParam === 'canceled') {
      setIsErrorDialogOpen(true);
      // Remove the parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('subscription');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) return;

      // Prevent duplicate requests - check if we've already fetched for this user
      const userId = user.id;
      if (hasFetchedSubscriptionRef.current === userId) return;
      hasFetchedSubscriptionRef.current = userId;

      setIsLoadingSubscription(true);
      try {
        const status = await subscriptionService.getSubscriptionStatus();
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user?.id, subscriptionService]);

  useEffect(() => {
    if (user?.locale && user.locale !== i18n.language) {
      i18n.changeLanguage(user.locale);
    }
  }, [user?.locale, i18n]);

  useEffect(() => {
    setValue('locale', i18n.language);
  }, [i18n.language, setValue]);

  const handleLogout = async () => {
    try {
      await logout();
      // Use full page reload after logout completes
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      window.location.href = '/';
    }
  };

  const handleCancelSubscription = () => {
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancelSubscription = async () => {
    setIsCancelDialogOpen(false);
    setIsCanceling(true);
    try {
      const result = await subscriptionService.cancelSubscription();
      showToast(
        t(
          'profile.subscription.cancelSuccess',
          `Subscription canceled. Your access will end on ${new Date(result.current_period_end).toLocaleDateString()}`
        ),
        'success'
      );

      // Refresh subscription status
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      showToast(
        error instanceof Error
          ? error.message
          : t(
              'profile.subscription.cancelError',
              'Failed to cancel subscription. Please try again.'
            ),
        'error'
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleSubscribe = async () => {
    setIsCreatingCheckout(true);
    try {
      const currentUrl = window.location.origin;
      const checkoutResponse = await subscriptionService.createCheckout({
        price_id: STRIPE_PRICE_ID,
        success_url: `${currentUrl}/profile?subscription=success`,
        cancel_url: `${currentUrl}/profile?subscription=canceled`,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkoutResponse.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      showToast(
        error instanceof Error
          ? error.message
          : t('profile.subscription.checkoutError', 'Failed to start checkout. Please try again.'),
        'error'
      );
      setIsCreatingCheckout(false);
    }
  };

  const startEditing = (field: string) => {
    setEditingField(field);
  };

  const stopEditing = async () => {
    const currentField = editingField;
    setEditingField(null);

    if (isDirty && currentField) {
      try {
        clearError();

        const formData = watch();

        const validationErrors = validateUserData(formData);
        if (Object.keys(validationErrors).length > 0) {
          showToast(t('profile.errors.validationErrors'), 'error');
          setEditingField(currentField);
          return;
        }

        if (currentField === 'locale') {
          i18n.changeLanguage(formData.locale);
        }

        const updateData = formatUserDataForAPI(formData);

        await updateUserData(updateData);
        setEditingField(null);
        showToast(t('profile.updateSuccess', 'Profile updated successfully!'), 'success');
      } catch (err) {
        console.error('Failed to auto-save profile:', err);
        showToast(t('profile.updateError', 'Failed to save changes. Please try again.'), 'error');
        setEditingField(currentField);
      }
    } else {
      setEditingField(null);
    }
  };

  const handleFieldChange = async (field: 'display_name', value: string) => {
    setValue(field, value, { shouldDirty: true });

    await trigger(field);
  };

  const validateUserData = (formData: ProfileFormData) => {
    const errors: Record<string, string> = {};

    if (!formData.display_name?.trim()) {
      errors.display_name = t(
        'globalFields.displayName.validation.required',
        'Display name is required'
      );
    } else if (formData.display_name.length < 3 || formData.display_name.length > 20) {
      errors.display_name = t(
        'globalFields.displayName.validation.range',
        'Display name must be between 3 and 20 characters'
      );
    }

    if (formData.locale && formData.locale.length > 100) {
      errors.locale = t(
        'profile.validation.localeMaxLength',
        'Locale must not exceed 100 characters'
      );
    }

    return errors;
  };

  const formatUserDataForAPI = (formData: ProfileFormData) => {
    const apiData: Record<string, string | null> = {
      email: user?.email?.trim() || null,
      display_name: formData.display_name?.trim() || null,
      locale: formData.locale?.trim() || null,
      country: user?.country?.trim() || null,
    };

    Object.keys(apiData).forEach(key => {
      if (apiData[key] === null || apiData[key] === '') {
        delete apiData[key];
      }
    });

    return apiData;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditing();
    }
  };

  // Get premium status from subscription API response
  const getPremiumStatus = () => {
    if (!subscriptionStatus) {
      return {
        plan: 'basic' as 'premium' | 'basic' | 'expired' | 'canceled',
        nextPaymentDate: null as string | null,
        credits: user?.credits_balance ?? 0,
        canceledAt: null as string | null,
        cancelAtPeriodEnd: false,
      };
    }

    // Determine plan status based on subscription_status and is_premium
    let plan: 'premium' | 'basic' | 'expired' | 'canceled' = 'basic';
    if (subscriptionStatus.subscription_status === 'active' && subscriptionStatus.is_premium) {
      plan = 'premium';
    } else if (subscriptionStatus.subscription_status === 'canceled') {
      plan = subscriptionStatus.cancel_at_period_end ? 'canceled' : 'expired';
    } else if (
      subscriptionStatus.subscription_status === 'past_due' ||
      subscriptionStatus.subscription_status === 'unpaid'
    ) {
      plan = 'expired';
    }

    return {
      plan,
      nextPaymentDate: subscriptionStatus.current_period_end,
      credits: user?.credits_balance ?? 0,
      canceledAt: subscriptionStatus.canceled_at,
      cancelAtPeriodEnd: subscriptionStatus.cancel_at_period_end,
    };
  };

  const premiumStatus = getPremiumStatus();

  if (!user) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <div className='p-8 text-center'>
              <h1 className='text-2xl font-bold text-foreground mb-4'>
                {t('profile.notAuthenticated.title')}
              </h1>
              <p className='text-muted-foreground'>{t('profile.notAuthenticated.description')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='py-4 sm:py-[2rem] flex flex-col gap-4 sm:gap-6'>
            {/* Profile Header */}
            <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'>
              <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center'>
                <User className='w-8 h-8 sm:w-10 sm:h-10 text-primary' />
              </div>
              <div className='flex-1 text-center sm:text-left'>
                <h1 className='text-xl sm:text-2xl font-bold text-foreground'>
                  {user.display_name}
                </h1>
                <p className='text-sm sm:text-base text-muted-foreground'>{user.email}</p>
              </div>
              <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                <DeleteAccountWidget />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogout}
                  className='flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 w-full sm:w-auto'
                >
                  <LogOut className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                  <span className='truncate'>{t('profile.actions.logout')}</span>
                </Button>
              </div>
            </div>

            {/* Profile Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6'>
              <Card className='gap-0'>
                <CardHeader className='p-3 sm:p-6 gap-0'>
                  <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                    <User className='w-4 h-4 sm:w-5 sm:h-5' />
                    {t('profile.sections.personalInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 p-3 sm:p-6 pt-0'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('profile.fields.name')}
                    </Label>
                    <div className='mt-1'>
                      {editingField === 'display_name' ? (
                        <Input
                          {...register('display_name', displayNameFieldValidation)}
                          className={`w-full ${errors.display_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                          onBlur={stopEditing}
                          onKeyDown={handleKeyDown}
                          onChange={e => handleFieldChange('display_name', e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <p
                          className='text-foreground cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors'
                          onClick={() => startEditing('display_name')}
                        >
                          {watch('display_name') || t('profile.fields.notSet')}
                        </p>
                      )}
                    </div>
                    {errors.display_name && (
                      <p className='text-destructive text-xs mt-1'>{errors.display_name.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className='gap-0'>
                <CardHeader className='p-3 sm:p-6'>
                  <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                    <Mail className='w-4 h-4 sm:w-5 sm:h-5' />
                    {t('profile.sections.contactInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 p-3 sm:p-6 pt-0'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('profile.fields.email')}
                    </Label>
                    <div className='mt-1'>
                      <p className='text-foreground'>{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='gap-0'>
                <CardHeader className='p-3 sm:p-6'>
                  <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                    <Settings className='w-4 h-4 sm:w-5 sm:h-5' />
                    {t('profile.sections.preferences')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 p-3 sm:p-6 pt-0'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('profile.fields.language', 'Language')}
                    </Label>
                    <div className='mt-1'>
                      <p className='text-foreground'>{t('languages.en', 'English')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='gap-0'>
                <CardHeader className='p-3 sm:p-6'>
                  <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                    <CalendarIcon className='w-4 h-4 sm:w-5 sm:h-5' />
                    {t('profile.sections.accountInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 p-3 sm:p-6 pt-0'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('profile.fields.country')}
                    </Label>
                    <div className='mt-1'>
                      <p className='text-foreground'>
                        {user?.country || t('profile.fields.notSet')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Premium Section */}
            <Card className='gap-0'>
              <CardHeader className='p-3 sm:p-6'>
                <div className='flex items-start justify-between gap-4'>
                  <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                    <Crown className='w-4 h-4 sm:w-5 sm:h-5' />
                    {t('profile.sections.premium', 'Premium')}
                  </CardTitle>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    <CreditCard className='w-4 h-4 text-primary' />
                    <div className='flex items-baseline gap-1'>
                      <span className='text-lg font-semibold text-foreground'>
                        {premiumStatus.credits}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {t('profile.credits.label', 'credits')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4 p-3 sm:p-6 pt-0'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('profile.fields.currentPlan', 'Current Plan')}
                  </Label>
                  <div className='mt-1'>
                    <div className='flex items-center gap-3 flex-wrap'>
                      {isLoadingSubscription ? (
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          <span className='text-sm'>
                            {t('profile.subscription.loading', 'Loading...')}
                          </span>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold ${
                              premiumStatus.plan === 'premium'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : premiumStatus.plan === 'canceled'
                                  ? 'bg-warning/10 text-warning border border-warning/20'
                                  : premiumStatus.plan === 'expired'
                                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                    : 'bg-muted text-muted-foreground border border-border'
                            }`}
                          >
                            {premiumStatus.plan === 'premium' && <Crown className='w-4 h-4' />}
                            {premiumStatus.plan === 'canceled' && (
                              <AlertCircle className='w-4 h-4' />
                            )}
                            {premiumStatus.plan === 'expired' && <CreditCard className='w-4 h-4' />}
                            {t(
                              `profile.plan.${premiumStatus.plan}`,
                              premiumStatus.plan.charAt(0).toUpperCase() +
                                premiumStatus.plan.slice(1)
                            )}
                          </span>
                          {premiumStatus.plan === 'basic' && (
                            <Button
                              onClick={handleSubscribe}
                              size='sm'
                              className='h-8'
                              disabled={isCreatingCheckout}
                            >
                              {isCreatingCheckout ? (
                                <>
                                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                  {t('profile.subscription.starting', 'Starting...')}
                                </>
                              ) : (
                                <>
                                  <Crown className='w-4 h-4 mr-2' />
                                  {t('profile.actions.discoverPremium', 'Discover Premium')}
                                </>
                              )}
                            </Button>
                          )}
                          {premiumStatus.plan === 'premium' && (
                            <Button
                              variant='outline'
                              onClick={handleCancelSubscription}
                              size='sm'
                              className='h-8'
                              disabled={isCanceling}
                            >
                              {isCanceling ? (
                                <>
                                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                  {t('profile.subscription.canceling', 'Canceling...')}
                                </>
                              ) : (
                                <>
                                  <CreditCard className='w-4 h-4 mr-2' />
                                  {t('profile.actions.cancelSubscription', 'Cancel Subscription')}
                                </>
                              )}
                            </Button>
                          )}
                          {(premiumStatus.plan === 'canceled' ||
                            premiumStatus.plan === 'expired') && (
                            <Button
                              onClick={handleSubscribe}
                              size='sm'
                              className='h-8'
                              disabled={isCreatingCheckout}
                            >
                              {isCreatingCheckout ? (
                                <>
                                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                  {t('profile.subscription.starting', 'Starting...')}
                                </>
                              ) : (
                                <>
                                  <Crown className='w-4 h-4 mr-2' />
                                  {t('profile.actions.resubscribe', 'Resubscribe')}
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {t(
                      'profile.premium.description',
                      'Premium membership unlocks a generous monthly credit allowance, giving you the freedom to create unlimited recaps, generate personalized audio summaries, and build comprehensive flashcard sets from your favorite podcasts and videos. Use your credits however you want to enhance your learning journey.'
                    )}
                  </p>
                  <p className='text-xs text-muted-foreground/80 italic'>
                    {t(
                      'profile.premium.creditsNote',
                      'Note: Credits reset at the end of each month.'
                    )}
                  </p>

                  {/* Subscription details */}
                  {!isLoadingSubscription &&
                    subscriptionStatus &&
                    (premiumStatus.plan === 'premium' || premiumStatus.plan === 'canceled') && (
                      <div className='mt-4 pt-4 border-t border-border'>
                        {premiumStatus.nextPaymentDate && (
                          <p className='text-sm text-muted-foreground'>
                            {premiumStatus.cancelAtPeriodEnd ? (
                              <>
                                <AlertCircle className='w-4 h-4 inline mr-1' />
                                {t('profile.subscription.expiresOn', 'Subscription ends on')}{' '}
                                <span className='font-semibold'>
                                  {new Date(premiumStatus.nextPaymentDate).toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              <>
                                {t('profile.subscription.renewsOn', 'Next billing date:')}{' '}
                                <span className='font-semibold'>
                                  {new Date(premiumStatus.nextPaymentDate).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  {!isLoadingSubscription &&
                    premiumStatus.plan === 'expired' &&
                    premiumStatus.canceledAt && (
                      <div className='mt-4 pt-4 border-t border-border'>
                        <p className='text-sm text-destructive'>
                          <AlertCircle className='w-4 h-4 inline mr-1' />
                          {t('profile.subscription.expired', 'Subscription expired on')}{' '}
                          <span className='font-semibold'>
                            {new Date(premiumStatus.canceledAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Theme Customization */}
            {premiumStatus.plan === 'premium' ? (
              <ThemeCustomizer />
            ) : (
              <Card className='gap-0'>
                <CardHeader className='p-3 sm:p-6'>
                  <div className='flex items-center gap-2'>
                    <Palette className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
                    <CardTitle className='text-lg sm:text-xl'>
                      {t('profile.theme.title', 'Theme Customization')}
                    </CardTitle>
                  </div>
                  <CardDescription className='mt-2'>
                    {t(
                      'profile.theme.premiumOnly',
                      'Theme customization is available for premium users only. Upgrade to unlock this feature.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className='p-3 sm:p-6 pt-0'>
                  <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                    <div className='flex-1'>
                      <p className='text-sm text-muted-foreground'>
                        {t(
                          'profile.theme.premiumDescription',
                          'Customize your theme colors separately for light and dark mode. Make the interface truly yours with personalized color schemes.'
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={handleSubscribe}
                      className='w-full sm:w-auto'
                      disabled={isCreatingCheckout}
                    >
                      {isCreatingCheckout ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          {t('profile.subscription.starting', 'Starting...')}
                        </>
                      ) : (
                        <>
                          <Crown className='w-4 h-4 mr-2' />
                          {t('profile.actions.discoverPremium', 'Discover Premium')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancelSubscription}
        title={t('profile.subscription.cancelTitle', 'Cancel subscription')}
        description={t(
          'profile.subscription.cancelConfirm',
          'Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.'
        )}
        confirmText={t('profile.subscription.cancel', 'Cancel subscription')}
        cancelText={t('common.keep', 'Keep subscription')}
        variant='destructive'
        isLoading={isCanceling}
      />

      {/* Success dialog after Stripe redirect */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-2'>
              <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0'>
                <Crown className='w-5 h-5 text-green-600' />
              </div>
              <div className='flex-1 text-center sm:text-left'>
                <DialogTitle className='text-green-600'>
                  {t('profile.subscription.successTitle', 'Thank you for supporting us!')}
                </DialogTitle>
                <DialogDescription className='mt-1'>
                  {t(
                    'profile.subscription.successMessage',
                    'Your subscription has been successfully activated. You now have access to all premium features.'
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)} className='w-full'>
              {t('common.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error dialog after Stripe cancel */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-2'>
              <div className='w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-destructive' />
              </div>
              <div className='flex-1 text-center sm:text-left'>
                <DialogTitle className='text-destructive'>
                  {t('profile.subscription.errorTitle', 'Subscription Error')}
                </DialogTitle>
                <DialogDescription className='mt-1'>
                  {t(
                    'profile.subscription.errorMessage',
                    'There was an error while you were trying to get a subscription. Please try again.'
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className='flex flex-col-reverse sm:flex-row gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsErrorDialogOpen(false)}
              className='w-full sm:flex-1'
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={async () => {
                setIsErrorDialogOpen(false);
                await handleSubscribe();
              }}
              disabled={isCreatingCheckout}
              className='w-full sm:flex-1'
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  {t('profile.subscription.starting', 'Starting...')}
                </>
              ) : (
                t('profile.subscription.tryAgain', 'Try again')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
