'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppProvider } from '@/contexts/AppContext';
import { ReactQueryProvider } from '@/lib/react-query';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <LanguageProvider>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </LanguageProvider>
    </ReactQueryProvider>
  );
}

