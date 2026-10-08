import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import { Textarea } from '@/shadcn/components/ui/textarea';
import { Label } from '@/shadcn/components/ui/label';
import {
  Headphones,
  FileText,
  Brain,
  Trash2,
  ChevronDown,
  ChevronUp,
  File,
  BarChart3,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  BookOpen,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shadcn/components/ui/collapsible';
import { CustomAudioPlayer } from '@/components/CustomAudioPlayer';
import { FlashcardCarousel } from '@/components/FlashcardCarousel';
import { FlashcardStatsDialog } from '@/components/FlashcardStatsDialog';
import { DeleteRecapDialog } from '@/components/RecapCardDialogs';
import {
  useRecapService,
  type Recap,
  type Flashcard,
  type Summary,
  type AnalyzeRecallResponse,
} from '@/services/recapService';
import { showToast } from '@/shared/ui';
import { addBackgroundRequest, removeBackgroundRequest } from '@/services/backgroundRequestTracker';
import { useBackgroundRequests } from '@/hooks/useBackgroundRequests';
import { useAuth } from '@/contexts/AuthContext';
import { useNoCreditsDialog } from '@/contexts/NoCreditsDialogContext';

interface Topic {
  title: string;
  description?: string;
  segments: string[];
}

interface StoredMaterialPayload {
  id: string;
  link?: string;
  documents?: { name: string; text: string }[];
  title: string;
  summary: string;
  topics?: Topic[];
  audioUrl?: string;
  segments?: { id: string; index: number; text: string }[];
  transcriptItems?: { text: string; offset: number; duration: number }[];
}

export const DashboardMaterialPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recapService = useRecapService();
  const { user } = useAuth();
  const { isGeneratingAudio: backgroundIsGeneratingAudio } = useBackgroundRequests(id || undefined);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [material, setMaterial] = useState<StoredMaterialPayload | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [flashcardQualities, setFlashcardQualities] = useState<Record<string, number>>({});
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [carouselStartOverKey, setCarouselStartOverKey] = useState(0);

  // Memoize flashcards array to prevent unnecessary re-shuffling
  const memoizedFlashcardsForCarousel = useMemo(
    () =>
      flashcards.map((flashcard, index) => ({
        id: flashcard.id,
        number: index + 1,
        question: flashcard.question,
        answer: flashcard.answer,
        isAnswered:
          flashcardQualities[flashcard.id] !== undefined && flashcardQualities[flashcard.id] !== 2,
      })),
    [flashcards, flashcardQualities]
  );
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [ttsCountdown, setTtsCountdown] = useState(120);
  const ttsCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ttsPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummaryContent, setEditedSummaryContent] = useState('');
  const [isUpdatingSummary, setIsUpdatingSummary] = useState(false);
  const [recallText, setRecallText] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeRecallResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const { openNoCreditsDialog } = useNoCreditsDialog();

  const editedSummaryTrimmedLength = editedSummaryContent.trim().length;
  const isEditedSummaryValid =
    editedSummaryTrimmedLength >= 10 && editedSummaryTrimmedLength <= 50000;
  const availableAudioUrl = summary
    ? summary.is_outdated
      ? undefined
      : summary.audio_url || undefined
    : material?.audioUrl;

  useEffect(() => {
    if (!isEditingSummary) {
      setEditedSummaryContent(summary?.content || '');
    }
  }, [isEditingSummary, summary?.content]);

  const handleSaveSummaryEdit = async () => {
    if (!id || !summary?.content) return;
    if (!isEditedSummaryValid) {
      showToast(
        t('dashboard.material.summaryValidationError', 'Summary must be 10-50,000 characters.'),
        'error'
      );
      return;
    }

    setIsUpdatingSummary(true);
    try {
      const updatedSummary = await recapService.updateSummary(id, editedSummaryContent);
      setSummary(updatedSummary);
      setMaterial(prev => (prev ? { ...prev, summary: updatedSummary.content } : prev));
      setIsEditingSummary(false);
      showToast(t('dashboard.material.summaryUpdated', 'Summary updated.'), 'success');
    } catch (err) {
      console.error('Error updating summary:', err);
      showToast(
        err instanceof Error
          ? err.message
          : t('dashboard.material.summaryUpdateError', 'Failed to update summary'),
        'error'
      );
    } finally {
      setIsUpdatingSummary(false);
    }
  };

  // Function to handle audio generation (extracted for reuse)
  const handleGenerateAudio = async () => {
    if (!id || !summary?.content) return;

    setIsGeneratingTTS(true);
    setTtsCountdown(120);

    // Clear any existing intervals
    if (ttsCountdownIntervalRef.current) {
      clearInterval(ttsCountdownIntervalRef.current);
      ttsCountdownIntervalRef.current = null;
    }
    if (ttsPollingIntervalRef.current) {
      clearInterval(ttsPollingIntervalRef.current);
      ttsPollingIntervalRef.current = null;
    }

    // Start countdown timer
    ttsCountdownIntervalRef.current = setInterval(() => {
      setTtsCountdown(prev => {
        if (prev <= 1) {
          if (ttsCountdownIntervalRef.current) {
            clearInterval(ttsCountdownIntervalRef.current);
            ttsCountdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Register background request for audio generation
    // Store previous audio URL if regenerating
    const previousAudioUrl = summary?.audio_url || material?.audioUrl;
    addBackgroundRequest({
      id: `audio-generation-${id}`,
      type: 'audio_generation',
      recapId: id,
      startedAt: Date.now(),
      title: recap?.title || recap?.episode_title,
      metadata: previousAudioUrl ? { previousAudioUrl } : undefined,
    });

    // Start the TTS generation request (will continue even if user navigates away)
    // Don't await it - let it run in the background
    recapService
      .generateTTS({
        text: summary.content,
        language: 'en',
        recap_id: id,
      })
      .then(async result => {
        // Only update state if component is still mounted
        // The audio is saved to the recap on the backend, so it will be available
        // when the user returns and fetches the summary
        try {
          const refreshedSummary = await recapService.getSummary(id);
          setSummary(refreshedSummary);
        } catch (refreshError) {
          console.warn('Failed to refresh summary after TTS generation:', refreshError);
          setSummary(prev =>
            prev ? { ...prev, audio_url: result.audio_url, is_outdated: false } : null
          );
        }
        setIsGeneratingTTS(false);

        // Remove background request since we completed locally
        if (id) {
          removeBackgroundRequest(`audio-generation-${id}`);
        }
        if (ttsCountdownIntervalRef.current) {
          clearInterval(ttsCountdownIntervalRef.current);
          ttsCountdownIntervalRef.current = null;
        }
        setTtsCountdown(120);
      })
      .catch(error => {
        console.error('Failed to generate TTS:', error);
        // Only show alert if component is still mounted
        setIsGeneratingTTS(false);
        if (ttsCountdownIntervalRef.current) {
          clearInterval(ttsCountdownIntervalRef.current);
          ttsCountdownIntervalRef.current = null;
        }
        setTtsCountdown(120);
        // Don't show toast if user navigated away
        const message =
          error instanceof Error
            ? error.message
            : t('dashboard.material.ttsError', 'Failed to generate audio');
        // Only show toast if we're still on the page (check if id still matches)
        if (id) {
          showToast(message, 'error');
        }
      });

    // Poll for audio URL if user stays on page
    // The backend saves the audio to the recap, so we can check for it
    // This allows the audio to appear even if the direct response is slow
    // The request continues in the background even if user navigates away
    if (ttsPollingIntervalRef.current) {
      clearInterval(ttsPollingIntervalRef.current);
    }

    const maxAttempts = 40; // Poll for up to 2 minutes (40 * 3 seconds)
    let attempts = 0;

    ttsPollingIntervalRef.current = setInterval(async () => {
      if (!id || !isGeneratingTTS) {
        if (ttsPollingIntervalRef.current) {
          clearInterval(ttsPollingIntervalRef.current);
          ttsPollingIntervalRef.current = null;
        }
        return;
      }

      attempts++;

      try {
        const updatedSummary = await recapService.getSummary(id);
        if (updatedSummary.audio_url && !updatedSummary.is_outdated) {
          // Audio is ready!
          setSummary(updatedSummary);
          setIsGeneratingTTS(false);
          if (ttsCountdownIntervalRef.current) {
            clearInterval(ttsCountdownIntervalRef.current);
            ttsCountdownIntervalRef.current = null;
          }
          if (ttsPollingIntervalRef.current) {
            clearInterval(ttsPollingIntervalRef.current);
            ttsPollingIntervalRef.current = null;
          }
          setTtsCountdown(120);

          // Remove background request since we completed locally
          if (id) {
            removeBackgroundRequest(`audio-generation-${id}`);
          }
        } else if (attempts >= maxAttempts) {
          // Stop polling after max attempts
          if (ttsPollingIntervalRef.current) {
            clearInterval(ttsPollingIntervalRef.current);
            ttsPollingIntervalRef.current = null;
          }
          setIsGeneratingTTS(false);
          if (ttsCountdownIntervalRef.current) {
            clearInterval(ttsCountdownIntervalRef.current);
            ttsCountdownIntervalRef.current = null;
          }
          setTtsCountdown(120);
        }
      } catch (err) {
        // Ignore polling errors - the request is still processing
        console.error('Error polling for audio:', err);
        if (attempts >= maxAttempts) {
          if (ttsPollingIntervalRef.current) {
            clearInterval(ttsPollingIntervalRef.current);
            ttsPollingIntervalRef.current = null;
          }
          setIsGeneratingTTS(false);
          if (ttsCountdownIntervalRef.current) {
            clearInterval(ttsCountdownIntervalRef.current);
            ttsCountdownIntervalRef.current = null;
          }
          setTtsCountdown(120);
        }
      }
    }, 3000); // Poll every 3 seconds
  };

  // Fetch recap data from API
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchRecap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedRecap = await recapService.getRecap(id);

        // Only update state if component is still mounted
        if (isMounted) {
          setRecap(fetchedRecap);

          // Try to get additional material data from sessionStorage (for backward compatibility)
          // This will be replaced with API calls when those endpoints are available
          const raw = sessionStorage.getItem(`dashboard-material-${id}`);
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as StoredMaterialPayload;
              setMaterial(parsed);
            } catch {
              // ignore parse errors
            }
          }

          // Fetch summary for this recap
          if (isMounted) {
            setIsLoadingSummary(true);
            try {
              const fetchedSummary = await recapService.getSummary(fetchedRecap.id);
              if (isMounted) {
                // Check if summary is empty (no content)
                if (
                  !fetchedSummary ||
                  !fetchedSummary.content ||
                  fetchedSummary.content.trim() === ''
                ) {
                  // Summary is empty, redirect to themes page
                  navigate(`/dashboard/themes?id=${encodeURIComponent(fetchedRecap.id)}`, {
                    replace: true,
                  });
                  return; // Exit early since we're redirecting
                }

                setSummary(fetchedSummary);
                // If audio is available, make sure we're not showing the generating state
                if (fetchedSummary.audio_url && !fetchedSummary.is_outdated) {
                  setIsGeneratingTTS(false);
                  if (ttsCountdownIntervalRef.current) {
                    clearInterval(ttsCountdownIntervalRef.current);
                    ttsCountdownIntervalRef.current = null;
                  }
                  setTtsCountdown(120);
                }
              }
            } catch (summaryErr) {
              console.error('Error fetching summary:', summaryErr);
              // If summary is not found (404) or empty, redirect to themes page
              // This means the recap hasn't been generated yet
              if (isMounted && fetchedRecap.id) {
                const errorMessage =
                  summaryErr instanceof Error ? summaryErr.message : String(summaryErr);
                // Check if it's a 404 or "summary_not_found" error
                if (
                  errorMessage.includes('404') ||
                  errorMessage.includes('summary_not_found') ||
                  errorMessage.includes('not found')
                ) {
                  // Redirect to themes page to allow user to select topics and generate summary
                  navigate(`/dashboard/themes?id=${encodeURIComponent(fetchedRecap.id)}`, {
                    replace: true,
                  });
                  return; // Exit early since we're redirecting
                }
              }
              // For other errors, just log them
            } finally {
              if (isMounted) {
                setIsLoadingSummary(false);
              }
            }
          }

          // Fetch flashcards for this recap
          if (isMounted) {
            setIsLoadingFlashcards(true);
            try {
              const fetchedFlashcards = await recapService.getFlashcards(fetchedRecap.id);
              if (isMounted) {
                setFlashcards(fetchedFlashcards);
                // Initialize quality for each flashcard (default: 2 = Good)
                const initialQualities: Record<string, number> = {};
                fetchedFlashcards.forEach(fc => {
                  initialQualities[fc.id] = 2; // Default quality: 2 = Good
                });
                setFlashcardQualities(initialQualities);
              }
            } catch (flashcardErr) {
              console.error('Error fetching flashcards:', flashcardErr);
              // Don't set error state for flashcards, just log it
            } finally {
              if (isMounted) {
                setIsLoadingFlashcards(false);
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching recap:', err);
          setError(
            err instanceof Error
              ? err.message
              : t('dashboard.material.loadError', 'Failed to load recap')
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRecap();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
      // Cleanup TTS countdown and polling on unmount
      // Note: The TTS generation request will continue in the background
      // When user returns, the summary fetch will show the audio if it's ready
      if (ttsCountdownIntervalRef.current) {
        clearInterval(ttsCountdownIntervalRef.current);
        ttsCountdownIntervalRef.current = null;
      }
      if (ttsPollingIntervalRef.current) {
        clearInterval(ttsPollingIntervalRef.current);
        ttsPollingIntervalRef.current = null;
      }
    };

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [id]); // Only depend on id, not recapService

  const handleDelete = async () => {
    if (!id) return;

    try {
      await recapService.deleteRecap(id);
      // After deletion, navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting recap:', err);
      showToast(
        err instanceof Error ? err.message : t('recap.deleteError', 'Failed to delete recap'),
        'error'
      );
    }
  };

  const handleStartOver = () => {
    // Trigger carousel reset by changing key
    setCarouselStartOverKey(prev => prev + 1);
  };

  const handleAnalyzeRecall = async () => {
    if (!summary?.content || !recallText.trim()) {
      setAnalyzeError(
        t('dashboard.material.recallRequired', 'Please enter what you remember from the recap.')
      );
      return;
    }

    // Check if user has credits
    if (user && (user.credits_balance ?? 0) <= 0) {
      openNoCreditsDialog();
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalyzeResult(null);

    try {
      const result = await recapService.analyzeRecall({
        summary: summary.content,
        text: recallText.trim(),
      });
      setAnalyzeResult(result);
    } catch (error) {
      console.error('Error analyzing recall:', error);
      // Check if it's a 402 Payment Required error (insufficient credits)
      if (
        error instanceof Error &&
        (error.message.includes('402') || error.message.includes('Insufficient credits'))
      ) {
        openNoCreditsDialog();
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t(
                'dashboard.material.analyzeError',
                'Failed to analyze your recall. Please try again.'
              );
        setAnalyzeError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract YouTube video ID from link
  const extractYouTubeVideoId = (link: string): string | null => {
    try {
      const url = new URL(link);
      const v = url.searchParams.get('v');
      if (v) return v;
      if (url.hostname.includes('youtu.be')) {
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) return pathParts[0];
      }
      const lastSegment = url.pathname.split('/').filter(Boolean).pop();
      if (lastSegment) return lastSegment;
    } catch {
      // If URL parsing fails, try to extract ID from string
      const match = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (match) return match[1];
    }
    return null;
  };

  // Calculate timestamp for a segment
  const getSegmentTimestamp = (segmentId: string): number | null => {
    if (!material?.segments) return null;

    // Find the segment index
    const segment = material.segments.find(seg => seg.id === segmentId);
    if (!segment) return null;

    // If we have transcriptItems, calculate more accurately
    if (material.transcriptItems && material.transcriptItems.length > 0) {
      // Calculate total duration from transcript items
      const totalDuration = material.transcriptItems.reduce(
        (sum, item) => sum + (item.duration || 0),
        0
      );

      if (totalDuration > 0) {
        // Estimate timestamp based on segment index
        const totalSegments = material.segments.length;
        const segmentRatio = segment.index / totalSegments;
        return Math.floor(segmentRatio * totalDuration);
      }
    }

    // Fallback: estimate based on segment index (assume ~1 minute per segment for typical videos)
    // This is a rough estimate
    return segment.index * 60;
  };

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

  // Create YouTube URL with timestamp
  const createYouTubeUrlWithTimestamp = (link: string, timestamp: number): string => {
    const videoId = extractYouTubeVideoId(link);
    if (!videoId) return link;

    // Remove existing timestamp if present
    const url = new URL(link);
    url.searchParams.delete('t');
    url.searchParams.set('t', timestamp.toString());

    return url.toString();
  };

  const topics = Array.isArray(material?.topics) ? (material.topics as Topic[]) : [];

  return (
    <div className='min-h-screen bg-gradient-to-b from-background via-background to-muted/40'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Hero header */}
          <div className='flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-5 sm:p-6 shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-2 min-w-0 flex-1'>
                <p className='inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary'>
                  <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold'>
                    ML
                  </span>
                  {t('dashboard.material.badge', 'Memory Loop recap')}
                </p>
                <h1 className='text-xl sm:text-3xl font-bold text-foreground leading-snug break-words'>
                  {recap?.title ||
                    material?.title ||
                    t('dashboard.material.titleFallback', 'Your personalised recap')}
                </h1>
                {(recap?.episode_url || material?.link) && !material?.documents && (
                  <p className='text-xs sm:text-sm text-muted-foreground break-all'>
                    {t('dashboard.material.source', 'Source:')}{' '}
                    <a
                      href={recap?.episode_url || material?.link || '#'}
                      target='_blank'
                      rel='noreferrer'
                      className='underline underline-offset-2'
                    >
                      {recap?.episode_url || material?.link}
                    </a>
                  </p>
                )}
                {material?.documents && material.documents.length > 0 && (
                  <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
                    <CollapsibleTrigger asChild>
                      <button className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors'>
                        <span>
                          {t('dashboard.material.sources', 'Sources')} ({material.documents.length})
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
                        {material.documents.map((doc, idx) => (
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
                {topics.length > 0 && (
                  <div className='mt-3 space-y-2'>
                    <Collapsible open={isTopicsOpen} onOpenChange={setIsTopicsOpen}>
                      <CollapsibleTrigger asChild>
                        <button className='flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors'>
                          <span>{t('dashboard.material.topics', 'Selected Topics')}</span>
                          {isTopicsOpen ? (
                            <ChevronUp className='w-4 h-4' />
                          ) : (
                            <ChevronDown className='w-4 h-4' />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className='flex flex-wrap gap-2 mt-2'>
                          {topics.map((topic, idx) => {
                            // Get the first segment's timestamp (start time of the topic)
                            const firstSegmentId = topic.segments?.[0];
                            const timestamp = firstSegmentId
                              ? getSegmentTimestamp(firstSegmentId)
                              : null;
                            const timestampText =
                              timestamp !== null ? formatTimestamp(timestamp) : null;

                            return (
                              <div
                                key={idx}
                                className='inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5'
                              >
                                <span className='text-xs font-medium text-foreground'>
                                  {topic.title}
                                </span>
                                {timestampText && material?.link && timestamp !== null && (
                                  <a
                                    href={createYouTubeUrlWithTimestamp(material.link, timestamp)}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='text-xs font-semibold text-primary hover:text-primary/80 underline underline-offset-2'
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {timestampText}
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </div>
              <div className='flex items-center gap-2 shrink-0 hidden sm:flex'>
                <Button variant='outline' onClick={() => navigate('/dashboard')}>
                  {t('dashboard.material.back', 'Back to dashboard')}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className='text-destructive hover:text-destructive hover:bg-destructive/10'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>
            </div>
            <div className='flex items-center gap-2 sm:hidden'>
              <Button variant='outline' onClick={() => navigate('/dashboard')} className='flex-1'>
                {t('dashboard.material.back', 'Back to dashboard')}
              </Button>
              <Button
                variant='outline'
                onClick={() => setIsDeleteDialogOpen(true)}
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {isLoading && (
            <Card>
              <CardContent className='py-6'>
                <p className='text-sm text-muted-foreground text-center'>
                  {t('common.loading', 'Loading...')}
                </p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardContent className='py-6'>
                <p className='text-sm text-destructive text-center'>{error}</p>
                <div className='mt-4 flex justify-center'>
                  <Button variant='outline' onClick={() => navigate('/dashboard')}>
                    {t('dashboard.material.back', 'Back to dashboard')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && !recap && (
            <Card>
              <CardContent className='py-6'>
                <p className='text-sm text-muted-foreground text-center'>
                  {t(
                    'dashboard.material.missing',
                    'No recap data found. Please generate a new recap from the dashboard.'
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {(material || summary) && (
            <>
              {/* Audio player section */}
              <Card className='border-dashed border-2 border-primary/30 bg-card/60'>
                <CardHeader>
                  <div className='flex items-center justify-between gap-4'>
                    <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                      <span
                        className='w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary'
                        aria-hidden='true'
                      >
                        <Headphones className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' />
                      </span>
                      {t('dashboard.material.audioTitle', 'Listen to your audio recap')}
                    </CardTitle>
                    {availableAudioUrl && !isGeneratingTTS && !backgroundIsGeneratingAudio && (
                      <Button
                        onClick={handleGenerateAudio}
                        disabled={
                          isGeneratingTTS || backgroundIsGeneratingAudio || !summary?.content
                        }
                        variant='outline'
                        className='shrink-0 px-3 sm:px-4'
                        aria-label={t('dashboard.material.regenerateAudio', 'Regenerate')}
                      >
                        <RotateCcw className='w-4 h-4 sm:mr-2' />
                        <span className='hidden sm:inline'>
                          {t('dashboard.material.regenerateAudio', 'Regenerate')}
                        </span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {availableAudioUrl ? (
                    <div className='space-y-4'>
                      {isGeneratingTTS || backgroundIsGeneratingAudio ? (
                        <div className='flex flex-col items-center justify-center py-8 space-y-4'>
                          <div className='relative'>
                            <div className='animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary'></div>
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <div className='h-8 w-8 rounded-full bg-primary/10'></div>
                            </div>
                          </div>
                          <div className='text-center space-y-2'>
                            {ttsCountdown > 0 ? (
                              <>
                                <div className='text-4xl font-bold text-primary tabular-nums'>
                                  {ttsCountdown}s
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                  {t('dashboard.material.generatingAudio', 'Generating audio...')}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className='text-4xl font-bold text-primary'>
                                  {t('dashboard.material.almostThere', 'Almost there...')}
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                  {t(
                                    'dashboard.material.finishingUp',
                                    'Finishing up your audio...'
                                  )}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <CustomAudioPlayer src={availableAudioUrl || ''} />
                      )}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-8 space-y-4'>
                      {isGeneratingTTS || backgroundIsGeneratingAudio ? (
                        <>
                          <div className='relative'>
                            <div className='animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary'></div>
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <div className='h-8 w-8 rounded-full bg-primary/10'></div>
                            </div>
                          </div>
                          <div className='text-center space-y-2'>
                            {isGeneratingTTS && ttsCountdown > 0 ? (
                              <>
                                <div className='text-4xl font-bold text-primary tabular-nums'>
                                  {ttsCountdown}s
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                  {t('dashboard.material.generatingAudio', 'Generating audio...')}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className='text-4xl font-bold text-primary'>
                                  {t('dashboard.material.almostThere', 'Almost there...')}
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                  {t(
                                    'dashboard.material.finishingUp',
                                    'Finishing up your audio...'
                                  )}
                                </p>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className='text-sm text-muted-foreground text-center'>
                            {summary?.is_outdated
                              ? t(
                                  'dashboard.material.audioOutdated',
                                  'Audio is outdated. Generate a new version from your edited summary.'
                                )
                              : t(
                                  'dashboard.material.noAudio',
                                  'No audio available yet. Generate audio from your summary.'
                                )}
                          </p>
                          <Button
                            onClick={handleGenerateAudio}
                            disabled={
                              isGeneratingTTS || backgroundIsGeneratingAudio || !summary?.content
                            }
                            className='mt-4'
                          >
                            {t('dashboard.material.generateAudio', 'Generate Audio')}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Test your knowledge section */}
              {(summary?.content || material?.summary) && (
                <Card className='border-dashed border-2 border-primary/30 bg-card/60'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                      <span
                        className='w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary'
                        aria-hidden='true'
                      >
                        <BookOpen className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' />
                      </span>
                      {t('dashboard.material.testKnowledgeTitle', 'Test your knowledge')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='recall-text'>
                        {t(
                          'dashboard.material.recallLabel',
                          'What did you remember from this recap?'
                        )}
                      </Label>
                      <Textarea
                        id='recall-text'
                        placeholder={t(
                          'dashboard.material.recallPlaceholder',
                          'Type what you remember from the recap...'
                        )}
                        value={recallText}
                        onChange={e => setRecallText(e.target.value)}
                        rows={6}
                        className='resize-none'
                        disabled={isAnalyzing}
                      />
                    </div>

                    <Button
                      onClick={handleAnalyzeRecall}
                      disabled={isAnalyzing || !recallText.trim() || recallText.trim().length < 10}
                      className='w-full sm:w-auto'
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          {t('dashboard.material.analyzing', 'Analyzing...')}
                        </>
                      ) : (
                        t('dashboard.material.analyzeButton', 'Analyze my recall')
                      )}
                    </Button>

                    {analyzeError && (
                      <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-3'>
                        <p className='text-sm text-destructive'>{analyzeError}</p>
                      </div>
                    )}

                    {analyzeResult && (
                      <div className='space-y-4 mt-4'>
                        {/* Overall Score */}
                        <div className='rounded-lg border border-border bg-card/50 p-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <h3 className='font-semibold text-lg'>
                              {t('dashboard.material.overallScore', 'Overall Score')}
                            </h3>
                          </div>
                          <div className='flex gap-4 text-sm text-muted-foreground mt-2'>
                            <span>
                              {t('dashboard.material.correctFacts', 'Correct')}:{' '}
                              {analyzeResult.correct_facts_count}
                            </span>
                            <span>
                              {t('dashboard.material.incorrectFacts', 'Incorrect')}:{' '}
                              {analyzeResult.incorrect_facts_count}
                            </span>
                          </div>
                        </div>

                        {/* Facts Analyzed */}
                        {analyzeResult.facts_analyzed.length > 0 && (
                          <div className='space-y-2'>
                            <h3 className='font-semibold text-base'>
                              {t('dashboard.material.factsAnalyzed', 'Facts Analyzed')}
                            </h3>
                            <div className='space-y-3'>
                              {analyzeResult.facts_analyzed.map((fact, index) => (
                                <div
                                  key={index}
                                  className={`rounded-lg border p-3 ${
                                    fact.status === 'true'
                                      ? 'border-green-500/50 bg-green-500/10'
                                      : fact.status === 'false'
                                        ? 'border-red-500/50 bg-red-500/10'
                                        : fact.status === 'partially_correct'
                                          ? 'border-yellow-500/50 bg-yellow-500/10'
                                          : 'border-blue-500/50 bg-blue-500/10'
                                  }`}
                                >
                                  <div className='flex items-start justify-between gap-2 mb-1'>
                                    <p className='text-sm font-medium flex-1'>{fact.fact}</p>
                                    <span
                                      className={`text-xs font-semibold px-2 py-1 rounded ${
                                        fact.status === 'true'
                                          ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                          : fact.status === 'false'
                                            ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                            : fact.status === 'partially_correct'
                                              ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                              : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                      }`}
                                    >
                                      {fact.status === 'true'
                                        ? t('dashboard.material.statusCorrect', 'Correct')
                                        : fact.status === 'false'
                                          ? t('dashboard.material.statusIncorrect', 'Incorrect')
                                          : fact.status === 'partially_correct'
                                            ? t(
                                                'dashboard.material.statusPartial',
                                                'Partially Correct'
                                              )
                                            : t(
                                                'dashboard.material.statusClarification',
                                                'Needs Clarification'
                                              )}
                                    </span>
                                  </div>
                                  <p className='text-xs text-muted-foreground mb-2'>
                                    {fact.explanation}
                                  </p>
                                  {fact.from_summary && (
                                    <p className='text-xs italic text-muted-foreground border-t border-border/50 pt-2'>
                                      <span className='font-medium'>
                                        {t('dashboard.material.fromSummary', 'From summary')}:
                                      </span>{' '}
                                      {fact.from_summary}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Facts */}
                        {analyzeResult.missing_facts.length > 0 && (
                          <div className='space-y-2'>
                            <h3 className='font-semibold text-base'>
                              {t('dashboard.material.missingFacts', 'Missing Facts')}
                            </h3>
                            <div className='rounded-lg border border-amber-500/50 bg-amber-500/10 p-3'>
                              <ul className='space-y-2'>
                                {analyzeResult.missing_facts.map((fact, index) => (
                                  <li
                                    key={index}
                                    className='text-sm text-muted-foreground flex items-start gap-2'
                                  >
                                    <span className='text-amber-600 dark:text-amber-400 mt-0.5'>
                                      •
                                    </span>
                                    <span>{fact}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Flashcards section - Always show if recap exists */}
          {recap && (
            <Card className='border-dashed border-2 border-primary/30 bg-card/60'>
              <CardHeader>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                  <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                    <span
                      className='w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary'
                      aria-hidden='true'
                    >
                      <Brain className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' />
                    </span>
                    {t('dashboard.material.flashcardsTitle', 'Review with flashcards')}
                  </CardTitle>
                  <div className='flex w-full md:w-auto justify-center md:justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setIsStatsOpen(true)}
                      className='inline-flex items-center gap-2 flex-1 md:flex-initial'
                    >
                      <BarChart3 className='w-4 h-4' />
                      {t('flashcard.showStats', 'Show my stats')}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={handleStartOver}
                      className='inline-flex items-center gap-2 flex-1 md:flex-initial'
                    >
                      <RotateCcw className='w-4 h-4' />
                      {t('flashcard.startOver', 'Start Over')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFlashcards ? (
                  <div className='flex items-center justify-center py-8'>
                    <p className='text-sm text-muted-foreground'>
                      {t('common.loading', 'Loading...')}
                    </p>
                  </div>
                ) : flashcards.length === 0 ? (
                  <div className='flex items-center justify-center py-8'>
                    <p className='text-sm text-muted-foreground'>
                      {t(
                        'dashboard.material.noFlashcards',
                        'No flashcards available for this recap.'
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    <FlashcardCarousel
                      key={carouselStartOverKey}
                      flashcards={memoizedFlashcardsForCarousel}
                      flashcardData={flashcards}
                      onCorrect={async flashcardId => {
                        try {
                          const currentQuality = flashcardQualities[flashcardId] ?? 2;
                          const newQuality = Math.min(5, currentQuality + 1); // Increase quality by 1, max 5

                          const updatedFlashcard = await recapService.reviewFlashcard(
                            flashcardId,
                            newQuality
                          );

                          // Update local state
                          setFlashcardQualities(prev => ({
                            ...prev,
                            [flashcardId]: newQuality,
                          }));
                          setFlashcards(prev =>
                            prev.map(fc => (fc.id === flashcardId ? updatedFlashcard : fc))
                          );
                        } catch (error) {
                          console.error('Error reviewing flashcard:', error);
                        }
                      }}
                      onIncorrect={async flashcardId => {
                        try {
                          const currentQuality = flashcardQualities[flashcardId] ?? 2;
                          const newQuality = Math.max(0, currentQuality - 1); // Decrease quality by 1, min 0

                          const updatedFlashcard = await recapService.reviewFlashcard(
                            flashcardId,
                            newQuality
                          );

                          // Update local state
                          setFlashcardQualities(prev => ({
                            ...prev,
                            [flashcardId]: newQuality,
                          }));
                          setFlashcards(prev =>
                            prev.map(fc => (fc.id === flashcardId ? updatedFlashcard : fc))
                          );
                        } catch (error) {
                          console.error('Error reviewing flashcard:', error);
                        }
                      }}
                      onDelete={async flashcardId => {
                        try {
                          await recapService.deleteFlashcard(flashcardId);

                          // Remove flashcard from local state
                          setFlashcards(prev => prev.filter(fc => fc.id !== flashcardId));
                          setFlashcardQualities(prev => {
                            const updated = { ...prev };
                            delete updated[flashcardId];
                            return updated;
                          });

                          // Show success message
                          showToast(
                            t('flashcard.deleteSuccess', 'Flashcard deleted successfully'),
                            'success'
                          );
                        } catch (error) {
                          console.error('Error deleting flashcard:', error);
                          showToast(
                            error instanceof Error
                              ? error.message
                              : t(
                                  'flashcard.deleteError',
                                  'Failed to delete flashcard. Please try again.'
                                ),
                            'error'
                          );
                        }
                      }}
                    />
                    {flashcards.length > 0 && (
                      <FlashcardStatsDialog
                        isOpen={isStatsOpen}
                        onOpenChange={setIsStatsOpen}
                        flashcards={flashcards}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary section - Show after flashcards */}
          {(summary?.content || material?.summary) && (
            <Card className='border-dashed border-2 border-primary/30 bg-card/60'>
              <CardHeader>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                    <span
                      className='w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary'
                      aria-hidden='true'
                    >
                      <FileText className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' />
                    </span>
                    {t('dashboard.material.summaryTitle', 'Read the core ideas')}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    {summary?.content && (
                      <>
                        {isEditingSummary ? (
                          <>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setIsEditingSummary(false);
                                setEditedSummaryContent(summary.content);
                              }}
                              disabled={isUpdatingSummary}
                              className='flex items-center gap-2'
                            >
                              <X className='w-4 h-4' />
                              {t('dashboard.material.cancelEdit', 'Cancel')}
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleSaveSummaryEdit}
                              disabled={isUpdatingSummary || !isEditedSummaryValid}
                              className='flex items-center gap-2'
                            >
                              {isUpdatingSummary ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                              ) : (
                                <Save className='w-4 h-4' />
                              )}
                              {t('dashboard.material.saveSummary', 'Save')}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsEditingSummary(true)}
                            className='flex items-center gap-2'
                          >
                            <Pencil className='w-4 h-4' />
                            {t('dashboard.material.editSummary', 'Edit')}
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={async () => {
                        const textToCopy = isEditingSummary
                          ? editedSummaryContent
                          : summary?.content || material?.summary || '';
                        try {
                          await navigator.clipboard.writeText(textToCopy);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (err) {
                          console.error('Failed to copy text:', err);
                        }
                      }}
                      className='flex items-center gap-2'
                    >
                      {copied ? (
                        <>
                          <Check className='w-4 h-4' />
                          {t('dashboard.material.copied', 'Copied!')}
                        </>
                      ) : (
                        <>
                          <Copy className='w-4 h-4' />
                          {t('dashboard.material.copyMarkdown', 'Copy markdown')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                {isLoadingSummary ? (
                  <p className='text-sm text-muted-foreground text-center'>
                    {t('dashboard.material.loadingSummary', 'Loading summary...')}
                  </p>
                ) : isEditingSummary ? (
                  <div className='space-y-2'>
                    <Textarea
                      value={editedSummaryContent}
                      onChange={e => setEditedSummaryContent(e.target.value)}
                      rows={14}
                      className='resize-none min-h-[280px]'
                      disabled={isUpdatingSummary}
                      placeholder={t(
                        'dashboard.material.summaryEditPlaceholder',
                        'Edit your summary (Markdown supported)...'
                      )}
                    />
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span>
                        {t(
                          'dashboard.material.summaryEditHint',
                          '10-50,000 characters. Markdown supported.'
                        )}
                      </span>
                      <span className={!isEditedSummaryValid ? 'text-destructive' : undefined}>
                        {editedSummaryTrimmedLength.toLocaleString()} / 50,000
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className='prose prose-sm dark:prose-invert max-w-none text-muted-foreground'>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className='mb-4 last:mb-0 leading-relaxed text-sm'>{children}</p>
                        ),
                        h1: ({ children }) => (
                          <h1 className='text-xl font-semibold mb-3 mt-4 first:mt-0 text-foreground'>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className='text-lg font-semibold mb-2 mt-3 first:mt-0 text-foreground'>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className='text-base font-semibold mb-2 mt-3 first:mt-0 text-foreground'>
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className='list-disc list-inside mb-4 space-y-1'>{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className='list-decimal list-inside mb-4 space-y-1'>{children}</ol>
                        ),
                        li: ({ children }) => <li className='ml-4'>{children}</li>,
                        code: ({ children }) => (
                          <code className='bg-muted px-1.5 py-0.5 rounded text-sm font-mono'>
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className='bg-muted p-3 rounded-lg overflow-x-auto mb-4'>
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className='border-l-4 border-primary/30 pl-4 italic my-4'>
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className='text-primary underline hover:text-primary/80'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {summary?.content || material?.summary || ''}
                    </ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteRecapDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        recapTitle={
          recap?.title ||
          material?.title ||
          t('dashboard.material.titleFallback', 'Your personalised recap')
        }
        onDelete={handleDelete}
      />
    </div>
  );
};
