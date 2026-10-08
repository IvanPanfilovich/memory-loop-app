import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shadcn/components/ui/tabs';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';
import { Textarea } from '@/shadcn/components/ui/textarea';
import {
  Sparkles,
  Search,
  X,
  Plus,
  Link as LinkIcon,
  FileText,
  CheckSquare,
  Trash2,
  Type,
} from 'lucide-react';
import { Progress } from '@/shadcn/components/ui/progress';
import { useRecapService, type Recap, type Topic } from '@/services/recapService';
import { addBackgroundRequest, removeBackgroundRequest } from '@/services/backgroundRequestTracker';
import { useNavigate, useSearchParams } from 'react-router';
import { RecapCard } from '@/components/RecapCard';
import { BulkDeleteRecapDialog } from '@/components/RecapCardDialogs';
import { showToast } from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { CreateRecapWidget } from '@/widgets/create-recap';
import AnimatedLines from '@/components/AnimatedLines';
import { DocumentUpload } from '@/components/DocumentUpload';
import { useNoCreditsDialog } from '@/contexts/NoCreditsDialogContext';
import { createDocxFileFromText, extractRawTextFromDocxFile } from '@/utils/documentConversion';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [recaps, setRecaps] = useState<TransformedRecap[]>([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const recapService = useRecapService();
  const navigate = useNavigate();
  const hasCheckedAuthRef = useRef(false);
  const [link, setLink] = useState('');
  const [documentFiles, setDocumentFiles] = useState<{ file: File; id: string }[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRecapIds, setSelectedRecapIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const { openNoCreditsDialog } = useNoCreditsDialog();

  // Pagination state
  const [isLoadingRecaps, setIsLoadingRecaps] = useState(false);
  const [hasMoreRecaps, setHasMoreRecaps] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const limit = 20;
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Track when auth loading completes or when we have user data
  useEffect(() => {
    if (!authLoading || (isAuthenticated && user)) {
      hasCheckedAuthRef.current = true;
    }
  }, [authLoading, isAuthenticated, user]);

  // Redirect to auth page if not authenticated (must be in useEffect, not render)
  useEffect(() => {
    if (!authLoading && hasCheckedAuthRef.current && (!isAuthenticated || !user)) {
      navigate('/auth', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Fetch recaps when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      fetchRecaps(0, true);
    }
  }, [isAuthenticated, user, authLoading]);

  // Type for transformed recap that RecapCard expects
  type TransformedRecap = {
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
  };

  // Transform API recap to match RecapCard expected format
  const transformRecap = (apiRecap: Recap): TransformedRecap => {
    return {
      id: apiRecap.id,
      title: apiRecap.title || '',
      episodeTitle: apiRecap.episode_title || '',
      platform: apiRecap.platform || 'YouTube',
      episodeUrl: apiRecap.episode_url || '',
      createdAt: apiRecap.created_at || '',
      lastReviewedAt: apiRecap.last_reviewed_at,
      recapDurationMinutes: apiRecap.recap_duration_minutes || 0,
      episodeDurationMinutes: apiRecap.episode_duration_minutes || 0,
      flashcardCount: apiRecap.flashcard_count || 0,
      isPinned: apiRecap.is_pinned || false,
      themes: (apiRecap.themes || []).map(t => (typeof t === 'string' ? t : String(t))),
      status:
        (apiRecap.status as 'not_started' | 'in_progress' | 'reviewed_today') || 'not_started',
    };
  };

  // Fetch recaps function
  const fetchRecaps = async (currentOffset: number, reset: boolean = false) => {
    if (isLoadingRecaps) return;

    setIsLoadingRecaps(true);
    try {
      const apiRecaps = await recapService.getRecaps(limit, currentOffset);
      const transformedRecaps = apiRecaps.map(transformRecap);

      if (reset) {
        setRecaps(transformedRecaps);
        setHasInitiallyLoaded(true); // Mark initial load as complete
      } else {
        setRecaps(prev => [...prev, ...transformedRecaps]);
      }

      // If we got fewer recaps than requested, we've reached the end
      setHasMoreRecaps(apiRecaps.length === limit);
      setOffset(currentOffset + apiRecaps.length);
    } catch (err) {
      console.error('Error fetching recaps:', err);
      setError(
        err instanceof Error ? err.message : t('dashboard.loadError', 'Failed to load recaps')
      );
      if (reset) {
        setHasInitiallyLoaded(true); // Mark as loaded even on error to show error state
      }
    } finally {
      setIsLoadingRecaps(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRecaps && !isLoadingRecaps && isAuthenticated) {
          fetchRecaps(offset, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreRecaps, isLoadingRecaps, offset, isAuthenticated]);

  // Filter recaps by search query
  const filteredRecaps = useMemo(() => {
    if (!searchQuery.trim()) return recaps;

    const query = searchQuery.toLowerCase();
    return recaps.filter(
      recap =>
        (recap.title || '').toLowerCase().includes(query) ||
        (recap.episodeTitle || '').toLowerCase().includes(query) ||
        (recap.themes || []).some(theme =>
          typeof theme === 'string' ? theme.toLowerCase().includes(query) : false
        )
    );
  }, [recaps, searchQuery]);

  // Show progress animation from 0% to 100% over 30 seconds
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      return;
    }

    // Animate from 0% to 100% over 30 seconds
    const duration = 30000; // 30 seconds in milliseconds
    const startTime = Date.now();
    const startProgress = 0;
    const endProgress = 100;
    const updateInterval = 50; // Update every 50ms for smooth animation

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1); // Clamp between 0 and 1

      // Linear interpolation from startProgress to endProgress
      const currentProgress = startProgress + (endProgress - startProgress) * progressRatio;
      setProgress(currentProgress);

      // Stop interval when we reach 100%
      if (progressRatio >= 1) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, updateInterval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isGenerating]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const waitForSummaryReady = async (recapId: string): Promise<void> => {
    const maxAttempts = 60;
    const pollIntervalMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const summary = await recapService.getSummary(recapId);
        if (summary?.content?.trim()) {
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const isRetryable =
          message.includes('404') ||
          message.includes('summary_not_found') ||
          message.includes('ai_summary_not_found') ||
          message.toLowerCase().includes('not found');
        if (!isRetryable) {
          throw err;
        }
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error('Summary generation timed out. Please try again.');
  };

  const generateWithAllTopics = async (recapId: string, topics: Topic[]): Promise<void> => {
    const topicIds = topics.map(topic => topic.id);
    if (topicIds.length === 0) {
      throw new Error('No topics found for this recap');
    }

    await recapService.selectTopics(recapId, { topic_ids: topicIds });
    await recapService.generateRecap(recapId, {
      topic_ids: topicIds,
      flashcard_count: 10,
    });

    const recap = await recapService.getRecap(recapId);
    addBackgroundRequest({
      id: `recap-generation-${recapId}`,
      type: 'recap_generation',
      recapId,
      startedAt: Date.now(),
      title: recap.title || recap.episode_title,
    });

    await recapService.pollRecapStatus(recapId);
    removeBackgroundRequest(`recap-generation-${recapId}`);
    await waitForSummaryReady(recapId);
  };

  const handleGenerateThemes = async () => {
    if (!link.trim()) {
      setError(t('dashboard.createRecap.linkRequired', 'Please enter a YouTube link'));
      return;
    }

    // Check if user has credits
    if (user && (user.credits_balance ?? 0) <= 0) {
      openNoCreditsDialog();
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(0);

    try {
      // Step 1: Create recap
      const recap = await recapService.createRecap({
        url: link.trim(),
        platform: 'YouTube',
      });

      if (!recap || !recap.id) {
        throw new Error('Failed to create recap: No ID returned from server');
      }

      // Step 2: Start processing
      await recapService.startProcessing(recap.id);

      // Register background request for processing
      addBackgroundRequest({
        id: `recap-processing-${recap.id}`,
        type: 'recap_processing',
        recapId: recap.id,
        startedAt: Date.now(),
        title: recap.title || recap.episode_title,
      });

      // Step 3: Poll for processing status
      const completedRecap = await recapService.pollRecapStatus(recap.id, updatedRecap => {
        // Update progress based on processing status
        const statusProgress: Record<string, number> = {
          pending: 10,
          transcribing: 30,
          extracting_topics: 60,
          generating: 80,
          completed: 100,
        };
        setProgress(statusProgress[updatedRecap.processing_status] || 0);
      });

      // Remove background request since we completed locally
      removeBackgroundRequest(`recap-processing-${recap.id}`);

      // Step 4: Get topics
      const topics = await recapService.getTopics(completedRecap.id);

      // Store topics and route to themes picker (do not auto-select/generate)
      try {
        sessionStorage.setItem(
          `dashboard-themes-${completedRecap.id}`,
          JSON.stringify({
            recapId: completedRecap.id,
            link: link.trim(),
            segments: [],
            topics,
          })
        );
      } catch {
        // Ignore storage errors
      }

      setLink('');
      setIsGenerating(false);
      setProgress(0);
      navigate(`/dashboard/themes?id=${encodeURIComponent(completedRecap.id)}`);
    } catch (err) {
      // Check if it's a 402 Payment Required error (insufficient credits)
      if (
        err instanceof Error &&
        (err.message.includes('402') || err.message.includes('Insufficient credits'))
      ) {
        openNoCreditsDialog();
      } else {
        const message =
          err instanceof Error ? err.message : t('common.unexpectedError', 'Something went wrong');
        setError(message);
      }
      setIsGenerating(false);
      setProgress(0);
      console.error('Error creating recap:', err);
    }
  };

  const handleGenerateFromDocuments = async () => {
    if (documentFiles.length === 0) {
      setError(t('dashboard.createRecap.documentsRequired', 'Please upload at least one document'));
      return;
    }

    // Check if user has credits
    if (user && (user.credits_balance ?? 0) <= 0) {
      openNoCreditsDialog();
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(0);

    try {
      const file = documentFiles[0].file;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      let userProvidedContent: string | null = null;
      if (fileExtension === 'docx') {
        try {
          userProvidedContent = await extractRawTextFromDocxFile(file);
        } catch (extractError) {
          console.warn('Failed to extract raw text from docx:', extractError);
        }
      }

      const uploadResponse = await recapService.uploadDocument(file);
      const createdRecap = uploadResponse.recap || uploadResponse;
      const topics = uploadResponse.topics || [];

      if (!createdRecap || !createdRecap.id) {
        throw new Error(`Failed to upload document "${file.name}": No ID returned from server`);
      }

      const trimmedUserProvidedContent = userProvidedContent?.trim();

      // Store topics and route to themes picker (do not auto-select/generate)
      try {
        sessionStorage.setItem(
          `dashboard-themes-${createdRecap.id}`,
          JSON.stringify({
            recapId: createdRecap.id,
            documents: [{ name: file.name, text: '' }],
            segments: [],
            topics,
            summaryOverride:
              trimmedUserProvidedContent &&
              trimmedUserProvidedContent.length >= 10 &&
              trimmedUserProvidedContent.length <= 50000
                ? trimmedUserProvidedContent
                : undefined,
          })
        );
      } catch {
        // Ignore storage errors
      }

      setDocumentFiles([]);
      setIsGenerating(false);
      setProgress(0);
      navigate(`/dashboard/themes?id=${encodeURIComponent(createdRecap.id)}`);
    } catch (err) {
      // Check if it's a 402 Payment Required error (insufficient credits)
      if (
        err instanceof Error &&
        (err.message.includes('402') || err.message.includes('Insufficient credits'))
      ) {
        openNoCreditsDialog();
      } else {
        const message =
          err instanceof Error ? err.message : t('common.unexpectedError', 'Something went wrong');
        setError(message);
      }
      setIsGenerating(false);
      setProgress(0);
      console.error('Error uploading document:', err);
    }
  };

  const handleGenerateFromText = async () => {
    const trimmed = pastedText.trim();
    if (trimmed.length < 10) {
      setError(t('dashboard.createRecap.textTooShort', 'Please paste at least 10 characters'));
      return;
    }
    if (trimmed.length > 50000) {
      setError(t('dashboard.createRecap.textTooLong', 'Text is too long (max 50,000 characters)'));
      return;
    }

    // Check if user has credits
    if (user && (user.credits_balance ?? 0) <= 0) {
      openNoCreditsDialog();
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(0);

    try {
      const file = await createDocxFileFromText(trimmed, 'conspectus.docx');
      let userProvidedContent: string | null = null;
      try {
        userProvidedContent = await extractRawTextFromDocxFile(file);
      } catch (extractError) {
        console.warn('Failed to extract raw text from generated docx:', extractError);
      }
      const uploadResponse = await recapService.uploadDocument(file);

      const createdRecap = uploadResponse.recap || uploadResponse;
      const topics = uploadResponse.topics || [];

      if (!createdRecap || !createdRecap.id) {
        throw new Error('Failed to create recap from text: No ID returned from server');
      }

      await generateWithAllTopics(createdRecap.id, topics);
      const extractedTrimmed = userProvidedContent?.trim();
      const contentToSave =
        extractedTrimmed && extractedTrimmed.length >= 10 && extractedTrimmed.length <= 50000
          ? extractedTrimmed
          : trimmed;
      await recapService.updateSummary(createdRecap.id, contentToSave);

      setPastedText('');
      setIsGenerating(false);
      setProgress(0);
      navigate(`/dashboard/${encodeURIComponent(createdRecap.id)}`);
    } catch (err) {
      // Check if it's a 402 Payment Required error (insufficient credits)
      if (
        err instanceof Error &&
        (err.message.includes('402') || err.message.includes('Insufficient credits'))
      ) {
        openNoCreditsDialog();
      } else {
        const message =
          err instanceof Error ? err.message : t('common.unexpectedError', 'Something went wrong');
        setError(message);
      }
      setIsGenerating(false);
      setProgress(0);
      console.error('Error creating recap from text:', err);
    }
  };

  // Organize recaps by time periods
  const organizeRecaps = (recapsList: TransformedRecap[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const pinned = recapsList.filter(r => r.isPinned);
    const todayRecaps = recapsList.filter(r => {
      const created = new Date(r.createdAt);
      return !r.isPinned && created >= today;
    });
    const thisWeek = recapsList.filter(r => {
      const created = new Date(r.createdAt);
      return !r.isPinned && created >= weekAgo && created < today;
    });
    const thisMonth = recapsList.filter(r => {
      const created = new Date(r.createdAt);
      return !r.isPinned && created >= monthAgo && created < weekAgo;
    });
    const earlier = recapsList.filter(r => {
      const created = new Date(r.createdAt);
      return !r.isPinned && created < monthAgo;
    });

    return { pinned, today: todayRecaps, thisWeek, thisMonth, earlier };
  };

  const { pinned, today, thisWeek, thisMonth, earlier } = organizeRecaps(filteredRecaps);

  // Selection handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedRecapIds(new Set());
  };

  const handleToggleSelectRecap = (recapId: string) => {
    setSelectedRecapIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recapId)) {
        newSet.delete(recapId);
      } else {
        newSet.add(recapId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    const recapIdsArray = Array.from(selectedRecapIds);
    if (recapIdsArray.length === 0) return;

    try {
      // Delete all selected recaps
      await Promise.all(recapIdsArray.map(id => recapService.deleteRecap(id)));

      // Remove deleted recaps from state
      setRecaps(prev => prev.filter(r => !selectedRecapIds.has(r.id)));

      // Reset selection
      setSelectedRecapIds(new Set());
      setIsSelectionMode(false);

      showToast(
        t('recap.bulkDelete.success', `Successfully deleted ${recapIdsArray.length} recap(s)`),
        'success'
      );
    } catch (error) {
      console.error('Error deleting recaps:', error);
      showToast(
        error instanceof Error
          ? error.message
          : t('recap.bulkDelete.error', 'Failed to delete recaps'),
        'error'
      );
    }
  };

  const selectedRecaps = useMemo(() => {
    return recaps.filter(r => selectedRecapIds.has(r.id));
  }, [recaps, selectedRecapIds]);

  const renderSection = (title: string, recapsList: TransformedRecap[], showViewAll = false) => {
    if (recapsList.length === 0) return null;

    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
          {showViewAll && recapsList.length > 4 && (
            <Button variant='ghost' size='sm'>
              {t('dashboard.sections.viewAll', 'View all')}
            </Button>
          )}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5'>
          {recapsList.map(recap => (
            <RecapCard
              key={recap.id}
              recap={recap}
              isSelectionMode={isSelectionMode}
              isSelected={selectedRecapIds.has(recap.id)}
              onSelect={() => handleToggleSelectRecap(recap.id)}
              onUpdate={updatedRecap => {
                // Update the recap in the local state
                setRecaps(prev => prev.map(r => (r.id === updatedRecap.id ? updatedRecap : r)));
              }}
              onDelete={recapId => {
                // Remove the deleted recap from the local state
                setRecaps(prev => prev.filter(r => r.id !== recapId));
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderEmptySection = (_title: string) => {
    // Don't show empty sections at all
    return null;
  };

  // Show loading state only if we're loading AND we don't have user data yet
  // If we have user data, show the dashboard immediately (don't wait for auth check to complete)
  if (authLoading && !user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  // Show redirecting message if not authenticated (redirect is handled in useEffect)
  if (!isAuthenticated || !user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground'>
          {t('common.redirecting', 'Redirecting to sign in...')}
        </p>
      </div>
    );
  }

  // Show loading state while initially fetching recaps
  if (!hasInitiallyLoaded && isLoadingRecaps) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // Show zero state if no recaps (only after initial load is complete)
  if (hasInitiallyLoaded && recaps.length === 0) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center px-4 py-8 relative overflow-hidden'>
        <AnimatedLines />
        <div className='w-full max-w-2xl relative z-10'>
          <Card className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm border-2'>
            <CardHeader className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pb-4'>
              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0'>
                  <Sparkles className='w-6 h-6 text-primary' aria-hidden='true' />
                </div>
                <CardTitle className='text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left'>
                  {t(
                    'dashboard.zeroState.title',
                    'Turn any content into a recap that you will actually remember'
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='px-6 space-y-8'>
              <div className='space-y-4'>
                {isGenerating ? (
                  <div className='space-y-3 py-6'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-muted-foreground'>
                          {t('dashboard.createRecap.generating', 'Creating recap...')}
                        </span>
                        <span className='text-muted-foreground font-medium'>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className='h-2' />
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue='youtube' className='w-full'>
                    <TabsList className='grid w-full grid-cols-2 gap-[3px] h-auto sm:h-9 sm:grid-cols-3 sm:gap-0'>
                      <TabsTrigger
                        value='youtube'
                        className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)]'
                      >
                        <LinkIcon className='w-4 h-4' />
                        <span>{t('dashboard.createRecap.youtubeTab', 'YouTube Link')}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value='documents'
                        className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)]'
                      >
                        <FileText className='w-4 h-4' />
                        <span>{t('dashboard.createRecap.documentsTab', 'Documents')}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value='text'
                        className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)] col-span-2 sm:col-span-1'
                      >
                        <Type className='w-4 h-4' />
                        <span>{t('dashboard.createRecap.textTab', 'Text')}</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value='youtube' className='space-y-4 mt-4'>
                      <div className='space-y-2'>
                        <div className='flex flex-col md:flex-row gap-2 px-2'>
                          <Input
                            type='url'
                            placeholder={t(
                              'dashboard.zeroState.inputPlaceholder',
                              'Paste a YouTube link…'
                            )}
                            value={link}
                            onChange={e => {
                              setLink(e.target.value);
                              setError(null);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && link.trim() && !isGenerating) {
                                handleGenerateThemes();
                              }
                            }}
                            className='flex-1 text-base'
                            disabled={isGenerating}
                            autoFocus
                          />
                          <Button
                            onClick={handleGenerateThemes}
                            disabled={!link.trim() || isGenerating}
                            size='lg'
                            className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 w-full md:w-auto md:shrink-0'
                          >
                            <div className='flex items-center gap-2'>
                              <Plus className='w-5 h-5' aria-hidden='true' />
                              <span>{t('dashboard.createRecap.button', 'Create new recap')}</span>
                            </div>
                          </Button>
                        </div>
                        {error && <p className='text-sm text-destructive'>{error}</p>}
                      </div>
                      <p className='text-sm text-muted-foreground text-center'>
                        {t(
                          'dashboard.zeroState.instructions',
                          'Paste a YouTube link to create your first recap.'
                        )}
                      </p>
                    </TabsContent>
                    <TabsContent value='documents' className='space-y-4 mt-4'>
                      <DocumentUpload
                        files={documentFiles}
                        onFilesChange={setDocumentFiles}
                        disabled={isGenerating}
                        maxFiles={1}
                      />
                      <div className='flex justify-end'>
                        <Button
                          onClick={handleGenerateFromDocuments}
                          disabled={documentFiles.length === 0 || isGenerating}
                          size='lg'
                          className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 w-full sm:w-auto'
                        >
                          <div className='flex items-center gap-2'>
                            <Plus className='w-5 h-5' aria-hidden='true' />
                            <span>{t('dashboard.createRecap.button', 'Create new recap')}</span>
                          </div>
                        </Button>
                      </div>
                      {error && <p className='text-sm text-destructive'>{error}</p>}
                      <p className='text-sm text-muted-foreground text-center'>
                        {t(
                          'dashboard.zeroState.documentsInstructions',
                          'Upload PDF or Word documents to create your first recap.'
                        )}
                      </p>
                    </TabsContent>
                    <TabsContent value='text' className='space-y-4 mt-4'>
                      <div className='space-y-2 px-2'>
                        <Textarea
                          value={pastedText}
                          onChange={e => {
                            setPastedText(e.target.value);
                            setError(null);
                          }}
                          rows={10}
                          className='resize-none'
                          disabled={isGenerating}
                          placeholder={t(
                            'dashboard.createRecap.textPlaceholder',
                            'Paste your notes (Markdown supported)...'
                          )}
                        />
                        <div className='flex items-center justify-between text-xs text-muted-foreground'>
                          <span>
                            {t(
                              'dashboard.createRecap.textHint',
                              '10-50,000 characters. Markdown supported.'
                            )}
                          </span>
                          <span
                            className={
                              pastedText.trim().length > 50000 ? 'text-destructive' : undefined
                            }
                          >
                            {pastedText.trim().length.toLocaleString()} / 50,000
                          </span>
                        </div>
                        <Input
                          type='file'
                          accept='.txt,.md,text/plain,text/markdown'
                          disabled={isGenerating}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void file.text().then(text => {
                              setPastedText(text);
                              setError(null);
                            });
                            e.target.value = '';
                          }}
                        />
                        <div className='flex justify-end pt-2'>
                          <Button
                            onClick={handleGenerateFromText}
                            disabled={
                              isGenerating ||
                              pastedText.trim().length < 10 ||
                              pastedText.trim().length > 50000
                            }
                            size='lg'
                            className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 w-full sm:w-auto'
                          >
                            <div className='flex items-center gap-2'>
                              <Plus className='w-5 h-5' aria-hidden='true' />
                              <span>{t('dashboard.createRecap.button', 'Create new recap')}</span>
                            </div>
                          </Button>
                        </div>
                        {error && <p className='text-sm text-destructive'>{error}</p>}
                      </div>
                      <p className='text-sm text-muted-foreground text-center'>
                        {t(
                          'dashboard.zeroState.textInstructions',
                          'Paste your own notes to generate flashcards. Your recap text will be saved exactly as provided.'
                        )}
                      </p>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8 space-y-8 max-w-7xl'>
        {/* Top Bar: Create Button and Search */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-4'>
          <div className='w-full sm:w-[240px] sm:max-w-[240px]'>
            <CreateRecapWidget />
          </div>
          <div className='flex items-center gap-2 w-full sm:w-[240px] sm:max-w-[240px]'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder={t('dashboard.search.placeholder', 'Search')}
                className='pl-9 pr-9 h-10 w-full max-w-full [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden'
                value={searchQuery}
                onChange={e => {
                  const query = e.target.value;
                  const params = new URLSearchParams(window.location.search);
                  if (query) {
                    params.set('q', query);
                  } else {
                    params.delete('q');
                  }
                  navigate(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`, {
                    replace: true,
                  });
                }}
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('q');
                    navigate(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`, {
                      replace: true,
                    });
                  }}
                  className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors'
                  aria-label={t('dashboard.search.clear', 'Clear search')}
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>
            <div className='flex-shrink-0 sm:hidden'>
              <Button
                variant={isSelectionMode ? 'default' : 'outline'}
                onClick={handleToggleSelectionMode}
                className='h-10 w-10 p-0'
                aria-label={
                  isSelectionMode
                    ? t('dashboard.cancelSelection', 'Cancel')
                    : t('dashboard.select', 'Select')
                }
              >
                <CheckSquare className='w-4 h-4' />
              </Button>
            </div>
          </div>
          <div className='hidden sm:flex flex-shrink-0'>
            <Button
              variant={isSelectionMode ? 'default' : 'outline'}
              onClick={handleToggleSelectionMode}
              className='h-10'
            >
              <CheckSquare className='w-4 h-4 mr-2' />
              {isSelectionMode
                ? t('dashboard.cancelSelection', 'Cancel')
                : t('dashboard.select', 'Select')}
            </Button>
          </div>
          {isSelectionMode && selectedRecapIds.size > 0 && (
            <div className='w-full sm:w-auto flex-shrink-0'>
              <Button
                variant='destructive'
                onClick={() => setIsBulkDeleteDialogOpen(true)}
                className='h-10 w-full sm:w-auto'
              >
                <Trash2 className='w-4 h-4 mr-2' />
                {t('dashboard.deleteSelected', { count: selectedRecapIds.size })}
              </Button>
            </div>
          )}
        </div>

        {/* Bulk Delete Dialog */}
        <BulkDeleteRecapDialog
          isOpen={isBulkDeleteDialogOpen}
          onOpenChange={setIsBulkDeleteDialogOpen}
          recapTitles={selectedRecaps.map(r => r.title)}
          onDelete={handleBulkDelete}
        />

        {/* Sections */}
        <div className='space-y-8'>
          {pinned.length > 0 && renderSection(t('dashboard.sections.pinned', 'Pinned'), pinned)}
          {today.length > 0
            ? renderSection(t('dashboard.sections.today', 'Today'), today)
            : renderEmptySection(t('dashboard.sections.today', 'Today'))}
          {thisWeek.length > 0
            ? renderSection(t('dashboard.sections.thisWeek', 'This week'), thisWeek)
            : renderEmptySection(t('dashboard.sections.thisWeek', 'This week'))}
          {thisMonth.length > 0
            ? renderSection(t('dashboard.sections.thisMonth', 'This month'), thisMonth)
            : renderEmptySection(t('dashboard.sections.thisMonth', 'This month'))}
          {earlier.length > 0 && renderSection(t('dashboard.sections.earlier', 'Earlier'), earlier)}

          {/* Infinite scroll observer target */}
          <div ref={observerTarget} className='h-4' />

          {/* Loading indicator */}
          {isLoadingRecaps && (
            <div className='flex justify-center py-8'>
              <p className='text-sm text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating action button for mobile */}
      <div className='fixed bottom-6 right-6 md:hidden z-50'>
        <CreateRecapWidget variant='floating' />
      </div>
    </div>
  );
};
