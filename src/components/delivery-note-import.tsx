'use client';

import { useState } from 'react';
import { Construction, Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Upload, FileText, Plus, Pencil, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { appConfig } from '../config/app-config';
import { useLanguage } from '../contexts/LanguageContext';
import { useCategories } from '@/hooks/use-categories';

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
  category: string;
  description?: string;
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
    category: ''
  });
  const [manualMaterials, setManualMaterials] = useState<ManualMaterialRow[]>([
    { name: '', quantity: '', unit: '', category: '' }
  ]);

  const { t } = useLanguage();

  // Mock LLM function to simulate parsing delivery note
  const mockLLMParse = async (text: string): Promise<ParsedMaterial[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock parsing logic - in real app this would be LLM API call
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: ParsedMaterial[] = [];

    // Simple pattern matching for demo purposes
    lines.forEach((line, index) => {
      const quantityMatch = line.match(/(\d+[,.]?\d*)\s*(szt\.|kg|t|m²|m³|m|l|opak\.|worek|paleta)/i);
      if (quantityMatch) {
        const quantity = parseFloat(quantityMatch[1].replace(',', '.'));
        const unit = quantityMatch[2];
        const name = line.replace(quantityMatch[0], '').trim().split(/\s{2,}/)[0] || `Materiał ${index + 1}`;
        
        parsed.push({
          id: `parsed-${Date.now()}-${index}`,
          name: name,
          quantity: quantity,
          unit: unit,
          category: 'Materiały podstawowe',
          description: ''
        });
      }
    });

    return parsed.length > 0 ? parsed : [
      {
        id: `parsed-${Date.now()}-1`,
        name: 'Przykładowy materiał 1',
        quantity: 100,
        unit: 'szt.',
        category: 'Materiały podstawowe',
        description: ''
      }
    ];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setProcessing(true);

    try {
      // In real app, this would extract text from PDF/image using OCR
      // For demo, we'll use mock text
      const mockText = `
        Cement portlandzki 500 kg
        Cegła ceramiczna 2000 szt.
        Piasek 5 t
        Styropian 50 m²
        Rury PCV 100 m
      `;
      
      const parsed = await mockLLMParse(mockText);
      setParsedMaterials(parsed);
    } catch (error) {
      console.error('Error processing file:', error);
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
      category: material.category
    });
  };

  const handleSaveEdit = () => {
    setParsedMaterials(parsedMaterials.map(m =>
      m.id === editingId
        ? {
            ...m,
            name: editForm.name,
            quantity: parseFloat(editForm.quantity),
            unit: editForm.unit,
            category: editForm.category
          }
        : m
    ));
    setEditingId(null);
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
      // Check if material already exists in global materials
      let existingMaterial = materials.find(m => 
        m.name.toLowerCase() === pm.name.toLowerCase()
      );

      let materialId: string;

      if (!existingMaterial) {
        // Create new material
        materialId = `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newMaterials.push({
          material_id: materialId,
          category_id: pm.category, // W przyszłości może być mapowanie na category_id
          name: pm.name,
          unit: pm.unit,
          description: pm.description || '',
          created_at: new Date().toISOString()
        });
      } else {
        materialId = existingMaterial.material_id;
      }

      // TODO: Check if material already exists in construction inventory via API
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

  // TODO: Get categories from API instead of materials
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];

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
                  disabled={processing}
                />
                {selectedFile && (
                  <p className="text-sm text-slate-600 mt-4">
                    Wybrany plik: {selectedFile.name}
                  </p>
                )}
              </div>
              {processing && (
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Przetwarzanie dokumentu...</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label>Wprowadź dane z delivery note</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Nazwa materiału</TableHead>
                        <TableHead className="w-[120px]">Ilość</TableHead>
                        <TableHead className="w-[120px]">Jednostka</TableHead>
                        <TableHead className="w-[200px]">Kategoria</TableHead>
                        <TableHead className="w-[150px] text-right">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualMaterials.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={row.name}
                              onValueChange={(value) => {
                                const newRows = [...manualMaterials];
                                newRows[index].name = value;
                                // Auto-fill unit and category if material exists
                                const selectedMaterial = materials.find(m => m.name === value);
                                if (selectedMaterial) {
                                  newRows[index].unit = selectedMaterial.unit;
                                  newRows[index].category = selectedMaterial.category_id;
                                }
                                setManualMaterials(newRows);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz materiał" />
                              </SelectTrigger>
                              <SelectContent>
                                {materials.map(material => (
                                  <SelectItem key={material.material_id} value={material.name}>
                                    {material.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={row.quantity}
                              onChange={(e) => {
                                const newRows = [...manualMaterials];
                                newRows[index].quantity = e.target.value;
                                setManualMaterials(newRows);
                              }}
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.unit}
                              disabled
                              placeholder="Auto"
                              className="bg-slate-50"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.category}
                              onValueChange={(value) => {
                                const newRows = [...manualMaterials];
                                newRows[index].category = value;
                                setManualMaterials(newRows);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz" />
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
                          </TableCell>
                          <TableCell className="text-right">
                            {manualMaterials.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const newRows = [...manualMaterials];
                                  newRows.splice(index, 1);
                                  setManualMaterials(newRows);
                                }}
                              >
                                <Trash2 className="size-4 text-red-600" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Nazwa materiału</TableHead>
                    <TableHead className="w-[120px]">Ilość</TableHead>
                    <TableHead className="w-[120px]">Jednostka</TableHead>
                    <TableHead className="w-[200px]">Kategoria</TableHead>
                    <TableHead className="w-[150px] text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedMaterials.map((material) => (
                    <TableRow key={material.id}>
                      {editingId === material.id ? (
                        <>
                          <TableCell>
                            <Select
                              value={editForm.name}
                              onValueChange={(value) => {
                                setEditForm({ ...editForm, name: value });
                                // Auto-fill unit and category if material exists
                                const selectedMaterial = materials.find(m => m.name === value);
                                if (selectedMaterial) {
                                  setEditForm({
                                    ...editForm,
                                    name: value,
                                    unit: selectedMaterial.unit,
                                    category: selectedMaterial.category_id
                                  });
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz materiał" />
                              </SelectTrigger>
                              <SelectContent>
                                {materials.map(material => (
                                  <SelectItem key={material.material_id} value={material.name}>
                                    {material.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.quantity}
                              onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.unit}
                              disabled
                              className="bg-slate-50"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editForm.category}
                              onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
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
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" onClick={handleSaveEdit}>
                                <CheckCircle2 className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                              >
                                Anuluj
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{material.name}</TableCell>
                          <TableCell>{material.quantity.toLocaleString('pl-PL')}</TableCell>
                          <TableCell>{material.unit}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{material.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(material)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(material.id)}
                              >
                                <Trash2 className="size-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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