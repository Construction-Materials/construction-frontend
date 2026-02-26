'use client';

import { useState, useRef, useEffect } from 'react';
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
import { useBulkCreateStorageItems } from '@/hooks/use-storage-items';
import { analyzeDocument, MatchCandidate } from '@/lib/api/documents';
import { searchMaterials, MaterialSearchResult } from '@/lib/api/materials';
import type { BulkStorageItemInput } from '@/lib/api/storage-items';

interface DeliveryNoteImportProps {
  construction: Construction;
  onUpdateConstruction: (id: string, updates: Partial<Construction>) => void;
  onComplete: () => void;
}

interface ParsedMaterial {
  id: string;
  extractedName: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  material_id: string | null;
  matchCandidates: MatchCandidate[];
}

interface ManualMaterialRow {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  material_id: string | null;
}

export function DeliveryNoteImport({
  construction,
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
    category: '',
    material_id: null as string | null,
  });
  const [manualMaterials, setManualMaterials] = useState<ManualMaterialRow[]>([
    { name: '', quantity: '', unit: '', category: '', material_id: null }
  ]);
  const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(null);
  const [editComboboxOpen, setEditComboboxOpen] = useState(false);
  const [openReviewComboboxId, setOpenReviewComboboxId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MaterialSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { t } = useLanguage();
  const bulkCreateMutation = useBulkCreateStorageItems();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchMaterials(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectFile = (file: File) => {
    setSelectedFile(file);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await analyzeDocument(construction.constructionId, selectedFile);

      const parsed: ParsedMaterial[] = response.extractedItems.map((item, index) => {
        const first = item.matchCandidates[0] ?? null;
        return {
          id: `parsed-${Date.now()}-${index}`,
          extractedName: item.extractedName,
          name: first?.name ?? '',
          quantity: item.extractedQuantity,
          unit: first?.unitName ?? '',
          category: first?.categoryName ?? '',
          material_id: first?.materialId ?? null,
          matchCandidates: item.matchCandidates,
        };
      });

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
      return {
        id: `manual-${Date.now()}-${index}`,
        extractedName: row.name,
        name: row.name,
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        category: row.category,
        material_id: row.material_id,
        matchCandidates: [],
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
      category: material.category,
      material_id: material.material_id,
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
            category: editForm.category,
            material_id: editForm.material_id,
          }
        : m
    ));
    setEditingId(null);
  };

  const applyCandidate = (
    rowId: string,
    candidate: { materialId: string; name: string; unitName: string; categoryName: string }
  ) => {
    setParsedMaterials(prev =>
      prev.map(m =>
        m.id === rowId
          ? { ...m, name: candidate.name, unit: candidate.unitName, category: candidate.categoryName, material_id: candidate.materialId }
          : m
      )
    );
    setOpenReviewComboboxId(null);
    setSearchQuery('');
    setSearchResults([]);
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
        materialId: pm.material_id!,
        quantityValue: pm.quantity,
      }));

      await bulkCreateMutation.mutateAsync({
        constructionId: construction.constructionId,
        items: bulkItems,
      });

      // Reset state
      setParsedMaterials([]);
      setSelectedFile(null);
      setManualMaterials([{ name: '', quantity: '', unit: '', category: '', material_id: null }]);
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
    setManualMaterials([{ name: '', quantity: '', unit: '', category: '', material_id: null }]);
    setEditingId(null);
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
                            <Popover
                              open={openComboboxIndex === index}
                              onOpenChange={(open) => {
                                setOpenComboboxIndex(open ? index : null);
                                if (!open) {
                                  setSearchQuery('');
                                  setSearchResults([]);
                                }
                              }}
                            >
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
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder={t.searchMaterials}
                                    onValueChange={(value) => setSearchQuery(value)}
                                  />
                                  <CommandList className="h-[200px]">
                                    {searchLoading ? (
                                      <div className="flex items-center justify-center py-6">
                                        <Loader2 className="size-4 animate-spin text-slate-400" />
                                      </div>
                                    ) : (
                                      <>
                                        <CommandEmpty>{t.noMatchingMaterials}</CommandEmpty>
                                        <CommandGroup>
                                          {searchResults.map((material) => (
                                            <CommandItem
                                              key={material.materialId}
                                              value={material.name}
                                              onSelect={() => {
                                                const newRows = [...manualMaterials];
                                                newRows[index].name = material.name;
                                                newRows[index].unit = material.unitName;
                                                newRows[index].category = material.categoryName;
                                                newRows[index].material_id = material.materialId;
                                                setManualMaterials(newRows);
                                                setOpenComboboxIndex(null);
                                                setSearchQuery('');
                                                setSearchResults([]);
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
                                      </>
                                    )}
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
                              value={row.category}
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
                    newRows.push({ name: '', quantity: '', unit: '', category: '', material_id: null });
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
                            <Popover
                              open={editComboboxOpen}
                              onOpenChange={(open) => {
                                setEditComboboxOpen(open);
                                if (!open) {
                                  setSearchQuery('');
                                  setSearchResults([]);
                                }
                              }}
                            >
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
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder={t.searchMaterials}
                                    onValueChange={(value) => setSearchQuery(value)}
                                  />
                                  <CommandList className="h-[200px]">
                                    {searchLoading ? (
                                      <div className="flex items-center justify-center py-6">
                                        <Loader2 className="size-4 animate-spin text-slate-400" />
                                      </div>
                                    ) : (
                                      <>
                                        <CommandEmpty>{t.noMatchingMaterials}</CommandEmpty>
                                        <CommandGroup>
                                          {searchResults.map((mat) => (
                                            <CommandItem
                                              key={mat.materialId}
                                              value={mat.name}
                                              onSelect={() => {
                                                setEditForm({
                                                  ...editForm,
                                                  name: mat.name,
                                                  unit: mat.unitName,
                                                  category: mat.categoryName,
                                                  material_id: mat.materialId,
                                                });
                                                setEditComboboxOpen(false);
                                                setSearchQuery('');
                                                setSearchResults([]);
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
                                      </>
                                    )}
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
                              value={editForm.category}
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
                          <TableCell>
                            <Popover
                              open={openReviewComboboxId === material.id}
                              onOpenChange={(open) => {
                                setOpenReviewComboboxId(open ? material.id : null);
                                if (!open) {
                                  setSearchQuery('');
                                  setSearchResults([]);
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openReviewComboboxId === material.id}
                                  className="w-full justify-between font-normal"
                                >
                                  <span className="truncate">
                                    {material.name || t.selectMaterialPlaceholder}
                                  </span>
                                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder={t.searchMaterials}
                                    onValueChange={(value) => setSearchQuery(value)}
                                  />
                                  <CommandList className="h-[200px]">
                                    {!searchQuery.trim() ? (
                                      <CommandGroup>
                                        {material.matchCandidates.map((candidate) => (
                                          <CommandItem
                                            key={candidate.materialId}
                                            value={candidate.name}
                                            onSelect={() => applyCandidate(material.id, candidate)}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 size-4",
                                                material.material_id === candidate.materialId ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {candidate.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    ) : searchLoading ? (
                                      <div className="flex items-center justify-center py-6">
                                        <Loader2 className="size-4 animate-spin text-slate-400" />
                                      </div>
                                    ) : (
                                      <>
                                        <CommandEmpty>{t.noMatchingMaterials}</CommandEmpty>
                                        <CommandGroup>
                                          {searchResults.map((mat) => (
                                            <CommandItem
                                              key={mat.materialId}
                                              value={mat.name}
                                              onSelect={() => applyCandidate(material.id, {
                                                materialId: mat.materialId,
                                                name: mat.name,
                                                unitName: mat.unitName,
                                                categoryName: mat.categoryName,
                                              })}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 size-4",
                                                  material.material_id === mat.materialId ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {mat.name}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </>
                                    )}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>{material.quantity.toLocaleString('pl-PL')}</TableCell>
                          <TableCell>{material.unit}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={material.category}>
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