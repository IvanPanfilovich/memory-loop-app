import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shadcn/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Progress } from '@/shadcn/components/ui/progress';
import { CheckCircle2, XCircle, Brain, TrendingUp } from 'lucide-react';
import type { Flashcard } from '@/services/recapService';

interface FlashcardStatsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  flashcards: Flashcard[];
}

export const FlashcardStatsDialog = ({
  isOpen,
  onOpenChange,
  flashcards,
}: FlashcardStatsDialogProps) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const total = flashcards.length;
    const totalCorrect = flashcards.reduce((sum, fc) => sum + fc.times_correct, 0);
    const totalIncorrect = flashcards.reduce((sum, fc) => sum + fc.times_incorrect, 0);
    const totalAnswers = totalCorrect + totalIncorrect;
    const successRate = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;
    const averageQuality =
      flashcards.length > 0
        ? flashcards.reduce((sum, fc) => sum + fc.ease_factor, 0) / flashcards.length
        : 0;

    return {
      total,
      totalCorrect,
      totalIncorrect,
      totalAnswers,
      successRate,
      averageQuality,
    };
  }, [flashcards]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto scrollbar'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-2xl'>
            <Brain className='w-6 h-6 text-primary' />
            {t('flashcard.stats.title', 'Flashcard Statistics')}
          </DialogTitle>
          <DialogDescription>
            {t('flashcard.stats.description', 'Track your progress and performance')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 mt-4'>
          {/* Overview Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {t('flashcard.stats.totalCards', 'Total Cards')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-foreground'>{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {t('flashcard.stats.totalAnswers', 'Total Answers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-foreground'>{stats.totalAnswers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {t('flashcard.stats.successRate', 'Success Rate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-primary'>
                  {stats.totalAnswers > 0 ? `${stats.successRate.toFixed(1)}%` : '—'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Correct vs Incorrect */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-primary' />
                {t('flashcard.stats.performance', 'Performance Breakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='w-4 h-4 text-green-600' />
                    <span className='font-medium'>{t('flashcard.stats.correct', 'Correct')}</span>
                  </div>
                  <span className='text-muted-foreground'>
                    {stats.totalCorrect}{' '}
                    {stats.totalAnswers > 0 &&
                      `(${((stats.totalCorrect / stats.totalAnswers) * 100).toFixed(1)}%)`}
                  </span>
                </div>
                <Progress
                  value={
                    stats.totalAnswers > 0 ? (stats.totalCorrect / stats.totalAnswers) * 100 : 0
                  }
                  className='h-3'
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    <XCircle className='w-4 h-4 text-destructive' />
                    <span className='font-medium'>
                      {t('flashcard.stats.incorrect', 'Incorrect')}
                    </span>
                  </div>
                  <span className='text-muted-foreground'>
                    {stats.totalIncorrect}{' '}
                    {stats.totalAnswers > 0 &&
                      `(${((stats.totalIncorrect / stats.totalAnswers) * 100).toFixed(1)}%)`}
                  </span>
                </div>
                <Progress
                  value={
                    stats.totalAnswers > 0 ? (stats.totalIncorrect / stats.totalAnswers) * 100 : 0
                  }
                  className='h-3'
                />
              </div>
            </CardContent>
          </Card>

          {/* Average Quality */}
          <Card>
            <CardHeader>
              <CardTitle>{t('flashcard.stats.averageQuality', 'Average Ease Factor')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    {t(
                      'flashcard.stats.qualityDescription',
                      'Higher values indicate easier recall'
                    )}
                  </span>
                  <span className='text-2xl font-bold text-primary'>
                    {stats.averageQuality.toFixed(2)}
                  </span>
                </div>
                <Progress value={(stats.averageQuality / 5) * 100} className='h-3' />
              </div>
            </CardContent>
          </Card>

          {/* Individual Card Stats */}
          {flashcards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('flashcard.stats.individualCards', 'Individual Card Performance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 max-h-64 overflow-y-auto scrollbar'>
                  {flashcards.map(flashcard => {
                    const cardTotal = flashcard.times_correct + flashcard.times_incorrect;
                    const cardSuccessRate =
                      cardTotal > 0 ? (flashcard.times_correct / cardTotal) * 100 : 0;

                    return (
                      <div
                        key={flashcard.id}
                        className='p-3 rounded-lg border bg-card/50 space-y-2'
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <p className='text-sm font-medium text-foreground line-clamp-2 flex-1'>
                            {flashcard.question}
                          </p>
                          <div className='text-xs text-muted-foreground shrink-0'>
                            {cardTotal > 0 ? `${cardSuccessRate.toFixed(0)}%` : '—'}
                          </div>
                        </div>
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <CheckCircle2 className='w-3 h-3 text-green-600' />
                            {flashcard.times_correct}
                          </span>
                          <span className='flex items-center gap-1'>
                            <XCircle className='w-3 h-3 text-destructive' />
                            {flashcard.times_incorrect}
                          </span>
                          <span className='ml-auto'>
                            {t('flashcard.stats.quality', 'Quality')}:{' '}
                            {flashcard.ease_factor.toFixed(1)}
                          </span>
                        </div>
                        {cardTotal > 0 && <Progress value={cardSuccessRate} className='h-1.5' />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
