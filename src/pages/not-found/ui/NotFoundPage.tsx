import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '@/shadcn/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // If we're on "/" but React Router is showing NotFoundPage,
  // it means React Router intercepted the navigation

  // Don't render 404 page if we're on "/" - we're reloading
  if (location.pathname === '/') {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-2xl'>
        {/* Header */}
        <div className='mb-8'>
          <div className='text-center'>
            <div className='w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Search className='w-12 h-12 text-primary' />
            </div>
            <h1 className='text-6xl font-bold text-primary mb-4'>
              {t('notFound.errorCode', '404')}
            </h1>
            <h2 className='text-3xl font-semibold text-gray-900 dark:text-white mb-4'>
              {t('notFound.title', 'Page Not Found')}
            </h2>
            <p className='text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto'>
              {t(
                'notFound.description',
                "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL."
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button
            onClick={handleGoHome}
            size='lg'
            className='bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2'
          >
            <Home className='w-5 h-5' />
            {t('notFound.goHome', 'Go to Homepage')}
          </Button>

          <Button
            onClick={handleGoBack}
            variant='outline'
            size='lg'
            className='flex items-center gap-2'
          >
            <ArrowLeft className='w-5 h-5' />
            {t('notFound.goBack', 'Go Back')}
          </Button>
        </div>
      </div>
    </div>
  );
};
