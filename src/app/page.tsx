'use client';

import { ConstructionList } from '@/components/construction-list';
import { Header } from '@/components/shared/Header';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { constructions, addConstruction } = useApp();
  const router = useRouter();

  const handleSelectConstruction = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ConstructionList
          constructions={constructions}
          onSelectConstruction={handleSelectConstruction}
          onAddConstruction={addConstruction}
        />
      </main>
    </div>
  );
}

