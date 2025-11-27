'use client';

import { Construction } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { appConfig } from '@/config/app-config';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConstructionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  construction: Construction | null;
  formData: Partial<Construction>;
  onFormDataChange: (data: Partial<Construction>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending?: boolean;
}

export function ConstructionEditDialog({
  open,
  onOpenChange,
  construction,
  formData,
  onFormDataChange,
  onSubmit,
  isPending = false,
}: ConstructionEditDialogProps) {
  const { t } = useLanguage();

  if (!construction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.editConstruction}</DialogTitle>
          <DialogDescription>
            {t.updateConstructionInfo}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className={`${appConfig.spacing.formSections} ${appConfig.spacing.headerMargin}`}>
          <div className={appConfig.spacing.formFields}>
            <Label htmlFor="edit-name">{t.constructionName} *</Label>
            <Input
              id="edit-name"
              value={formData.name || ''}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder={t.constructionNamePlaceholder}
              required
            />
          </div>
          <div className={appConfig.spacing.formFields}>
            <Label htmlFor="edit-address">{t.location} *</Label>
            <Input
              id="edit-address"
              value={formData.address || ''}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              placeholder={t.locationPlaceholder}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={appConfig.spacing.formFields}>
              <Label htmlFor="edit-start_date">{t.startDate} *</Label>
              <Input
                id="edit-start_date"
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => onFormDataChange({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className={appConfig.spacing.formFields}>
              <Label htmlFor="edit-status">{t.status} *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormDataChange({ ...formData, status: value as Construction['status'] })}
              >
                <SelectTrigger id="edit-status">
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
            <Label htmlFor="edit-description">{t.description}</Label>
            <Textarea
              id="edit-description"
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder={t.descriptionPlaceholder}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t.saving : t.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

