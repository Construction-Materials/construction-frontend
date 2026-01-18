'use client';

import { Toaster } from 'sonner';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ReactQueryProvider } from '@/lib/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <LanguageProvider>
        {children}
        <Toaster position="top-right" richColors />
      </LanguageProvider>
    </ReactQueryProvider>
  );
}

