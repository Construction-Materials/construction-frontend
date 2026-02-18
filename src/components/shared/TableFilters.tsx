'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category } from '@/types';

interface TableFiltersProps {
  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Categories
  categories: Category[];
  selectedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
  getCategoryName: (categoryId: string) => string;

  // Reload
  isReloading: boolean;
  onReload: () => void;

  // Optional: show results count
  showResultsCount?: boolean;
  filteredCount?: number;
  totalCount?: number;
}

export function TableFilters({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  getCategoryName,
  isReloading,
  onReload,
  showResultsCount = false,
  filteredCount = 0,
  totalCount = 0,
}: TableFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap gap-3">
        {/* Search by name */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder || t.searchMaterial}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
                    onClick={onClearCategories}
                    className="h-auto p-1 text-xs"
                  >
                    {t.clearAll}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.has(category.categoryId);
                  return (
                    <Badge
                      key={category.categoryId}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => onToggleCategory(category.categoryId)}
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

        {/* Reload button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onReload}
          disabled={isReloading}
          title={t.reload}
        >
          <RefreshCw className={`size-4 ${isReloading ? 'animate-spin' : ''}`} />
        </Button>

        {/* Active category filters display */}
        {selectedCategories.size > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            {Array.from(selectedCategories).map((categoryId) => (
              <Badge
                key={categoryId}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onToggleCategory(categoryId)}
              >
                {getCategoryName(categoryId)}
                <X className="size-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {showResultsCount && (searchQuery || selectedCategories.size > 0) && (
        <p className="text-sm text-slate-500">
          {t.showingResults}: {filteredCount} {t.of} {totalCount}
        </p>
      )}
    </div>
  );
}
