/// <reference types="react-scripts" />

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeAllListeners: (event: string) => void;
    } & any;
  }
}