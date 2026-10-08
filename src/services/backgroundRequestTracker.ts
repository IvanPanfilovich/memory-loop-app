/**
 * Background Request Tracker Service
 *
 * Tracks long-running requests (recap generation, theme generation, audio generation)
 * and monitors their completion even when the user navigates away from the page.
 * Shows toast notifications when requests complete.
 */

import { showToast } from '@/shared/ui';
import { SERVER_URL } from '@/shared/constants/server';
import { getAuthToken } from '@/services/reduxTokenService';

export type BackgroundRequestType =
  | 'recap_processing' // YouTube recap processing (transcription, topic extraction)
  | 'recap_generation' // Summary and flashcard generation
  | 'audio_generation'; // TTS audio generation

export interface BackgroundRequest {
  id: string; // Unique request ID
  type: BackgroundRequestType;
  recapId: string;
  startedAt: number; // Timestamp
  title?: string; // Optional title for display
  metadata?: Record<string, unknown>; // Additional metadata (e.g., previousAudioUrl for regeneration)
}

const STORAGE_KEY = 'background_requests';
const POLL_INTERVAL = 10000; // Poll every 10 seconds (reduced frequency to minimize API calls)

let pollingInterval: NodeJS.Timeout | null = null;
let isPolling = false;

/**
 * Get all active background requests from localStorage
 */
export const getActiveRequests = (): BackgroundRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get active requests:', error);
    return [];
  }
};

/**
 * Save active requests to localStorage
 */
const saveActiveRequests = (requests: BackgroundRequest[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error('Failed to save active requests:', error);
  }
};

/**
 * Add a new background request to track
 */
export const addBackgroundRequest = (request: BackgroundRequest): void => {
  const requests = getActiveRequests();

  // Remove any existing request with the same ID
  const filtered = requests.filter(r => r.id !== request.id);

  // Add the new request
  filtered.push(request);

  saveActiveRequests(filtered);
  startPolling();
};

/**
 * Remove a completed/failed request
 */
export const removeBackgroundRequest = (requestId: string): void => {
  const requests = getActiveRequests();
  const filtered = requests.filter(r => r.id !== requestId);
  saveActiveRequests(filtered);

  // Stop polling if no more requests
  if (filtered.length === 0) {
    stopPolling();
  }
};

/**
 * Check if a request is still active
 */
const checkRequestStatus = async (request: BackgroundRequest, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/recaps/${request.recapId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[BackgroundTracker] Failed to check status for recap ${request.recapId}`);
      return true; // Keep polling if we can't check
    }

    const recap = await response.json();

    switch (request.type) {
      case 'recap_processing':
        // Check if processing is complete
        if (recap.processing_status === 'completed') {
          showToast(
            request.title
              ? `Recap "${request.title}" processing completed!`
              : 'Recap processing completed!',
            'success'
          );
          return false; // Request is complete
        }
        if (recap.processing_status === 'failed') {
          showToast(
            request.title
              ? `Recap "${request.title}" processing failed.`
              : 'Recap processing failed.',
            'error'
          );
          return false; // Request failed
        }
        return true; // Still processing

      case 'recap_generation':
        // Check if generation is complete based on recap status
        // No need to check summary - if processing_status is completed, generation is done
        if (recap.processing_status === 'completed') {
          // Generation is complete - check if we have summary or flashcards
          // But don't make a separate API call - just check if recap has the necessary fields
          // The recap status being 'completed' indicates generation finished
          showToast(
            request.title
              ? `Recap "${request.title}" generation completed!`
              : 'Recap generation completed!',
            'success'
          );
          return false; // Request is complete
        }
        if (recap.processing_status === 'failed') {
          showToast(
            request.title
              ? `Recap "${request.title}" generation failed.`
              : 'Recap generation failed.',
            'error'
          );
          return false; // Request failed
        }
        return true; // Still generating

      case 'audio_generation': {
        // Wait at least 30 seconds before checking (to avoid false positives from old audio)
        // Audio generation typically takes 1-2 minutes
        const age = Date.now() - request.startedAt;
        if (age < 30000) {
          return true; // Too soon to check, still generating
        }

        // Check if audio URL exists
        const summaryResponse = await fetch(`${SERVER_URL}/api/recaps/${request.recapId}/summary`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!summaryResponse.ok) {
          console.warn(
            `[BackgroundTracker] Failed to fetch summary for recap ${request.recapId}: ${summaryResponse.status}`
          );
          return true; // Keep polling on error
        }

        const summary = await summaryResponse.json();

        const audioUrl: string | undefined = summary.audio_url;
        const isOutdated: boolean | undefined = summary.is_outdated;

        // New backend behavior: mark audio as outdated when the summary changes.
        // Only treat audio as ready when it's present and not outdated.
        if (audioUrl && isOutdated === false) {
          showToast(
            request.title
              ? `Audio for "${request.title}" is ready!`
              : 'Audio generation completed!',
            'success'
          );
          return false; // Request is complete
        }

        // Backward compatibility: if backend doesn't send is_outdated, fall back to URL/time checks.
        if (audioUrl && isOutdated === undefined) {
          // If we have a previous audio URL (regenerating), check if it changed
          const previousAudioUrl = request.metadata?.previousAudioUrl;
          if (previousAudioUrl) {
            // For regeneration: if URL changed, it's definitely done
            if (audioUrl !== previousAudioUrl) {
              showToast(
                request.title
                  ? `Audio for "${request.title}" is ready!`
                  : 'Audio generation completed!',
                'success'
              );
              return false; // Request is complete
            }

            // URL is the same - check if enough time has passed (3 minutes)
            // If backend reuses the same URL, we rely on time-based detection
            if (age >= 180000) {
              showToast(
                request.title
                  ? `Audio for "${request.title}" is ready!`
                  : 'Audio generation completed!',
                'success'
              );
              return false; // Request is complete
            }

            // URL unchanged and not enough time - still generating
            return true;
          }

          // First-time generation: audio URL exists, it's complete
          showToast(
            request.title
              ? `Audio for "${request.title}" is ready!`
              : 'Audio generation completed!',
            'success'
          );
          return false; // Request is complete
        }

        // No audio URL yet (or audio is marked outdated)
        return true; // Still generating
      }

      default:
        return true;
    }
  } catch (error) {
    console.error('[BackgroundTracker] Error checking request status:', error);
    return true; // Keep polling on error
  }
};

/**
 * Poll all active requests to check their status
 */
const pollActiveRequests = async (): Promise<void> => {
  const requests = getActiveRequests();
  if (requests.length === 0) {
    stopPolling();
    return;
  }

  // Get auth token from Redux store
  const token = getAuthToken();

  if (!token) {
    console.warn('[BackgroundTracker] No auth token available, skipping poll');
    return;
  }

  // Check each request
  const stillActive: BackgroundRequest[] = [];

  for (const request of requests) {
    // Check if request is too old (more than 10 minutes)
    const age = Date.now() - request.startedAt;
    if (age > 10 * 60 * 1000) {
      console.warn(`[BackgroundTracker] Request ${request.id} is too old, removing`);
      continue; // Skip this request
    }

    try {
      const isStillActive = await checkRequestStatus(request, token);

      if (isStillActive) {
        stillActive.push(request);
      } else {
        // Request completed or failed
        removeBackgroundRequest(request.id);
      }
    } catch (error) {
      console.error(`[BackgroundTracker] Error checking request ${request.id}:`, error);
      // Keep the request if there was an error checking it
      stillActive.push(request);
    }
  }

  // Update storage with still-active requests
  if (stillActive.length !== requests.length) {
    saveActiveRequests(stillActive);
  }
};

/**
 * Start polling for active requests
 */
const startPolling = (): void => {
  if (isPolling) {
    return;
  }

  isPolling = true;

  // Poll immediately, then set interval
  pollActiveRequests().catch(error => {
    console.error('[BackgroundTracker] Error in initial poll:', error);
  });

  pollingInterval = setInterval(() => {
    pollActiveRequests().catch(error => {
      console.error('[BackgroundTracker] Error in polling interval:', error);
    });
  }, POLL_INTERVAL);
};

/**
 * Stop polling for active requests
 */
const stopPolling = (): void => {
  if (!isPolling) return;

  isPolling = false;

  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

/**
 * Initialize background request tracking
 * Should be called when the app starts
 */
export const initializeBackgroundTracking = (): void => {
  const requests = getActiveRequests();
  if (requests.length > 0) {
    startPolling();
  }
};

/**
 * Clean up old requests (older than 10 minutes)
 */
export const cleanupOldRequests = (): void => {
  const requests = getActiveRequests();
  const now = Date.now();
  const active = requests.filter(r => now - r.startedAt < 10 * 60 * 1000);

  if (active.length !== requests.length) {
    saveActiveRequests(active);
  }
};
