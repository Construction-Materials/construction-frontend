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

// Query keys
export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (params?: MaterialsQueryParams) => [...materialKeys.lists(), params] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  byConstruction: (constructionId: string) => [...materialKeys.all, 'by-construction', constructionId] as const,
  byConstructionWithParams: (constructionId: string, params?: MaterialsQueryParams) => 
    [...materialKeys.byConstruction(constructionId), params] as const,
  byCategory: (categoryId: string) => [...materialKeys.all, 'by-category', categoryId] as const,
  byCategoryWithParams: (categoryId: string, params?: MaterialsQueryParams) => 
    [...materialKeys.byCategory(categoryId), params] as const,
};

// Hook do pobierania wszystkich materiałów
export function useMaterials(params?: MaterialsQueryParams) {
  return useQuery({
    queryKey: materialKeys.list(params),
    queryFn: () => getMaterials(params),
  });
}

// Hook do pobierania pojedynczego materiału
export function useMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => getMaterialById(id),
    enabled: !!id,
  });
}

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

// Hook do pobierania materiałów po kategorii
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

// Hook do tworzenia materiału
export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      category_id: string;
      name: string;
      description: string;
      unit: string;
    }) => createMaterial(data),
    onSuccess: () => {
      // Invalidate queries, aby odświeżyć listę
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
  });
}

// Hook do aktualizacji materiału
export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Material> }) =>
      updateMaterial(id, data),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(data.material_id) });
      queryClient.invalidateQueries({ queryKey: materialKeys.byCategory(data.category_id) });
    },
  });
}

// Hook do usuwania materiału
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
  });
}

