//src/types/react-google-recaptcha3.d.ts
declare module 'react-google-recaptcha3' {
  export interface ReCaptcha {
    execute: (action: string) => Promise<string>;
  }

  export interface LoadCaptchaScriptOptions {
    sitekey: string;
    onSuccess: (recaptcha: ReCaptcha) => void;
    onError?: (error: Error) => void;
  }

  export function loadCaptchaScript(options: LoadCaptchaScriptOptions): void;
}