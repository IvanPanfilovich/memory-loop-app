import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shadcn/components/ui/collapsible';
import { useRecapService, type Topic } from '@/services/recapService';
import { addBackgroundRequest, removeBackgroundRequest } from '@/services/backgroundRequestTracker';
import { FileText, ChevronDown, ChevronUp, File } from 'lucide-react';
import { showToast } from '@/shared/ui';

interface StoredThemesPayload {
  recapId?: string;
  link?: string;
  documents?: { name: string; text: string }[];
  segments: { id: string; index: number; text: string }[];
  topics: Topic[];
  transcriptItems?: { text: string; offset: number; duration: number }[];
  summaryOverride?: string;
}

export const DashboardThemesPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<StoredThemesPayload | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  // Always use 10 flashcards - slider removed
  const [countdown, setCountdown] = useState(30);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recapService = useRecapService();

  useEffect(() => {
    const recapId = searchParams.get('id');
    if (!recapId) {
      setIsLoadingTopics(false);
      return;
    }

    // Try to get from sessionStorage first (for backward compatibility)
    const raw = sessionStorage.getItem(`dashboard-themes-${recapId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredThemesPayload;
        setData(parsed);
        if (parsed.topics && Array.isArray(parsed.topics)) {
          setTopics(parsed.topics);
          setSelectedTopicIds(parsed.topics.filter(t => t.is_selected).map(t => t.id));
        }
        setIsLoadingTopics(false);
        return;
      } catch {
        // Fall through to API call
      }
    }

    // Fetch topics from API
    const fetchTopics = async () => {
      try {
        const fetchedTopics = await recapService.getTopics(recapId);
        setTopics(fetchedTopics);
        setSelectedTopicIds(fetchedTopics.filter(t => t.is_selected).map(t => t.id));

        // Store in sessionStorage for consistency
        const payload: StoredThemesPayload = {
          recapId,
          link: '',
          topics: fetchedTopics,
          segments: [],
        };
        try {
          sessionStorage.setItem(`dashboard-themes-${recapId}`, JSON.stringify(payload));
        } catch {
          // Ignore storage errors
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [searchParams]); // recapService is stable and doesn't need to be in dependencies

  // Countdown timer for loading state (30 seconds)
  useEffect(() => {
    if (!isSummarizing) {
      setCountdown(30);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    // Reset countdown to 30 when starting
    setCountdown(30);

    // Start countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isSummarizing]);

  // Progress animation removed - no longer needed

  // Use topics directly from state
  const topicsArray = topics;

  // Format timestamp as MM:SS or HH:MM:SS
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total video duration
  const getTotalDuration = (): number => {
    if (!data) return 0;

    // If we have transcriptItems, calculate accurately
    if (data.transcriptItems && data.transcriptItems.length > 0) {
      return data.transcriptItems.reduce((sum, item) => sum + (item.duration || 0), 0);
    }

    // Fallback: estimate based on segments
    if (data.segments && data.segments.length > 0) {
      return data.segments.length * 60; // Estimate 60 seconds per segment
    }

    return 0;
  };

  const toggleTopic = (topicId: string) => {
    if (isSummarizing) return; // Prevent interaction during summarization
    setSelectedTopicIds(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const allSelected = topicsArray.length > 0 && selectedTopicIds.length === topicsArray.length;

  const handleSelectAll = () => {
    if (isSummarizing || !topicsArray.length) return; // Prevent interaction during summarization
    if (allSelected) {
      setSelectedTopicIds([]);
    } else {
      setSelectedTopicIds(topicsArray.map(topic => topic.id));
    }
  };

  const handleContinue = async () => {
    const recapId = searchParams.get('id') || data?.recapId;
    if (!recapId || !topicsArray.length || !selectedTopicIds.length) return;

    setIsSummarizing(true);
    try {
      // Step 5: Select topics
      const updatedTopics = await recapService.selectTopics(recapId, {
        topic_ids: selectedTopicIds,
      });

      // Update local state with selected topics
      setTopics(updatedTopics);
      const finalSelectedTopicIds = updatedTopics.filter(t => t.is_selected).map(t => t.id);
      setSelectedTopicIds(finalSelectedTopicIds);

      // Step 6: Generate summary and flashcards
      if (finalSelectedTopicIds.length === 0) {
        throw new Error('Please select at least one topic');
      }

      await recapService.generateRecap(recapId, {
        topic_ids: finalSelectedTopicIds,
        flashcard_count: 10, // Always send 10 flashcards
      });

      // Register background request for generation
      const recap = await recapService.getRecap(recapId);
      addBackgroundRequest({
        id: `recap-generation-${recapId}`,
        type: 'recap_generation',
        recapId: recapId,
        startedAt: Date.now(),
        title: recap.title || recap.episode_title,
      });

      // Poll until generation is complete
      await recapService.pollRecapStatus(recapId);

      // Remove background request since we completed locally
      removeBackgroundRequest(`recap-generation-${recapId}`);

      // Wait for summary to be available before navigating (prevents redirect loop)
      const waitForSummaryReady = async (): Promise<void> => {
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

      await waitForSummaryReady();

      const override = data?.summaryOverride?.trim();
      if (override && override.length >= 10 && override.length <= 50000) {
        await recapService.updateSummary(recapId, override);
      }

      // Navigate to material page with recap ID
      navigate(`/dashboard/${encodeURIComponent(recapId)}`);
    } catch (error) {
      console.error('Failed to generate recap:', error);
      const message =
        error instanceof Error
          ? error.message
          : t('dashboard.themes.generateError', 'Failed to generate recap');
      showToast(message, 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className='min-h-screen bg-background relative'>
      {isSummarizing && (
        <>
          <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-40 pointer-events-none' />
          {/* Loading overlay with spinner and countdown */}
          <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
            <Card className='pointer-events-auto w-full max-w-md mx-4 bg-background/95 backdrop-blur-sm border shadow-2xl'>
              <CardContent className='pt-8 pb-6 px-6'>
                <div className='flex flex-col items-center space-y-6'>
                  {/* Spinner */}
                  <div className='relative'>
                    <div className='animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary'></div>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='h-8 w-8 rounded-full bg-primary/10'></div>
                    </div>
                  </div>

                  {/* Countdown timer */}
                  <div className='text-center space-y-2'>
                    {countdown > 0 ? (
                      <>
                        <div className='text-4xl font-bold text-primary tabular-nums'>
                          {countdown}s
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {t('dashboard.themes.generating', 'Generating your recap...')}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className='text-4xl font-bold text-primary'>
                          {t('dashboard.themes.almostThere', 'Almost there...')}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {t('dashboard.themes.finishingUp', 'Finishing up your recap...')}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-5xl mx-auto space-y-6'>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4'>
            <div className='space-y-1 flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <FileText className='w-5 h-5 sm:w-6 sm:h-6 text-primary' />
                <h1 className='text-xl leading-tight sm:text-3xl font-bold text-foreground'>
                  {t('dashboard.themes.title', 'Themes from this episode')}
                </h1>
              </div>
              {data?.link && !data?.documents && (
                <p className='text-xs sm:text-sm text-muted-foreground mt-1 break-all'>
                  {t('dashboard.themes.source', 'Source:')}{' '}
                  <a href={data.link} target='_blank' rel='noreferrer' className='underline'>
                    {data.link}
                  </a>
                </p>
              )}
              {data?.documents && data.documents.length > 0 && (
                <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen} className='pl-8'>
                  <CollapsibleTrigger asChild>
                    <button className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors'>
                      <span>
                        {t('dashboard.themes.sources', 'Sources')} ({data.documents.length})
                      </span>
                      {isSourcesOpen ? (
                        <ChevronUp className='w-4 h-4' />
                      ) : (
                        <ChevronDown className='w-4 h-4' />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='mt-2'>
                    <div className='space-y-2 pl-4 border-l-2 border-primary/20'>
                      {data.documents.map((doc, idx) => (
                        <div key={idx} className='flex items-center gap-2 py-1.5'>
                          <File className='w-4 h-4 text-primary flex-shrink-0' />
                          <span className='text-xs sm:text-sm text-muted-foreground break-all'>
                            {doc.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:justify-end flex-shrink-0'>
              <Button
                variant='outline'
                onClick={handleSelectAll}
                disabled={isSummarizing}
                className='shrink-0 w-full sm:w-auto'
              >
                {allSelected
                  ? t('dashboard.themes.clearAll', 'Clear all')
                  : t('dashboard.themes.selectAll', 'Select all')}
              </Button>
              <Button
                variant='outline'
                onClick={() => navigate('/dashboard')}
                disabled={isSummarizing}
                className='shrink-0 w-full sm:w-auto'
              >
                {t('dashboard.themes.back', 'Back to dashboard')}
              </Button>
            </div>
          </div>

          {isLoadingTopics && (
            <Card>
              <CardContent className='py-6'>
                <p className='text-sm text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
              </CardContent>
            </Card>
          )}

          {!isLoadingTopics && !data && !searchParams.get('id') && (
            <Card>
              <CardContent className='py-6'>
                <p className='text-sm text-muted-foreground'>
                  {t(
                    'dashboard.themes.missing',
                    'No themes data found. Please generate themes from the dashboard first.'
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoadingTopics && topicsArray.length === 0 && searchParams.get('id') && (
            <Card>
              <CardContent className='py-6'>
                <p className='text-sm text-muted-foreground'>
                  {t(
                    'dashboard.themes.noTopics',
                    'The AI did not return structured topics. Try again or adjust your prompt.'
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {topicsArray.length > 0 && (
            <div className='relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 pb-10'>
              {/* Timeline - shown on desktop (center) */}
              <div
                className='hidden md:flex flex-col items-center relative px-2 md:px-4 w-16 md:w-24 flex-shrink-0 z-20 order-1 md:order-2'
                style={{ minHeight: '100%' }}
              >
                {/* Vertical timeline line */}
                <div className='absolute top-6 bottom-4 left-1/2 -translate-x-1/2 w-1 bg-primary/30'></div>
                {/* Timeline items - timestamps from 0 to end (only for YouTube videos, not documents) */}
                {!data?.documents && (
                  <div className='absolute inset-0 hidden md:flex flex-col items-center w-full'>
                    {(() => {
                      const totalDuration = getTotalDuration();
                      if (totalDuration === 0) return null;

                      // Calculate number of timestamps based on number of topics: topics / 2 + 2
                      const numberOfTimestamps = Math.max(
                        2,
                        Math.floor(topicsArray.length / 2) + 2
                      );
                      const timestamps: number[] = [];

                      // Generate evenly spaced timestamps from 0 to end
                      for (let i = 0; i < numberOfTimestamps; i++) {
                        const position = i / (numberOfTimestamps - 1); // 0 to 1
                        const timestamp = Math.round(position * totalDuration);
                        timestamps.push(timestamp);
                      }

                      return timestamps.map((timestamp, tsIdx) => {
                        // Calculate position as percentage for even spacing
                        // For first and last, use fixed positioning to prevent overflow
                        const isFirst = tsIdx === 0;
                        const isLast = tsIdx === numberOfTimestamps - 1;

                        let style: React.CSSProperties;
                        if (isFirst) {
                          // First timestamp: position at top to align with timeline line start (top-6 = 1.5rem)
                          style = { top: '1.5rem', transform: 'translateY(-50%)' };
                        } else if (isLast) {
                          // Last timestamp: position at bottom, lower than the line end
                          style = { bottom: '0.5rem', transform: 'translateY(50%)' };
                        } else {
                          // Middle timestamps: use percentage with center transform
                          const positionPercent = (tsIdx / (numberOfTimestamps - 1)) * 100;
                          style = {
                            top: `${positionPercent}%`,
                            transform: 'translateY(-50%)',
                          };
                        }

                        return (
                          <div
                            key={tsIdx}
                            className='absolute flex flex-col items-center justify-center'
                            style={style}
                          >
                            <div className='px-2 py-1 rounded-md bg-primary/10 border border-primary/20'>
                              <span className='text-xs font-semibold text-primary whitespace-nowrap'>
                                {formatTimestamp(timestamp)}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Mobile: All cards in single column (right of timeline) */}
              <div className='md:hidden space-y-4 relative order-2'>
                {topicsArray.map((topic, idx) => {
                  const isSelected = selectedTopicIds.includes(topic.id);
                  const minHeight = idx % 2 === 0 ? '140px' : '40px';
                  return (
                    <div
                      key={topic.id}
                      className='relative flex items-center'
                      data-topic-id={topic.id}
                      style={{ minHeight: minHeight }}
                    >
                      <Card
                        className={`relative w-full h-full flex flex-col transition-colors border-2 ${
                          isSummarizing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        } ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-lg font-semibold'>
                            {topic.name || t('dashboard.themes.untitled', 'Untitled theme')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 flex-1 pb-4'>
                          {topic.description && (
                            <p className='text-sm text-muted-foreground'>{topic.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Left column */}
              <div className='hidden md:block space-y-4 relative z-10 order-1'>
                {topicsArray.map((topic, idx) => {
                  if (idx % 2 !== 0) return null; // Only even indices in left column
                  const isSelected = selectedTopicIds.includes(topic.id);
                  // Match timeline spacing: even indices have larger spacing
                  const minHeight = '140px';
                  return (
                    <div
                      key={topic.id}
                      className='relative flex items-center'
                      data-topic-id={topic.id}
                      data-topic-side='left'
                      style={{ minHeight: minHeight }}
                    >
                      <Card
                        className={`relative w-full h-full flex flex-col cursor-pointer transition-colors border-2 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-lg font-semibold'>
                            {topic.name || t('dashboard.themes.untitled', 'Untitled theme')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 flex-1 pb-4'>
                          {topic.description && (
                            <p className='text-sm text-muted-foreground'>{topic.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Right column */}
              <div className='hidden md:block space-y-4 relative order-3'>
                {topicsArray.map((topic, idx) => {
                  if (idx % 2 === 0) return null; // Only odd indices in right column
                  const isSelected = selectedTopicIds.includes(topic.id);
                  // Odd indices have very small spacing to be close to timestamp above
                  const minHeight = '40px';
                  return (
                    <div
                      key={topic.id}
                      className='relative flex items-center'
                      data-topic-id={topic.id}
                      data-topic-side='right'
                      style={{ minHeight: minHeight }}
                    >
                      <Card
                        className={`relative w-full h-full flex flex-col cursor-pointer transition-colors border-2 z-10 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-lg font-semibold'>
                            {topic.name || t('dashboard.themes.untitled', 'Untitled theme')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 flex-1 pb-4'>
                          {topic.description && (
                            <p className='text-sm text-muted-foreground'>{topic.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Continue button */}
      {topicsArray.length > 0 && (
        <div className='fixed inset-x-0 bottom-6 flex justify-center pointer-events-none px-4 z-50'>
          <Button
            size='lg'
            className={`pointer-events-auto w-full max-w-md py-4 text-base sm:text-lg font-semibold shadow-xl rounded-full disabled:opacity-100 ${
              selectedTopicIds.length === 0
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            disabled={selectedTopicIds.length === 0 || isSummarizing}
            onClick={handleContinue}
          >
            <span className='relative z-10'>
              {isSummarizing
                ? t('dashboard.themes.loading', 'Loading')
                : t('dashboard.themes.continue', 'Continue')}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};
