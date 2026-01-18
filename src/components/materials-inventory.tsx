'use client';

import { useMemo } from 'react';
import { Construction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TablePagination, usePagination } from './shared/TablePagination';
import { TableFilters } from './shared/TableFilters';
import { EmptyState } from './shared/EmptyState';
import { useMaterialsByConstruction, materialKeys } from '@/hooks/use-materials';
import { useStorageItemsByConstruction, storageItemKeys } from '@/hooks/use-storage-items';
import { useCategories, categoryKeys } from '@/hooks/use-categories';
import { useTableFilters } from '@/hooks/use-table-filters';

interface MaterialsInventoryProps {
  construction: Construction;
  onGoToDeliveryNoteImport: () => void;
}

export function MaterialsInventory({
  construction,
  onGoToDeliveryNoteImport
}: MaterialsInventoryProps) {
  const pagination = usePagination(10);
  const { t } = useLanguage();

  // Fetch all data (up to API max of 100) for client-side filtering and pagination
  const { data: materialsData, isLoading: materialsLoading, error: materialsError } = useMaterialsByConstruction(
    construction.construction_id,
    { limit: 100 }
  );
  const { data: storageData, isLoading: storageLoading, error: storageError } = useStorageItemsByConstruction(
    construction.construction_id,
    { limit: 100 }
  );
  const { data: categoriesData } = useCategories();

  const materials = materialsData?.materials || [];
  const storageItems = storageData?.storage_items || [];
  const categories = categoriesData?.categories || [];

  const isLoading = materialsLoading || storageLoading;
  const error = materialsError || storageError;

  // Query keys to invalidate on reload
  const queryKeysToInvalidate = useMemo(() => [
    storageItemKeys.byConstruction(construction.construction_id),
    materialKeys.byConstruction(construction.construction_id),
    categoryKeys.all,
  ], [construction.construction_id]);

  // Use table filters hook
  const {
    searchQuery,
    selectedCategories,
    isReloading,
    hasFilters,
    filteredItems: filteredMaterials,
    setSearchQuery,
    toggleCategory,
    clearCategoryFilters,
    handleReload,
    getCategoryName,
  } = useTableFilters({
    items: materials,
    categories,
    getItemName: (material) => material.name,
    getItemCategoryId: (material) => material.category_id,
    queryKeysToInvalidate,
  });

  // Create a map of material_id to quantity_value for quick lookup
  const quantityMap = useMemo(() => {
    const map = new Map<string, string>();
    storageItems.forEach((item) => {
      map.set(item.material_id, item.quantity_value);
    });
    return map;
  }, [storageItems]);

  // Paginate filtered materials (client-side)
  const paginatedMaterials = pagination.paginateItems(filteredMaterials);

  // Reset pagination when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    pagination.resetPage();
  };

  const handleToggleCategory = (categoryId: string) => {
    toggleCategory(categoryId);
    pagination.resetPage();
  };

  const handleClearCategories = () => {
    clearCategoryFilters();
    pagination.resetPage();
  };

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
              <p className="text-slate-600">{t.loadingMaterials}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{t.errorLoadingMaterials}: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && materials.length === 0 && (
            <EmptyState
              icon={Package}
              title={t.noMaterials}
              description={t.noMaterialsDesc}
            />
          )}

          {!isLoading && !error && materials.length > 0 && (
            <>
              <TableFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onClearCategories={handleClearCategories}
                getCategoryName={getCategoryName}
                isReloading={isReloading}
                onReload={handleReload}
                showResultsCount={hasFilters}
                filteredCount={filteredMaterials.length}
                totalCount={materials.length}
              />

              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">{t.noMatchingMaterials}</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.material}</TableHead>
                        <TableHead>{t.category}</TableHead>
                        <TableHead className="text-right">{t.quantity}</TableHead>
                        <TableHead className="text-right">{t.unit}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMaterials.map((material) => {
                        const quantity = quantityMap.get(material.material_id) || '0';
                        return (
                          <TableRow key={material.material_id}>
                            <TableCell className="max-w-[250px]">
                              <div className="font-medium truncate" title={material.name}>{material.name}</div>
                              {material.description && (
                                <div className="text-sm text-slate-500 truncate" title={material.description}>{material.description}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getCategoryName(material.category_id)}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {material.unit}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <TablePagination
                    currentPage={pagination.currentPage}
                    totalItems={filteredMaterials.length}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.handlePageChange}
                    onPageSizeChange={pagination.handlePageSizeChange}
                  />
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}