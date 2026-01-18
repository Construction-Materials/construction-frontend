'use client';

import { Badge } from '../ui/badge';
import { Construction } from '@/types';
import { useLanguage } from '../../contexts/LanguageContext';

interface StatusBadgeProps {
  status: Construction['status'];
  type?: 'construction';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();

  const getStatusColor = (status: Construction['status']) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: Construction['status']) => {
    switch (status) {
      case 'planned':
        return t.statusPlanned;
      case 'active':
        return t.statusActive;
      case 'completed':
        return t.statusCompleted;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
