'use client';

import { Button } from '../ui/button';
import { RefreshCw, X } from 'lucide-react';

interface FilterActionsProps {
  onRefresh: () => void;
  onReset: () => void;
  translations: {
    refresh: string;
    resetFilters: string;
  };
}

export function FilterActions({
  onRefresh,
  onReset,
  translations: t
}: FilterActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="gap-2"
      >
        <RefreshCw className="size-4" />
        {t.refresh}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="gap-2"
      >
        <X className="size-4" />
        {t.resetFilters}
      </Button>
    </div>
  );
}

