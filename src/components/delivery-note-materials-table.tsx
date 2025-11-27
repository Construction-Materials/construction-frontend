'use client';

import { Material } from '@/types';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Combobox } from './ui/combobox';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { CheckCircle2, Pencil, Trash2, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

interface Category {
  category_id: string;
  name: string;
}

interface DeliveryNoteMaterialsTableProps {
  mode: 'parsed' | 'manual';
  // Dla trybu parsed
  parsedMaterials?: ParsedMaterial[];
  editingId?: string | null;
  editForm?: {
    name: string;
    quantity: string;
    unit: string;
    selected_material_id: string;
  };
  onEdit?: (material: ParsedMaterial) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onEditFormChange?: (field: string, value: string) => void;
  onMaterialSelect?: (materialId: string, parsedMaterialId: string) => void;
  onDelete?: (id: string) => void;
  errorMaterialIds?: Set<string>;
  // Dla trybu manual
  manualMaterials?: ManualMaterialRow[];
  onManualMaterialChange?: (index: number, field: keyof ManualMaterialRow, value: string) => void;
  onManualMaterialDelete?: (index: number) => void;
  // Wspólne
  materials: Material[];
  categories?: Category[];
}

export function DeliveryNoteMaterialsTable({
  mode,
  parsedMaterials = [],
  editingId = null,
  editForm,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onMaterialSelect,
  onDelete,
  errorMaterialIds = new Set(),
  manualMaterials = [],
  onManualMaterialChange,
  onManualMaterialDelete,
  materials,
  categories = [],
}: DeliveryNoteMaterialsTableProps) {
  const { t } = useLanguage();

  if (mode === 'parsed') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t.materialFromDocument}</TableHead>
            <TableHead className="w-[300px]">{t.materialFromDatabase}</TableHead>
            <TableHead className="w-[120px]">{t.quantity}</TableHead>
            <TableHead className="w-[120px]">{t.unit}</TableHead>
            <TableHead className="w-[100px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsedMaterials.map((material) => {
            const hasError = errorMaterialIds.has(material.id);
            return (
            <TableRow 
              key={material.id}
              className={hasError ? 'bg-red-50 hover:bg-red-100' : ''}
            >
              {editingId === material.id ? (
                <>
                  <TableCell>
                    <Input
                      value={editForm?.name || ''}
                      onChange={(e) => onEditFormChange?.('name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Combobox
                      value={editForm?.selected_material_id || 'brak-materialu'}
                      onValueChange={(value) => {
                        const actualMaterialId = value === 'brak-materialu' ? null : value;
                        onEditFormChange?.('selected_material_id', actualMaterialId || '');
                        const selectedMaterial = actualMaterialId ? materials.find(m => m.material_id === actualMaterialId) : null;
                        if (selectedMaterial) {
                          onEditFormChange?.('selected_material_id', actualMaterialId || '');
                          onEditFormChange?.('unit', selectedMaterial.unit);
                        } else {
                          onEditFormChange?.('selected_material_id', '');
                          onEditFormChange?.('unit', '');
                        }
                      }}
                      placeholder={t.selectMaterial}
                      options={
                        materials.length === 0
                          ? [{ value: 'brak-materialu', label: t.noMaterials }]
                          : [
                              { value: 'brak-materialu', label: t.noMatch },
                              ...materials.map(mat => ({
                                value: mat.material_id,
                                label: mat.name
                              }))
                            ]
                      }
                      emptyText={t.noResults}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm?.quantity || ''}
                      onChange={(e) => onEditFormChange?.('quantity', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editForm?.unit || ''}
                      disabled
                      className="bg-slate-50"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" onClick={onSaveEdit}>
                        <CheckCircle2 className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onCancelEdit}
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{material.name}</span>
                      {material.suggested_materials && material.suggested_materials.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-4 text-blue-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{t.suggestedMaterials}:</p>
                              {material.suggested_materials.map((suggested, idx) => (
                                <div key={idx} className="text-sm">
                                  • {suggested.name} ({suggested.similarity_score.toFixed(0)}% {t.similarityScore})
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Combobox
                      value={material.selected_material_id || 'brak-materialu'}
                      onValueChange={(value) => onMaterialSelect?.(value, material.id)}
                      placeholder={t.selectMaterial}
                      options={
                        materials.length === 0
                          ? [{ value: 'brak-materialu', label: t.noMaterials }]
                          : [
                              { value: 'brak-materialu', label: t.noMatch },
                              ...materials.map(mat => ({
                                value: mat.material_id,
                                label: mat.name
                              }))
                            ]
                      }
                      emptyText={t.noResults}
                    />
                  </TableCell>
                  <TableCell>{material.quantity.toLocaleString(t.locale)}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit?.(material)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete?.(material.id)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  // Tryb manual
  return (
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
              <Combobox
                value={row.name}
                onValueChange={(value) => {
                  onManualMaterialChange?.(index, 'name', value);
                  const selectedMaterial = materials.find(m => m.name === value);
                  if (selectedMaterial) {
                    onManualMaterialChange?.(index, 'unit', selectedMaterial.unit);
                    onManualMaterialChange?.(index, 'category', selectedMaterial.category_id);
                  } else {
                    onManualMaterialChange?.(index, 'unit', '');
                    onManualMaterialChange?.(index, 'category', '');
                  }
                }}
                placeholder={t.selectMaterial}
                options={materials.map(material => ({
                  value: material.name,
                  label: material.name
                }))}
                emptyText={t.noMaterials}
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                step="0.01"
                value={row.quantity}
                onChange={(e) => onManualMaterialChange?.(index, 'quantity', e.target.value)}
                placeholder="0"
              />
            </TableCell>
            <TableCell>
              <Input
                value={row.unit}
                disabled
                placeholder={t.auto}
                className="bg-slate-50"
              />
            </TableCell>
            <TableCell>
              <Input
                value={row.category ? categories.find(c => c.category_id === row.category)?.name || '' : ''}
                disabled
                placeholder={t.auto}
                className="bg-slate-50"
              />
            </TableCell>
            <TableCell className="text-right">
              {manualMaterials.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onManualMaterialDelete?.(index)}
                >
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

