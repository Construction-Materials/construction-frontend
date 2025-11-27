'use client';

import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Filter } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterPopoverProps {
  label: string;
  items: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  translations: {
    selectLabel: string;
    emptyMessage?: string;
  };
  idPrefix?: string;
}

export function FilterPopover({
  label,
  items,
  selectedValues,
  onToggle,
  translations: t,
  idPrefix = 'filter'
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="size-4" />
          {label}
          {selectedValues.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedValues.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t.selectLabel}</Label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t.emptyMessage || 'Brak opcji'}
              </p>
            ) : (
              items.map(item => (
                <div key={item.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${idPrefix}-${item.value}`}
                    checked={selectedValues.includes(item.value)}
                    onCheckedChange={() => onToggle(item.value)}
                  />
                  <Label
                    htmlFor={`${idPrefix}-${item.value}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {item.label}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

