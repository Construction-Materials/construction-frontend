import { Material } from '@/types';

const API_BASE_URL = '';

// Kept for use by non-overlapping functions below
export interface MaterialsResponse {
  materials: Material[];
  total: number;
  page: number;
  size: number;
}

export interface MaterialsQueryParams {
  limit?: number;
  offset?: number;
}

export async function getMaterials(): Promise<Material[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials: ${response.statusText}`);
  }

  return response.json() as Promise<Material[]>;
}

export async function getMaterialById(id: string): Promise<Material> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch material: ${response.statusText}`);
  }

  return response.json() as Promise<Material>;
}

export async function createMaterial(data: {
  name: string;
  description: string;
  categoryId: string;
  unitId: string;
}): Promise<Material> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create material: ${response.statusText}`);
  }

  return response.json() as Promise<Material>;
}

export async function updateMaterial(
  id: string,
  data: Partial<Pick<Material, 'name' | 'description' | 'categoryId' | 'unitId'>>
): Promise<Material> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update material: ${response.statusText}`);
  }

  return response.json() as Promise<Material>;
}

export async function deleteMaterial(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/materials/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
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
  if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
  if (params?.offset !== undefined) searchParams.append('offset', params.offset.toString());

  const url = `${API_BASE_URL}/api/v1/materials/by-construction/${constructionId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials: ${response.statusText}`);
  }

  return response.json() as Promise<MaterialsResponse>;
}

export async function getMaterialsByCategory(
  categoryId: string,
  params?: MaterialsQueryParams
): Promise<MaterialsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
  if (params?.offset !== undefined) searchParams.append('offset', params.offset.toString());

  const url = `${API_BASE_URL}/api/v1/materials/category/${categoryId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials by category: ${response.statusText}`);
  }

  return response.json() as Promise<MaterialsResponse>;
}
