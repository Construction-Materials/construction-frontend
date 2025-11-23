'use client';

import { useRouter } from 'next/navigation';
import { MaterialsManager } from '@/components/materials-manager';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MaterialsPage() {
  const router = useRouter();
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useApp();
  const { t } = useLanguage();

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
          materials={materials}
          onAddMaterial={addMaterial}
          onUpdateMaterial={updateMaterial}
          onDeleteMaterial={deleteMaterial}
          onGoToAddMaterial={handleGoToAddMaterial}
        />
      </main>
    </div>
  );
}

