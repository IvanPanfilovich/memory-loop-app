import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/shared/ui';
import { Card, CardContent, CardHeader } from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { Play, Brain, MoreVertical, Pin, PinOff, Edit2, Trash2, FileText } from 'lucide-react';
// Recap type that matches the transformed format from DashboardPage
export interface Recap {
  id: string;
  title: string;
  episodeTitle: string;
  platform: 'YouTube' | 'Document' | string;
  episodeUrl: string;
  createdAt: string;
  lastReviewedAt: string | null;
  recapDurationMinutes: number;
  episodeDurationMinutes: number;
  flashcardCount: number;
  themes: string[];
  status: 'not_started' | 'in_progress' | 'reviewed_today';
  isPinned: boolean;
}
import { useNavigate } from 'react-router';
import { RenameRecapDialog, DeleteRecapDialog } from './RecapCardDialogs';
import { useRecapService } from '@/services/recapService';
import { useBackgroundRequests } from '@/hooks/useBackgroundRequests';
import { Loader2 } from 'lucide-react';

interface RecapCardProps {
  recap: Recap;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updatedRecap: Recap) => void;
  onDelete?: (recapId: string) => void;
}

export const RecapCard = ({
  recap,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete,
}: RecapCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const recapService = useRecapService();
  const { isProcessing, isGenerating, isGeneratingAudio } = useBackgroundRequests(recap.id);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine overall status
  const isInProgress = isProcessing || isGenerating || isGeneratingAudio;
  const statusText = isProcessing
    ? t('recap.status.processing', 'Processing...')
    : isGenerating
      ? t('recap.status.generating', 'Generating...')
      : isGeneratingAudio
        ? t('recap.status.generatingAudio', 'Generating audio...')
        : null;

  const handleCardClick = async () => {
    if (isSelectionMode && onSelect) {
      onSelect();
      return;
    }

    // Fetch recap data using GET /api/recaps/{id} before navigation
    setIsLoading(true);
    try {
      const apiRecap = await recapService.getRecap(recap.id);
      // Transform API recap to match RecapCard expected format
      const transformedRecap = transformApiRecap(apiRecap);
      // Update the recap in the parent component if onUpdate is provided
      if (onUpdate) {
        onUpdate(transformedRecap);
      }
      // Navigate to material page
      navigate(`/dashboard/${recap.id}`);
    } catch (error) {
      console.error('Failed to fetch recap:', error);
      // Still navigate even if fetch fails (DashboardMaterialPage will handle the error)
      navigate(`/dashboard/${recap.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRecap = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectionMode && onSelect) {
      onSelect();
      return;
    }

    // Fetch recap data using GET /api/recaps/{id} before navigation
    setIsLoading(true);
    try {
      const apiRecap = await recapService.getRecap(recap.id);
      const transformedRecap = transformApiRecap(apiRecap);
      if (onUpdate) {
        onUpdate(transformedRecap);
      }
      navigate(`/dashboard/${recap.id}`);
    } catch (error) {
      console.error('Failed to fetch recap:', error);
      navigate(`/dashboard/${recap.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const transformApiRecap = (apiRecap: {
    id: string;
    title: string;
    episode_title: string;
    platform: string;
    episode_url: string;
    created_at: string;
    last_reviewed_at: string | null;
    recap_duration_minutes: number;
    episode_duration_minutes: number;
    flashcard_count: number;
    themes: unknown[];
    is_pinned: boolean;
    status?: string;
  }): Recap => {
    return {
      id: apiRecap.id,
      title: apiRecap.title || '',
      episodeTitle: apiRecap.episode_title || '',
      platform: (apiRecap.platform as 'YouTube') || 'YouTube',
      episodeUrl: apiRecap.episode_url || '',
      createdAt: apiRecap.created_at || '',
      lastReviewedAt: apiRecap.last_reviewed_at,
      recapDurationMinutes: apiRecap.recap_duration_minutes || 0,
      episodeDurationMinutes: apiRecap.episode_duration_minutes || 0,
      flashcardCount: apiRecap.flashcard_count || 0,
      isPinned: apiRecap.is_pinned || false,
      themes: (apiRecap.themes || []).map((t: unknown) => (typeof t === 'string' ? t : String(t))),
      status:
        (apiRecap.status as 'not_started' | 'in_progress' | 'reviewed_today') || 'not_started',
    };
  };

  const handleRename = async (newTitle: string) => {
    if (!newTitle.trim() || newTitle === recap.title) {
      setIsRenameDialogOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedRecap = await recapService.updateRecap(recap.id, {
        title: newTitle.trim(),
        pinned: recap.isPinned, // Always send current pinned status
      });

      const transformedRecap = transformApiRecap(updatedRecap);

      if (onUpdate) {
        onUpdate(transformedRecap);
      }

      setIsRenameDialogOpen(false);
    } catch (error) {
      console.error('Error renaming recap:', error);
      showToast(
        error instanceof Error ? error.message : t('recap.renameError', 'Failed to rename recap'),
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      await recapService.deleteRecap(recap.id);

      if (onDelete) {
        onDelete(recap.id);
      }

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting recap:', error);
      showToast(
        error instanceof Error ? error.message : t('recap.deleteError', 'Failed to delete recap'),
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsUpdating(true);
    try {
      const updatedRecap = await recapService.updateRecap(recap.id, {
        title: recap.title, // Always send current title
        pinned: !recap.isPinned,
      });

      const transformedRecap = transformApiRecap(updatedRecap);

      if (onUpdate) {
        onUpdate(transformedRecap);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      showToast(
        error instanceof Error ? error.message : t('recap.pinError', 'Failed to update pin status'),
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={`border-2 transition-colors cursor-pointer ${
        isSelectionMode
          ? isSelected
            ? 'border-primary bg-primary/10 hover:bg-primary/20'
            : 'hover:border-primary/50'
          : 'hover:border-primary/50'
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className='pb-3 overflow-hidden relative'>
        <div className='flex items-start justify-between gap-2 min-w-0'>
          <div className='flex-1 min-w-0 overflow-hidden'>
            <div className='flex items-center gap-2 mb-1 flex-wrap'>
              <h3 className='font-semibold text-base text-foreground line-clamp-2 break-words'>
                {recap.title}
              </h3>
              {isInProgress && (
                <div className='flex items-center gap-1.5 text-xs text-primary flex-shrink-0'>
                  <Loader2 className='w-3 h-3 animate-spin' />
                  <span className='text-primary font-medium'>{statusText}</span>
                </div>
              )}
            </div>
          </div>
          {!isSelectionMode && (
            <div className='flex items-center gap-2 flex-shrink-0'>
              {recap.isPinned && <Pin className='w-4 h-4 text-primary' />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='px-2'
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreVertical className='w-4 h-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' onClick={e => e.stopPropagation()}>
                  <DropdownMenuItem onClick={handleTogglePin} disabled={isUpdating}>
                    {recap.isPinned ? (
                      <>
                        <PinOff className='w-4 h-4 mr-2' />
                        {isUpdating ? t('common.loading', 'Loading...') : t('recap.unpin', 'Unpin')}
                      </>
                    ) : (
                      <>
                        <Pin className='w-4 h-4 mr-2' />
                        {isUpdating ? t('common.loading', 'Loading...') : t('recap.pin', 'Pin')}
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsRenameDialogOpen(true);
                    }}
                    disabled={isUpdating}
                  >
                    <Edit2 className='w-4 h-4 mr-2' />
                    {t('recap.renameMenu', 'Rename')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={isUpdating}
                    className='text-destructive focus:text-destructive'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    {t('recap.deleteMenu', 'Delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {/* Stats */}
        <div className='flex items-center gap-2 sm:gap-4 flex-wrap'>
          <div className='flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg bg-primary/10 border border-primary/20'>
            <Play className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            <span className='text-sm sm:text-base text-muted-foreground'>
              {t('recap.recap', 'recap')}
            </span>
            <span className='text-base sm:text-lg font-semibold text-foreground'>
              {recap.recapDurationMinutes} {t('recap.min', 'min')}
            </span>
          </div>
          <div className='flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg bg-primary/10 border border-primary/20'>
            <Brain className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            <span className='text-sm sm:text-base text-muted-foreground'>
              {t('recap.cards', 'cards')}
            </span>
            <span className='text-base sm:text-lg font-semibold text-foreground'>
              {recap.flashcardCount}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!isSelectionMode && (
          <div className='flex items-center gap-2 pt-2'>
            <Button size='sm' onClick={handleOpenRecap} className='flex-1'>
              <FileText className='w-4 h-4 mr-1.5' />
              {t('recap.openRecap', 'Open recap')}
            </Button>
          </div>
        )}

        {!isSelectionMode && (
          <>
            <RenameRecapDialog
              isOpen={isRenameDialogOpen}
              onOpenChange={open => {
                setIsRenameDialogOpen(open);
                if (!open) {
                  setIsUpdating(false);
                }
              }}
              currentTitle={recap.title}
              onRename={handleRename}
            />

            <DeleteRecapDialog
              isOpen={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              recapTitle={recap.title}
              onDelete={handleDelete}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
