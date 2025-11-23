'use client';

import { useState } from 'react';
import { Construction, Material } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Package, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { EmptyState } from './shared/EmptyState';
import { useMaterialsByConstruction } from '@/hooks/use-materials';

interface MaterialsInventoryProps {
  construction: Construction;
  onGoToDeliveryNoteImport: () => void;
}

export function MaterialsInventory({
  construction,
  onGoToDeliveryNoteImport
}: MaterialsInventoryProps) {
  const { data: materialsData, isLoading, error } = useMaterialsByConstruction(construction.construction_id);
  const materials = materialsData?.materials || [];

  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.warehouseTitle}</CardTitle>
              <CardDescription>
                {t.warehouseDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-slate-600">Ładowanie materiałów...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">Błąd podczas ładowania materiałów: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && materials.length === 0 && (
            <EmptyState
              icon={Package}
              title={t.noMaterials}
              description={t.noMaterialsDesc}
            />
          )}

          {!isLoading && !error && materials.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.material}</TableHead>
                  <TableHead>{t.category}</TableHead>
                  <TableHead className="text-right">{t.unit}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.material_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{material.name}</div>
                        {material.description && (
                          <div className="text-sm text-slate-500">{material.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.category_id}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {material.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={onGoToDeliveryNoteImport}
        variant="outline"
        className="flex items-center"
      >
        <Upload className="size-4 mr-2" />
        {t.importDeliveryNote}
      </Button>
    </div>
  );
}