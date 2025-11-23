'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppProvider } from '@/contexts/AppContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </LanguageProvider>
  );
}

