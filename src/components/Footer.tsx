import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <footer
      className={`bg-sidebar border-t border-border py-6 p-5 max-[1000px]:p-4 ${className}`}
      style={{
        paddingLeft: 'max(env(safe-area-inset-left), 1.25rem)',
        paddingRight: 'max(env(safe-area-inset-right), 1.25rem)',
      }}
    >
      <div className='max-w-[1900px] mx-auto w-full'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
          <div className='text-sm text-foreground'>{t('sidebar.brand', 'Memory Loop')}</div>

          <div className='flex flex-wrap justify-center sm:justify-end gap-6 text-sm'>
            <Link
              to='/privacy-policy'
              className='text-foreground hover:text-foreground/80 transition-colors duration-200'
            >
              {t('footer.privacyPolicy')}
            </Link>
            <Link
              to='/terms-and-conditions'
              className='text-foreground hover:text-foreground/80 transition-colors duration-200'
            >
              {t('footer.termsAndConditions')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
