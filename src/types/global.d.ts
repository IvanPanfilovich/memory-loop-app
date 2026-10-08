declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }

  var gtag: (...args: unknown[]) => void;
}

export {};
