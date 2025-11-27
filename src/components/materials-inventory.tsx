'use client';

import { useState } from 'react';
import { Construction } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Package, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { EmptyState } from './shared/EmptyState';
import { useStorageMaterialsByConstruction, storageItemKeys } from '@/hooks/use-storage-items';
import { MaterialsFilters } from './materials/filters';
import { useCategories } from '@/hooks/use-categories';
import { useQueryClient } from '@tanstack/react-query';

interface MaterialsInventoryProps {
  construction: Construction;
  onGoToDeliveryNoteImport: () => void;
}

export function MaterialsInventory({
  construction,
  onGoToDeliveryNoteImport
}: MaterialsInventoryProps) {
  const { data: storageMaterialsData, isLoading, error } = useStorageMaterialsByConstruction(construction.construction_id);
  const allMaterials = storageMaterialsData?.materials || [];
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];
  const queryClient = useQueryClient();

  // Filtrowanie i sortowanie
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Filtrowanie i sortowanie materiałów
  const filteredAndSortedMaterials = allMaterials
    .filter(material => {
      // Filtrowanie po wyszukiwaniu
      if (searchQuery && !material.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Filtrowanie po kategoriach (selectedCategories zawiera category_id, ale material.category to nazwa)
      if (selectedCategories.length > 0) {
        const materialCategoryId = categories.find(cat => cat.name === material.category)?.category_id;
        if (!materialCategoryId || !selectedCategories.includes(materialCategoryId)) {
          return false;
        }
      }
      // Filtrowanie po jednostkach
      if (selectedUnits.length > 0 && !selectedUnits.includes(material.unit)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === null) return 0;
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleUnitToggle = (unit: string) => {
    setSelectedUnits(prev =>
      prev.includes(unit)
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  };

  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedUnits([]);
    setSortOrder(null);
  };

  const handleRefresh = () => {
    queryClient.refetchQueries({ 
      queryKey: storageItemKeys.materialsByConstruction(construction.construction_id) 
    });
  };

  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.warehouseTitle}</CardTitle>
              <CardDescription>
                {t.warehouseDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-slate-600">Ładowanie materiałów...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">Błąd podczas ładowania materiałów: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && allMaterials.length === 0 && (
            <EmptyState
              icon={Package}
              title={t.noMaterials}
              description={t.noMaterialsDesc}
            />
          )}

          {!isLoading && !error && allMaterials.length > 0 && (
            <>
              <MaterialsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                selectedUnits={selectedUnits}
                onUnitToggle={handleUnitToggle}
                sortOrder={sortOrder}
                onSortToggle={handleSortToggle}
                onRefresh={handleRefresh}
                onResetFilters={clearFilters}
                translations={{
                  search: t.search,
                  searchPlaceholder: t.searchPlaceholder,
                  categories: t.categories,
                  selectCategories: t.selectCategories,
                  noCategories: t.noCategories,
                  units: t.units,
                  selectUnits: t.selectUnits,
                  sortByName: t.sortByName,
                  refresh: t.refresh,
                  resetFilters: t.resetFilters,
                }}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.material}</TableHead>
                    <TableHead>{t.category}</TableHead>
                    <TableHead className="text-right">Ilość</TableHead>
                    <TableHead className="text-right">{t.unit}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        {t.noMaterialsMatching || 'Brak materiałów spełniających kryteria'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedMaterials.map((material) => (
                      <TableRow key={material.material_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{material.name}</div>
                            {material.description && (
                              <div className="text-sm text-slate-500 truncate max-w-md">
                                {material.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{material.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {material.quantity_value}
                        </TableCell>
                        <TableCell className="text-right">
                          {material.unit}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}