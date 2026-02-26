'use client';

import { Construction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDeliveryNoteImport } from '@/hooks/use-delivery-note-import';
import { DeliveryNoteUploadZone } from './upload-zone';
import { DeliveryNoteManualTable } from './manual-table';
import { DeliveryNoteReviewTable } from './review-table';

interface DeliveryNoteImportProps {
  construction: Construction;
  onUpdateConstruction: (id: string, updates: Partial<Construction>) => void;
  onComplete: () => void;
}

export function DeliveryNoteImport({
  construction,
  onComplete,
}: DeliveryNoteImportProps) {
  const { t } = useLanguage();
  const {
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
    setManualMaterials,
    setOpenComboboxIndex,
    setEditForm,
    setEditComboboxOpen,
    setOpenReviewComboboxId,
    setSearchQuery,
    clearSearch,
    selectFile,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    processFile,
    handleManualSubmit,
    handleEdit,
    handleSaveEdit,
    cancelEdit,
    applyCandidate,
    handleDelete,
    handleAddToInventory,
    handleReset,
  } = useDeliveryNoteImport({ construction, onComplete });

  const validCount = parsedMaterials.filter(pm => pm.material_id !== null).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.deliveryNoteTitle}</CardTitle>
        <CardDescription>{t.deliveryNoteDesc}</CardDescription>
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
              <DeliveryNoteUploadZone
                selectedFile={selectedFile}
                processing={processing}
                error={error}
                isDragOver={isDragOver}
                onSelectFile={selectFile}
                onRemoveFile={handleRemoveFile}
                onProcess={processFile}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <DeliveryNoteManualTable
                manualMaterials={manualMaterials}
                openComboboxIndex={openComboboxIndex}
                searchQuery={searchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                onUpdateRows={setManualMaterials}
                onSetOpenComboboxIndex={setOpenComboboxIndex}
                onSearchQueryChange={setSearchQuery}
                onClearSearch={clearSearch}
                onSubmit={handleManualSubmit}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t.recognizedMaterials} ({parsedMaterials.length})</h3>
                <p className="text-sm text-slate-600">{t.reviewBeforeAdding}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                {t.startOver}
              </Button>
            </div>

            <DeliveryNoteReviewTable
              parsedMaterials={parsedMaterials}
              editingId={editingId}
              editForm={editForm}
              editComboboxOpen={editComboboxOpen}
              openReviewComboboxId={openReviewComboboxId}
              searchQuery={searchQuery}
              searchResults={searchResults}
              searchLoading={searchLoading}
              onEdit={handleEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={cancelEdit}
              onDelete={handleDelete}
              onEditFormChange={setEditForm}
              onEditComboboxOpenChange={setEditComboboxOpen}
              onReviewComboboxOpenChange={setOpenReviewComboboxId}
              onApplyCandidate={applyCandidate}
              onSearchQueryChange={setSearchQuery}
              onClearSearch={clearSearch}
            />

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
                disabled={saving || validCount === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    {t.addMaterialsToWarehouse} ({validCount})
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
