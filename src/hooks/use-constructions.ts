import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConstructions,
  getConstructionById,
  createConstruction,
  updateConstruction,
  deleteConstruction,
  type ConstructionsQueryParams,
} from '@/lib/api/constructions';
import { Construction } from '@/types';
import { showSuccessNotification, showErrorNotification } from '@/lib/notifications';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
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
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: constructionKeys.detail(data.construction_id) });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

// Hook do usuwania konstrukcji
export function useDeleteConstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConstruction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}
