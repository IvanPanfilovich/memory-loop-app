import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Button } from '@/shadcn/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            {variant === 'destructive' && (
              <div className='w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0'>
                <AlertTriangle className='w-5 h-5 text-destructive' />
              </div>
            )}
            <div className='flex-1'>
              <DialogTitle className={variant === 'destructive' ? 'text-destructive' : ''}>
                {title}
              </DialogTitle>
              <DialogDescription className='mt-1'>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isLoading} className='flex-1'>
            {cancelText || t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className='flex-1'
          >
            {isLoading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                {t('common.loading', 'Loading...')}
              </>
            ) : (
              confirmText || t('common.confirm', 'Confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
