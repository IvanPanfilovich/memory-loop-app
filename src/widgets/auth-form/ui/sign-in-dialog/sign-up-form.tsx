import { Input } from '@/shadcn/components/ui/input';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { Step } from './step';
import { useEffect, useState } from 'react';
import type { Dispatch, FC, SetStateAction } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useRegister } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/shared/ui';
import { getProviderLink } from '@/shared';
import {
  displayNameFieldValidation,
  emailFieldValidation,
  passwordFieldValidation,
} from '@/shared';
import { ResendButton } from '../resend-button';
import { useCountryDetection } from '@/hooks/useCountryDetection';
import Cookies from 'js-cookie';

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  referralCode?: string;
  locale: string;
  country: string;
  canRecord: boolean;
  canShareClassRecordings: boolean;
  canShareLiveStream: boolean;
  canAIProcess: boolean;
  canTeacherInviteGuests: boolean;
  canStudentInviteGuests: boolean;
  canAnonymousJoin: boolean;
  canPartyChat: boolean;
  canInviteMultipleTeachers: boolean;
  canInviteMultipleStudents: boolean;
};

interface ISignUpFormProps {
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
}

export const SignUpForm: FC<ISignUpFormProps> = ({ activeStep, setActiveStep }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [hasReferralCodeInCookie, setHasReferralCodeInCookie] = useState(false);

  // Referral code cookie name
  const REFERRAL_COOKIE_NAME = 'referral_code';

  const { country: detectedCountry } = useCountryDetection();
  const { mutate: registerMutation, isPending: isRegisterLoading } = useRegister(_userId => {
    showToast(t('auth.signUp.successMessage'), 'success');
    // Preserve current path when redirecting to login
    const currentPath = location.pathname;
    navigate(`${currentPath}?login=true`, { replace: true });
  });

  const {
    register,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      canRecord: true,
      canShareClassRecordings: true,
      canShareLiveStream: true,
      canAIProcess: true,
      canTeacherInviteGuests: true,
      canStudentInviteGuests: true,
      canAnonymousJoin: true,
      canPartyChat: true,
      canInviteMultipleTeachers: true,
      canInviteMultipleStudents: true,
      locale: i18n.language,
      country: 'undefined',
    },
  });
  const email = watch('email');
  const allValues = watch();

  const onSubmit = (data: FormValues) => {
    // Get referral code from cookie first, then from form input
    const cookieReferralCode = Cookies.get(REFERRAL_COOKIE_NAME);
    const formReferralCode = data.referralCode?.trim();
    const referralCode = cookieReferralCode || formReferralCode;

    registerMutation({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      locale: data.locale || i18n.language,
      country: data.country || detectedCountry || 'undefined',
      date_of_birth: '2000-01-01', // Default date of birth to satisfy API requirements
      inviteCode: referralCode || undefined,
    });

    // Clear referral code cookie after using it
    if (cookieReferralCode) {
      Cookies.remove(REFERRAL_COOKIE_NAME);
    }
  };

  // Check for referral code in cookie
  useEffect(() => {
    const cookieReferralCode = Cookies.get(REFERRAL_COOKIE_NAME);
    setHasReferralCodeInCookie(!!cookieReferralCode);
  }, []);

  // Check for referral code in URL and store in cookie
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store referral code in cookie (expires in 30 days)
      Cookies.set(REFERRAL_COOKIE_NAME, refCode, {
        expires: 30,
        sameSite: 'lax',
        secure: window.location.protocol === 'https:',
      });
      setHasReferralCodeInCookie(true);

      // Remove ref parameter from URL to keep it clean
      // Only if we're not on /signup (which already handles redirect)
      if (location.pathname !== '/signup') {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('ref');
        const newSearch = newSearchParams.toString();
        navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
      }
    }
  }, [searchParams, navigate, location.pathname]);

  useEffect(() => {
    if (detectedCountry && detectedCountry !== 'undefined') {
      setValue('country', detectedCountry);
    }
  }, [detectedCountry, setValue]);

  const next = async () => {
    if (activeStep === 1) {
      const ok = await trigger(['fullName', 'email', 'password']);
      if (!ok) return;
    }

    if (activeStep === 2) {
      const ok = await trigger('email');
      if (!ok) return;

      const link = getProviderLink(email ?? '');
      if (link) window.open(link, '_blank');
      onSubmit(allValues);

      setActiveStep(3);
      return;
    }

    if (activeStep === 3) {
      return;
    }

    setActiveStep((s: number) => Math.min(s + 1, steps.length));
  };

  const prev = () => setActiveStep(s => Math.max(s - 1, 1));

  const steps = [
    {
      text: t('home.dialogs.signUp.steps.create'),
      content: (
        <>
          <div data-testid='sign-up-step-1-content'>
            <Input
              data-testid='sign-up-full-name-input'
              className={errors?.fullName ? 'border-destructive' : ''}
              placeholder={t('globalFields.displayName.label')}
              {...register('fullName', displayNameFieldValidation)}
            />
            {errors.fullName && (
              <p data-testid='sign-up-full-name-error' className='text-destructive text-sm'>
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div>
            <Input
              data-testid='sign-up-email-input'
              placeholder={t('globalFields.email.label')}
              className={errors?.email ? 'border-destructive' : ''}
              {...register('email', {
                ...emailFieldValidation,
                onChange: e => {
                  setValue('email', e.target.value.replace(/\s+/g, ''));
                },
              })}
              inputMode='email'
            />
            {errors.email && (
              <p data-testid='sign-up-email-error' className='text-destructive text-sm'>
                {errors.email.message}
              </p>
            )}
          </div>
          <div className='relative'>
            <Input
              data-testid='sign-up-password-input'
              type={showPassword ? 'text' : 'password'}
              className={
                errors?.password
                  ? 'border-destructive focus-visible:ring-destructive pr-10'
                  : 'pr-10'
              }
              placeholder={t('globalFields.password.label')}
              {...register('password', passwordFieldValidation)}
            />
            <button
              type='button'
              className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
          {errors.password && (
            <p data-testid='sign-up-password-error' className='text-destructive text-sm'>
              {errors.password.message}
            </p>
          )}

          {!hasReferralCodeInCookie && (
            <div>
              <Input
                data-testid='sign-up-referral-code-input'
                placeholder={t('referrals.codePlaceholder', 'Referral Code (Optional)')}
                className={errors?.referralCode ? 'border-destructive' : ''}
                {...register('referralCode', {
                  onChange: e => {
                    // Convert to uppercase
                    const value = e.target.value.toUpperCase().replace(/\s+/g, '');
                    setValue('referralCode', value);
                  },
                })}
              />
              {errors.referralCode && (
                <p data-testid='sign-up-referral-code-error' className='text-destructive text-sm'>
                  {errors.referralCode.message}
                </p>
              )}
            </div>
          )}

          <div className='mt-4'>
            <p className='text-sm text-muted-foreground text-left'>
              <Link
                data-testid='sign-up-terms-link'
                to='/terms-and-conditions'
                target='_blank'
                className='text-foreground underline hover:text-foreground/80'
              >
                {t('sidebar.termsAndConditions', 'Terms & Conditions')}
              </Link>
              {' | '}
              <Link
                data-testid='sign-up-privacy-link'
                to='/privacy-policy'
                target='_blank'
                className='text-foreground underline hover:text-foreground/80'
              >
                {t('sidebar.privacyPolicy', 'Privacy Policy')}
              </Link>
            </p>
          </div>
        </>
      ),
    },
    {
      text: t('home.dialogs.signUp.steps.verify'),
      content: (
        <h2 className='text-sm'>
          {t('home.dialogs.signUp.fields.verify.label')}
          <span className='font-semibold break-all'>{email}</span>
          {t('home.dialogs.signUp.fields.verify.email')}
        </h2>
      ),
    },
    {
      text: t('home.dialogs.signUp.steps.complete'),
      content: (
        <div className='flex flex-col gap-4'>
          <h3 className='text-sm break-all'>
            {t('home.dialogs.signUp.fields.complete.accountCreated')}
          </h3>

          <div className='flex items-center justify-between gap-2 max-[480px]:flex-col max-[480px]:items-start'>
            <h2 className='text-sm opacity-70'>
              {t('home.dialogs.signUp.fields.complete.didntReceive')}
            </h2>
            <ResendButton email={email ?? ''} activeStep={activeStep} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <ScrollArea className='grid gap-4 text-card-foreground min-[450px]:px-[20px]'>
      <div className='flex flex-col gap-1'>
        {steps.map((step, index) => (
          <Step
            key={index}
            step={index + 1}
            text={step.text}
            active={activeStep}
            last={index + 1 === steps.length}
            next={next}
            prev={prev}
            loading={isRegisterLoading}
          >
            {step.content}
          </Step>
        ))}
      </div>
    </ScrollArea>
  );
};
