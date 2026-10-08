import { useState, useEffect } from 'react';
import { detectUserCountry, type CountryDetectionResult } from '@/services/countryDetection';

interface UseCountryDetectionReturn {
  country: string;
  countryCode: string;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useCountryDetection = (): UseCountryDetectionReturn => {
  const [country, setCountry] = useState<string>('undefined');
  const [countryCode, setCountryCode] = useState<string>('undefined');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const detectCountry = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result: CountryDetectionResult = await detectUserCountry();

      if (result.success && result.country) {
        setCountry(result.country);
        setCountryCode(result.countryCode || 'undefined');
      } else {
        setCountry('undefined');
        setCountryCode('undefined');
        setError(result.error || 'Country detection failed');
      }
    } catch (err) {
      console.error('Country detection hook error:', err);
      setCountry('undefined');
      setCountryCode('undefined');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    detectCountry();
  };

  useEffect(() => {
    detectCountry();
  }, []);

  return {
    country,
    countryCode,
    isLoading,
    error,
    retry,
  };
};
