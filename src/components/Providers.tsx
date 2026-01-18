'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { ReactQueryProvider } from '@/lib/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ReactQueryProvider>
  );
}

