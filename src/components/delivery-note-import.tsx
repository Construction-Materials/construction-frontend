'use client';

import { useState, useRef } from 'react';
import { Construction } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Upload, FileText, Plus, Pencil, Trash2, CheckCircle2, Loader2, ChevronsUpDown, Check, X, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useCategories } from '@/hooks/use-categories';
import { useBulkCreateStorageItems } from '@/hooks/use-storage-items';
import { useMaterials } from '@/hooks/use-materials';
import { analyzeDocument, ExtractedMaterial } from '@/lib/api/documents';
import type { BulkStorageItemInput } from '@/lib/api/storage-items';

interface DeliveryNoteImportProps {
  construction: Construction;
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
  // Fields from API response
  material_id: string | null;
  material_exists: boolean;
  material_unit: string | null;
  unit_matches: boolean;
  can_use_quantity: boolean;
  suggested_materials: Array<{
    material_id: string;
    name: string;
    unit: string;
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
  onUpdateConstruction,
  onComplete
}: DeliveryNoteImportProps) {
  const { data: materialsData } = useMaterials();
  const materials = materialsData?.materials || [];
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
  const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(null);
  const [editComboboxOpen, setEditComboboxOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useLanguage();
  const bulkCreateMutation = useBulkCreateStorageItems();

  const selectFile = (file: File) => {
    setSelectedFile(file);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await analyzeDocument(construction.construction_id, selectedFile);

      const parsed: ParsedMaterial[] = response.extracted_data.materials.map((material, index) => ({
        id: `parsed-${Date.now()}-${index}`,
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        category: '', // Will be set when user selects a material
        description: '',
        material_id: material.material_id,
        material_exists: material.material_exists,
        material_unit: material.material_unit,
        unit_matches: material.unit_matches,
        can_use_quantity: material.can_use_quantity,
        suggested_materials: material.suggested_materials,
      }));

      setParsedMaterials(parsed);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : t.errorProcessingDocument || 'Error processing document');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    selectFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      selectFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleManualSubmit = () => {
    // Convert manual materials directly to parsed materials without LLM
    const validManualMaterials = manualMaterials.filter(
      row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()
    );

    if (validManualMaterials.length === 0) return;

    const parsed: ParsedMaterial[] = validManualMaterials.map((row, index) => {
      const existingMaterial = materials.find(m => m.name.toLowerCase() === row.name.toLowerCase());
      return {
        id: `manual-${Date.now()}-${index}`,
        name: row.name,
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        category: row.category,
        description: '',
        material_id: existingMaterial?.material_id || null,
        material_exists: !!existingMaterial,
        material_unit: existingMaterial?.unit || null,
        unit_matches: existingMaterial?.unit === row.unit,
        can_use_quantity: true,
        suggested_materials: [],
      };
    });

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

  const handleAddToInventory = async () => {
    // Filter only materials that have a valid material_id
    const validItems = parsedMaterials.filter(pm => pm.material_id !== null);

    if (validItems.length === 0) {
      setError(t.noValidMaterialsToAdd || 'No valid materials to add. Please select existing materials.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const bulkItems: BulkStorageItemInput[] = validItems.map(pm => ({
        construction_id: construction.construction_id,
        material_id: pm.material_id!,
        quantity_value: pm.quantity,
      }));

      await bulkCreateMutation.mutateAsync({
        constructionId: construction.construction_id,
        items: bulkItems,
      });

      // Reset state
      setParsedMaterials([]);
      setSelectedFile(null);
      setManualMaterials([{ name: '', quantity: '', unit: '', category: '' }]);
      setEditingId(null);
      onComplete();
    } catch (err) {
      console.error('Failed to add materials to inventory:', err);
      setError(err instanceof Error ? err.message : t.errorAddingMaterials || 'Error adding materials to inventory');
    } finally {
      setSaving(false);
    }
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

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.name || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.deliveryNoteTitle}</CardTitle>
        <CardDescription>
          {t.deliveryNoteDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {parsedMaterials.length === 0 ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="size-4 mr-2" />
                {t.uploadTab}
              </TabsTrigger>
              <TabsTrigger value="manual">
                <FileText className="size-4 mr-2" />
                {t.manualTab}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              {!selectedFile ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleDropZoneClick}
                >
                  <Upload className={cn(
                    "size-12 mx-auto mb-4",
                    isDragOver ? "text-blue-500" : "text-slate-400"
                  )} />
                  <p className="text-sm text-slate-600 mb-2">
                    {t.dragAndDrop}
                  </p>
                  <p className="text-xs text-slate-400">
                    PDF, PNG, JPG
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={processing}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-solid border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <FileText className="size-6 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                          <p className="text-xs text-slate-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={processing}
                      >
                        <X className="size-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="size-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <Button
                    onClick={processFile}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        {t.processingDocument}
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        {t.processWithAI}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label>{t.enterDeliveryNoteData}</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">{t.materialName}</TableHead>
                        <TableHead className="w-[120px]">{t.quantity}</TableHead>
                        <TableHead className="w-[120px]">{t.unit}</TableHead>
                        <TableHead className="w-[200px]">{t.category}</TableHead>
                        <TableHead className="w-[150px] text-right">{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualMaterials.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Popover open={openComboboxIndex === index} onOpenChange={(open) => setOpenComboboxIndex(open ? index : null)}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openComboboxIndex === index}
                                  className="w-full justify-between font-normal"
                                >
                                  <span className="truncate">
                                    {row.name || t.selectMaterialPlaceholder}
                                  </span>
                                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
                                <Command>
                                  <CommandInput placeholder={t.searchMaterials} />
                                  <CommandList className="h-[200px]">
                                    <CommandEmpty>{t.noMatchingMaterials}</CommandEmpty>
                                    <CommandGroup>
                                      {materials.map((material) => (
                                        <CommandItem
                                          key={material.material_id}
                                          value={material.name}
                                          onSelect={(value) => {
                                            const selectedMaterial = materials.find(m => m.name.toLowerCase() === value.toLowerCase());
                                            if (selectedMaterial) {
                                              const newRows = [...manualMaterials];
                                              newRows[index].name = selectedMaterial.name;
                                              newRows[index].unit = selectedMaterial.unit;
                                              newRows[index].category = selectedMaterial.category_id;
                                              setManualMaterials(newRows);
                                            }
                                            setOpenComboboxIndex(null);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 size-4",
                                              row.name === material.name ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {material.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="1"
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
                            <Input
                              value={getCategoryName(row.category)}
                              disabled
                              placeholder="Auto"
                              className="bg-slate-50"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {manualMaterials.length > 0 && (
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
                  {t.addAnotherMaterial}
                </Button>
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={manualMaterials.every(row => !row.name.trim() || !row.quantity.trim() || !row.unit.trim() || !row.category.trim())}
                className="w-full"
              >
                <CheckCircle2 className="size-4 mr-2" />
                {t.goToSummary} ({manualMaterials.filter(row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()).length})
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t.recognizedMaterials} ({parsedMaterials.length})</h3>
                <p className="text-sm text-slate-600">
                  {t.reviewBeforeAdding}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                {t.startOver}
              </Button>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">{t.materialName}</TableHead>
                    <TableHead className="w-[120px]">{t.quantity}</TableHead>
                    <TableHead className="w-[120px]">{t.unit}</TableHead>
                    <TableHead className="w-[200px]">{t.category}</TableHead>
                    <TableHead className="w-[150px] text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedMaterials.map((material) => (
                    <TableRow key={material.id}>
                      {editingId === material.id ? (
                        <>
                          <TableCell>
                            <Popover open={editComboboxOpen} onOpenChange={setEditComboboxOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={editComboboxOpen}
                                  className="w-full justify-between font-normal"
                                >
                                  <span className="truncate">
                                    {editForm.name || t.selectMaterialPlaceholder}
                                  </span>
                                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
                                <Command>
                                  <CommandInput placeholder={t.searchMaterials} />
                                  <CommandList className="h-[200px]">
                                    <CommandEmpty>{t.noMatchingMaterials}</CommandEmpty>
                                    <CommandGroup>
                                      {materials.map((mat) => (
                                        <CommandItem
                                          key={mat.material_id}
                                          value={mat.name}
                                          onSelect={(value) => {
                                            const selectedMaterial = materials.find(m => m.name.toLowerCase() === value.toLowerCase());
                                            if (selectedMaterial) {
                                              setEditForm({
                                                ...editForm,
                                                name: selectedMaterial.name,
                                                unit: selectedMaterial.unit,
                                                category: selectedMaterial.category_id
                                              });
                                            }
                                            setEditComboboxOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 size-4",
                                              editForm.name === mat.name ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {mat.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
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
                            <Input
                              value={getCategoryName(editForm.category)}
                              disabled
                              className="bg-slate-50"
                            />
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
                                {t.cancel}
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="max-w-[200px] truncate" title={material.name}>{material.name}</TableCell>
                          <TableCell>{material.quantity.toLocaleString('pl-PL')}</TableCell>
                          <TableCell>{material.unit}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={getCategoryName(material.category)}>
                            <Badge variant="outline">{getCategoryName(material.category)}</Badge>
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

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="size-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleAddToInventory}
                className="flex-1"
                size="lg"
                disabled={saving || parsedMaterials.filter(pm => pm.material_id !== null).length === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    {t.addMaterialsToWarehouse} ({parsedMaterials.filter(pm => pm.material_id !== null).length})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}