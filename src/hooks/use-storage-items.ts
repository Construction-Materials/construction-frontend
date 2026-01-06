import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStorageItemsByConstruction,
  getStorageItem,
  updateStorageItem,
  deleteStorageItem,
  bulkCreateStorageItems,
  type StorageItemsQueryParams,
  type BulkStorageItemInput,
} from '@/lib/api/storage-items';

export const storageItemKeys = {
  all: ['storage-items'] as const,
  byConstruction: (constructionId: string) =>
    [...storageItemKeys.all, 'by-construction', constructionId] as const,
  byConstructionWithParams: (constructionId: string, params?: StorageItemsQueryParams) =>
    [...storageItemKeys.byConstruction(constructionId), params] as const,
  item: (constructionId: string, materialId: string) =>
    [...storageItemKeys.all, 'item', constructionId, materialId] as const,
};

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

export function useStorageItem(constructionId: string, materialId: string) {
  return useQuery({
    queryKey: storageItemKeys.item(constructionId, materialId),
    queryFn: () => getStorageItem(constructionId, materialId),
    enabled: !!constructionId && !!materialId,
  });
}

export function useUpdateStorageItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      constructionId,
      materialId,
      data,
    }: {
      constructionId: string;
      materialId: string;
      data: { quantity_value: string };
    }) => updateStorageItem(constructionId, materialId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: storageItemKeys.byConstruction(variables.constructionId),
      });
      queryClient.invalidateQueries({
        queryKey: storageItemKeys.item(variables.constructionId, variables.materialId),
      });
    },
  });
}

export function useDeleteStorageItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      constructionId,
      materialId,
    }: {
      constructionId: string;
      materialId: string;
    }) => deleteStorageItem(constructionId, materialId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: storageItemKeys.byConstruction(variables.constructionId),
      });
    },
  });
}

export function useBulkCreateStorageItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      constructionId,
      items,
    }: {
      constructionId: string;
      items: BulkStorageItemInput[];
    }) => bulkCreateStorageItems(constructionId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: storageItemKeys.byConstruction(variables.constructionId),
      });
    },
  });
}
