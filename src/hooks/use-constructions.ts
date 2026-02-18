import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConstructions,
  getConstructionById,
  createConstruction,
  updateConstruction,
  deleteConstruction,
  type CreateConstructionInput,
} from '@/lib/api/constructions';
import { showSuccessNotification, showErrorNotification } from '@/lib/notifications';

export const constructionKeys = {
  all: ['constructions'] as const,
  lists: () => [...constructionKeys.all, 'list'] as const,
  list: () => [...constructionKeys.lists()] as const,
  details: () => [...constructionKeys.all, 'detail'] as const,
  detail: (id: string) => [...constructionKeys.details(), id] as const,
};

export function useConstructions() {
  return useQuery({
    queryKey: constructionKeys.list(),
    queryFn: () => getConstructions(),
  });
}

export function useConstruction(id: string) {
  return useQuery({
    queryKey: constructionKeys.detail(id),
    queryFn: () => getConstructionById(id),
    enabled: !!id,
  });
}

export function useCreateConstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConstructionInput) => createConstruction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

export function useUpdateConstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateConstructionInput> }) =>
      updateConstruction(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: constructionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: constructionKeys.detail(data.constructionId) });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

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
