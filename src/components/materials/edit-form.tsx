'use client';

import { Category } from '@/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MaterialEditFormProps {
  formData: {
    name: string;
    unit: string;
    category: string;
    description: string;
  };
  onFormDataChange: (data: Partial<MaterialEditFormProps['formData']>) => void;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  translations: {
    materialName: string;
    unit: string;
    category: string;
    description: string;
    selectCategory: string;
    saveChanges: string;
    cancel: string;
  };
}

export function MaterialEditForm({
  formData,
  onFormDataChange,
  categories,
  onSubmit,
  onCancel,
  translations: t
}: MaterialEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">{t.materialName} *</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-unit">{t.unit} *</Label>
          <Input
            id="edit-unit"
            value={formData.unit}
            onChange={(e) => onFormDataChange({ unit: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-category">{t.category} *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onFormDataChange({ category: value })}
            required
          >
            <SelectTrigger id="edit-category">
              <SelectValue placeholder={t.selectCategory} />
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-slate-500">
                  Brak kategorii
                </div>
              ) : (
                categories.map(category => (
                  <SelectItem key={category.category_id} value={category.category_id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="edit-description">{t.description}</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {t.saveChanges}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}

