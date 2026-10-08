/**
 * Map a webmail domain to that provider's inbox URL, so a "check your email"
 * screen can offer a one-click jump to the right inbox.
 */
export const getProviderLink = (email: string): string | null => {
  const domain = email.split('@').pop()?.toLowerCase() || '';
  const providers: [string, string][] = [
    ['gmail', 'https://mail.google.com'],
    ['yahoo', 'https://mail.yahoo.com'],
    ['outlook', 'https://outlook.live.com'],
    ['hotmail', 'https://outlook.live.com'],
    ['icloud', 'https://www.icloud.com/mail'],
    ['aol', 'https://mail.aol.com'],
    ['protonmail', 'https://mail.protonmail.com'],
    ['zoho', 'https://mail.zoho.com'],
    ['yandex', 'https://mail.yandex.com'],
    ['mail.ru', 'https://mail.ru'],
  ];

  for (const [provider, url] of providers) {
    if (domain.includes(provider)) {
      return url;
    }
  }

  return null;
};
