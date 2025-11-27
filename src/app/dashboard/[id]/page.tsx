'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConstruction, useUpdateConstruction, useDeleteConstruction } from '@/hooks/use-constructions';
import { useMaterials } from '@/hooks/use-materials';
import { Construction } from '@/types';
import { ConstructionEditDialog } from '@/components/construction-edit-dialog';
import { toast } from 'sonner';

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Construction>>({});

  useEffect(() => {
    if (construction) {
      setEditFormData({
        name: construction.name,
        description: construction.description,
        address: construction.address,
        start_date: construction.start_date,
        status: construction.status,
      });
    }
  }, [construction]);

  const handleUpdateConstruction = async (id: string, updates: Partial<Construction>) => {
    await updateMutation.mutateAsync({ id, data: updates });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!construction) return;
    
    try {
      await handleUpdateConstruction(construction.construction_id, editFormData);
      toast.success(t.constructionUpdated);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update construction:', error);
      toast.error(t.constructionUpdateError);
    }
  };

  const handleDeleteConstruction = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t.constructionDeleted);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete construction:', error);
      toast.error(t.constructionDeleteError);
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="size-4 mr-2" />
              {t.edit}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="size-4 mr-2" />
              {t.deleteConstruction}
            </Button>
          </div>
        </div>
        <ConstructionDashboard
          construction={construction}
          materials={materials}
          orders={constructionOrders}
          onUpdateConstruction={handleUpdateConstruction}
          onAddOrder={addOrder}
          onUpdateOrder={updateOrder}
        />

        <ConstructionEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          construction={construction}
          formData={editFormData}
          onFormDataChange={setEditFormData}
          onSubmit={handleEditSubmit}
          isPending={updateMutation.isPending}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteConstructionConfirm}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.deleteConstructionDesc.replace('{name}', construction.name)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConstruction}
                className="bg-red-600 hover:bg-red-700"
              >
                {t.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

