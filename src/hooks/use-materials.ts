import { useQuery } from '@tanstack/react-query';
import {
  getMaterialsByConstruction,
  type MaterialsQueryParams,
} from '@/lib/api/materials';

// Query keys
export const materialKeys = {
  all: ['materials'] as const,
  byConstruction: (constructionId: string) => [...materialKeys.all, 'by-construction', constructionId] as const,
  byConstructionWithParams: (constructionId: string, params?: MaterialsQueryParams) => 
    [...materialKeys.byConstruction(constructionId), params] as const,
};

// Hook do pobierania materiałów dla konstrukcji
export function useMaterialsByConstruction(
  constructionId: string,
  params?: MaterialsQueryParams
) {
  return useQuery({
    queryKey: materialKeys.byConstructionWithParams(constructionId, params),
    queryFn: () => getMaterialsByConstruction(constructionId, params),
    enabled: !!constructionId,
  });
}

