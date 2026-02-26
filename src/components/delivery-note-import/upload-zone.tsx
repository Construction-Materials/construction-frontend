'use client';

import { useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Upload, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';

interface DeliveryNoteUploadZoneProps {
  selectedFile: File | null;
  processing: boolean;
  error: string | null;
  isDragOver: boolean;
  onSelectFile: (file: File) => void;
  onRemoveFile: () => void;
  onProcess: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function DeliveryNoteUploadZone({
  selectedFile,
  processing,
  error,
  isDragOver,
  onSelectFile,
  onRemoveFile,
  onProcess,
  onDragOver,
  onDragLeave,
  onDrop,
}: DeliveryNoteUploadZoneProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelectFile(file);
  };

  if (!selectedFile) {
    return (
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={cn('size-12 mx-auto mb-4', isDragOver ? 'text-blue-500' : 'text-slate-400')} />
        <p className="text-sm text-slate-600 mb-2">{t.dragAndDrop}</p>
        <p className="text-xs text-slate-400">PDF, PNG, JPG</p>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={processing}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-solid border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileText className="size-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemoveFile} disabled={processing}>
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

      <Button onClick={onProcess} disabled={processing} className="w-full">
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
  );
}
