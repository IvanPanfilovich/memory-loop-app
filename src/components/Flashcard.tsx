import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import { Check, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface FlashcardProps {
  id: string;
  number: number;
  question: string;
  answer: string;
  className?: string;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onDelete?: (id: string) => void;
  isAnswered?: boolean;
}

export const Flashcard = ({
  id,
  number: _number,
  question,
  answer,
  className,
  onCorrect,
  onIncorrect,
  onDelete,
  isAnswered: _isAnswered = false,
}: FlashcardProps) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleCorrect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCorrect) {
      onCorrect();
    }
  };

  const handleIncorrect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onIncorrect) {
      onIncorrect();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className={cn('relative h-[400px] w-full', className)} style={{ perspective: '1000px' }}>
      <div
        className='relative w-full h-full transition-transform duration-500'
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front side (Question) */}
        <Card
          className='absolute inset-0 w-full h-full border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background cursor-pointer'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
          onClick={handleFlip}
        >
          <CardContent className='p-6 h-full flex flex-col justify-center relative'>
            {/* Delete button - top right */}
            {onDelete && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleDelete}
                className='absolute top-2 right-2 z-10 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                title={t('flashcard.delete', 'Delete flashcard')}
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            )}
            <div className='text-center space-y-4'>
              <p className='text-base sm:text-lg text-foreground leading-relaxed'>{question}</p>
              <p className='text-xs text-muted-foreground mt-6'>
                {t('flashcard.clickToFlip', 'Click to flip')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back side (Answer) */}
        <Card
          className='absolute inset-0 w-full h-full border-2 border-primary/30 bg-gradient-to-br from-background via-primary/5 to-primary/10'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent className='p-6 h-full flex flex-col justify-center relative'>
            {/* Delete button - top right */}
            {onDelete && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleDelete}
                className='absolute top-2 right-2 z-10 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                title={t('flashcard.delete', 'Delete flashcard')}
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            )}
            <div className='text-center space-y-4'>
              <p className='text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line'>
                {answer}
              </p>
              <div className='flex items-center justify-center gap-3 mt-6'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleIncorrect}
                  className='border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
                >
                  <X className='w-4 h-4 mr-2' />
                  {t('flashcard.incorrect', 'Incorrect')}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCorrect}
                  className='border-green-600 text-green-600 hover:bg-green-600 hover:text-green-50'
                >
                  <Check className='w-4 h-4 mr-2' />
                  {t('flashcard.correct', 'Correct')}
                </Button>
              </div>
              <Button variant='ghost' size='sm' onClick={handleFlip} className='mt-2'>
                {t('flashcard.clickToFlipBack', 'Click to flip back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('flashcard.deleteTitle', 'Delete flashcard')}
        description={t(
          'flashcard.deleteConfirm',
          'Are you sure you want to delete this flashcard? This action cannot be undone.'
        )}
        confirmText={t('flashcard.delete', 'Delete')}
        variant='destructive'
      />
    </div>
  );
};
