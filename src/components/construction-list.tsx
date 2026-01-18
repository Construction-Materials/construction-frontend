'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Construction } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Building2, MapPin, Calendar, Plus, Search, Filter, X, RefreshCw } from 'lucide-react';
import { appConfig } from '../config/app-config';
import { useLanguage } from '../contexts/LanguageContext';
import { StatusBadge } from './shared/StatusBadge';
import { EmptyState } from './shared/EmptyState';
import { constructionKeys } from '@/hooks/use-constructions';

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
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    start_date: '',
    status: 'planned' as Construction['status'],
    description: ''
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Construction['status']>>(new Set());
  const [isReloading, setIsReloading] = useState(false);

  // Available statuses for filtering
  const statuses: Construction['status'][] = ['planned', 'active', 'completed'];

  // Filter constructions based on search query and selected statuses
  const filteredConstructions = useMemo(() => {
    return constructions.filter((construction) => {
      const matchesSearch = searchQuery === '' ||
        construction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        construction.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatuses.size === 0 ||
        selectedStatuses.has(construction.status);

      return matchesSearch && matchesStatus;
    });
  }, [constructions, searchQuery, selectedStatuses]);

  const hasFilters = searchQuery !== '' || selectedStatuses.size > 0;

  // Toggle status selection
  const toggleStatus = useCallback((status: Construction['status']) => {
    setSelectedStatuses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  }, []);

  // Clear all status filters
  const clearStatusFilters = useCallback(() => {
    setSelectedStatuses(new Set());
  }, []);

  // Reload data
  const handleReload = useCallback(async () => {
    setIsReloading(true);
    await queryClient.invalidateQueries({ queryKey: constructionKeys.all });
    setIsReloading(false);
  }, [queryClient]);

  const validateForm = () => {
    if (!formData.name.trim()) return 'name';
    if (!formData.address.trim()) return 'address';
    if (!formData.start_date) return 'start_date';
    if (!formData.status) return 'status';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidField = validateForm();
    if (invalidField) {
      setValidationError(invalidField);
      return;
    }

    setValidationError(null);
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

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setValidationError(null);
    }
  };

  const { t } = useLanguage();

  // Helper to get status label
  const getStatusLabel = (status: Construction['status']) => {
    switch (status) {
      case 'planned': return t.statusPlanned;
      case 'active': return t.statusActive;
      case 'completed': return t.statusCompleted;
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>{t.constructions}</h2>
          <p className="text-slate-600">{t.manageAllConstructions}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
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
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{t.fillAllRequiredFields}</p>
                </div>
              )}
              <div className={appConfig.spacing.formFields}>
                <Label htmlFor="name">{t.constructionName} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (validationError === 'name') setValidationError(null);
                  }}
                  placeholder={t.constructionNamePlaceholder}
                  className={validationError === 'name' ? 'border-red-500' : ''}
                />
              </div>
              <div className={appConfig.spacing.formFields}>
                <Label htmlFor="address">{t.location} *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (validationError === 'address') setValidationError(null);
                  }}
                  placeholder={t.locationPlaceholder}
                  className={validationError === 'address' ? 'border-red-500' : ''}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={appConfig.spacing.formFields}>
                  <Label htmlFor="start_date">{t.startDate} *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => {
                      setFormData({ ...formData, start_date: e.target.value });
                      if (validationError === 'start_date') setValidationError(null);
                    }}
                    className={validationError === 'start_date' ? 'border-red-500' : ''}
                  />
                </div>
                <div className={appConfig.spacing.formFields}>
                  <Label htmlFor="status">{t.status} *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => {
                      setFormData({ ...formData, status: value as Construction['status'] });
                      if (validationError === 'status') setValidationError(null);
                    }}
                  >
                    <SelectTrigger id="status" className={validationError === 'status' ? 'border-red-500' : ''}>
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
                  onClick={() => handleDialogChange(false)}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      {!isLoading && !error && constructions.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-3">
            {/* Search by name */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder={t.searchConstruction}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="size-4" />
                  {t.status}
                  {selectedStatuses.size > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedStatuses.size}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.filterByStatus}</span>
                    {selectedStatuses.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearStatusFilters}
                        className="h-auto p-1 text-xs"
                      >
                        {t.clearAll}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => {
                      const isSelected = selectedStatuses.has(status);
                      return (
                        <Badge
                          key={status}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => toggleStatus(status)}
                        >
                          {getStatusLabel(status)}
                          {isSelected && (
                            <X className="size-3 ml-1" />
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Reload button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleReload}
              disabled={isReloading}
              title={t.reload}
            >
              <RefreshCw className={`size-4 ${isReloading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Active status filters display */}
            {selectedStatuses.size > 0 && (
              <div className="flex flex-wrap gap-1 items-center">
                {Array.from(selectedStatuses).map((status) => (
                  <Badge
                    key={status}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleStatus(status)}
                  >
                    {getStatusLabel(status)}
                    <X className="size-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          {hasFilters && (
            <p className="text-sm text-slate-500">
              {t.showingResults}: {filteredConstructions.length} {t.of} {constructions.length}
            </p>
          )}
        </div>
      )}

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

      {!isLoading && !error && constructions.length > 0 && filteredConstructions.length === 0 && hasFilters && (
        <div className="text-center py-12">
          <p className="text-slate-600">{t.noMatchingConstructions}</p>
        </div>
      )}

      {!isLoading && !error && filteredConstructions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConstructions.map((construction) => (
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