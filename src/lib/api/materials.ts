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

