'use client';

import { useMemo, useState } from 'react';
import { Construction, Material, StorageItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Package, Search, Filter, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { EmptyState } from './shared/EmptyState';
import { useMaterialsByConstruction } from '@/hooks/use-materials';
import { useStorageItemsByConstruction } from '@/hooks/use-storage-items';
import { useCategories } from '@/hooks/use-categories';

interface MaterialsInventoryProps {
  construction: Construction;
  onGoToDeliveryNoteImport: () => void;
}

export function MaterialsInventory({
  construction,
  onGoToDeliveryNoteImport
}: MaterialsInventoryProps) {
  const { data: materialsData, isLoading: materialsLoading, error: materialsError } = useMaterialsByConstruction(construction.construction_id);
  const { data: storageData, isLoading: storageLoading, error: storageError } = useStorageItemsByConstruction(construction.construction_id);
  const { data: categoriesData } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const materials = materialsData?.materials || [];
  const storageItems = storageData?.storage_items || [];
  const categories = categoriesData?.categories || [];

  const isLoading = materialsLoading || storageLoading;
  const error = materialsError || storageError;

  const { t } = useLanguage();

  // Create a map of material_id to quantity_value for quick lookup
  const quantityMap = useMemo(() => {
    const map = new Map<string, string>();
    storageItems.forEach((item) => {
      map.set(item.material_id, item.quantity_value);
    });
    return map;
  }, [storageItems]);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.name || t.noName;
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Clear all category filters
  const clearCategoryFilters = () => {
    setSelectedCategories(new Set());
  };

  // Filter materials based on search query and selected categories
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // Filter by name
      const matchesSearch = searchQuery === '' ||
        material.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by categories (if none selected, show all)
      const matchesCategory = selectedCategories.size === 0 ||
        selectedCategories.has(material.category_id);

      return matchesSearch && matchesCategory;
    });
  }, [materials, searchQuery, selectedCategories]);

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
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                {/* Search by name */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    placeholder={t.searchMaterial}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Category filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="size-4" />
                      {t.category}
                      {selectedCategories.size > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {selectedCategories.size}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t.filterByCategory}</span>
                        {selectedCategories.size > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearCategoryFilters}
                            className="h-auto p-1 text-xs"
                          >
                            {t.clearAll}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                          const isSelected = selectedCategories.has(category.category_id);
                          return (
                            <Badge
                              key={category.category_id}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() => toggleCategory(category.category_id)}
                            >
                              {category.name}
                              {isSelected && (
                                <X className="size-3 ml-1" />
                              )}
                            </Badge>
                          );
                        })}
                        {categories.length === 0 && (
                          <span className="text-sm text-slate-500">{t.noCategories}</span>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Active category filters display */}
                {selectedCategories.size > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    {Array.from(selectedCategories).map((categoryId) => (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => toggleCategory(categoryId)}
                      >
                        {getCategoryName(categoryId)}
                        <X className="size-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Results count */}
              {(searchQuery || selectedCategories.size > 0) && (
                <p className="text-sm text-slate-500 mb-3">
                  {t.showingResults}: {filteredMaterials.length} {t.of} {materials.length}
                </p>
              )}

              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">{t.noMatchingMaterials}</p>
                </div>
              ) : (
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
                    {filteredMaterials.map((material) => {
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
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}