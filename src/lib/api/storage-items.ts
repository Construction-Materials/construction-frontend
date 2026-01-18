import { StorageItem } from '@/types';

const API_BASE_URL = '';

export interface StorageItemsResponse {
  storage_items: StorageItem[];
  total: number;
  page: number;
  size: number;
}

export interface StorageItemsQueryParams {
  limit?: number;
  offset?: number;
}

export async function getStorageItemsByConstruction(
  constructionId: string,
  params?: StorageItemsQueryParams
): Promise<StorageItemsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
  if (params?.offset !== undefined) searchParams.append('offset', params.offset.toString());

  const url = `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch storage items: ${response.statusText}`);
  }

  const data = await response.json() as StorageItemsResponse;
  return data;
}

export async function getStorageItem(
  constructionId: string,
  materialId: string
): Promise<StorageItem> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}/material/${materialId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch storage item: ${response.statusText}`);
  }

  const data = await response.json() as StorageItem;
  return data;
}

export async function updateStorageItem(
  constructionId: string,
  materialId: string,
  data: { quantity_value: string }
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
    throw new Error(`Failed to update storage item: ${response.statusText}`);
  }

  const result = await response.json() as StorageItem;
  return result;
}

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
    throw new Error(`Failed to delete storage item: ${response.statusText}`);
  }
}

export interface BulkStorageItemInput {
  construction_id: string;
  material_id: string;
  quantity_value: number;
}

export async function bulkCreateStorageItems(
  constructionId: string,
  items: BulkStorageItemInput[]
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
    throw new Error(`Failed to bulk create storage items: ${response.statusText}`);
  }

  const data = await response.json() as StorageItem[];
  return data;
}
