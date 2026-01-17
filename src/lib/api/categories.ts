import { Category } from '@/types';

const API_BASE_URL = '';

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  size: number;
}

export interface CategoriesQueryParams {
  page?: number;
  size?: number;
}

export async function getCategories(
  params?: CategoriesQueryParams
): Promise<CategoriesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());

  const url = `${API_BASE_URL}/api/v1/categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const data = await response.json() as CategoriesResponse;
  return data;
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.statusText}`);
  }

  const data = await response.json() as Category;
  return data;
}

export async function createCategory(
  data: { name: string }
): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.statusText}`);
  }

  const result = await response.json() as Category;
  return result;
}

export async function updateCategory(
  id: string,
  data: { name: string }
): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update category: ${response.statusText}`);
  }

  const result = await response.json() as Category;
  return result;
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete category: ${response.statusText}`);
  }
}

