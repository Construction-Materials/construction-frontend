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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Package, Pencil, Trash2, Tag } from 'lucide-react';
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
import { TablePagination, usePagination } from './shared/TablePagination';
import { appConfig } from '../config/app-config';

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
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaterialId) {
      try {
        await updateMutation.mutateAsync({
          id: selectedMaterialId,
          data: {
            name: formData.name,
            unit: formData.unit,
            category_id: formData.category,
            description: formData.description || ''
          }
        });
        setEditDialogOpen(false);
        setSelectedMaterialId(null);
        setFormData({ name: '', unit: '', category: '', description: '' });
      } catch (error) {
        console.error('Failed to update material:', error);
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
        await deleteMutation.mutateAsync(selectedMaterialId);
        setDeleteDialogOpen(false);
        setSelectedMaterialId(null);
      } catch (error) {
        console.error('Failed to delete material:', error);
      }
    }
  };

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];
  const { t } = useLanguage();
  const pagination = usePagination(10);

  // Paginate materials
  const paginatedMaterials = pagination.paginateItems(materials);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.name || t.noName;
  };

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
              <p className="text-slate-600">{t.loadingMaterials}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{t.errorLoadingMaterials}: {error.message}</p>
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
                  {paginatedMaterials.map((material) => (
                    <TableRow key={material.material_id}>
                      <TableCell className="max-w-[200px] truncate" title={material.name}>{material.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(material.category_id)}</Badge>
                      </TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <span className="text-sm text-slate-600" title={material.description || ''}>
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
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                currentPage={pagination.currentPage}
                totalItems={materials.length}
                pageSize={pagination.pageSize}
                onPageChange={pagination.handlePageChange}
                onPageSizeChange={pagination.handlePageSizeChange}
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
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  required
                >
                  <SelectTrigger id="edit-unit">
                    <SelectValue placeholder={t.selectUnit} />
                  </SelectTrigger>
                  <SelectContent>
                    {appConfig.materialUnits.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        {t.noCategories}
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
            <DialogTitle>{t.manageCategories}</DialogTitle>
            <DialogDescription>
              {t.manageCategoriesDesc}
            </DialogDescription>
          </DialogHeader>
          <CategoriesManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}