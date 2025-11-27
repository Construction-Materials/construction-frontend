'use client';

import { useState } from 'react';
import { Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Plus, Package, Pencil, Trash2, Tag, Search, ArrowUp, ArrowDown, X, RefreshCw, Filter } from 'lucide-react';
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
import { appConfig } from '@/config/app-config';
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

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.name || "Brak nazwy";
  };

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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCategoriesDialogOpen(true)}>
                <Tag className="size-4 mr-2" />
                {t.editCategories}
              </Button>
              <Button onClick={onGoToAddMaterial}>
                <Plus className="size-4 mr-2" />
                {t.addMaterials}
              </Button>
            </div>
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
              {/* Filtry i wyszukiwanie */}
              <div className="mb-6">
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="w-64">
                    <Label htmlFor="search" className="text-sm text-slate-600 mb-2 block">
                      {t.search}
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="search"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-2"
                      />
                    </div>
                </div>
                <div className="flex w-full justify-between">
                  <div>
                  {/* Filtrowanie po kategoriach */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter className="size-4" />
                          {t.categories}
                          {selectedCategories.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {selectedCategories.length}
                            </Badge>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="start">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">{t.selectCategories}</Label>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {categories.length === 0 ? (
                              <p className="text-sm text-slate-500">{t.noCategories}</p>
                            ) : (
                              categories.map(category => (
                                <div key={category.category_id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`category-${category.category_id}`}
                                    checked={selectedCategories.includes(category.category_id)}
                                    onCheckedChange={() => handleCategoryToggle(category.category_id)}
                                  />
                                  <Label
                                    htmlFor={`category-${category.category_id}`}
                                    className="text-sm font-normal cursor-pointer flex-1"
                                  >
                                    {category.name}
                                  </Label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Filtrowanie po jednostkach */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter className="size-4" />
                          {t.units}
                          {selectedUnits.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {selectedUnits.length}
                            </Badge>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="start">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">{t.selectUnits}</Label>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {appConfig.materialUnits.map(unit => (
                              <div key={unit.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`unit-${unit.value}`}
                                  checked={selectedUnits.includes(unit.value)}
                                  onCheckedChange={() => handleUnitToggle(unit.value)}
                                />
                                <Label
                                  htmlFor={`unit-${unit.value}`}
                                  className="text-sm font-normal cursor-pointer flex-1"
                                >
                                  {unit.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSortToggle}
                      className="gap-2"
                    >
                      {sortOrder === 'asc' && <ArrowUp className="size-4" />}
                      {sortOrder === 'desc' && <ArrowDown className="size-4" />}
                      {sortOrder === null && <ArrowUp className="size-4 opacity-50" />}
                      {t.sortByName}
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="gap-2"
                    >
                      <RefreshCw className="size-4" />
                      {t.refresh}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-2"
                    >
                      <X className="size-4" />
                      {t.resetFilters}
                    </Button>
                  </div>
                </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.materialName}</TableHead>
                    <TableHead>{t.category}</TableHead>
                    <TableHead>{t.unit}</TableHead>
                    <TableHead>{t.description}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        {t.noMaterialsMatching}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedMaterials.map((material) => (
                  <TableRow key={material.material_id}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryName(material.category_id)}</Badge>
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell className="max-w-md">
                      <span className="text-sm text-slate-600 truncate block">
                        {material.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(material)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(material.material_id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">{t.materialName} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-unit">{t.unit} *</Label>
                <Input
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">{t.category} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder={t.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-slate-500">
                        Brak kategorii
                      </div>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.category_id} value={category.category_id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">{t.description}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {t.saveChanges}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                {t.cancel}
              </Button>
            </div>
          </form>
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