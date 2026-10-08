import { Route, Routes } from 'react-router';
import { LandingPage } from '@/pages/landing';
import { ProfilePage } from '@/pages/profile';
import { DashboardPage, DashboardThemesPage, DashboardMaterialPage } from '@/pages/dashboard';
import { PaywallPage } from '@/pages/paywall';
import { OAuthCallback } from '@/pages/oauth-callback';
import { VerifyEmailPage } from '@/pages/verify-email';
import { EmailConfirmationPage } from '@/pages/email-confirmation';
import { ResetPasswordPage } from '@/pages/reset-password';
import { PrivacyPolicyPage } from '@/pages/privacy-policy';
import { TermsAndConditionsPage } from '@/pages/terms-and-conditions';
import { FAQPage } from '@/pages/faq';
import { NotFoundPage } from '@/pages/not-found';
import { AuthGuard } from '@/contexts/AuthGuard';
import { AuthPage } from '@/pages/auth';
import { SignupPage } from '@/pages/signup';

export const Router = () => {
  return (
    <Routes>
      {/* Landing page */}
      <Route path='/' element={<LandingPage />} />

      {/* Auth callback must come before /auth to avoid route conflicts */}
      <Route path='/auth/callback' element={<OAuthCallback />} />

      {/* Email confirmation (backend redirects here) */}
      <Route path='/email-confirmation' element={<EmailConfirmationPage />} />

      {/* Legacy email verification links (redirects to backend) */}
      <Route path='/api/auth/confirm/*' element={<VerifyEmailPage />} />
      <Route path='/auth/verify-email' element={<VerifyEmailPage />} />

      {/* Signup page - handles referral codes */}
      <Route path='/signup' element={<SignupPage />} />

      {/* Auth page */}
      <Route path='/auth' element={<AuthPage />} />

      {/* Dashboard pages */}
      <Route
        path='/dashboard'
        element={
          <AuthGuard requireAuth={true}>
            <DashboardPage />
          </AuthGuard>
        }
      />
      <Route
        path='/dashboard/themes'
        element={
          <AuthGuard requireAuth={true}>
            <DashboardThemesPage />
          </AuthGuard>
        }
      />
      <Route
        path='/dashboard/:id'
        element={
          <AuthGuard requireAuth={true}>
            <DashboardMaterialPage />
          </AuthGuard>
        }
      />

      {/* Paywall page */}
      <Route path='/paywall' element={<PaywallPage />} />

      {/* Reset Password Page */}
      <Route path='/reset-password' element={<ResetPasswordPage />} />

      {/* Privacy Policy Page */}
      <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />

      {/* Terms and Conditions Page */}
      <Route path='/terms-and-conditions' element={<TermsAndConditionsPage />} />

      {/* FAQ Page */}
      <Route path='/faq' element={<FAQPage />} />

      <Route
        path='/profile'
        element={
          <AuthGuard requireAuth={true}>
            <ProfilePage />
          </AuthGuard>
        }
      />

      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
};
