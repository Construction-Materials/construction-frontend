'use client';

import { Construction } from '@/types';
import { MapPin, Calendar, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConstructionInfoProps {
  construction: Construction;
}

export function ConstructionInfo({ construction }: ConstructionInfoProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="size-4 text-slate-500 flex-shrink-0" />
        <span className="text-slate-700">{construction.address}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="size-4 text-slate-500 flex-shrink-0" />
        <span className="text-slate-700">
          {t.startedOn}: {new Date(construction.start_date).toLocaleDateString(t.locale)}
        </span>
      </div>
    </div>
  );
}
