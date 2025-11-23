import { Material } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface MaterialsResponse {
  materials: Material[];
  total: number;
  page: number;
  size: number;
}

export interface MaterialsQueryParams {
  page?: number;
  size?: number;
}

export async function getMaterials(
  params?: MaterialsQueryParams
): Promise<MaterialsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());

  const url = `${API_BASE_URL}/api/v1/materials/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials: ${response.statusText}`);
  }

  const data = await response.json() as MaterialsResponse;
  return data;
}

export async function getMaterialById(id: string): Promise<Material> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch material: ${response.statusText}`);
  }

  const data = await response.json() as Material;
  return data;
}

export async function updateMaterial(
  id: string,
  data: Partial<Material>
): Promise<Material> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update material: ${response.statusText}`);
  }

  const result = await response.json() as Material;
  return result;
}

export async function deleteMaterial(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete material: ${response.statusText}`);
  }
}

export async function getMaterialsByConstruction(
  constructionId: string,
  params?: MaterialsQueryParams
): Promise<MaterialsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());

  const url = `${API_BASE_URL}/api/v1/materials/by-construction/${constructionId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials: ${response.statusText}`);
  }

  const data = await response.json() as MaterialsResponse;
  return data;
}

export async function getMaterialsByCategory(
  categoryId: string,
  params?: MaterialsQueryParams
): Promise<MaterialsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());

  const url = `${API_BASE_URL}/api/v1/materials/category/${categoryId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials by category: ${response.statusText}`);
  }

  const data = await response.json() as MaterialsResponse;
  return data;
}
