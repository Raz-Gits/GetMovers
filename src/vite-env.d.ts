/// <reference types="vite/client" />

declare function gtag(...args: unknown[]): void;

declare module '*.mov' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

interface Turnstile {
  render: (container: string | HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

interface Window {
  turnstile?: Turnstile;
}
