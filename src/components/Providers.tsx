'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppProvider } from '@/contexts/AppContext';
import { ReactQueryProvider } from '@/lib/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <LanguageProvider>
        <AppProvider>
          {children}
        </AppProvider>
      </LanguageProvider>
    </ReactQueryProvider>
  );
}

