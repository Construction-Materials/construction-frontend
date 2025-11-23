'use client';

import { useRouter } from 'next/navigation';
import { AddMaterialsForm } from '@/components/add-materials-form';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/use-categories';
import { Category } from '@/types';

export default function AddMaterialsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];

  const handleAddMaterials = (newMaterials: Array<{ name: string; unit: string; category: string; description: string }>) => {
    // TODO: Implement via API - createMaterial
    console.log('Add materials:', newMaterials);
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
          categories={categories}
        />
      </main>
    </div>
  );
}

