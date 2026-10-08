import { showToast } from '@/shared/utils/notificationUtils';

/**
 * Handles fetch errors and displays user-friendly toast notifications
 */
export const handleFetchError = (error: unknown, context?: string): void => {
  console.error('Fetch error:', error, context);

  let errorMessage = 'An error occurred. Please try again.';

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    errorMessage =
      'Unable to connect to the server. Please check your internet connection and try again.';
  } else if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else {
      // Use the error message if it's user-friendly
      errorMessage = error.message;
    }
  }

  showToast(errorMessage, 'error');
};
