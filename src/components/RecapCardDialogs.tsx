import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shadcn/components/ui/dialog';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { AlertTriangle, Edit2 } from 'lucide-react';

interface RenameRecapDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRename: (newTitle: string) => void;
}

export const RenameRecapDialog = ({
  isOpen,
  onOpenChange,
  currentTitle,
  onRename,
}: RenameRecapDialogProps) => {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!newTitle.trim()) return;
    setIsSaving(true);
    try {
      await onRename(newTitle.trim());
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewTitle(currentTitle);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className='sm:max-w-md !z-[100] recap-dialog-high-z'
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
              <Edit2 className='w-6 h-6 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-xl'>
                {t('recap.rename.title', 'Rename recap')}
              </DialogTitle>
              <DialogDescription className='mt-1'>
                {t('recap.rename.description', 'Enter a new name for this recap.')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Input
              type='text'
              placeholder={t('recap.rename.placeholder', 'Recap title')}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newTitle.trim() && !isSaving) {
                  handleSave();
                }
              }}
              className='w-full text-base'
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={isSaving}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!newTitle.trim() || newTitle.trim() === currentTitle || isSaving}
          >
            {isSaving ? t('common.loading', 'Saving...') : t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteRecapDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recapTitle: string;
  onDelete: () => void;
}

export const DeleteRecapDialog = ({
  isOpen,
  onOpenChange,
  recapTitle,
  onDelete,
}: DeleteRecapDialogProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-md !z-[100] recap-dialog-high-z'
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0'>
              <AlertTriangle className='w-6 h-6 text-destructive' />
            </div>
            <div>
              <DialogTitle className='text-xl'>
                {t('recap.delete.title', 'Delete recap')}
              </DialogTitle>
              <DialogDescription className='mt-1'>
                {t(
                  'recap.delete.description',
                  'Are you sure you want to delete this recap? This action cannot be undone.'
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='rounded-lg border-2 border-destructive/20 bg-destructive/5 p-4'>
            <p className='text-sm font-medium text-foreground'>
              {t('recap.delete.recapName', 'Recap:')}{' '}
              <span className='font-semibold'>{recapTitle}</span>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
            {isDeleting
              ? t('common.loading', 'Deleting...')
              : t('recap.delete.confirm', 'Delete recap')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface BulkDeleteRecapDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recapTitles: string[];
  onDelete: () => void;
}

export const BulkDeleteRecapDialog = ({
  isOpen,
  onOpenChange,
  recapTitles,
  onDelete,
}: BulkDeleteRecapDialogProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-md !z-[100] recap-dialog-high-z'
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0'>
              <AlertTriangle className='w-6 h-6 text-destructive' />
            </div>
            <div>
              <DialogTitle className='text-xl'>
                {t('recap.bulkDelete.title', 'Delete recaps')}
              </DialogTitle>
              <DialogDescription className='mt-1'>
                {t(
                  'recap.bulkDelete.description',
                  'Are you sure you want to delete these recaps? This action cannot be undone.'
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='rounded-lg border-2 border-destructive/20 bg-destructive/5 p-4 max-h-64 overflow-y-auto'>
            <div className='space-y-2'>
              {recapTitles.map((title, index) => (
                <p key={index} className='text-sm font-medium text-foreground'>
                  {index + 1}. {title}
                </p>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? t('common.loading', 'Deleting...') : t('common.ok', 'OK')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
