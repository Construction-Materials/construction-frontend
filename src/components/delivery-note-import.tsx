'use client';

import { useState, useRef } from 'react';
import { Construction, Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Upload, FileText, Plus, Pencil, Trash2, CheckCircle2, Loader2, ChevronsUpDown, Check, X } from 'lucide-react';
import { cn } from './ui/utils';
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
  const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(null);
  const [editComboboxOpen, setEditComboboxOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          category: t.basicMaterials,
          description: ''
        });
      }
    });

    return parsed.length > 0 ? parsed : [
      {
        id: `parsed-${Date.now()}-1`,
        name: `${t.sampleMaterial} 1`,
        quantity: 100,
        unit: 'szt.',
        category: t.basicMaterials,
        description: ''
      }
    ];
  };

  const selectFile = (file: File) => {
    setSelectedFile(file);
  };

  const processFile = async () => {
    if (!selectedFile) return;

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
                        {t.uploadFile}
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

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleAddToInventory}
                className="flex-1"
                size="lg"
              >
                <Plus className="size-4 mr-2" />
                {t.addMaterialsToWarehouse} ({parsedMaterials.length})
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}