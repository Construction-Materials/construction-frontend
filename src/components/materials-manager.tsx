'use client';

import { useState } from 'react';
import { Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Package } from 'lucide-react';
import { MaterialsCatalogTable } from './materials/catalog-table';
import { MaterialsFilters } from './materials/filters';
import { MaterialsHeaderActions } from './materials/header-actions';
import { MaterialEditForm } from './materials/edit-form';
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
import { useLanguage } from '../contexts/LanguageContext';
import { useCategories } from '@/hooks/use-categories';
import { useUpdateMaterial, useDeleteMaterial } from '@/hooks/use-materials';
import { CategoriesManager } from './categories-manager';
import { useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/hooks/use-materials';

interface MaterialsManagerProps {
  materials: Material[];
  isLoading?: boolean;
  error?: Error | null;
  onGoToAddMaterial: () => void;
}

export function MaterialsManager({
  materials,
  isLoading = false,
  error,
  onGoToAddMaterial
}: MaterialsManagerProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    category: '',
    description: ''
  });

  // Filtrowanie i sortowanie
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaterialId) {
      try {
        await updateMaterialMutation.mutateAsync({
          id: selectedMaterialId,
          data: {
            name: formData.name,
            unit: formData.unit,
            category_id: formData.category,
            description: formData.description,
          },
        });
        setEditDialogOpen(false);
        setSelectedMaterialId(null);
        setFormData({ name: '', unit: '', category: '', description: '' });
      } catch (error) {
        console.error('Błąd podczas aktualizacji materiału:', error);
        // Można dodać toast notification tutaj
      }
    }
  };

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const openEditDialog = (material: Material) => {
    setFormData({
      name: material.name,
      unit: material.unit,
      category: material.category_id,
      description: material.description || ''
    });
    setSelectedMaterialId(material.material_id);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setSelectedMaterialId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedMaterialId) {
      try {
        await deleteMaterialMutation.mutateAsync(selectedMaterialId);
        setDeleteDialogOpen(false);
        setSelectedMaterialId(null);
      } catch (error) {
        console.error('Błąd podczas usuwania materiału:', error);
        // Można dodać toast notification tutaj
      }
    }
  };

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];
  const updateMaterialMutation = useUpdateMaterial();
  const deleteMaterialMutation = useDeleteMaterial();
  const queryClient = useQueryClient();

  // Filtrowanie i sortowanie materiałów
  const filteredAndSortedMaterials = materials
    .filter(material => {
      // Filtrowanie po wyszukiwaniu
      if (searchQuery && !material.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Filtrowanie po kategoriach
      if (selectedCategories.length > 0 && !selectedCategories.includes(material.category_id)) {
        return false;
      }
      // Filtrowanie po jednostkach
      if (selectedUnits.length > 0 && !selectedUnits.includes(material.unit)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === null) return 0;
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleUnitToggle = (unit: string) => {
    setSelectedUnits(prev =>
      prev.includes(unit)
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  };

  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedUnits([]);
    setSortOrder(null);
  };

  const handleRefresh = () => {
    queryClient.refetchQueries({ queryKey: materialKeys.all });
  };

  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.materialsCatalog}</CardTitle>
              <CardDescription>
                {t.manageMaterialsDesc}
              </CardDescription>
            </div>
            <MaterialsHeaderActions
              onAddMaterial={onGoToAddMaterial}
              onEditCategories={() => setCategoriesDialogOpen(true)}
              translations={{
                editCategories: t.editCategories,
                addMaterials: t.addMaterials,
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-600">Ładowanie materiałów...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Błąd podczas ładowania materiałów: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && materials.length === 0 && (
            <div className="text-center py-12">
              <Package className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                {t.noMaterials}
              </p>
              <Button onClick={onGoToAddMaterial}>
                <Plus className="size-4 mr-2" />
                {t.addMaterials}
              </Button>
            </div>
          )}

          {!isLoading && !error && materials.length > 0 && (
            <>
              <MaterialsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                selectedUnits={selectedUnits}
                onUnitToggle={handleUnitToggle}
                sortOrder={sortOrder}
                onSortToggle={handleSortToggle}
                onRefresh={handleRefresh}
                onResetFilters={clearFilters}
                translations={{
                  search: t.search,
                  searchPlaceholder: t.searchPlaceholder,
                  categories: t.categories,
                  selectCategories: t.selectCategories,
                  noCategories: t.noCategories,
                  units: t.units,
                  selectUnits: t.selectUnits,
                  sortByName: t.sortByName,
                  refresh: t.refresh,
                  resetFilters: t.resetFilters,
                }}
              />

              <MaterialsCatalogTable
                materials={filteredAndSortedMaterials}
                categories={categories}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                translations={{
                  materialName: t.materialName,
                  category: t.category,
                  unit: t.unit,
                  description: t.description,
                  actions: t.actions,
                  noMaterialsMatching: t.noMaterialsMatching,
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editMaterial}</DialogTitle>
            <DialogDescription>
              {t.updateMaterialInfo}
            </DialogDescription>
          </DialogHeader>
          <MaterialEditForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            categories={categories}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditDialogOpen(false)}
            translations={{
              materialName: t.materialName,
              unit: t.unit,
              category: t.category,
              description: t.description,
              selectCategory: t.selectCategory,
              saveChanges: t.saveChanges,
              cancel: t.cancel,
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={categoriesDialogOpen} onOpenChange={setCategoriesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Zarządzanie kategoriami</DialogTitle>
            <DialogDescription>
              Dodaj, edytuj lub usuń kategorie materiałów
            </DialogDescription>
          </DialogHeader>
          <CategoriesManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}