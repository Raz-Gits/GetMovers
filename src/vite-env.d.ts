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
