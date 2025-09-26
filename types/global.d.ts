// types/global.d.ts
export {};

declare global {
  interface Window {
    // Inyectado por <Script src="https://cdn.conekta.io/js/latest/conekta.js">
    Conekta?: {
      setPublicKey: (key?: string) => void;
      Token: {
        create: (
          data: Record<string, unknown>,
          success: (tok: { id: string }) => void,
          failure: (err: { message?: string }) => void
        ) => void;
      };
    };

    // Inyectado por <script src="https://cdn.jsdelivr.net/.../confetti.browser.min.js">
    confetti?: {
      create: (
        canvas: HTMLCanvasElement,
        opts: { resize: boolean; useWorker: boolean }
      ) => (opts: Record<string, unknown>) => void;
    };

    __CON_TOKEN__?: string;
    __CONFETTI_FN__?: (opts: Record<string, unknown>) => void;
    __CONFETTI_CANVAS__?: HTMLCanvasElement;
  }
}