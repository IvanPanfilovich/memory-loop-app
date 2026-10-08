import { SERVER_URL } from '@/shared/constants/server';
import { useAuthTokens } from '@/hooks/useAuthTokens';

export interface Recap {
  id: string;
  user_id: number;
  title: string;
  episode_title: string;
  platform: string;
  episode_url: string;
  status: string;
  is_pinned: boolean;
  processing_status:
    | 'pending'
    | 'transcribing'
    | 'extracting_topics'
    | 'generating'
    | 'completed'
    | 'failed';
  processing_error: string;
  recap_duration_minutes: number;
  episode_duration_minutes: number;
  themes: unknown[];
  flashcard_count: number;
  created_at: string;
  last_reviewed_at: string | null;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  is_selected: boolean;
}

export interface Summary {
  id: string;
  content: string;
  audio_url?: string;
  audio_duration_seconds?: number;
  model_used?: string;
  tokens_used?: number;
  is_ai_generated?: boolean;
  is_outdated?: boolean;
}

export interface Flashcard {
  id: string;
  recap_id: string;
  question: string;
  answer: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
}

export interface CreateRecapRequest {
  url: string;
  title?: string;
  platform?: string;
}

export interface SelectTopicsRequest {
  topic_ids: string[];
}

export interface GenerateRequest {
  topic_ids: string[]; // Required: Array of topic UUIDs to include in the summary
  flashcard_count?: number; // Optional: Number of flashcards to generate (default: 10, range: 5-20)
}

export interface AnalyzeRecallRequest {
  summary: string; // The original summary to compare against
  text: string; // The user's recall text to analyze
}

export interface FactAnalysis {
  fact: string;
  status: 'true' | 'false' | 'needs_clarification' | 'partially_correct';
  explanation: string;
  from_summary: string;
}

export interface AnalyzeRecallResponse {
  facts_analyzed: FactAnalysis[];
  missing_facts: string[];
  overall_score: number;
  correct_facts_count: number;
  incorrect_facts_count: number;
}

export const useRecapService = () => {
  const { token } = useAuthTokens();

  const getAuthHeaders = () => {
    if (!token) {
      throw new Error('Missing auth token');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  /**
   * 1. Create a new recap
   */
  const createRecap = async (request: CreateRecapRequest): Promise<Recap> => {
    const response = await fetch(`${SERVER_URL}/api/recaps`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        url: request.url,
        title: request.title,
        platform: request.platform || 'YouTube',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    // Handle case where response might be wrapped in a 'data' object
    const recap = data.data || data;
    if (!recap || !recap.id) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response: Recap ID not found');
    }
    return recap;
  };

  /**
   * 1a. Upload a document to create a new recap
   * Returns: { recap: Recap, topics: Topic[] }
   */
  const uploadDocument = async (
    file: File,
    title?: string
  ): Promise<{ recap: Recap; topics: Topic[] }> => {
    if (!token) {
      throw new Error('Missing auth token');
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf' && fileExtension !== 'docx') {
      throw new Error('File must be PDF or DOCX format');
    }

    // Validate file size (10 MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10 MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }

    const response = await fetch(`${SERVER_URL}/api/recaps/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // DO NOT set Content-Type - browser sets it automatically with boundary
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    // For document upload, the response structure is: { recap: {...}, topics: [...] }
    if (!data.recap || !data.recap.id) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response: Recap ID not found');
    }
    return {
      recap: data.recap,
      topics: data.topics || [],
    };
  };

  /**
   * 2. Start processing a recap
   */
  const startProcessing = async (recapId: string): Promise<Recap> => {
    if (!recapId) {
      throw new Error('Recap ID is required to start processing');
    }

    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * 3. Get recap by ID (for polling)
   */
  const getRecap = async (recapId: string): Promise<Recap> => {
    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * 4. Get extracted topics for a recap
   */
  const getTopics = async (recapId: string): Promise<Topic[]> => {
    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}/topics`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * 5. Select topics for a recap
   */
  const selectTopics = async (recapId: string, request: SelectTopicsRequest): Promise<Topic[]> => {
    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}/topics/select`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * 6. Generate summary and flashcards
   */
  const generateRecap = async (
    recapId: string,
    request: GenerateRequest
  ): Promise<{ status: string }> => {
    if (!request.topic_ids || request.topic_ids.length === 0) {
      throw new Error('At least one topic must be selected');
    }

    // Validate and adjust flashcard_count (range: 0-25)
    // Use the value from the request, defaulting to 10 if not provided
    let flashcardCount = request.flashcard_count ?? 10;
    // Clamp to valid range (0-25)
    if (flashcardCount < 0) {
      flashcardCount = 0;
    } else if (flashcardCount > 25) {
      flashcardCount = 25;
    }

    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        topic_ids: request.topic_ids,
        flashcard_count: flashcardCount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Poll recap status until completed or failed
   */
  const pollRecapStatus = async (
    recapId: string,
    onStatusUpdate?: (recap: Recap) => void,
    pollInterval: number = 2000,
    maxAttempts: number = 150 // 5 minutes max (150 * 2s = 300s)
  ): Promise<Recap> => {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const recap = await getRecap(recapId);

      if (onStatusUpdate) {
        onStatusUpdate(recap);
      }

      if (recap.processing_status === 'completed') {
        return recap;
      }

      if (recap.processing_status === 'failed') {
        throw new Error(recap.processing_error || 'Processing failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error('Polling timeout: Processing took too long');
  };

  /**
   * Get all recaps with pagination
   */
  const getRecaps = async (limit: number = 20, offset: number = 0): Promise<Recap[]> => {
    const params = new URLSearchParams();
    if (limit !== 20) params.set('limit', limit.toString());
    if (offset !== 0) params.set('offset', offset.toString());

    const url = `${SERVER_URL}/api/recaps${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Update a recap (title and/or pinned status)
   */
  const updateRecap = async (
    recapId: string,
    updates: { title?: string; pinned?: boolean }
  ): Promise<Recap> => {
    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        title: updates.title,
        pinned: updates.pinned,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Delete a recap
   */
  const deleteRecap = async (recapId: string): Promise<void> => {
    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    // 204 No Content - no response body to parse
    return;
  };

  /**
   * Get flashcards for a recap
   */
  const getFlashcards = async (
    recapId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Flashcard[]> => {
    const params = new URLSearchParams({
      recap_id: recapId,
    });
    if (limit !== 50) params.set('limit', limit.toString());
    if (offset !== 0) params.set('offset', offset.toString());

    const url = `${SERVER_URL}/api/flashcards?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Review a flashcard with quality rating
   * Quality: 0 = Again, 1 = Hard, 2 = Good, 3 = Good (easy), 4 = Easy, 5 = Easy (too soon)
   */
  const reviewFlashcard = async (flashcardId: string, quality: number): Promise<Flashcard> => {
    const response = await fetch(`${SERVER_URL}/api/flashcards/${flashcardId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        quality: quality,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Delete a flashcard
   */
  const deleteFlashcard = async (flashcardId: string): Promise<void> => {
    const response = await fetch(`${SERVER_URL}/api/flashcards/${flashcardId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    // 204 No Content - no response body to parse
    return;
  };

  /**
   * Get summary for a recap
   */
  const getSummary = async (recapId: string): Promise<Summary> => {
    if (!recapId) {
      throw new Error('Recap ID is required');
    }

    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Update an existing AI summary with a user-edited version
   */
  const updateSummary = async (recapId: string, content: string): Promise<Summary> => {
    if (!recapId) {
      throw new Error('Recap ID is required');
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) {
      throw new Error('Summary must be at least 10 characters');
    }
    if (trimmedContent.length > 50000) {
      throw new Error('Summary exceeds maximum length');
    }

    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}/summary`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ content: trimmedContent }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Generate TTS (Text-to-Speech) audio
   */
  const generateTTS = async (request: {
    text: string;
    language?: string;
    recap_id?: string;
  }): Promise<{ audio_url: string; duration_sec: number; format: string }> => {
    const response = await fetch(`${SERVER_URL}/api/tts/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        text: request.text,
        language: request.language || 'en',
        recap_id: request.recap_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  /**
   * Analyze user's recall text against the original summary
   */
  const analyzeRecall = async (request: AnalyzeRecallRequest): Promise<AnalyzeRecallResponse> => {
    const response = await fetch(`${SERVER_URL}/api/analyze/recall`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        summary: request.summary,
        text: request.text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && errorData.message) ||
        (errorData && errorData.error) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  return {
    createRecap,
    uploadDocument,
    startProcessing,
    getRecap,
    getTopics,
    selectTopics,
    generateRecap,
    pollRecapStatus,
    getRecaps,
    updateRecap,
    deleteRecap,
    getFlashcards,
    reviewFlashcard,
    deleteFlashcard,
    getSummary,
    updateSummary,
    generateTTS,
    analyzeRecall,
  };
};
