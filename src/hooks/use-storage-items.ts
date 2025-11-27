import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStorageItemsByConstruction,
  getStorageMaterialsByConstruction,
  createStorageItem,
  updateStorageItem,
  deleteStorageItem,
  createStorageItemsBulk,
  type StorageItemsQueryParams,
} from '@/lib/api/storage-items';
import { StorageItem, CreateStorageItemRequest, UpdateStorageItemRequest } from '@/types';

// Query keys
export const storageItemKeys = {
  all: ['storage-items'] as const,
  lists: () => [...storageItemKeys.all, 'list'] as const,
  byConstruction: (constructionId: string) => [...storageItemKeys.all, 'by-construction', constructionId] as const,
  byConstructionWithParams: (constructionId: string, params?: StorageItemsQueryParams) => 
    [...storageItemKeys.byConstruction(constructionId), params] as const,
  materialsByConstruction: (constructionId: string) => 
    [...storageItemKeys.all, 'materials-by-construction', constructionId] as const,
};

// Hook do pobierania storage items dla konstrukcji
export function useStorageItemsByConstruction(
  constructionId: string,
  params?: StorageItemsQueryParams
) {
  return useQuery({
    queryKey: storageItemKeys.byConstructionWithParams(constructionId, params),
    queryFn: () => getStorageItemsByConstruction(constructionId, params),
    enabled: !!constructionId,
  });
}

// Hook do pobierania materiałów z storage dla konstrukcji
export function useStorageMaterialsByConstruction(constructionId: string) {
  return useQuery({
    queryKey: storageItemKeys.materialsByConstruction(constructionId),
    queryFn: () => getStorageMaterialsByConstruction(constructionId),
    enabled: !!constructionId,
  });
}

// Hook do tworzenia storage item
export function useCreateStorageItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStorageItemRequest) => createStorageItem(data),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.byConstruction(data.construction_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.materialsByConstruction(data.construction_id) 
      });
    },
  });
}

// Hook do aktualizacji storage item
export function useUpdateStorageItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      constructionId, 
      materialId, 
      data 
    }: { 
      constructionId: string; 
      materialId: string; 
      data: UpdateStorageItemRequest 
    }) => updateStorageItem(constructionId, materialId, data),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.byConstruction(data.construction_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.materialsByConstruction(data.construction_id) 
      });
    },
  });
}

// Hook do usuwania storage item
export function useDeleteStorageItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      constructionId, 
      materialId 
    }: { 
      constructionId: string; 
      materialId: string 
    }) => deleteStorageItem(constructionId, materialId),
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.byConstruction(variables.constructionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.materialsByConstruction(variables.constructionId) 
      });
    },
  });
}

// Hook do tworzenia wielu storage items
export function useCreateStorageItemsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      constructionId, 
      items 
    }: { 
      constructionId: string; 
      items: CreateStorageItemRequest[] 
    }) => createStorageItemsBulk(constructionId, items),
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.byConstruction(variables.constructionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: storageItemKeys.materialsByConstruction(variables.constructionId) 
      });
    },
  });
}

