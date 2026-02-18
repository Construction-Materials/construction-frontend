import { Category } from '@/types';

export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/v1/categories', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json() as Promise<Category[]>;
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await fetch(`/api/v1/categories/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.statusText}`);
  }

  return response.json() as Promise<Category>;
}

export async function createCategory(data: { name: string }): Promise<Category> {
  const response = await fetch('/api/v1/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.statusText}`);
  }

  return response.json() as Promise<Category>;
}

export async function updateCategory(id: string, data: { name?: string }): Promise<Category> {
  const response = await fetch(`/api/v1/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update category: ${response.statusText}`);
  }

  return response.json() as Promise<Category>;
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/v1/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete category: ${response.statusText}`);
  }
}
