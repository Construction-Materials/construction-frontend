'use client';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Szukaj...',
  label,
  id = 'search'
}: SearchInputProps) {
  return (
    <div className="w-64">
      {label && (
        <Label htmlFor={id} className="text-sm text-slate-600 mb-2 block">
          {label}
        </Label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 border-2"
        />
      </div>
    </div>
  );
}

