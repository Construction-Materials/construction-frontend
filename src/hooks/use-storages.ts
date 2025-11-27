import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStoragesByConstruction,
  createStorage,
  updateStorage,
  deleteStorage,
  type CreateStorageRequest,
  type UpdateStorageRequest,
} from '@/lib/api/storages';
import { Storage } from '@/types';

// Query keys
export const storageKeys = {
  all: ['storages'] as const,
  lists: () => [...storageKeys.all, 'list'] as const,
  byConstruction: (constructionId: string) => 
    [...storageKeys.all, 'by-construction', constructionId] as const,
  details: () => [...storageKeys.all, 'detail'] as const,
  detail: (id: string) => [...storageKeys.details(), id] as const,
};

// Hook do pobierania storages dla konstrukcji
export function useStoragesByConstruction(constructionId: string) {
  return useQuery({
    queryKey: storageKeys.byConstruction(constructionId),
    queryFn: () => getStoragesByConstruction(constructionId),
    enabled: !!constructionId,
  });
}

// Hook do tworzenia storage
export function useCreateStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStorageRequest) => createStorage(data),
    onSuccess: (data) => {
      // Invalidate queries dla danej konstrukcji
      queryClient.invalidateQueries({ 
        queryKey: storageKeys.byConstruction(data.construction_id) 
      });
      queryClient.invalidateQueries({ queryKey: storageKeys.lists() });
    },
  });
}

// Hook do aktualizacji storage
export function useUpdateStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storageId, data }: { storageId: string; data: UpdateStorageRequest }) =>
      updateStorage(storageId, data),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: storageKeys.byConstruction(data.construction_id) 
      });
      queryClient.invalidateQueries({ queryKey: storageKeys.detail(data.storage_id) });
      queryClient.invalidateQueries({ queryKey: storageKeys.lists() });
    },
  });
}

// Hook do usuwania storage
export function useDeleteStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storageId: string) => deleteStorage(storageId),
    onSuccess: (_, storageId) => {
      // Invalidate queries - musimy znaleźć construction_id z cache
      queryClient.invalidateQueries({ queryKey: storageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storageKeys.detail(storageId) });
      // Invalidate wszystkie by-construction queries, ponieważ nie mamy construction_id
      queryClient.invalidateQueries({ 
        queryKey: [...storageKeys.all, 'by-construction'] 
      });
    },
  });
}

