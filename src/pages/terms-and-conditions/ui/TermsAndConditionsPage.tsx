import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Separator } from '@/shadcn/components/ui/separator';

const TermsAndConditionsPage = () => {
  const { t } = useTranslation();

  return (
    <div className='min-h-screen bg-background'>
      <div className='w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8'>
        <div className='space-y-4 sm:space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2 sm:space-y-4'>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight'>
              {t('termsAndConditions.title', 'Terms & Conditions')}
            </h1>
            <p className='text-sm sm:text-lg text-muted-foreground'>
              {t('termsAndConditions.subtitle', 'Memory Loop')}
            </p>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              {t('termsAndConditions.lastUpdated', 'Last updated: January 2025')}
            </p>
          </div>

          <Separator />

          {/* Section 1: About Us */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section1.title', '1) About Us and Contact Details')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('termsAndConditions.section1.service', 'Service Name')}
                  </h4>
                  <p className='text-muted-foreground text-sm sm:text-base'>Memory Loop</p>
                </div>
                <div>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('termsAndConditions.section1.email', 'Email')}
                  </h4>
                  <p className='text-muted-foreground text-sm sm:text-base'>
                    <a
                      href='mailto:ivan.panfilovich.work@gmail.com'
                      className='underline underline-offset-2'
                    >
                      ivan.panfilovich.work@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              <div className='mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'termsAndConditions.section1.complianceNote',
                    'The Memory Loop platform provides this information in compliance with EU transparency rules for online services.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Scope of Terms */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section2.title', '2) Scope of Terms')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'termsAndConditions.section2.content',
                  'These Terms govern your use of the Memory Loop platform ("we", "us", "our"), a service that generates personalized recap podcasts and flashcards from YouTube content. By creating an account or using our service, you confirm that you have read, understood, and agreed to these Terms.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 3: Definitions */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section3.title', '3) Definitions')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <div className='space-y-3 sm:space-y-4'>
                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('termsAndConditions.section3.service', '"Service"')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'termsAndConditions.section3.serviceDesc',
                      'the Memory Loop platform that generates recap podcasts, audio summaries, and flashcards from user-submitted content links.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('termsAndConditions.section3.premium', '"Premium Subscription"')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'termsAndConditions.section3.premiumDesc',
                      'a paid subscription plan that provides monthly credits for generating recaps and accessing premium features.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('termsAndConditions.section3.credits', '"Credits"')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'termsAndConditions.section3.creditsDesc',
                      'virtual currency used within the Service to generate recaps, audio summaries, and flashcards. Credits are allocated monthly for Premium subscribers and reset at the end of each billing cycle.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('termsAndConditions.section3.content', '"User Content"')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'termsAndConditions.section3.contentDesc',
                      'links to YouTube content that you submit to the Service, as well as any recaps, flashcards, or other content generated by or stored in your account.'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Account Registration */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section4.title', '4) Account Registration and Eligibility')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <ol className='space-y-2 text-muted-foreground text-sm sm:text-base list-decimal list-inside'>
                <li>
                  {t(
                    'termsAndConditions.section4.age',
                    'You must be at least 18 years old to use our Service. By creating an account, you represent that you meet this age requirement.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section4.accuracy',
                    'You are responsible for providing accurate, current, and complete information during registration and keeping your account information updated.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section4.security',
                    'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section4.oneAccount',
                    'You may only maintain one account. Creating multiple accounts to circumvent usage limits or other restrictions is prohibited.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section4.termination',
                    'We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.'
                  )}
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Section 5: Service Description */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section5.title', '5) Service Description')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'termsAndConditions.section5.intro',
                  'Memory Loop uses artificial intelligence to analyze content from YouTube links you provide and generates:'
                )}
              </p>
              <ul className='space-y-2 text-muted-foreground text-sm sm:text-base list-disc list-inside ml-2'>
                <li>
                  {t(
                    'termsAndConditions.section5.recap',
                    'Personalized recap podcasts focusing on themes and topics you select'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section5.audio',
                    'Audio summaries of selected content segments'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section5.flashcards',
                    'Flashcards containing key facts and information from the content'
                  )}
                </li>
              </ul>
              <div className='mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'termsAndConditions.section5.note',
                    'The Service is provided "as is" and we do not guarantee the accuracy, completeness, or quality of generated content. Generated content is for informational and educational purposes only.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Premium Subscriptions and Payments */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t(
                  'termsAndConditions.section6.title',
                  '6) Premium Subscriptions, Payments, and Stripe'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <div className='space-y-2 sm:space-y-3'>
                <h4 className='font-semibold text-foreground text-sm sm:text-base'>
                  {t('termsAndConditions.section6.subscription', 'Premium Subscription:')}
                </h4>
                <ul className='space-y-2 text-muted-foreground text-sm sm:text-base list-disc list-inside ml-2'>
                  <li>
                    {t(
                      'termsAndConditions.section6.subscription1',
                      'Premium subscriptions are billed on a recurring monthly basis.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.subscription2',
                      'Premium subscribers receive a monthly allocation of credits that reset at the beginning of each billing cycle.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.subscription3',
                      'Subscription fees are displayed in your local currency (where available) or in EUR. Prices may vary by region and are subject to applicable taxes.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.subscription4',
                      'Your subscription automatically renews each month unless cancelled before the renewal date.'
                    )}
                  </li>
                </ul>
              </div>

              <div className='space-y-2 sm:space-y-3'>
                <h4 className='font-semibold text-foreground text-sm sm:text-base'>
                  {t('termsAndConditions.section6.payment', 'Payment Processing via Stripe:')}
                </h4>
                <ul className='space-y-2 text-muted-foreground text-sm sm:text-base list-disc list-inside ml-2'>
                  <li>
                    {t(
                      'termsAndConditions.section6.payment1',
                      'We use Stripe, Inc. ("Stripe") as our payment service provider. By subscribing, you agree to Stripe\'s Terms of Service and Privacy Policy.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.payment2',
                      'Payment card information is processed securely by Stripe. We do not store or have access to your full payment card details.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.payment3',
                      'You authorize us to charge your payment method on file for subscription fees and any applicable taxes.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.payment4',
                      'If payment fails, we may suspend your Premium subscription until payment is successfully processed.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.payment5',
                      'Stripe is PCI DSS Level 1 certified and complies with applicable financial regulations.'
                    )}
                  </li>
                </ul>
              </div>

              <div className='space-y-2 sm:space-y-3'>
                <h4 className='font-semibold text-foreground text-sm sm:text-base'>
                  {t('termsAndConditions.section6.credits', 'Credits System:')}
                </h4>
                <ul className='space-y-2 text-muted-foreground text-sm sm:text-base list-disc list-inside ml-2'>
                  <li>
                    {t(
                      'termsAndConditions.section6.credits1',
                      'Credits are consumed when you generate recaps, audio summaries, or flashcards.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.credits2',
                      'Unused credits do not roll over to the next billing cycle unless explicitly stated in your subscription plan.'
                    )}
                  </li>
                  <li>
                    {t(
                      'termsAndConditions.section6.credits3',
                      'Credit costs may vary based on content length and complexity. We reserve the right to adjust credit costs with reasonable notice.'
                    )}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Cancellation and Refunds */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t(
                  'termsAndConditions.section7.title',
                  '7) Cancellation, Refunds, and Subscription Changes'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <ol className='space-y-2 text-muted-foreground text-sm sm:text-base list-decimal list-inside'>
                <li>
                  {t(
                    'termsAndConditions.section7.cancellation',
                    'You may cancel your Premium subscription at any time through your account settings or by contacting support. Cancellation takes effect at the end of your current billing period.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section7.refund',
                    'Refunds: Subscription fees are generally non-refundable. However, we may provide refunds at our discretion for exceptional circumstances (e.g., technical issues preventing service use, billing errors).'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section7.chargeback',
                    'If you dispute a charge through your payment provider (chargeback), we reserve the right to immediately suspend or terminate your account.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section7.changes',
                    "We reserve the right to modify subscription prices, credit allocations, or features with at least 30 days' notice. Continued use after changes constitutes acceptance."
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section7.termination',
                    'We may terminate or suspend Premium subscriptions for violations of these Terms, fraudulent activity, or non-payment, without refund.'
                  )}
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Section 8: User Content and Intellectual Property */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t(
                  'termsAndConditions.section8.title',
                  '8) User Content and Intellectual Property'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <ol className='space-y-2 text-muted-foreground text-sm sm:text-base list-decimal list-inside'>
                <li>
                  {t(
                    'termsAndConditions.section8.ownership',
                    'You retain ownership of User Content you submit. By submitting content, you grant us a license to use, process, and store it to provide the Service.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section8.generated',
                    'Generated content (recaps, flashcards) created from your User Content belongs to you, subject to these Terms.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section8.thirdParty',
                    "You are responsible for ensuring you have the right to submit links to third-party content (YouTube). You must comply with YouTube's terms of service."
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section8.prohibited',
                    'You may not submit content that is illegal, infringes intellectual property rights, contains malware, or violates any applicable laws or third-party rights.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section8.serviceIP',
                    'The Service, including its design, functionality, and underlying technology, is our intellectual property. You may not copy, modify, or reverse engineer the Service.'
                  )}
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Section 9: Acceptable Use */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t(
                  'termsAndConditions.section9.title',
                  '9) Acceptable Use and Prohibited Activities'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t('termsAndConditions.section9.intro', 'You agree not to:')}
              </p>
              <ul className='space-y-2 text-muted-foreground text-sm sm:text-base list-disc list-inside ml-2'>
                <li>
                  {t(
                    'termsAndConditions.section9.prohibited1',
                    'Use the Service for any illegal purpose or in violation of any laws'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section9.prohibited2',
                    'Attempt to circumvent usage limits, credit systems, or subscription restrictions'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section9.prohibited3',
                    'Interfere with or disrupt the Service, servers, or networks'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section9.prohibited4',
                    'Use automated systems (bots, scrapers) to access the Service without authorization'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section9.prohibited5',
                    'Share your account credentials or allow others to use your account'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section9.prohibited6',
                    'Submit content that contains viruses, malware, or harmful code'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section9.prohibited7',
                    'Resell or redistribute generated content for commercial purposes without authorization'
                  )}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 10: Limitation of Liability */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section10.title', '10) Limitation of Liability')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <ol className='space-y-2 text-muted-foreground text-sm sm:text-base list-decimal list-inside'>
                <li>
                  {t(
                    'termsAndConditions.section10.noGuarantees',
                    'The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted, error-free, or secure operation.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section10.accuracy',
                    'We do not guarantee the accuracy, completeness, or quality of generated content. Generated content is for informational purposes only and should not be relied upon as professional advice.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section10.indirectDamages',
                    'To the maximum extent permitted by law, we are not liable for indirect, incidental, consequential, or punitive damages (e.g., lost profits, data loss).'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section10.totalLiability',
                    'Our total liability for any claims related to the Service is limited to the amount you paid us in the 12 months preceding the claim, or €50, whichever is greater.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section10.consumerRights',
                    'Nothing in these Terms limits your statutory rights under applicable consumer protection laws.'
                  )}
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Section 11: Data Protection */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section11.title', '11) Data Protection and Privacy')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'termsAndConditions.section11.content',
                  'Your use of the Service is subject to our Privacy Policy, which explains how we collect, use, and protect your personal data in compliance with GDPR and applicable data protection laws. By using the Service, you consent to our data practices as described in the Privacy Policy.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 12: Third-Party Services */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section12.title', '12) Third-Party Services')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'termsAndConditions.section12.intro',
                  'The Service integrates with third-party services:'
                )}
              </p>
              <ul className='space-y-2 text-muted-foreground text-sm sm:text-base list-disc list-inside ml-2'>
                <li>
                  {t(
                    'termsAndConditions.section12.youtube',
                    "YouTube — for accessing content you link. Your use of this service is subject to YouTube's terms of service."
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section12.stripe',
                    "Stripe — for payment processing. Stripe's terms and privacy policy apply to payment transactions."
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section12.ai',
                    'AI service providers — for generating recaps and content. These providers process your content in accordance with our agreements with them.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section12.analytics',
                    "Google Analytics 4 and Smartlook — for website analytics and user behavior analysis. These services are only used with your consent via our cookie consent banner. Google's and Smartlook's respective privacy policies apply."
                  )}
                </li>
              </ul>
              <p className='text-sm sm:text-base text-muted-foreground mt-2'>
                {t(
                  'termsAndConditions.section12.disclaimer',
                  'We are not responsible for the availability, functionality, or content of third-party services. Your interactions with third-party services are at your own risk.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 13: Statutory Right of Withdrawal */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t(
                  'termsAndConditions.section13.title',
                  '13) Statutory Right of Withdrawal (EU Notice)'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'termsAndConditions.section13.content',
                  'For digital content services provided immediately upon subscription, you may lose your right of withdrawal once performance has begun with your consent and acknowledgment that you will lose your right of withdrawal (Article 16(m) of EU Consumer Rights Directive 2011/83/EU). By subscribing and using the Service, you acknowledge that the Service begins immediately and you consent to losing your right of withdrawal. This does not affect your other consumer rights under applicable law.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 14: Dispute Resolution */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t(
                  'termsAndConditions.section14.title',
                  '14) Dispute Resolution and Governing Law'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <ol className='space-y-2 text-muted-foreground text-sm sm:text-base list-decimal list-inside'>
                <li>
                  {t(
                    'termsAndConditions.section14.contact',
                    'Please contact us first at ivan.panfilovich.work@gmail.com for any complaints or disputes. We aim to resolve issues promptly and fairly.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section14.governing',
                    'These Terms are governed by the laws of the European Union and applicable member state laws.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section14.jurisdiction',
                    'For EU consumers, disputes may be resolved through out-of-court dispute resolution mechanisms available in your country of residence.'
                  )}
                </li>
                <li>
                  {t(
                    'termsAndConditions.section14.court',
                    'You always retain the right to take disputes to court under applicable law.'
                  )}
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Section 15: Changes to Terms */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section15.title', '15) Changes to These Terms')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'termsAndConditions.section15.content',
                  'We may update these Terms from time to time (e.g., due to legal changes, service improvements, or new features). Material changes will be communicated via email or prominent notice on the Service at least 30 days before they take effect. Continued use of the Service after changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you may cancel your subscription and stop using the Service.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 16: Contact */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('termsAndConditions.section16.title', '16) Contact Us')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'termsAndConditions.section16.content',
                  'For questions about these Terms, please contact us at ivan.panfilovich.work@gmail.com.'
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { TermsAndConditionsPage };
