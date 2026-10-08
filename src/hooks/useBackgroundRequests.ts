import { useState, useEffect } from 'react';
import { getActiveRequests, type BackgroundRequest } from '@/services/backgroundRequestTracker';

/**
 * Hook to check if a recap has any active background requests
 */
export const useBackgroundRequests = (recapId?: string) => {
  const [activeRequests, setActiveRequests] = useState<BackgroundRequest[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  useEffect(() => {
    const updateRequests = () => {
      const allRequests = getActiveRequests();
      const relevantRequests = recapId
        ? allRequests.filter(r => r.recapId === recapId)
        : allRequests;

      setActiveRequests(relevantRequests);

      if (recapId) {
        // Check specific request types for this recap
        setIsProcessing(relevantRequests.some(r => r.type === 'recap_processing'));
        setIsGenerating(relevantRequests.some(r => r.type === 'recap_generation'));
        setIsGeneratingAudio(relevantRequests.some(r => r.type === 'audio_generation'));
      }
    };

    // Update immediately
    updateRequests();

    // Poll for updates every 2 seconds
    const interval = setInterval(updateRequests, 2000);

    return () => clearInterval(interval);
  }, [recapId]);

  return {
    activeRequests,
    isProcessing,
    isGenerating,
    isGeneratingAudio,
    hasActiveRequests: activeRequests.length > 0,
  };
};
