import type { FC, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';

interface IStepProps {
  step: number;
  text: string;
  active: number;
  last?: boolean;
  next?: () => void;
  prev?: () => void;
  loading?: boolean;
  children: ReactNode;
}

export const Step: FC<IStepProps> = ({
  step,
  active,
  next,
  prev,
  text,
  loading,
  children,
  last = false,
}) => {
  const { t } = useTranslation();
  const isActive = step === active;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <div data-testid={`sign-up-step-${step}-header`} className='flex items-center gap-2'>
        <div
          data-testid={`sign-up-step-${step}-indicator`}
          className={`size-7 rounded-full ${!isActive && step > active ? 'bg-muted text-foreground/60' : 'bg-primary text-primary-foreground'} flex items-center justify-center text-sm`}
        >
          {!isActive && step < active ? <Check className='size-3.5' /> : step}
        </div>
        <h2
          data-testid={`sign-up-step-${step}-title`}
          className={`${!isActive && step > active ? 'text-foreground/60 font-medium' : 'text-foreground font-semibold'} `}
        >
          {text}
        </h2>
      </div>
      <div
        data-testid={`sign-up-step-${step}-container`}
        className={`ml-3.5 pl-5.5 py-3 ${!last && 'border-l border-primary/20'}`}
      >
        <AnimatePresence>
          {isActive && (
            <motion.div
              key={step}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='flex flex-col gap-4 overflow-hidden p-1'
            >
              {children}

              <div className='flex items-center gap-2' data-testid={`sign-up-step-${step}-buttons`}>
                {active === 1 && (
                  <button
                    data-testid='sign-up-back-to-signin-button'
                    className='border border-primary/90 transition-colors duration-300 hover:bg-primary/10 text-primary px-6 py-3 rounded-md w-fit text-sm font-semibold cursor-pointer'
                    onClick={e => {
                      e.preventDefault();
                      // Preserve current path when switching back to sign-in
                      const currentPath = location.pathname;
                      navigate(`${currentPath}?login=true`, { replace: true });
                    }}
                  >
                    {t('home.dialogs.signUp.steps.buttons.back')}
                  </button>
                )}

                {!last && active !== 1 && prev && (
                  <button
                    data-testid={`sign-up-step-${step}-back-button`}
                    className='border border-primary/90 transition-colors duration-300 hover:bg-primary/10 text-primary px-6 py-3 rounded-md w-fit text-sm font-semibold cursor-pointer'
                    onClick={e => {
                      e.preventDefault();
                      prev();
                    }}
                  >
                    {t('home.dialogs.signUp.steps.buttons.back')}
                  </button>
                )}

                {!last && next && (
                  <button
                    data-testid={`sign-up-step-${step}-next-button`}
                    className='bg-primary/90 disabled:bg-primary/50 transition-colors duration-300 hover:bg-primary disabled:hover:bg-primary/60 text-primary-foreground px-6 py-3 rounded-md w-fit text-sm font-semibold cursor-pointer flex items-center justify-center'
                    disabled={loading}
                    onClick={e => {
                      e.preventDefault();
                      next();
                    }}
                  >
                    {loading ? (
                      <Loader2 className='animate-spin h-5 w-5' />
                    ) : (
                      t('home.dialogs.signUp.steps.buttons.next')
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
