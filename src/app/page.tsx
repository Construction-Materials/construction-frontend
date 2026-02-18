'use client';

import { ConstructionList } from '@/components/construction-list';
import { Header } from '@/components/shared/Header';
import { useRouter } from 'next/navigation';
import { useConstructions, useCreateConstruction } from '@/hooks/use-constructions';

export default function HomePage() {
  const router = useRouter();
  const { data, isLoading, error } = useConstructions();
  const createMutation = useCreateConstruction();

  const handleSelectConstruction = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  const handleAddConstruction = async (construction: import('@/lib/api/constructions').CreateConstructionInput) => {
    await createMutation.mutateAsync(construction);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ConstructionList
          constructions={data || []}
          isLoading={isLoading}
          error={error}
          onSelectConstruction={handleSelectConstruction}
          onAddConstruction={handleAddConstruction}
        />
      </main>
    </div>
  );
}

