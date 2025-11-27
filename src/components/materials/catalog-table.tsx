'use client';

import { Material, Category } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface MaterialsCatalogTableProps {
  materials: Material[];
  categories: Category[];
  onEdit: (material: Material) => void;
  onDelete: (materialId: string) => void;
  translations: {
    materialName: string;
    category: string;
    unit: string;
    description: string;
    actions: string;
    noMaterialsMatching: string;
  };
}

export function MaterialsCatalogTable({
  materials,
  categories,
  onEdit,
  onDelete,
  translations: t
}: MaterialsCatalogTableProps) {
  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.name || "Brak nazwy";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.materialName}</TableHead>
          <TableHead>{t.category}</TableHead>
          <TableHead>{t.unit}</TableHead>
          <TableHead>{t.description}</TableHead>
          <TableHead className="text-right">{t.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
              {t.noMaterialsMatching}
            </TableCell>
          </TableRow>
        ) : (
          materials.map((material) => (
            <TableRow key={material.material_id}>
              <TableCell>{material.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{getCategoryName(material.category_id)}</Badge>
              </TableCell>
              <TableCell>{material.unit}</TableCell>
              <TableCell className="max-w-md">
                <span className="text-sm text-slate-600 truncate block">
                  {material.description || '-'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(material)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(material.material_id)}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}


