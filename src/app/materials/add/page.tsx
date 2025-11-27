'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AddMaterialsForm } from '@/components/add-materials-form';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/use-categories';
import { createMaterialsBulk } from '@/lib/api/materials';
import { toast } from 'sonner';

export default function AddMaterialsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];
  const [isPending, startTransition] = useTransition();

  const handleAddMaterials = (newMaterials: Array<{ name: string; unit: string; category: string; description: string }>) => {
    if (newMaterials.length === 0) {
      return;
    }

    startTransition(async () => {
      try {
        // Mapowanie danych z formularza na format API
        const materialsData = newMaterials.map(material => ({
          name: material.name,
          unit: material.unit,
          category_id: material.category,
          description: material.description || '',
        }));

        await createMaterialsBulk(materialsData);
        toast.success(`Pomyślnie dodano ${newMaterials.length} materiałów`);
        router.push('/materials');
      } catch (error) {
        console.error('Błąd podczas dodawania materiałów:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Nie udało się dodać materiałów. Spróbuj ponownie.';
        toast.error(errorMessage);
      }
    });
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
          isLoading={isPending}
        />
      </main>
    </div>
  );
}

