'use client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, CheckCircle2, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { MaterialSearchResult } from '@/lib/api/materials';
import { ManualMaterialRow } from '@/hooks/use-delivery-note-import';

interface DeliveryNoteManualTableProps {
  manualMaterials: ManualMaterialRow[];
  openComboboxIndex: number | null;
  searchQuery: string;
  searchResults: MaterialSearchResult[];
  searchLoading: boolean;
  onUpdateRows: (rows: ManualMaterialRow[]) => void;
  onSetOpenComboboxIndex: (index: number | null) => void;
  onSearchQueryChange: (query: string) => void;
  onClearSearch: () => void;
  onSubmit: () => void;
}

export function DeliveryNoteManualTable({
  manualMaterials,
  openComboboxIndex,
  searchQuery,
  searchResults,
  searchLoading,
  onUpdateRows,
  onSetOpenComboboxIndex,
  onSearchQueryChange,
  onClearSearch,
  onSubmit,
}: DeliveryNoteManualTableProps) {
  const { t } = useLanguage();

  const updateRow = (index: number, patch: Partial<ManualMaterialRow>) => {
    const updated = [...manualMaterials];
    updated[index] = { ...updated[index], ...patch };
    onUpdateRows(updated);
  };

  const removeRow = (index: number) => {
    const updated = [...manualMaterials];
    updated.splice(index, 1);
    onUpdateRows(updated);
  };

  const addRow = () => {
    onUpdateRows([...manualMaterials, { name: '', quantity: '', unit: '', category: '', material_id: null }]);
  };

  const validCount = manualMaterials.filter(
    row => row.name.trim() && row.quantity.trim() && row.unit.trim() && row.category.trim()
  ).length;

  return (
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
                      onSetOpenComboboxIndex(open ? index : null);
                      if (!open) onClearSearch();
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openComboboxIndex === index}
                        className="w-full justify-between font-normal"
                      >
                        <span className="truncate">{row.name || t.selectMaterialPlaceholder}</span>
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder={t.searchMaterials}
                          onValueChange={onSearchQueryChange}
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
                                      updateRow(index, {
                                        name: material.name,
                                        unit: material.unitName,
                                        category: material.categoryName,
                                        material_id: material.materialId,
                                      });
                                      onSetOpenComboboxIndex(null);
                                      onClearSearch();
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 size-4',
                                        row.name === material.name ? 'opacity-100' : 'opacity-0'
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
                    onChange={(e) => updateRow(index, { quantity: e.target.value })}
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <Input value={row.unit} disabled placeholder="Auto" className="bg-slate-50" />
                </TableCell>
                <TableCell>
                  <Input value={row.category} disabled placeholder="Auto" className="bg-slate-50" />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => removeRow(index)}>
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button type="button" variant="outline" onClick={addRow} className="w-full">
        <Plus className="size-4 mr-2" />
        {t.addAnotherMaterial}
      </Button>

      <Button onClick={onSubmit} disabled={validCount === 0} className="w-full">
        <CheckCircle2 className="size-4 mr-2" />
        {t.goToSummary} ({validCount})
      </Button>
    </div>
  );
}
