import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMaterials,
  getMaterialById,
  getMaterialsByConstruction,
  getMaterialsByCategory,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  type MaterialsQueryParams,
} from '@/lib/api/materials';
import { Material } from '@/types';
import { showSuccessNotification, showErrorNotification } from '@/lib/notifications';

export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: () => [...materialKeys.lists()] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  byConstruction: (constructionId: string) => [...materialKeys.all, 'by-construction', constructionId] as const,
  byConstructionWithParams: (constructionId: string, params?: MaterialsQueryParams) =>
    [...materialKeys.byConstruction(constructionId), params] as const,
  byCategory: (categoryId: string) => [...materialKeys.all, 'by-category', categoryId] as const,
  byCategoryWithParams: (categoryId: string, params?: MaterialsQueryParams) =>
    [...materialKeys.byCategory(categoryId), params] as const,
};

export function useMaterials() {
  return useQuery({
    queryKey: materialKeys.list(),
    queryFn: () => getMaterials(),
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => getMaterialById(id),
    enabled: !!id,
  });
}

// Not in new API — left unchanged
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

// Not in new API — left unchanged
export function useMaterialsByCategory(
  categoryId: string,
  params?: MaterialsQueryParams
) {
  return useQuery({
    queryKey: materialKeys.byCategoryWithParams(categoryId, params),
    queryFn: () => getMaterialsByCategory(categoryId, params),
    enabled: !!categoryId,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      categoryId: string;
      unitId: string;
    }) => createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Material, 'name' | 'description' | 'categoryId' | 'unitId'>> }) =>
      updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}
