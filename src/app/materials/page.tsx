'use client';

import { useRouter } from 'next/navigation';
import { MaterialsManager } from '@/components/materials-manager';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMaterials } from '@/hooks/use-materials';

export default function MaterialsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data, isLoading, error } = useMaterials();

  const handleGoToAddMaterial = () => {
    router.push('/materials/add');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="size-4 mr-2" />
            {t.back}
          </Button>
        </div>
        <MaterialsManager
          materials={data || []}
          isLoading={isLoading}
          error={error}
          onGoToAddMaterial={handleGoToAddMaterial}
        />
      </main>
    </div>
  );
}

