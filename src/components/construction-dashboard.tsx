'use client';

import { useState, useEffect } from 'react';
import { Construction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Package, Upload, Pencil } from 'lucide-react';
import { MaterialsInventory } from './materials-inventory';
import { DeliveryNoteImport } from './delivery-note-import';
import { useLanguage } from '../contexts/LanguageContext';
import { StatusBadge } from './shared/StatusBadge';
import { ConstructionInfo } from './shared/ConstructionInfo';
import { useUpdateConstruction } from '@/hooks/use-constructions';
import { appConfig } from '../config/app-config';

interface ConstructionDashboardProps {
  construction: Construction;
  onUpdateConstruction: (id: string, updates: Partial<Construction>) => void;
}

export function ConstructionDashboard({
  construction,
  onUpdateConstruction,
}: ConstructionDashboardProps) {
  const [activeTab, setActiveTab] = useState('inventory');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    startDate: '',
    status: 'planned' as Construction['status']
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const { t } = useLanguage();
  const updateMutation = useUpdateConstruction();

  // Sync form data when construction prop changes
  useEffect(() => {
    if (construction) {
      setFormData({
        name: construction.name || '',
        description: construction.description || '',
        address: construction.address || '',
        startDate: construction.startDate ? construction.startDate.split('T')[0] : '',
        status: construction.status || 'planned'
      });
    }
  }, [construction]);

  const validateForm = () => {
    if (!formData.name.trim()) return 'name';
    if (!formData.description.trim()) return 'description';
    if (!formData.address.trim()) return 'address';
    if (!formData.startDate) return 'startDate';
    if (!formData.status) return 'status';
    return null;
  };

  const openEditDialog = () => {
    setFormData({
      name: construction.name || '',
      description: construction.description || '',
      address: construction.address || '',
      startDate: construction.startDate ? construction.startDate.split('T')[0] : '',
      status: construction.status || 'planned'
    });
    setValidationError(null);
    setEditDialogOpen(true);
  };

  const handleEditDialogChange = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setValidationError(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidField = validateForm();
    if (invalidField) {
      setValidationError(invalidField);
      return;
    }

    setValidationError(null);
    try {
      await updateMutation.mutateAsync({
        id: construction.constructionId,
        data: {
          name: formData.name,
          description: formData.description,
          address: formData.address,
          startDate: formData.startDate,
          status: formData.status as Construction['status']
        }
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update construction:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle>{construction.name}</CardTitle>
                <StatusBadge status={construction.status} type="construction" />
              </div>
              {construction.description && (
                <CardDescription>{construction.description}</CardDescription>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={openEditDialog}>
              <Pencil className="size-4 mr-2" />
              {t.edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ConstructionInfo construction={construction} />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-2 mx-auto">
          <TabsTrigger value="inventory">
            <Package className="size-4 mr-2" />
            {t.warehouse}
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="size-4 mr-2" />
            {t.importDeliveryNote}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <MaterialsInventory
            construction={construction}
            onGoToDeliveryNoteImport={() => setActiveTab('import')}
          />
        </TabsContent>
        <TabsContent value="import" className="mt-6">
          <DeliveryNoteImport
            construction={construction}
            onUpdateConstruction={onUpdateConstruction}
            onComplete={() => setActiveTab('inventory')}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.editConstruction}</DialogTitle>
            <DialogDescription>
              {t.editConstructionDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{t.fillAllRequiredFields}</p>
              </div>
            )}

            <div>
              <Label htmlFor="edit-name">{t.constructionName} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (validationError === 'name') setValidationError(null);
                }}
                className={validationError === 'name' ? 'border-red-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="edit-address">{t.address} *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (validationError === 'address') setValidationError(null);
                }}
                className={validationError === 'address' ? 'border-red-500' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start-date">{t.startDate} *</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    if (validationError === 'startDate') setValidationError(null);
                  }}
                  className={validationError === 'startDate' ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">{t.status} *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    setFormData({ ...formData, status: value as Construction['status'] });
                    if (validationError === 'status') setValidationError(null);
                  }}
                >
                  <SelectTrigger id="edit-status" className={validationError === 'status' ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appConfig.constructionStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {t[status.value as keyof typeof t] || status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">{t.description} *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (validationError === 'description') setValidationError(null);
                }}
                className={validationError === 'description' ? 'border-red-500' : ''}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t.saving : t.saveChanges}
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
    </div>
  );
}