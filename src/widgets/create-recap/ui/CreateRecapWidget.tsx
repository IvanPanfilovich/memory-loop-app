import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shadcn/components/ui/dialog';
import { Input } from '@/shadcn/components/ui/input';
import { Textarea } from '@/shadcn/components/ui/textarea';
import { Progress } from '@/shadcn/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shadcn/components/ui/tabs';
import { Plus, Sparkles, Link as LinkIcon, FileText, Type } from 'lucide-react';
import { useRecapService, type Topic } from '@/services/recapService';
import { addBackgroundRequest, removeBackgroundRequest } from '@/services/backgroundRequestTracker';
import { DocumentUpload } from '@/components/DocumentUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNoCreditsDialog } from '@/contexts/NoCreditsDialogContext';
import { createDocxFileFromText, extractRawTextFromDocxFile } from '@/utils/documentConversion';

interface CreateRecapWidgetProps {
  variant?: 'default' | 'floating';
}

export const CreateRecapWidget = ({ variant = 'default' }: CreateRecapWidgetProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [link, setLink] = useState('');
  const [documentFiles, setDocumentFiles] = useState<{ file: File; id: string }[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [activeTab, setActiveTab] = useState<'youtube' | 'documents' | 'text'>('youtube');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recapService = useRecapService();
  const { user } = useAuth();
  const { openNoCreditsDialog } = useNoCreditsDialog();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    setIsDialogOpen(true);
    setLink('');
    setDocumentFiles([]);
    setPastedText('');
    setActiveTab('youtube');
    setError(null);
  };

  const handleClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setLink('');
      setDocumentFiles([]);
      setPastedText('');
      setActiveTab('youtube');
      setError(null);
      setIsGenerating(false);
      setProgress(0);
      // Clear any running intervals/timeouts
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
    }
  };

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

      handleClose(false);
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

      // Step 1: Upload document (response includes both recap and topics)
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

      handleClose(false);
      navigate(`/dashboard/themes?id=${encodeURIComponent(createdRecap.id)}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('common.unexpectedError', 'Something went wrong');
      setError(message);
      setIsGenerating(false);
      setProgress(0);
      console.error('Error creating recap from documents:', err);
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

      setIsDialogOpen(false);
      setPastedText('');
      setIsGenerating(false);
      setProgress(0);
      navigate(`/dashboard/${encodeURIComponent(createdRecap.id)}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('common.unexpectedError', 'Something went wrong');
      setError(message);
      setIsGenerating(false);
      setProgress(0);
      console.error('Error creating recap from text:', err);
    }
  };

  if (variant === 'floating') {
    return (
      <>
        <Button
          size='lg'
          onClick={handleOpen}
          className='rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-shadow'
        >
          <Plus className='w-6 h-6' />
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={handleClose}>
          <DialogContent className='sm:max-w-lg max-h-[100vh] overflow-y-auto'>
            <DialogHeader>
              <div className='flex items-center gap-3 mb-2'>
                <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                  <Sparkles className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <DialogTitle className='text-xl'>
                    {t('dashboard.createRecap.title', 'Create new recap')}
                  </DialogTitle>
                  <DialogDescription className='mt-1'>
                    {t(
                      'dashboard.createRecap.description',
                      'Choose a source to create a recap and flashcards.'
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className='space-y-4 py-4 w-full max-w-full overflow-hidden'>
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
                <Tabs
                  value={activeTab}
                  onValueChange={value => setActiveTab(value as 'youtube' | 'documents' | 'text')}
                >
                  <TabsList className='grid w-full grid-cols-2 gap-[3px] h-auto sm:h-9 sm:grid-cols-3 sm:gap-0'>
                    <TabsTrigger
                      value='youtube'
                      className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)]'
                    >
                      <LinkIcon className='w-4 h-4' />
                      {t('dashboard.createRecap.youtube', 'YouTube')}
                    </TabsTrigger>
                    <TabsTrigger
                      value='documents'
                      className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)]'
                    >
                      <FileText className='w-4 h-4' />
                      {t('dashboard.createRecap.documents', 'Documents')}
                    </TabsTrigger>
                    <TabsTrigger
                      value='text'
                      className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)] col-span-2 sm:col-span-1'
                    >
                      <Type className='w-4 h-4' />
                      {t('dashboard.createRecap.textTab', 'Text')}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='youtube' className='space-y-4 mt-4'>
                    <div className='space-y-2 px-2'>
                      <Input
                        type='url'
                        placeholder={t(
                          'dashboard.zeroState.inputPlaceholder',
                          'Paste a YouTube link…'
                        )}
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && link.trim() && !isGenerating) {
                            handleGenerateThemes();
                          }
                        }}
                        className='w-full text-base'
                        disabled={isGenerating}
                        autoFocus
                      />
                      {error && <p className='text-sm text-destructive'>{error}</p>}
                    </div>
                  </TabsContent>
                  <TabsContent
                    value='documents'
                    className='space-y-4 mt-4 w-full max-w-full overflow-hidden'
                  >
                    <DocumentUpload
                      files={documentFiles}
                      onFilesChange={setDocumentFiles}
                      disabled={isGenerating}
                      maxFiles={1}
                    />
                    {error && <p className='text-sm text-destructive'>{error}</p>}
                  </TabsContent>
                  <TabsContent value='text' className='space-y-4 mt-4'>
                    <div className='space-y-2 px-2'>
                      <Textarea
                        value={pastedText}
                        onChange={e => {
                          setPastedText(e.target.value);
                          setError(null);
                        }}
                        rows={6}
                        className='resize-none max-h-[200px] sm:max-h-[35vh] overflow-y-auto'
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
                      {error && <p className='text-sm text-destructive'>{error}</p>}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => handleClose(false)}
                  disabled={isGenerating}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={
                    activeTab === 'youtube'
                      ? handleGenerateThemes
                      : activeTab === 'documents'
                        ? handleGenerateFromDocuments
                        : handleGenerateFromText
                  }
                  disabled={
                    isGenerating ||
                    (activeTab === 'youtube'
                      ? !link.trim()
                      : activeTab === 'documents'
                        ? documentFiles.length === 0
                        : pastedText.trim().length < 10 || pastedText.trim().length > 50000)
                  }
                  size='lg'
                >
                  {isGenerating
                    ? t('common.loading', 'Loading...')
                    : t('dashboard.createRecap.button', 'Create new recap')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        size='lg'
        onClick={handleOpen}
        className='text-base shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary w-full max-w-full px-8 sm:px-6'
      >
        <div className='flex items-center gap-2'>
          <Plus className='w-5 h-5' />
          <span>{t('dashboard.createRecap.button', 'Create new recap')}</span>
        </div>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-lg max-h-[100vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <Sparkles className='w-6 h-6 text-primary' />
              </div>
              <div>
                <DialogTitle className='text-xl'>
                  {t('dashboard.createRecap.title', 'Create new recap')}
                </DialogTitle>
                <DialogDescription className='mt-1'>
                  {t(
                    'dashboard.createRecap.description',
                    'Choose a source to create a recap and flashcards.'
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className='space-y-4 py-4 w-full max-w-full overflow-hidden'>
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
              <Tabs
                value={activeTab}
                onValueChange={value => setActiveTab(value as 'youtube' | 'documents' | 'text')}
              >
                <TabsList className='grid w-full grid-cols-2 gap-[3px] h-auto sm:h-9 sm:grid-cols-3 sm:gap-0'>
                  <TabsTrigger
                    value='youtube'
                    className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)]'
                  >
                    <LinkIcon className='w-4 h-4' />
                    {t('dashboard.createRecap.youtube', 'YouTube')}
                  </TabsTrigger>
                  <TabsTrigger
                    value='documents'
                    className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)]'
                  >
                    <FileText className='w-4 h-4' />
                    {t('dashboard.createRecap.documents', 'Documents')}
                  </TabsTrigger>
                  <TabsTrigger
                    value='text'
                    className='flex items-center gap-2 h-9 sm:h-[calc(100%-1px)] col-span-2 sm:col-span-1'
                  >
                    <Type className='w-4 h-4' />
                    {t('dashboard.createRecap.textTab', 'Text')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='youtube' className='space-y-4 mt-4'>
                  <div className='space-y-2 px-2'>
                    <Input
                      type='url'
                      placeholder={t(
                        'dashboard.zeroState.inputPlaceholder',
                        'Paste a YouTube link…'
                      )}
                      value={link}
                      onChange={e => setLink(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && link.trim() && !isGenerating) {
                          handleGenerateThemes();
                        }
                      }}
                      className='w-full text-base'
                      disabled={isGenerating}
                      autoFocus
                    />
                    {error && <p className='text-sm text-destructive'>{error}</p>}
                  </div>
                </TabsContent>
                <TabsContent
                  value='documents'
                  className='space-y-4 mt-4 w-full max-w-full overflow-hidden'
                >
                  <DocumentUpload
                    files={documentFiles}
                    onFilesChange={setDocumentFiles}
                    disabled={isGenerating}
                    maxFiles={1}
                  />
                  {error && <p className='text-sm text-destructive'>{error}</p>}
                </TabsContent>
                <TabsContent value='text' className='space-y-4 mt-4'>
                  <div className='space-y-2 px-2'>
                    <Textarea
                      value={pastedText}
                      onChange={e => {
                        setPastedText(e.target.value);
                        setError(null);
                      }}
                      rows={6}
                      className='resize-none max-h-[200px] sm:max-h-[35vh] overflow-y-auto'
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
                    {error && <p className='text-sm text-destructive'>{error}</p>}
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => handleClose(false)} disabled={isGenerating}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={
                  activeTab === 'youtube'
                    ? handleGenerateThemes
                    : activeTab === 'documents'
                      ? handleGenerateFromDocuments
                      : handleGenerateFromText
                }
                disabled={
                  isGenerating ||
                  (activeTab === 'youtube'
                    ? !link.trim()
                    : activeTab === 'documents'
                      ? documentFiles.length === 0
                      : pastedText.trim().length < 10 || pastedText.trim().length > 50000)
                }
                size='lg'
              >
                {isGenerating
                  ? t('common.loading', 'Loading...')
                  : t('dashboard.createRecap.button', 'Create new recap')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
