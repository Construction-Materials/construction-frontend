'use client';

import { useRouter } from 'next/navigation';
import { AddMaterialsForm } from '@/components/add-materials-form';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { appConfig } from '@/config/app-config';
import { Material } from '@/types';

export default function AddMaterialsPage() {
  const router = useRouter();
  const { materials, setMaterials } = useApp();
  const { t } = useLanguage();

  const uniqueCategories = Array.from(
    new Set([
      ...appConfig.defaultCategories,
      ...materials.map(m => m.category).filter(Boolean)
    ])
  );

  const handleAddMaterials = (newMaterials: Omit<Material, 'id'>[]) => {
    const materialsWithIds = newMaterials.map(material => ({
      ...material,
      id: Date.now().toString() + Math.random().toString()
    }));
    setMaterials([...materials, ...materialsWithIds]);
    router.push('/materials');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/materials')}
          >
            <ArrowLeft className="size-4 mr-2" />
            {t.back}
          </Button>
        </div>
        <AddMaterialsForm
          onAddMaterials={handleAddMaterials}
          existingCategories={uniqueCategories}
        />
      </main>
    </div>
  );
}

