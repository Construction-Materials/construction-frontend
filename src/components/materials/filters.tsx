'use client';

import { Category } from '@/types';
import { SearchInput } from '../shared/SearchInput';
import { FilterPopover, FilterOption } from '../shared/FilterPopover';
import { SortButton } from '../shared/SortButton';
import { FilterActions } from '../shared/FilterActions';
import { appConfig } from '@/config/app-config';

interface MaterialsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  selectedUnits: string[];
  onUnitToggle: (unit: string) => void;
  sortOrder: 'asc' | 'desc' | null;
  onSortToggle: () => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  translations: {
    search: string;
    searchPlaceholder: string;
    categories: string;
    selectCategories: string;
    noCategories: string;
    units: string;
    selectUnits: string;
    sortByName: string;
    refresh: string;
    resetFilters: string;
  };
}

export function MaterialsFilters({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryToggle,
  selectedUnits,
  onUnitToggle,
  sortOrder,
  onSortToggle,
  onRefresh,
  onResetFilters,
  translations: t
}: MaterialsFiltersProps) {
  // Konwersja kategorii na FilterOption
  const categoryOptions: FilterOption[] = categories.map(cat => ({
    value: cat.category_id,
    label: cat.name
  }));

  // Konwersja jednostek na FilterOption
  const unitOptions: FilterOption[] = appConfig.materialUnits.map(unit => ({
    value: unit.value,
    label: unit.label
  }));

  return (
    <div className="mb-6">
      <div className="flex gap-4 items-end flex-wrap">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t.searchPlaceholder}
          label={t.search}
        />
      </div>
      <div className="flex w-full justify-between mt-4">
        <div className="flex gap-2 flex-wrap">
          <FilterPopover
            label={t.categories}
            items={categoryOptions}
            selectedValues={selectedCategories}
            onToggle={onCategoryToggle}
            idPrefix="category"
            translations={{
              selectLabel: t.selectCategories,
              emptyMessage: t.noCategories,
            }}
          />
          <FilterPopover
            label={t.units}
            items={unitOptions}
            selectedValues={selectedUnits}
            onToggle={onUnitToggle}
            idPrefix="unit"
            translations={{
              selectLabel: t.selectUnits,
            }}
          />
          <SortButton
            sortOrder={sortOrder}
            onToggle={onSortToggle}
            label={t.sortByName}
          />
        </div>
        <FilterActions
          onRefresh={onRefresh}
          onReset={onResetFilters}
          translations={{
            refresh: t.refresh,
            resetFilters: t.resetFilters,
          }}
        />
      </div>
    </div>
  );
}

