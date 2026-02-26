import { useState, useEffect } from 'react';
import { Construction } from '@/types';
import { analyzeDocument, MatchCandidate } from '@/lib/api/documents';
import { searchMaterials, MaterialSearchResult } from '@/lib/api/materials';
import { useBulkCreateStorageItems } from '@/hooks/use-storage-items';
import type { BulkStorageItemInput } from '@/lib/api/storage-items';
import { useLanguage } from '../contexts/LanguageContext';

export interface ParsedMaterial {
  id: string;
  extractedName: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  material_id: string | null;
  matchCandidates: MatchCandidate[];
}

export interface ManualMaterialRow {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  material_id: string | null;
}

export interface EditForm {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  material_id: string | null;
}

interface UseDeliveryNoteImportOptions {
  construction: Construction;
  onComplete: () => void;
}

export function useDeliveryNoteImport({ construction, onComplete }: UseDeliveryNoteImportOptions) {
  const [processing, setProcessing] = useState(false);
  const [parsedMaterials, setParsedMaterials] = useState<ParsedMaterial[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    quantity: '',
    unit: '',
    category: '',
    material_id: null,
  });
  const [manualMaterials, setManualMaterials] = useState<ManualMaterialRow[]>([
    { name: '', quantity: '', unit: '', category: '', material_id: null },
  ]);
  const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(null);
  const [editComboboxOpen, setEditComboboxOpen] = useState(false);
  const [openReviewComboboxId, setOpenReviewComboboxId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  const selectFile = (file: File) => setSelectedFile(file);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
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
      setError(err instanceof Error ? err.message : t.errorProcessingDocument || 'Error processing document');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = () => {
    const valid = manualMaterials.filter(
      row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()
    );
    if (valid.length === 0) return;
    const parsed: ParsedMaterial[] = valid.map((row, index) => ({
      id: `manual-${Date.now()}-${index}`,
      extractedName: row.name,
      name: row.name,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      category: row.category,
      material_id: row.material_id,
      matchCandidates: [],
    }));
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
    setParsedMaterials(prev =>
      prev.map(m =>
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
      )
    );
    setEditingId(null);
  };

  const applyCandidate = (
    rowId: string,
    candidate: { materialId: string; name: string; unitName: string; categoryName: string }
  ) => {
    setParsedMaterials(prev =>
      prev.map(m =>
        m.id === rowId
          ? {
              ...m,
              name: candidate.name,
              unit: candidate.unitName,
              category: candidate.categoryName,
              material_id: candidate.materialId,
            }
          : m
      )
    );
    setOpenReviewComboboxId(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDelete = (id: string) => {
    setParsedMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleAddToInventory = async () => {
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
      setParsedMaterials([]);
      setSelectedFile(null);
      setManualMaterials([{ name: '', quantity: '', unit: '', category: '', material_id: null }]);
      setEditingId(null);
      onComplete();
    } catch (err) {
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

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return {
    // State
    processing,
    parsedMaterials,
    selectedFile,
    editingId,
    editForm,
    manualMaterials,
    openComboboxIndex,
    editComboboxOpen,
    openReviewComboboxId,
    isDragOver,
    error,
    saving,
    searchQuery,
    searchResults,
    searchLoading,
    // Setters
    setManualMaterials,
    setOpenComboboxIndex,
    setEditForm,
    setEditComboboxOpen,
    setOpenReviewComboboxId,
    setSearchQuery,
    clearSearch,
    // File handlers
    selectFile,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    processFile,
    // Handlers
    handleManualSubmit,
    handleEdit,
    handleSaveEdit,
    cancelEdit: () => setEditingId(null),
    applyCandidate,
    handleDelete,
    handleAddToInventory,
    handleReset,
  };
}
