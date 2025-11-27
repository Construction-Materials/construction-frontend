import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConstructions,
  getConstructionById,
  createConstruction,
  updateConstruction,
  deleteConstruction,
  analyzeDocument,
  type ConstructionsQueryParams,
  type AnalyzeDocumentResponse,
} from '@/lib/api/constructions';
import { createStorage } from '@/lib/api/storages';
import { storageKeys } from './use-storages';
import { Construction } from '@/types';

// Query keys
export const constructionKeys = {
  all: ['constructions'] as const,
  lists: () => [...constructionKeys.all, 'list'] as const,
  list: (params?: ConstructionsQueryParams) => [...constructionKeys.lists(), params] as const,
  details: () => [...constructionKeys.all, 'detail'] as const,
  detail: (id: string) => [...constructionKeys.details(), id] as const,
};

// Hook do pobierania listy konstrukcji
export function useConstructions(params?: ConstructionsQueryParams) {
  return useQuery({
    queryKey: constructionKeys.list(params),
    queryFn: () => getConstructions(params),
  });
}

// Hook do pobierania pojedynczej konstrukcji
export function useConstruction(id: string) {
  return useQuery({
    queryKey: constructionKeys.detail(id),
    queryFn: () => getConstructionById(id),
    enabled: !!id,
  });
}

// Hook do tworzenia konstrukcji
export function useCreateConstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Construction, 'construction_id' | 'created_at'>) =>
      createConstruction(data),
    onSuccess: async (construction) => {
      // Automatycznie utwórz storage o nazwie "unknown" dla nowej konstrukcji
      try {
        await createStorage({
          construction_id: construction.construction_id,
          name: 'unknown',
        });
        // Invalidate queries dla storages
        queryClient.invalidateQueries({ 
          queryKey: storageKeys.byConstruction(construction.construction_id) 
        });
      } catch (error) {
        console.error('Failed to create default storage:', error);
        // Nie rzucamy błędu, aby nie przerwać procesu tworzenia konstrukcji
      }
      // Invalidate queries, aby odświeżyć listę
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
    },
  });
}

// Hook do aktualizacji konstrukcji
export function useUpdateConstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Construction> }) =>
      updateConstruction(id, data),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: constructionKeys.detail(data.construction_id) });
    },
  });
}

// Hook do usuwania konstrukcji
export function useDeleteConstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConstruction(id),
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
    },
  });
}

// Hook do analizy dokumentu
export function useAnalyzeDocument() {
  return useMutation({
    mutationFn: ({ constructionId, file }: { constructionId: string; file: File }) =>
      analyzeDocument(constructionId, file),
  });
}

