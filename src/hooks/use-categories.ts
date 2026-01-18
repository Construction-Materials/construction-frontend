import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoriesQueryParams,
} from '@/lib/api/categories';
import { Category } from '@/types';
import { showSuccessNotification, showErrorNotification } from '@/lib/notifications';

/*
The queryKey is how React Query tracks your data in its cache.
queryFn (The Fetcher) 
React Query executes this function when it decides it needs data 
(e.g., on component mount or when the queryKey changes). 
It handles the await logic internally and exposes the result via data, isLoading, and isError.
*/

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: CategoriesQueryParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Hook do pobierania listy kategorii
export function useCategories(params?: CategoriesQueryParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategories(params),
  });
}

// Hook do pobierania pojedynczej kategorii
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
}

// Hook do tworzenia kategorii
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

// Hook do aktualizacji kategorii
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

// Hook do usuwania kategorii
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      showSuccessNotification();
    },
    onError: () => {
      showErrorNotification();
    },
  });
}

