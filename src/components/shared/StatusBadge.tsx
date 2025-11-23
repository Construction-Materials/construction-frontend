'use client';

import { Badge } from '../ui/badge';
import { Construction, Order } from '@/types';
import { useLanguage } from '../../contexts/LanguageContext';

type StatusType = Construction['status'] | Order['status'];

interface StatusBadgeProps {
  status: StatusType;
  type: 'construction' | 'order';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const { t } = useLanguage();
  
  const getStatusColor = (status: StatusType) => {
    if (type === 'construction') {
      switch (status as Construction['status']) {
        case 'planned':
          return 'bg-blue-100 text-blue-800';
        case 'active':
          return 'bg-green-100 text-green-800';
        case 'completed':
          return 'bg-slate-100 text-slate-800';
      }
    } else {
      switch (status as Order['status']) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'ordered':
          return 'bg-blue-100 text-blue-800';
        case 'delivered':
          return 'bg-green-100 text-green-800';
      }
    }
  };

  const getStatusLabel = (status: StatusType) => {
    if (type === 'construction') {
      switch (status as Construction['status']) {
        case 'planned':
          return t.statusPlanned;
        case 'active':
          return t.statusActive;
        case 'completed':
          return t.statusCompleted;
      }
    } else {
      switch (status as Order['status']) {
        case 'pending':
          return t.pending;
        case 'ordered':
          return t.ordered;
        case 'delivered':
          return t.delivered;
      }
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
