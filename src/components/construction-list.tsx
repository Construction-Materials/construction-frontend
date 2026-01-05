'use client';

import { useState } from 'react';
import { Construction } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2, MapPin, Calendar, Plus } from 'lucide-react';
import { appConfig } from '../config/app-config';
import { useLanguage } from '../contexts/LanguageContext';
import { StatusBadge } from './shared/StatusBadge';
import { EmptyState } from './shared/EmptyState';

interface ConstructionListProps {
  constructions: Construction[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectConstruction: (id: string) => void;
  onAddConstruction: (construction: Omit<Construction, 'construction_id' | 'created_at'>) => Promise<void>;
}

export function ConstructionList({
  constructions,
  isLoading = false,
  error,
  onSelectConstruction,
  onAddConstruction
}: ConstructionListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    start_date: '',
    status: 'planned' as Construction['status'],
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAddConstruction(formData);
      setFormData({
        name: '',
        address: '',
        start_date: '',
        status: 'planned',
        description: ''
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to add construction:', error);
    }
  };

  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>{t.constructions}</h2>
          <p className="text-slate-600">{t.manageAllConstructions}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              {t.newConstruction}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.addNewConstruction}</DialogTitle>
              <DialogDescription>
                {t.fillBasicConstructionInfo}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className={`${appConfig.spacing.formSections} ${appConfig.spacing.headerMargin}`}>
              <div className={appConfig.spacing.formFields}>
                <Label htmlFor="name">{t.constructionName} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.constructionNamePlaceholder}
                  required
                />
              </div>
              <div className={appConfig.spacing.formFields}>
                <Label htmlFor="address">{t.location} *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t.locationPlaceholder}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={appConfig.spacing.formFields}>
                  <Label htmlFor="start_date">{t.startDate} *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className={appConfig.spacing.formFields}>
                  <Label htmlFor="status">{t.status} *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Construction['status'] })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">{t.statusPlanned}</SelectItem>
                      <SelectItem value="active">{t.statusActive}</SelectItem>
                      <SelectItem value="completed">{t.statusCompleted}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className={appConfig.spacing.formFields}>
                <Label htmlFor="description">{t.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.descriptionPlaceholder}
                  rows={3}
                />
              </div>
              <div className={`flex gap-3 ${appConfig.spacing.formButtons}`}>
                <Button type="submit" className="flex-1">
                  {t.addConstruction}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-600">{t.loading}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">{t.errorLoadingConstructions}: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {constructions.map((construction) => (
          <Card
            key={construction.construction_id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectConstruction(construction.construction_id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <Building2 className="size-5 text-slate-500 mt-1 flex-shrink-0" />
                <StatusBadge status={construction.status} type="construction" />
              </div>
              <CardTitle className="mt-2">{construction.name}</CardTitle>
              {construction.description && (
                <CardDescription>{construction.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="size-4 flex-shrink-0" />
                <span>{construction.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="size-4 flex-shrink-0" />
                <span>{t.startedOn}: {new Date(construction.start_date).toLocaleDateString(t.locale)}</span>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && constructions.length === 0 && (
        <EmptyState
          icon={Building2}
          title={t.noConstructions}
          description={t.startByAdding}
          actionLabel={t.addFirstConstruction}
          onAction={() => setDialogOpen(true)}
        />
      )}
    </div>
  );
}