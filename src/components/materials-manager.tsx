'use client';

import { useState } from 'react';
import { Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
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

interface MaterialsManagerProps {
  materials: Material[];
  onAddMaterial: (material: Omit<Material, 'id'>) => void;
  onUpdateMaterial: (id: string, updates: Partial<Material>) => void;
  onDeleteMaterial: (id: string) => void;
  onGoToAddMaterial: () => void;
}

export function MaterialsManager({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onGoToAddMaterial
}: MaterialsManagerProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    category: '',
    description: ''
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaterialId) {
      onUpdateMaterial(selectedMaterialId, formData);
      setEditDialogOpen(false);
      setSelectedMaterialId(null);
    }
  };

  const openEditDialog = (material: Material) => {
    setFormData({
      name: material.name,
      unit: material.unit,
      category: material.category,
      description: material.description || ''
    });
    setSelectedMaterialId(material.id);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setSelectedMaterialId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedMaterialId) {
      onDeleteMaterial(selectedMaterialId);
      setDeleteDialogOpen(false);
      setSelectedMaterialId(null);
    }
  };

  const categories = Array.from(new Set(materials.map(m => m.category)));

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
            <Button onClick={onGoToAddMaterial}>
              <Plus className="size-4 mr-2" />
              {t.addMaterials}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
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
          ) : (
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
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.category}</Badge>
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-slate-600">
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
                          onClick={() => openDeleteDialog(material.id)}
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
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
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
    </div>
  );
}