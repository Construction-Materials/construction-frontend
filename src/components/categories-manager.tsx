'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories';
import { useLanguage } from '../contexts/LanguageContext';

export function CategoriesManager() {
  const { data, isLoading, error } = useCategories();
  const categories = data?.categories || [];
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleOpenDialog = (categoryId?: string) => {
    if (categoryId) {
      const category = categories.find(c => c.category_id === categoryId);
      if (category) {
        setFormData({ name: category.name });
        setEditingCategoryId(categoryId);
      }
    } else {
      setFormData({ name: '' });
      setEditingCategoryId(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategoryId(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await updateMutation.mutateAsync({
          id: editingCategoryId,
          data: { name: formData.name }
        });
      } else {
        await createMutation.mutateAsync({ name: formData.name });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async () => {
    if (editingCategoryId) {
      try {
        await deleteMutation.mutateAsync(editingCategoryId);
        setDeleteDialogOpen(false);
        setEditingCategoryId(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const openDeleteDialog = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setDeleteDialogOpen(true);
  };

  const { t } = useLanguage();

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="size-4 mr-2" />
            Dodaj kategorię
          </Button>
        </div>
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-600">Ładowanie kategorii...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Błąd podczas ładowania kategorii: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">Brak kategorii</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="size-4 mr-2" />
                Dodaj pierwszą kategorię
              </Button>
            </div>
          )}

          {!isLoading && !error && categories.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa kategorii</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.category_id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(category.category_id)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(category.category_id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? 'Edytuj kategorię' : 'Dodaj kategorię'}
            </DialogTitle>
            <DialogDescription>
              {editingCategoryId
                ? 'Zaktualizuj nazwę kategorii'
                : 'Wprowadź nazwę nowej kategorii'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nazwa kategorii *</Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="np. Materiały podstawowe"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCategoryId ? 'Zapisz zmiany' : 'Dodaj kategorię'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Anuluj
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć kategorię?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Wszystkie materiały przypisane do tej kategorii mogą zostać bez kategorii.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingCategoryId(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

