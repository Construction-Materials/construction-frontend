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
import { useUnitMap, unitKeys } from '@/hooks/use-units';
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
    construction.constructionId,
    { limit: 100 }
  );
  const { data: storageData, isLoading: storageLoading, error: storageError } = useStorageItemsByConstruction(
    construction.constructionId,
    { limit: 100 }
  );
  const { data: categoriesData } = useCategories();
  const unitMap = useUnitMap();

  const materials = materialsData || [];
  const storageItems = storageData || [];
  const categories = categoriesData || [];

  const isLoading = materialsLoading || storageLoading;
  const error = materialsError || storageError;

  // Query keys to invalidate on reload
  const queryKeysToInvalidate = useMemo(() => [
    storageItemKeys.byConstruction(construction.constructionId),
    materialKeys.byConstruction(construction.constructionId),
    categoryKeys.all,
    unitKeys.list(),
  ], [construction.constructionId]);

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
    getItemCategoryId: (material) => material.categoryId,
    queryKeysToInvalidate,
  });

  // Create a map of material_id to quantity_value for quick lookup
  const quantityMap = useMemo(() => {
    const map = new Map<string, string>();
    storageItems.forEach((item) => {
      map.set(item.materialId, String(item.quantityValue));
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
                        const quantity = quantityMap.get(material.materialId) || '0';
                        return (
                          <TableRow key={material.materialId}>
                            <TableCell className="max-w-[250px]">
                              <div className="font-medium truncate" title={material.name}>{material.name}</div>
                              {material.description && (
                                <div className="text-sm text-slate-500 truncate" title={material.description}>{material.description}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getCategoryName(material.categoryId)}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {unitMap.get(material.unitId)?.name ?? material.unitId}
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