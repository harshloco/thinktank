declare global {
    interface Window {
      grecaptcha: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
      FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string;
    }
  }
  
  export {};