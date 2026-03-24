declare function gtag(...args: unknown[]): void;

export function trackCallClick(source: string) {
  gtag('event', 'call_click', {
    call_source: source,
    lead_cost: 170,
  });
}

export function trackCtaClick(source: string) {
  gtag('event', 'cta_click', {
    cta_source: source,
  });
}
