'use client';

import { Button } from '../ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SortButtonProps {
  sortOrder: 'asc' | 'desc' | null;
  onToggle: () => void;
  label: string;
}

export function SortButton({ sortOrder, onToggle, label }: SortButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="gap-2"
    >
      {sortOrder === 'asc' && <ArrowUp className="size-4" />}
      {sortOrder === 'desc' && <ArrowDown className="size-4" />}
      {sortOrder === null && <ArrowUp className="size-4 opacity-50" />}
      {label}
    </Button>
  );
}

