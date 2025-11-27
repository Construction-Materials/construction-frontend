'use client';

import { Button } from '../ui/button';
import { Plus, Tag } from 'lucide-react';

interface MaterialsHeaderActionsProps {
  onAddMaterial: () => void;
  onEditCategories: () => void;
  translations: {
    editCategories: string;
    addMaterials: string;
  };
}

export function MaterialsHeaderActions({
  onAddMaterial,
  onEditCategories,
  translations: t
}: MaterialsHeaderActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onEditCategories}>
        <Tag className="size-4 mr-2" />
        {t.editCategories}
      </Button>
      <Button onClick={onAddMaterial}>
        <Plus className="size-4 mr-2" />
        {t.addMaterials}
      </Button>
    </div>
  );
}


