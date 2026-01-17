import { Construction } from '@/types';

const API_BASE_URL = '';

export interface ConstructionsResponse {
  constructions: Construction[];
  total: number;
  page: number;
  size: number;
}

export interface ConstructionsQueryParams {
  page?: number;
  size?: number;
}

export async function getConstructions(
  params?: ConstructionsQueryParams
): Promise<ConstructionsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());

  const url = `${API_BASE_URL}/api/v1/constructions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch constructions: ${response.statusText}`);
  }

  const data = await response.json() as ConstructionsResponse;
  return data;
}

export async function getConstructionById(id: string): Promise<Construction> {
  const response = await fetch(`${API_BASE_URL}/api/v1/constructions/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch construction: ${response.statusText}`);
  }

  const data = await response.json() as Construction;
  return data;
}

export async function createConstruction(
  data: Omit<Construction, 'construction_id' | 'created_at'>
): Promise<Construction> {
  const response = await fetch(`${API_BASE_URL}/api/v1/constructions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create construction: ${response.statusText}`);
  }

  const result = await response.json() as Construction;
  return result;
}

export async function updateConstruction(
  id: string,
  data: Partial<Construction>
): Promise<Construction> {
  const response = await fetch(`${API_BASE_URL}/api/v1/constructions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update construction: ${response.statusText}`);
  }

  const result = await response.json() as Construction;
  return result;
}

export async function deleteConstruction(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/constructions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete construction: ${response.statusText}`);
  }
}

