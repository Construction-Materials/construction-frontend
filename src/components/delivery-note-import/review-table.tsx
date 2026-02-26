'use client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Pencil, Trash2, CheckCircle2, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '../ui/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { MaterialSearchResult } from '@/lib/api/materials';
import { ParsedMaterial, EditForm } from '@/hooks/use-delivery-note-import';
import { MatchCandidate } from '@/lib/api/documents';

interface DeliveryNoteReviewTableProps {
  parsedMaterials: ParsedMaterial[];
  editingId: string | null;
  editForm: EditForm;
  editComboboxOpen: boolean;
  openReviewComboboxId: string | null;
  searchQuery: string;
  searchResults: MaterialSearchResult[];
  searchLoading: boolean;
  onEdit: (material: ParsedMaterial) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEditFormChange: (form: EditForm) => void;
  onEditComboboxOpenChange: (open: boolean) => void;
  onReviewComboboxOpenChange: (id: string | null) => void;
  onApplyCandidate: (rowId: string, candidate: MatchCandidate) => void;
  onSearchQueryChange: (query: string) => void;
  onClearSearch: () => void;
}

export function DeliveryNoteReviewTable({
  parsedMaterials,
  editingId,
  editForm,
  editComboboxOpen,
  openReviewComboboxId,
  searchQuery,
  searchResults,
  searchLoading,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditFormChange,
  onEditComboboxOpenChange,
  onReviewComboboxOpenChange,
  onApplyCandidate,
  onSearchQueryChange,
  onClearSearch,
}: DeliveryNoteReviewTableProps) {
  const { t } = useLanguage();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t.materialName}</TableHead>
            <TableHead className="w-[120px]">{t.quantity}</TableHead>
            <TableHead className="w-[120px]">{t.unit}</TableHead>
            <TableHead className="w-[200px]">{t.category}</TableHead>
            <TableHead className="w-[150px] text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsedMaterials.map((material) =>
            editingId === material.id ? (
              <EditRow
                key={material.id}
                material={material}
                editForm={editForm}
                editComboboxOpen={editComboboxOpen}
                searchQuery={searchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
                onEditFormChange={onEditFormChange}
                onEditComboboxOpenChange={onEditComboboxOpenChange}
                onSearchQueryChange={onSearchQueryChange}
                onClearSearch={onClearSearch}
              />
            ) : (
              <ReviewRow
                key={material.id}
                material={material}
                openReviewComboboxId={openReviewComboboxId}
                searchQuery={searchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                onEdit={onEdit}
                onDelete={onDelete}
                onReviewComboboxOpenChange={onReviewComboboxOpenChange}
                onApplyCandidate={onApplyCandidate}
                onSearchQueryChange={onSearchQueryChange}
                onClearSearch={onClearSearch}
              />
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Internal sub-rows ---

interface EditRowProps {
  material: ParsedMaterial;
  editForm: EditForm;
  editComboboxOpen: boolean;
  searchQuery: string;
  searchResults: MaterialSearchResult[];
  searchLoading: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEditFormChange: (form: EditForm) => void;
  onEditComboboxOpenChange: (open: boolean) => void;
  onSearchQueryChange: (query: string) => void;
  onClearSearch: () => void;
}

function EditRow({
  editForm,
  editComboboxOpen,
  searchResults,
  searchLoading,
  onSave,
  onCancel,
  onEditFormChange,
  onEditComboboxOpenChange,
  onSearchQueryChange,
  onClearSearch,
}: EditRowProps) {
  const { t } = useLanguage();

  return (
    <TableRow>
      <TableCell>
        <Popover
          open={editComboboxOpen}
          onOpenChange={(open) => {
            onEditComboboxOpenChange(open);
            if (!open) onClearSearch();
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={editComboboxOpen}
              className="w-full justify-between font-normal"
            >
              <span className="truncate">{editForm.name || t.selectMaterialPlaceholder}</span>
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
                      {searchResults.map((mat) => (
                        <CommandItem
                          key={mat.materialId}
                          value={mat.name}
                          onSelect={() => {
                            onEditFormChange({
                              ...editForm,
                              name: mat.name,
                              unit: mat.unitName,
                              category: mat.categoryName,
                              material_id: mat.materialId,
                            });
                            onEditComboboxOpenChange(false);
                            onClearSearch();
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              editForm.name === mat.name ? 'opacity-100' : 'opacity-0'
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
          onChange={(e) => onEditFormChange({ ...editForm, quantity: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <Input value={editForm.unit} disabled className="bg-slate-50" />
      </TableCell>
      <TableCell>
        <Input value={editForm.category} disabled className="bg-slate-50" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-1 justify-end">
          <Button size="sm" onClick={onSave}>
            <CheckCircle2 className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            {t.cancel}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface ReviewRowProps {
  material: ParsedMaterial;
  openReviewComboboxId: string | null;
  searchQuery: string;
  searchResults: MaterialSearchResult[];
  searchLoading: boolean;
  onEdit: (material: ParsedMaterial) => void;
  onDelete: (id: string) => void;
  onReviewComboboxOpenChange: (id: string | null) => void;
  onApplyCandidate: (rowId: string, candidate: MatchCandidate) => void;
  onSearchQueryChange: (query: string) => void;
  onClearSearch: () => void;
}

function ReviewRow({
  material,
  openReviewComboboxId,
  searchQuery,
  searchResults,
  searchLoading,
  onEdit,
  onDelete,
  onReviewComboboxOpenChange,
  onApplyCandidate,
  onSearchQueryChange,
  onClearSearch,
}: ReviewRowProps) {
  const { t } = useLanguage();
  const isOpen = openReviewComboboxId === material.id;

  return (
    <TableRow>
      <TableCell>
        <Popover
          open={isOpen}
          onOpenChange={(open) => {
            onReviewComboboxOpenChange(open ? material.id : null);
            if (!open) onClearSearch();
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between font-normal"
            >
              <span className="truncate">{material.name || t.selectMaterialPlaceholder}</span>
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
                {!searchQuery.trim() ? (
                  <CommandGroup>
                    {material.matchCandidates.map((candidate) => (
                      <CommandItem
                        key={candidate.materialId}
                        value={candidate.name}
                        onSelect={() => onApplyCandidate(material.id, candidate)}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            material.material_id === candidate.materialId ? 'opacity-100' : 'opacity-0'
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
                          onSelect={() =>
                            onApplyCandidate(material.id, {
                              materialId: mat.materialId,
                              name: mat.name,
                              unitName: mat.unitName,
                              categoryName: mat.categoryName,
                            })
                          }
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              material.material_id === mat.materialId ? 'opacity-100' : 'opacity-0'
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
          <Button size="sm" variant="ghost" onClick={() => onEdit(material)}>
            <Pencil className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(material.id)}>
            <Trash2 className="size-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
