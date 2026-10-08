export const getInitials = (displayName: string): string => {
  if (!displayName || typeof displayName !== 'string') {
    return 'U';
  }

  const words = displayName.trim().split(/\s+/);

  if (words.length === 0) {
    return 'U';
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};
