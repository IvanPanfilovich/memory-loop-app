import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Separator } from '@/shadcn/components/ui/separator';

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <div className='min-h-screen bg-background'>
      <div className='w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8'>
        <div className='space-y-4 sm:space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2 sm:space-y-4'>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight'>
              {t('privacyPolicy.title', 'Privacy Policy')}
            </h1>
            <p className='text-sm sm:text-lg text-muted-foreground'>
              {t('privacyPolicy.subtitle', 'Memory Loop')}
            </p>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              {t('privacyPolicy.lastUpdated', 'Last updated: January 2025')}
            </p>
          </div>

          <Separator />

          {/* Introduction */}
          <Card>
            <CardContent className='pt-4 sm:pt-6 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground leading-relaxed'>
                {t(
                  'privacyPolicy.introduction',
                  'The Memory Loop platform ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Policy explains what we collect, why and how we use it, how long we keep it, who we share it with, and the rights you have under the EU General Data Protection Regulation (GDPR).'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 1: Who we are */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section1.title', '1) Who we are (Data Controller)')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section1.service', 'Service Name')}
                  </h4>
                  <p className='text-muted-foreground text-sm sm:text-base'>Memory Loop</p>
                </div>
                <div>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section1.email', 'Email')}
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
                    'privacyPolicy.section1.controllerNote',
                    'The Memory Loop platform is the data controller for personal data processed via our service and website.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: What data we collect */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section2.title', '2) What data we collect')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section2.intro',
                  'We collect and process the following categories of data:'
                )}
              </p>

              <div className='space-y-3 sm:space-y-4'>
                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section2.accountData', 'Account & profile data')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'privacyPolicy.section2.accountDataDesc',
                      'name, email address, password (hashed), display name, locale, country, date of birth (optional), profile preferences.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section2.contentData', 'Content & usage data')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'privacyPolicy.section2.contentDataDesc',
                      'YouTube links you submit, generated recaps, audio summaries, flashcards, selected themes/topics, timestamps, and your interactions with generated content.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section2.subscriptionData', 'Subscription & payment data')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'privacyPolicy.section2.subscriptionDataDesc',
                      'premium subscription status, payment history, credit usage, billing information, transaction identifiers. Payment card details are processed securely by Stripe and are not stored by us.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section2.technicalData', 'Technical & usage data (website)')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'privacyPolicy.section2.technicalDataDesc',
                      'IP address, device and browser type/version, language, time zone, referring/exit pages, interactions with the site, cookies and similar identifiers, session data.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section2.communications', 'Communications')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'privacyPolicy.section2.communicationsDesc',
                      'messages you send us (email, contact forms), feedback/complaints, support requests.'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Why we use your data */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section3.title', '3) Why we use your data and the legal bases')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse border border-border text-xs sm:text-sm'>
                  <thead>
                    <tr className='bg-muted'>
                      <th className='border border-border p-2 sm:p-3 text-left font-semibold'>
                        {t('privacyPolicy.section3.purpose', 'Purpose')}
                      </th>
                      <th className='border border-border p-2 sm:p-3 text-left font-semibold'>
                        {t('privacyPolicy.section3.examples', 'Examples')}
                      </th>
                      <th className='border border-border p-2 sm:p-3 text-left font-semibold'>
                        {t('privacyPolicy.section3.legalBasis', 'Legal basis')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className='text-xs sm:text-sm'>
                    <tr>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.servicePurpose',
                          'Service delivery & account management'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.serviceExamples',
                          'Creating & managing your account, generating recaps, processing content requests'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.serviceLegal',
                          'Contract (GDPR Art. 6(1)(b)); Legitimate interests (Art. 6(1)(f)) to run an effective service.'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.paymentPurpose',
                          'Payments & subscription management'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.paymentExamples',
                          'Processing premium subscriptions via Stripe, managing credits, issuing invoices'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.paymentLegal',
                          'Legal obligation (tax/accounting) under applicable law; Contract.'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='border border-border p-2 sm:p-3'>
                        {t('privacyPolicy.section3.securityPurpose', 'Security & fraud prevention')}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.securityExamples',
                          'Preventing misuse, ensuring service security, detecting fraudulent activity'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.securityLegal',
                          'Legitimate interests (Art. 6(1)(f)).'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.marketingPurpose',
                          'Direct marketing to existing customers'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.marketingExamples',
                          'Emails about service updates, new features; always with opt‑out'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.marketingLegal',
                          'Legitimate interests + e‑Privacy Directive "soft opt‑in," where permitted; opt‑out anytime.'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='border border-border p-2 sm:p-3'>
                        {t('privacyPolicy.section3.newsletterPurpose', 'Newsletters & promotions')}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.newsletterExamples',
                          'Non‑essential marketing communications'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.newsletterLegal',
                          'Consent (Art. 6(1)(a)); withdraw anytime.'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.analyticsPurpose',
                          'Analytics & service improvement'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.analyticsExamples',
                          'Measuring service performance, improving features, understanding usage patterns'
                        )}
                      </td>
                      <td className='border border-border p-2 sm:p-3'>
                        {t(
                          'privacyPolicy.section3.analyticsLegal',
                          'Consent for non‑essential analytics under e‑Privacy; legitimate interests/necessary for strictly necessary cookies only.'
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className='mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'privacyPolicy.section3.note',
                    'We will let you know when providing data is required (e.g., to create an account or generate content). If you do not provide mandatory data, we may be unable to provide the service.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Payment processing with Stripe */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section4.title', '4) Payment processing with Stripe')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section4.intro',
                  'We use Stripe, Inc. ("Stripe") as our payment service provider for processing premium subscription payments. When you subscribe to our premium service:'
                )}
              </p>
              <ul className='space-y-2 text-muted-foreground text-sm sm:text-base list-disc list-inside ml-2'>
                <li>
                  {t(
                    'privacyPolicy.section4.stripe1',
                    'Stripe collects and processes your payment card information securely. We do not store or have access to your full card details.'
                  )}
                </li>
                <li>
                  {t(
                    'privacyPolicy.section4.stripe2',
                    'Stripe may collect additional information as required for payment processing, fraud prevention, and compliance with financial regulations.'
                  )}
                </li>
                <li>
                  {t(
                    'privacyPolicy.section4.stripe3',
                    "Stripe's processing of your payment data is subject to Stripe's Privacy Policy (available at https://stripe.com/privacy)."
                  )}
                </li>
                <li>
                  {t(
                    'privacyPolicy.section4.stripe4',
                    'We receive confirmation of successful payments and subscription status from Stripe, but not your full payment card details.'
                  )}
                </li>
              </ul>
              <div className='mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'privacyPolicy.section4.note',
                    "Stripe is PCI DSS Level 1 certified and complies with applicable data protection laws. For more information about Stripe's data practices, please review their privacy policy."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Where we get your data */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section5.title', '5) Where we get your data')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <ul className='space-y-2 text-muted-foreground text-sm sm:text-base'>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section5.directly',
                      'Directly from you when you create an account, submit content links, generate recaps, or contact us.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section5.stripe',
                      'From Stripe when processing payments and managing subscriptions.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section5.thirdParty',
                      'From third-party services (YouTube) when you provide links to their content, in accordance with their terms of service.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section5.automatically',
                      'Automatically through your use of our service (technical data, usage patterns).'
                    )}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 6: Who we share data with */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section6.title', '6) Who we share data with (recipients)')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-3 px-3 sm:px-6'>
              <ul className='space-y-2 text-muted-foreground text-sm sm:text-base'>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section6.stripe',
                      'Stripe, Inc. — for processing premium subscription payments and managing billing.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section6.hosting',
                      'Hosting, cloud storage, and IT service providers — to operate and maintain our service infrastructure.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section6.ai',
                      'AI service providers — for generating recaps, audio summaries, and flashcards from your submitted content.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section6.analytics',
                      'Analytics and session recording providers — Google Analytics 4 (GA4) and Smartlook — for understanding how visitors interact with our website and improving user experience. These services are only used with your consent via our cookie banner.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section6.authorities',
                      'Tax authorities or other government bodies when required by law (e.g., for tax reporting, compliance).'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section6.advisors',
                      'Professional advisors (auditors, accountants, lawyers) where necessary.'
                    )}
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-2 flex-shrink-0'>•</span>
                  <span>
                    {t(
                      'privacyPolicy.section6.courts',
                      'Courts and law‑enforcement if legally required.'
                    )}
                  </span>
                </li>
              </ul>
              <div className='mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'privacyPolicy.section6.processorsNote',
                    'We require processors to implement appropriate security measures and process data only per our instructions (GDPR Art. 28).'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: International transfers */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section7.title', '7) International transfers')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section7.content',
                  'Some providers (including Stripe, AI service providers, and Google Analytics) may be located outside the EEA. Where data is transferred internationally, we use European Commission Standard Contractual Clauses (SCCs) or rely on adequacy decisions, and apply supplementary safeguards as needed. Smartlook stores data in the EU region. Stripe is certified under appropriate frameworks for international data transfers.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 8: How long we keep your data */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section8.title', '8) How long we keep your data (retention)')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section8.intro',
                  'We keep data no longer than necessary for the purposes above and to comply with laws. Key periods:'
                )}
              </p>

              <div className='space-y-2 sm:space-y-3'>
                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section8.accountData', 'Account data:')}
                  </h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t(
                      'privacyPolicy.section8.accountDataDesc',
                      'retained while your account is active. After account deletion, we may retain certain data for up to 30 days for security and fraud prevention, then delete or anonymize it, except where longer retention is required by law.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t(
                      'privacyPolicy.section8.contentData',
                      'Generated content (recaps, flashcards):'
                    )}
                  </h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t(
                      'privacyPolicy.section8.contentDataDesc',
                      'stored while your account is active. You can delete your content at any time. Deleted content is permanently removed within 30 days, except where retention is required by law.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section8.paymentData', 'Payment & subscription records:')}
                  </h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t(
                      'privacyPolicy.section8.paymentDataDesc',
                      'retained for at least 7 years for tax and accounting purposes as required by applicable law.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section8.marketing', 'Marketing data:')}
                  </h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t(
                      'privacyPolicy.section8.marketingDesc',
                      'until you opt out or for a defined inactivity period (e.g., 24 months), whichever is sooner.'
                    )}
                  </p>
                </div>

                <div className='p-3 sm:p-4 border rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section8.websiteLogs', 'Website logs (security):')}
                  </h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t('privacyPolicy.section8.websiteLogsDesc', 'typically 12 months.')}
                  </p>
                </div>
              </div>

              <div className='mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'privacyPolicy.section8.note',
                    'Where retention obligations differ (e.g., ongoing disputes), we may keep data longer to establish, exercise, or defend legal claims.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 9: Your rights */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section9.title', '9) Your rights')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section9.intro',
                  'Under GDPR you have the right to access your data, rectify inaccuracies, erase data (where applicable), restrict or object to processing, and data portability. Where we rely on consent, you may withdraw it at any time (this will not affect prior lawful processing). You also have the right not to be subject to a decision based solely on automated processing that produces legal or similarly significant effects.'
                )}
              </p>

              <div className='p-3 sm:p-4 bg-muted rounded-lg'>
                <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                  {t('privacyPolicy.section9.howToExercise', 'How to exercise your rights:')}
                </h4>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'privacyPolicy.section9.howToExerciseDesc',
                    'contact us using the details in Section 1, or use the account settings in your profile. We may ask for information to verify your identity before acting on your request.'
                  )}
                </p>
              </div>

              <div className='p-3 sm:p-4 bg-muted rounded-lg'>
                <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                  {t('privacyPolicy.section9.rightToComplain', 'Right to complain:')}
                </h4>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t(
                    'privacyPolicy.section9.rightToComplainDesc',
                    'You can lodge a complaint with your local data protection authority. For EU residents, you can find your supervisory authority at https://edpb.europa.eu/about-edpb/board/members_en'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 10: Cookies */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t(
                  'privacyPolicy.section10.title',
                  '10) Cookies, analytics and similar technologies'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section10.intro',
                  'We use strictly necessary cookies to run our service (e.g., to maintain sessions, remember your preferences, or remember privacy choices). We only set non‑essential cookies (e.g., analytics, A/B testing, session recordings) with your consent via our cookie banner/preferences. This approach follows the EU e‑Privacy Directive rule that storing or accessing information on a device requires prior consent unless strictly necessary for the service you request.'
                )}
              </p>

              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section10.cookiePolicy',
                  'See our separate Cookie Policy for full details (cookie categories, lifetimes, vendors, and your choices).'
                )}
              </p>

              <div className='p-3 sm:p-4 border rounded-lg space-y-3'>
                <div>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section10.googleAnalytics', 'Google Analytics 4 (GA4):')}
                  </h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t(
                      'privacyPolicy.section10.googleAnalyticsDesc',
                      "We use Google Analytics 4 to understand how visitors interact with our website. GA4 collects anonymized data about page views, user interactions, and website performance. GA4's standard user‑level/event data retention is 2 months by default (configurable up to 14 months in the free version; longer for GA360). Google's privacy policy applies: https://policies.google.com/privacy"
                    )}
                  </p>
                </div>

                <div>
                  <h4 className='font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base'>
                    {t('privacyPolicy.section10.smartlook', 'Smartlook:')}
                  </h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t(
                      'privacyPolicy.section10.smartlookDesc',
                      "We use Smartlook for session recording and user behavior analysis to improve our website's usability and user experience. Smartlook records user interactions (clicks, scrolls, form inputs) in an anonymized manner. Recordings are stored in the EU region and are subject to Smartlook's privacy policy: https://www.smartlook.com/help/privacy-policy/"
                    )}
                  </p>
                </div>

                <div className='p-2 sm:p-3 bg-muted rounded-lg'>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    {t(
                      'privacyPolicy.section10.analyticsConsent',
                      'Both Google Analytics 4 and Smartlook are only activated with your explicit consent via our cookie consent banner. You can withdraw your consent at any time by clearing your browser cookies or adjusting your cookie preferences.'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 11: Children's data */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section11.title', "11) Children's data")}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section11.content',
                  "Our services are intended for adults (18+). We do not knowingly collect children's personal data. If you are under 18, please do not use our service or provide any personal information."
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 12: Security */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section12.title', '12) Security')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section12.content',
                  'We apply appropriate technical and organizational measures to protect personal data—encryption in transit and at rest, access controls, secure configuration, logging, backups, and staff confidentiality. We limit access to those who need it and train personnel on data protection.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 13: Third-party links */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section13.title', '13) Third‑party links and services')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section13.content',
                  'Our service integrates with third‑party services (YouTube, Stripe). Those services have their own privacy terms; please review them before using. We are not responsible for the privacy practices of third‑party services.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 14: Changes to this Policy */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section14.title', '14) Changes to this Policy')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section14.content',
                  'We may update this Policy from time to time (e.g., due to legal or service changes). The "Last updated" date shows the latest version. For significant changes, we will provide a clear notice on the website or via email before they take effect.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Section 15: Contact us */}
          <Card>
            <CardHeader className='px-3 sm:px-6'>
              <CardTitle className='text-lg sm:text-xl'>
                {t('privacyPolicy.section15.title', '15) Contact us')}
              </CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                {t(
                  'privacyPolicy.section15.content',
                  'For any questions about this Policy or your data, contact us at ivan.panfilovich.work@gmail.com. You may also contact your local data protection authority for complaints.'
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { PrivacyPolicyPage };
