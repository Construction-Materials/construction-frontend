'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConstructionDashboard } from '@/components/construction-dashboard';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConstruction, useUpdateConstruction, useDeleteConstruction } from '@/hooks/use-constructions';
import { useMaterials } from '@/hooks/use-materials';

export default function DashboardPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { orders, addOrder, updateOrder } = useApp();
  const { data: materialsData } = useMaterials();
  const materials = materialsData?.materials || [];
  const { t } = useLanguage();
  const { data: construction, isLoading, error } = useConstruction(id);
  const updateMutation = useUpdateConstruction();
  const deleteMutation = useDeleteConstruction();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUpdateConstruction = async (id: string, updates: Partial<import('@/types').Construction>) => {
    await updateMutation.mutateAsync({ id, data: updates });
  };

  const handleDeleteConstruction = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete construction:', error);
    }
  };

  const constructionOrders = orders.filter(o => o.constructionId === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p>Ładowanie...</p>
        </main>
      </div>
    );
  }

  if (error || !construction) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p>Konstrukcja nie znaleziona</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="size-4 mr-2" />
            {t.back}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Usuń konstrukcję
          </Button>
        </div>
        <ConstructionDashboard
          construction={construction}
          materials={materials}
          orders={constructionOrders}
          onUpdateConstruction={handleUpdateConstruction}
          onAddOrder={addOrder}
          onUpdateOrder={updateOrder}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć konstrukcję?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta operacja jest nieodwracalna. Wszystkie dane związane z konstrukcją "{construction.name}" zostaną trwale usunięte.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConstruction}
                className="bg-red-600 hover:bg-red-700"
              >
                Usuń
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

