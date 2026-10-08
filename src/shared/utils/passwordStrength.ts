export interface PasswordStrength {
  percentage: number;
  strength: 'weak' | 'medium' | 'strong';
  colorClass: string;
}

/**
 * Rough, purely presentational strength meter: 10% per character, capped at
 * 100%, bucketed into weak / medium / strong with a matching Tailwind colour.
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const percentage = Math.min(password.length * 10, 100);
  const strength = percentage < 30 ? 'weak' : percentage < 70 ? 'medium' : 'strong';
  const colorClass =
    percentage < 30 ? 'text-red-500' : percentage < 70 ? 'text-yellow-500' : 'text-green-500';

  return { percentage, strength, colorClass };
};
