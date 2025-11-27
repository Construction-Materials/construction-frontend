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

  const { t } = useLanguage();
  const analyzeDocumentMutation = useAnalyzeDocument();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];

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
      // TODO: Dodać toast/alert z błędem
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = () => {
    // Convert manual materials directly to parsed materials without LLM
    const validManualMaterials = manualMaterials.filter(
      row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()
    );

    if (validManualMaterials.length === 0) return;

    const parsed: ParsedMaterial[] = validManualMaterials.map((row, index) => ({
      id: `manual-${Date.now()}-${index}`,
      name: row.name,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      category: row.category,
      description: ''
    }));

    setParsedMaterials(parsed);
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
        return {
          ...m,
          selected_material_id: actualMaterialId,
          unit: selectedMaterial?.unit || m.unit
        };
      }
      return m;
    }));
  };

  const handleDelete = (id: string) => {
    setParsedMaterials(parsedMaterials.filter(m => m.id !== id));
  };

  const handleAddToInventory = () => {
    // First, collect new materials that don't exist yet
    const newMaterials: Material[] = [];
    // TODO: Materials are now managed via API endpoint /api/v1/materials/by-construction/{construction_id}
    // This function needs to be refactored to use API

    parsedMaterials.forEach(pm => {
      // Use selected material if available, otherwise check if material exists by name
      let materialId: string | null = pm.selected_material_id || null;

      if (!materialId) {
        // Check if material already exists in global materials by name
        const existingMaterial = materials.find(m => 
          m.name.toLowerCase() === pm.name.toLowerCase()
        );

        if (existingMaterial) {
          materialId = existingMaterial.material_id;
        } else {
          // Create new material - use first category as default
          materialId = `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          newMaterials.push({
            material_id: materialId,
            category_id: categories[0]?.category_id || '',
            name: pm.name,
            unit: pm.unit,
            description: pm.description || '',
            created_at: new Date().toISOString()
          });
        }
      }

      // TODO: Check if material already exists in construction inventory via API
      // TODO: Add material to construction inventory with quantity
    });

    // TODO: Add new materials via API
    // newMaterials.forEach(material => createMaterial(material));

    // Reset state
    setParsedMaterials([]);
    setSelectedFile(null);
    setManualMaterials([{ name: '', quantity: '', unit: '', category: '' }]);
    setEditingId(null);
    onComplete();
  };

  const handleReset = () => {
    setParsedMaterials([]);
    setSelectedFile(null);
    setManualMaterials([{ name: '', quantity: '', unit: '', category: '' }]);
    setEditingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Delivery Note</CardTitle>
        <CardDescription>
          Wgraj plik PDF/zdjęcie lub wprowadź dane ręcznie. System automatycznie rozpozna materiały.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {parsedMaterials.length === 0 ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="size-4 mr-2" />
                Wgraj plik
              </TabsTrigger>
              <TabsTrigger value="manual">
                <FileText className="size-4 mr-2" />
                Wprowadź ręcznie
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <Upload className="size-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 mb-4">
                  Przeciągnij i upuść plik lub kliknij aby wybrać
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
                    Wybrany plik: {selectedFile.name}
                  </p>
                )}
              </div>
                {(processing || analyzeDocumentMutation.isPending) && (
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Przetwarzanie dokumentu...</span>
                </div>
              )}
              {analyzeDocumentMutation.isError && (
                <div className="text-sm text-red-600 mt-2">
                  Błąd podczas przetwarzania dokumentu. Spróbuj ponownie.
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label>Wprowadź dane z delivery note</Label>
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
                  Dodaj kolejny materiał
                </Button>
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={manualMaterials.every(row => !row.name.trim() || !row.quantity.trim() || !row.unit.trim() || !row.category.trim())}
                className="w-full"
              >
                <CheckCircle2 className="size-4 mr-2" />
                Przejdź do podsumowania ({manualMaterials.filter(row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()).length})
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Rozpoznane materiały ({parsedMaterials.length})</h3>
                <p className="text-sm text-slate-600">
                  Sprawdź i edytuj dane przed dodaniem do magazynu
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Rozpocznij od nowa
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
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleAddToInventory}
                className="flex-1"
                size="lg"
              >
                <Plus className="size-4 mr-2" />
                Dodaj {parsedMaterials.length} materiał(ów) do magazynu
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}