// global.d.ts
interface PaystackPopUpOptions {
  key: string;
  email: string;
  amount: number;
  currency: 'NGN';
  ref: string;
  metadata?: any;
  callback: (response: any) => void;
  onClose: () => void;
}

interface PaystackPopUp {
  setup(options: PaystackPopUpOptions): {
    openIframe: () => void;
  };
}

declare global {
  interface Window {
    PaystackPop: PaystackPopUp;
  }
}

// This export is needed to make the file a module
export {};
