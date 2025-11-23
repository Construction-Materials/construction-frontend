'use client';

import { Material } from '@/types';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';

interface MaterialSelectProps {
  materials: Material[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  label?: string;
}

export function MaterialSelect({
  materials,
  value,
  onChange,
  id = 'material',
  required = false,
  label
}: MaterialSelectProps) {
  const { t } = useLanguage();

  return (
    <div>
      <Label htmlFor={id}>{label || t.material} {required && '*'}</Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={t.selectMaterial} />
        </SelectTrigger>
        <SelectContent>
          {materials.map((material) => (
            <SelectItem key={material.id} value={material.id}>
              {material.name} ({material.unit})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
