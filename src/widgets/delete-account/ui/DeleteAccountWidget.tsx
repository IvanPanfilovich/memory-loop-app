import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { DeleteAccountDialog } from './DeleteAccountDialog';

export const DeleteAccountWidget = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant='destructive'
        size='sm'
        onClick={() => setIsDialogOpen(true)}
        className='flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 w-full sm:w-auto'
        title={t('profile.actions.deleteAccount')}
      >
        <Trash2 className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
        <span className='truncate'>{t('profile.actions.deleteAccount')}</span>
      </Button>

      <DeleteAccountDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
};
