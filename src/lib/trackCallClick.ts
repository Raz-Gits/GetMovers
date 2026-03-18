declare function gtag(...args: unknown[]): void;

export function trackCallClick(source: string) {
  gtag('event', 'call_click', {
    call_source: source,
    phone_number: '2405990097',
  });
}

export function trackCtaClick(source: string) {
  gtag('event', 'cta_click', {
    cta_source: source,
  });
}
