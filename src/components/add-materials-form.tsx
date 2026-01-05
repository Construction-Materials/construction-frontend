'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Package } from 'lucide-react';
import { appConfig } from '../config/app-config';
import { useLanguage } from '../contexts/LanguageContext';

interface MaterialFormData {
  name: string;
  unit: string;
  category: string;
  description: string;
}

interface AddMaterialsFormProps {
  onAddMaterials: (materials: MaterialFormData[]) => Promise<void>;
  categories: Array<{ category_id: string; name: string }>;
  isLoading?: boolean;
}

export function AddMaterialsForm({ onAddMaterials, categories, isLoading = false }: AddMaterialsFormProps) {
  const [materials, setMaterials] = useState<MaterialFormData[]>([
    { name: '', unit: '', category: '', description: '' }
  ]);

  const handleAddRow = () => {
    setMaterials([
      ...materials,
      { name: '', unit: '', category: '', description: '' }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index: number, field: keyof MaterialFormData, value: string) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMaterials = materials.filter(m => m.name && m.unit && m.category);
    if (validMaterials.length > 0) {
      await onAddMaterials(validMaterials);
    }
  };

  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t.addNewMaterials}</CardTitle>
          <CardDescription>
            {t.addMaterialsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={appConfig.spacing.formSections}>
            <div className={appConfig.spacing.formCards}>
              {materials.map((material, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="size-5 text-slate-500" />
                        <CardTitle className="text-lg">
                          {t.material} {index + 1}
                        </CardTitle>
                      </div>
                      {materials.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(index)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className={appConfig.spacing.formSections}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={appConfig.spacing.formFields}>
                        <Label htmlFor={`name-${index}`}>
                          {t.materialName} *
                        </Label>
                        <Input
                          id={`name-${index}`}
                          value={material.name}
                          onChange={(e) => handleChange(index, 'name', e.target.value)}
                          placeholder={t.constructionNamePlaceholder}
                          required
                        />
                      </div>
                      <div className={appConfig.spacing.formFields}>
                        <Label htmlFor={`unit-${index}`}>
                          {t.unit} *
                        </Label>
                        <Select
                          value={material.unit}
                          onValueChange={(value) => handleChange(index, 'unit', value)}
                        >
                          <SelectTrigger id={`unit-${index}`}>
                            <SelectValue placeholder={t.selectUnit} />
                          </SelectTrigger>
                          <SelectContent>
                            {appConfig.materialUnits.map(unit => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className={appConfig.spacing.formFields}>
                      <Label htmlFor={`category-${index}`}>
                        {t.category} *
                      </Label>
                      <Select
                        value={material.category}
                        onValueChange={(value) => handleChange(index, 'category', value)}
                      >
                        <SelectTrigger id={`category-${index}`}>
                          <SelectValue placeholder={t.selectCategory} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-slate-500">
                              {t.noCategories}
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
                    <div className={appConfig.spacing.formFields}>
                      <Label htmlFor={`description-${index}`}>
                        {t.description}
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        value={material.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                        placeholder={t.descriptionPlaceholder}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddRow}
                className="flex-1"
              >
                <Plus className="size-4 mr-2" />
                {t.addAnotherMaterial}
              </Button>
            </div>

            <div className={`flex gap-3 ${appConfig.spacing.formButtons} border-t`}>
              <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
                {isLoading ? t.saving : `${t.saveAllMaterials} (${materials.filter(m => m.name && m.unit && m.category).length})`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}