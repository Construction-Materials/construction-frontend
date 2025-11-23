'use client';

import { useState } from 'react';
import { Construction, Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Package, Pencil, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MaterialSelect } from './shared/MaterialSelect';
import { EmptyState } from './shared/EmptyState';

interface MaterialsInventoryProps {
  construction: Construction;
  materials: Material[];
  onUpdateConstruction: (id: string, updates: Partial<Construction>) => void;
  onAddMaterial: (material: Material) => void;
  onGoToDeliveryNoteImport: () => void;
}

export function MaterialsInventory({
  construction,
  materials,
  onUpdateConstruction,
  onAddMaterial,
  onGoToDeliveryNoteImport
}: MaterialsInventoryProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: ''
  });

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMaterials = [
      ...construction.materials,
      {
        materialId: formData.materialId,
        quantity: parseFloat(formData.quantity)
      }
    ];
    onUpdateConstruction(construction.id, { materials: updatedMaterials });
    setFormData({ materialId: '', quantity: '' });
    setDialogOpen(false);
  };

  const handleEditMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMaterials = construction.materials.map(m =>
      m.materialId === editingMaterialId
        ? {
            ...m,
            quantity: parseFloat(formData.quantity)
          }
        : m
    );
    onUpdateConstruction(construction.id, { materials: updatedMaterials });
    setEditDialogOpen(false);
    setEditingMaterialId(null);
  };

  const openEditDialog = (materialId: string) => {
    const material = construction.materials.find(m => m.materialId === materialId);
    if (material) {
      setFormData({
        materialId: material.materialId,
        quantity: material.quantity.toString()
      });
      setEditingMaterialId(materialId);
      setEditDialogOpen(true);
    }
  };

  const availableMaterials = materials.filter(
    m => !construction.materials.some(cm => cm.materialId === m.id)
  );

  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.warehouseTitle}</CardTitle>
              <CardDescription>
                {t.warehouseDescription}
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" />
                  {t.addMaterials}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.addMaterialToWarehouse}</DialogTitle>
                  <DialogDescription>
                    {t.selectMaterialDesc}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMaterial} className="space-y-4">
                  <MaterialSelect
                    materials={availableMaterials}
                    value={formData.materialId}
                    onChange={(value) => setFormData({ ...formData, materialId: value })}
                    required
                  />
                  <div>
                    <Label htmlFor="quantity">{t.quantity} *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder={t.quantityToAdd}
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {t.addToWarehouse}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      {t.cancel}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {construction.materials.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t.noMaterials}
              description={t.noMaterialsDesc}
              actionLabel={t.addMaterials}
              onAction={() => setDialogOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.material}</TableHead>
                  <TableHead>{t.category}</TableHead>
                  <TableHead className="text-right">{t.quantity}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {construction.materials.map((cm) => {
                  const material = materials.find(m => m.id === cm.materialId);
                  if (!material) return null;
                  
                  return (
                    <TableRow key={cm.materialId}>
                      <TableCell>
                        <div>
                          <div>{material.name}</div>
                          {material.description && (
                            <div className="text-sm text-slate-500">{material.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell className="text-right">
                        {cm.quantity.toLocaleString(t.locale)} {material.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(cm.materialId)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editWarehouseQuantity}</DialogTitle>
            <DialogDescription>
              {t.updateWarehouseQuantity}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMaterial} className="space-y-4">
            <div>
              <Label htmlFor="edit-quantity">{t.quantity} *</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
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

      <Button
        onClick={onGoToDeliveryNoteImport}
        variant="outline"
        className="flex items-center"
      >
        <Upload className="size-4 mr-2" />
        {t.importDeliveryNote}
      </Button>
    </div>
  );
}