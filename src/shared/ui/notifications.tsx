import { Toaster } from 'sonner';
import { createPortal } from 'react-dom';
import { Button } from '@/shadcn/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useNotifications } from '../utils/notificationUtils';
import './notifications.css';

export const Notifications = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { notifications, removeNotification } = useNotifications();
  const [portalTarget, setPortalTarget] = useState(
    document.querySelector('#main-class-area') ?? document.body
  );

  const toaster = createPortal(
    <Toaster
      closeButton
      duration={6000}
      position='top-right'
      expand
      theme='system'
      toastOptions={{
        className: 'toast-theme-aware',
        style: {
          background: 'var(--card-foreground)',
          color: 'var(--card)',
          border: '1px solid var(--border)',
        },
      }}
    />,
    portalTarget
  );

  useEffect(() => {
    const newTarget = document.querySelector('#main-class-area') ?? document.body;
    setPortalTarget(newTarget);
  }, [pathname]);

  return (
    <>
      {toaster}

      {notifications.map(({ id, title, description }) =>
        createPortal(
          <div
            className='fixed inset-0 z-50 flex items-center justify-center'
            data-notification-dialog={id}
            style={{
              zIndex: 999999,
              pointerEvents: 'auto',
            }}
          >
            <div
              className='bg-background border border-input rounded-lg shadow-lg p-6 max-w-md mx-4'
              style={{
                zIndex: 999999,
                pointerEvents: 'auto',
              }}
            >
              <div className='space-y-4'>
                <h2 className='text-2xl font-semibold'>{title}</h2>
                <div
                  className='text-base text-center'
                  dangerouslySetInnerHTML={{ __html: description }}
                  data-testid='notification-description'
                />
                <div className='flex justify-center'>
                  <Button
                    size='lg'
                    className='notification-close-btn'
                    data-testid='notification-close-button'
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeNotification(id);
                    }}
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      zIndex: 999999,
                      pointerEvents: 'auto',
                    }}
                  >
                    {t('popup.close')}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </>
  );
};
