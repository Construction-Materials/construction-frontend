import { StorageItem, CreateStorageItemRequest, UpdateStorageItemRequest, StorageItemsResponse, StorageMaterialsResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface StorageItemsQueryParams {
  page?: number;
  size?: number;
}

/**
 * Tworzy nowy storage item
 * POST /api/v1/storage-items/
 */
export async function createStorageItem(
  data: CreateStorageItemRequest
): Promise<StorageItem> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storage-items/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create storage item: ${response.statusText}`;
    try {
      const errorData = await response.json() as { message?: string; error?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Jeśli nie można sparsować JSON, użyj domyślnego komunikatu
    }
    throw new Error(errorMessage);
  }

  const result = await response.json() as StorageItem;
  return result;
}

/**
 * Aktualizuje storage item dla danej konstrukcji i materiału
 * PUT /api/v1/storage-items/construction/{construction_id}/material/{material_id}
 */
export async function updateStorageItem(
  constructionId: string,
  materialId: string,
  data: UpdateStorageItemRequest
): Promise<StorageItem> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}/material/${materialId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to update storage item: ${response.statusText}`;
    try {
      const errorData = await response.json() as { message?: string; error?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Jeśli nie można sparsować JSON, użyj domyślnego komunikatu
    }
    throw new Error(errorMessage);
  }

  const result = await response.json() as StorageItem;
  return result;
}

/**
 * Usuwa storage item dla danej konstrukcji i materiału
 * DELETE /api/v1/storage-items/construction/{construction_id}/material/{material_id}
 */
export async function deleteStorageItem(
  constructionId: string,
  materialId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}/material/${materialId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to delete storage item: ${response.statusText}`;
    try {
      const errorData = await response.json() as { message?: string; error?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Jeśli nie można sparsować JSON, użyj domyślnego komunikatu
    }
    throw new Error(errorMessage);
  }
}

/**
 * Pobiera storage items dla danej konstrukcji
 * GET /api/v1/storage-items/construction/{construction_id}
 */
export async function getStorageItemsByConstruction(
  constructionId: string,
  params?: StorageItemsQueryParams
): Promise<StorageItemsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());

  const url = `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch storage items: ${response.statusText}`;
    try {
      const errorData = await response.json() as { message?: string; error?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Jeśli nie można sparsować JSON, użyj domyślnego komunikatu
    }
    throw new Error(errorMessage);
  }

  const data = await response.json() as StorageItemsResponse;
  return data;
}

/**
 * Tworzy wiele storage items dla danej konstrukcji
 * POST /api/v1/storage-items/construction/{construction_id}
 */
export async function createStorageItemsBulk(
  constructionId: string,
  items: CreateStorageItemRequest[]
): Promise<StorageItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}/bulk`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to create storage items: ${response.statusText}`;
    try {
      const errorData = await response.json() as { message?: string; error?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Jeśli nie można sparsować JSON, użyj domyślnego komunikatu
    }
    throw new Error(errorMessage);
  }

  const result = await response.json() as StorageItem[];
  return result;
}

/**
 * Pobiera materiały z informacjami o storage dla danej konstrukcji
 * GET /api/v1/storage-items/construction/{construction_id}/materials
 */
export async function getStorageMaterialsByConstruction(
  constructionId: string
): Promise<StorageMaterialsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}/materials`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to fetch storage materials: ${response.statusText}`;
    try {
      const errorData = await response.json() as { message?: string; error?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Jeśli nie można sparsować JSON, użyj domyślnego komunikatu
    }
    throw new Error(errorMessage);
  }

  const data = await response.json() as StorageMaterialsResponse;
  return data;
}

