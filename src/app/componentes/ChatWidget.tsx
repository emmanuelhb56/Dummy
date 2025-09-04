'use client';

import { useEffect } from 'react';

interface ChatwootWidgetProps {
  websiteToken?: string;
}

const ChatwootWidget: React.FC<ChatwootWidgetProps> = ({
  websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN
}) => {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined' || !websiteToken) return;

    // Configuración de Chatwoot
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: 'right',
      locale: 'es',
      type: 'expanded_bubble',
      showPopoutButton: true,
      darkMode: 'dark'
    };

    // Cargar el script de Chatwoot si no existe
    if (!document.getElementById('chatwoot-sdk')) {
      const script = document.createElement('script');
      script.id = 'chatwoot-sdk';
      script.src = 'https://app.chatwoot.com/packs/js/sdk.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: websiteToken,
            baseUrl: 'https://app.chatwoot.com'
          });
        }
      };
      
      document.head.appendChild(script);
    } else if (window.chatwootSDK) {
      // Si ya existe, solo inicializar
      window.chatwootSDK.run({
        websiteToken: websiteToken,
        baseUrl: 'https://app.chatwoot.com'
      });
    }

    return () => {
      // Limpieza opcional si es necesario
    };
  }, [websiteToken]);

  return null;
};

export default ChatwootWidget;