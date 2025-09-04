declare global {
  interface Window {
    chatwootSDK: {
      run: (config: {
        websiteToken: string;
        baseUrl: string;
      }) => void;
      toggle: (state: 'open' | 'close') => void;
      setUser: (identifier: string, userProperties: Record<string, unknown>) => void;
      setCustomAttributes: (attributes: Record<string, unknown>) => void;
    };
    chatwootSettings: {
      hideMessageBubble?: boolean;
      position?: 'left' | 'right';
      locale?: string;
      type?: 'standard' | 'expanded_bubble';
      launcherTitle?: string;
      showPopoutButton?: boolean;
      darkMode?: 'auto' | 'light' | 'dark';
    };
  }
}

// This export turns the file into a module
export {};
