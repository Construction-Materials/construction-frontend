import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Category } from '@/types';

interface UseTableFiltersOptions<T> {
  items: T[];
  categories: Category[];
  getItemName: (item: T) => string;
  getItemCategoryId: (item: T) => string;
  queryKeysToInvalidate?: readonly (readonly unknown[])[];
}

interface UseTableFiltersReturn<T> {
  // State
  searchQuery: string;
  selectedCategories: Set<string>;
  isReloading: boolean;
  hasFilters: boolean;

  // Filtered items
  filteredItems: T[];

  // Actions
  setSearchQuery: (query: string) => void;
  toggleCategory: (categoryId: string) => void;
  clearCategoryFilters: () => void;
  handleReload: () => Promise<void>;

  // Helpers
  getCategoryName: (categoryId: string) => string;
}

export function useTableFilters<T>({
  items,
  categories,
  getItemName,
  getItemCategoryId,
  queryKeysToInvalidate = [],
}: UseTableFiltersOptions<T>): UseTableFiltersReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isReloading, setIsReloading] = useState(false);
  const queryClient = useQueryClient();

  const hasFilters = searchQuery !== '' || selectedCategories.size > 0;

  // Filter items based on search query and selected categories
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchQuery === '' ||
        getItemName(item).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategories.size === 0 ||
        selectedCategories.has(getItemCategoryId(item));

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategories, getItemName, getItemCategoryId]);

  // Toggle category selection
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Clear all category filters
  const clearCategoryFilters = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  // Reload data by invalidating queries
  const handleReload = useCallback(async () => {
    if (queryKeysToInvalidate.length === 0) return;

    setIsReloading(true);
    await Promise.all(
      queryKeysToInvalidate.map(queryKey =>
        queryClient.invalidateQueries({ queryKey })
      )
    );
    setIsReloading(false);
  }, [queryClient, queryKeysToInvalidate]);

  // Helper function to get category name by ID
  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.name || '';
  }, [categories]);

  return {
    searchQuery,
    selectedCategories,
    isReloading,
    hasFilters,
    filteredItems,
    setSearchQuery,
    toggleCategory,
    clearCategoryFilters,
    handleReload,
    getCategoryName,
  };
}
