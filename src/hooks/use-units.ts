import { useQuery } from '@tanstack/react-query';
import { getUnits } from '@/lib/api/units';
import { Unit } from '@/types';

export const unitKeys = {
  all: ['units'] as const,
  list: () => [...unitKeys.all, 'list'] as const,
};

export function useUnits() {
  return useQuery({
    queryKey: unitKeys.list(),
    queryFn: () => getUnits(),
  });
}

export function useUnitMap(): Map<string, Unit> {
  const { data } = useUnits();
  const map = new Map<string, Unit>();
  data?.forEach((unit) => map.set(unit.unitId, unit));
  return map;
}
