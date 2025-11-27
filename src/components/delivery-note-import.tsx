'use client';

import { useState } from 'react';
import { Construction, Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DeliveryNoteMaterialsTable } from './delivery-note-materials-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, FileText, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { appConfig } from '../config/app-config';
import { useLanguage } from '../contexts/LanguageContext';
import { useCategories } from '@/hooks/use-categories';
import { useAnalyzeDocument } from '@/hooks/use-constructions';
import { useCreateStorageItemsBulk } from '@/hooks/use-storage-items';
import { toast } from 'sonner';

interface DeliveryNoteImportProps {
  construction: Construction;
  materials: Material[];
  onUpdateConstruction: (id: string, updates: Partial<Construction>) => void;
  onComplete: () => void;
}

interface ParsedMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  description?: string;
  material_id?: string | null;
  material_exists?: boolean;
  selected_material_id?: string | null;
  suggested_materials?: Array<{
    material_id: string;
    name: string;
    unit: string;
    description: string;
    similarity_score: number;
  }>;
}

interface ManualMaterialRow {
  name: string;
  quantity: string;
  unit: string;
  category: string;
}

export function DeliveryNoteImport({
  construction,
  materials,
  onUpdateConstruction,
  onComplete
}: DeliveryNoteImportProps) {
  const [processing, setProcessing] = useState(false);
  const [parsedMaterials, setParsedMaterials] = useState<ParsedMaterial[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    quantity: '',
    unit: '',
    selected_material_id: ''
  });
  const [manualMaterials, setManualMaterials] = useState<ManualMaterialRow[]>([
    { name: '', quantity: '', unit: '', category: '' }
  ]);
  const [errorMaterialIds, setErrorMaterialIds] = useState<Set<string>>(new Set());

  const { t } = useLanguage();
  const analyzeDocumentMutation = useAnalyzeDocument();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];
  const createStorageItemsBulkMutation = useCreateStorageItemsBulk();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setProcessing(true);

    try {
      const response = await analyzeDocumentMutation.mutateAsync({
        constructionId: construction.construction_id,
        file: file,
      });

      // Mapowanie odpowiedzi z API na format ParsedMaterial
      const parsed: ParsedMaterial[] = response.extracted_data.materials.map((material, index) => {
        // Jeśli materiał istnieje, użyj jego material_id
        // W przeciwnym razie wybierz materiał z najwyższym similarity_score
        let selectedMaterialId: string | null = null;
        
        if (material.material_exists && material.material_id) {
          selectedMaterialId = material.material_id;
        } else if (material.suggested_materials && material.suggested_materials.length > 0) {
          // Sortuj po similarity_score i wybierz najwyższy
          const sorted = [...material.suggested_materials].sort((a, b) => b.similarity_score - a.similarity_score);
          selectedMaterialId = sorted[0].material_id;
        }

        return {
          id: `parsed-${Date.now()}-${index}`,
          name: material.name,
          quantity: material.quantity,
          unit: material.unit,
          description: '',
          material_id: material.material_id,
          material_exists: material.material_exists,
          selected_material_id: selectedMaterialId,
          suggested_materials: material.suggested_materials,
        };
      });

      setParsedMaterials(parsed);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(t.errorProcessingDocument);
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = async () => {
    // Filtruj tylko poprawne materiały
    const validManualMaterials = manualMaterials.filter(
      row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()
    );

    if (validManualMaterials.length === 0) {
      toast.error(t.errorNoMaterialsToAdd);
      return;
    }

    // Znajdź material_id dla każdego materiału na podstawie nazwy
    const materialsToAdd = validManualMaterials
      .map(row => {
        const material = materials.find(m => m.name === row.name);
        if (!material) return null;
        
        return {
          construction_id: construction.construction_id,
          material_id: material.material_id,
          quantity_value: parseFloat(row.quantity)
        };
      })
      .filter((item): item is { construction_id: string; material_id: string; quantity_value: number } => item !== null);

    if (materialsToAdd.length === 0) {
      toast.error(t.errorMaterialsNotFound);
      return;
    }

    try {
      await createStorageItemsBulkMutation.mutateAsync({
        constructionId: construction.construction_id,
        items: materialsToAdd
      });

      // Reset state po sukcesie
      setManualMaterials([{ name: '', quantity: '', unit: '', category: '' }]);
      toast.success(t.materialsAddedSuccess);
      onComplete();
    } catch (error) {
      console.error('Error adding materials to inventory:', error);
      toast.error(t.errorSavingMaterials);
    }
  };

  const handleEdit = (material: ParsedMaterial) => {
    setEditingId(material.id);
    setEditForm({
      name: material.name,
      quantity: material.quantity.toString(),
      unit: material.unit,
      selected_material_id: material.selected_material_id || ''
    });
  };

  const handleSaveEdit = () => {
    setParsedMaterials(parsedMaterials.map(m => {
      if (m.id === editingId) {
        const selectedMaterial = materials.find(mat => mat.material_id === editForm.selected_material_id);
        return {
          ...m,
          name: editForm.name,
          quantity: parseFloat(editForm.quantity),
          unit: selectedMaterial?.unit || m.unit,
          selected_material_id: editForm.selected_material_id || null
        };
      }
      return m;
    }));
    setEditingId(null);
  };

  const handleMaterialSelect = (materialId: string, parsedMaterialId: string) => {
    setParsedMaterials(parsedMaterials.map(m => {
      if (m.id === parsedMaterialId) {
        // Jeśli wybrano "brak-materialu", ustaw na null
        const actualMaterialId = materialId === 'brak-materialu' ? null : materialId;
        const selectedMaterial = actualMaterialId ? materials.find(mat => mat.material_id === actualMaterialId) : null;
        const updatedMaterial = {
          ...m,
          selected_material_id: actualMaterialId,
          unit: selectedMaterial?.unit || m.unit
        };
        
        // Usuń błąd jeśli materiał został dopasowany
        if (actualMaterialId && errorMaterialIds.has(parsedMaterialId)) {
          const newErrorIds = new Set(errorMaterialIds);
          newErrorIds.delete(parsedMaterialId);
          setErrorMaterialIds(newErrorIds);
        }
        
        return updatedMaterial;
      }
      return m;
    }));
  };

  const handleDelete = (id: string) => {
    setParsedMaterials(parsedMaterials.filter(m => m.id !== id));
  };

  const handleAddToInventory = async () => {
    // Sprawdź, czy wszystkie materiały mają dopasowanie
    const materialsWithoutMatch = parsedMaterials.filter(
      pm => !pm.selected_material_id
    );

    if (materialsWithoutMatch.length > 0) {
      // Podświetl wiersze z błędami
      const errorIds = new Set(materialsWithoutMatch.map(m => m.id));
      setErrorMaterialIds(errorIds);
      
      // Wyświetl toast error
      toast.error(t.errorNoMatchMaterials);
      return;
    }

    // Wyczyść błędy jeśli wszystkie materiały mają dopasowanie
    setErrorMaterialIds(new Set());

    // Filtruj tylko materiały z wybranym material_id
    const materialsToAdd = parsedMaterials
      .filter(pm => pm.selected_material_id !== null && pm.selected_material_id !== undefined)
      .map(pm => ({
        construction_id: construction.construction_id,
        material_id: pm.selected_material_id!,
        quantity_value: pm.quantity
      }));

    if (materialsToAdd.length === 0) {
      toast.error(t.errorNoMaterialsToAdd);
      return;
    }

    try {
      await createStorageItemsBulkMutation.mutateAsync({
        constructionId: construction.construction_id,
        items: materialsToAdd
      });

      // Reset state po sukcesie
      setParsedMaterials([]);
      setSelectedFile(null);
      setManualMaterials([{ name: '', quantity: '', unit: '', category: '' }]);
      setEditingId(null);
      setErrorMaterialIds(new Set());
      toast.success(t.materialsAddedSuccess);
      onComplete();
    } catch (error) {
      console.error('Error adding materials to inventory:', error);
      toast.error(t.errorAddingMaterials);
    }
  };

  const handleReset = () => {
    setParsedMaterials([]);
    setSelectedFile(null);
    setManualMaterials([{ name: '', quantity: '', unit: '', category: '' }]);
    setEditingId(null);
    setErrorMaterialIds(new Set());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.deliveryNoteImport}</CardTitle>
        <CardDescription>
          {t.deliveryNoteImportDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {parsedMaterials.length === 0 ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="size-4 mr-2" />
                {t.uploadFile}
              </TabsTrigger>
              <TabsTrigger value="manual">
                <FileText className="size-4 mr-2" />
                {t.enterManually}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <Upload className="size-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 mb-4">
                  {t.dragAndDropFile}
                </p>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                  disabled={processing || analyzeDocumentMutation.isPending}
                />
                {selectedFile && (
                  <p className="text-sm text-slate-600 mt-4">
                    {t.selectedFile}: {selectedFile.name}
                  </p>
                )}
              </div>
                {(processing || analyzeDocumentMutation.isPending) && (
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <Loader2 className="size-5 animate-spin" />
                  <span>{t.processingDocument}</span>
                </div>
              )}
              {analyzeDocumentMutation.isError && (
                <div className="text-sm text-red-600 mt-2">
                  {t.errorProcessingDocument}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label>{t.enterDeliveryNoteData}</Label>
                <div className="border rounded-lg">
                  <DeliveryNoteMaterialsTable
                    mode="manual"
                    manualMaterials={manualMaterials}
                    onManualMaterialChange={(index, field, value) => {
                      const newRows = [...manualMaterials];
                      newRows[index][field] = value;
                      setManualMaterials(newRows);
                    }}
                    onManualMaterialDelete={(index) => {
                      const newRows = [...manualMaterials];
                      newRows.splice(index, 1);
                      setManualMaterials(newRows);
                    }}
                    materials={materials}
                    categories={categories}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newRows = [...manualMaterials];
                    newRows.push({ name: '', quantity: '', unit: '', category: '' });
                    setManualMaterials(newRows);
                  }}
                  className="w-full"
                >
                  <Plus className="size-4 mr-2" />
                  {t.addAnotherMaterial}
                </Button>
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={
                  createStorageItemsBulkMutation.isPending ||
                  manualMaterials.every(row => !row.name.trim() || !row.quantity.trim() || !row.unit.trim() || !row.category.trim())
                }
                className="w-full"
              >
                {createStorageItemsBulkMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    {t.saveMaterials} ({manualMaterials.filter(row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()).length})
                  </>
                )}
              </Button>
              {createStorageItemsBulkMutation.isError && (
                <div className="text-sm text-red-600 mt-2">
                  {t.errorSavingMaterials}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t.reviewMaterials} ({parsedMaterials.length})</h3>
                <p className="text-sm text-slate-600">
                  {t.reviewMaterialsDesc}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                {t.startOver}
              </Button>
            </div>

            <div className="border rounded-lg">
              <DeliveryNoteMaterialsTable
                mode="parsed"
                parsedMaterials={parsedMaterials}
                editingId={editingId}
                editForm={editForm}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditingId(null)}
                onEditFormChange={(field, value) => {
                  setEditForm(prev => ({ ...prev, [field]: value }));
                }}
                onMaterialSelect={handleMaterialSelect}
                onDelete={handleDelete}
                materials={materials}
                errorMaterialIds={errorMaterialIds}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleAddToInventory}
                className="flex-1"
                size="lg"
                disabled={createStorageItemsBulkMutation.isPending || parsedMaterials.filter(pm => pm.selected_material_id).length === 0}
              >
                {createStorageItemsBulkMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {t.adding}
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    {t.addMaterialsToWarehouse} {parsedMaterials.filter(pm => pm.selected_material_id).length} {t.material}(ów) {t.addToWarehouse}
                  </>
                )}
              </Button>
            </div>
            {createStorageItemsBulkMutation.isError && (
              <div className="text-sm text-red-600 mt-2">
                {t.errorAddingMaterials}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}