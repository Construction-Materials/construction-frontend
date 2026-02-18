import { StorageItem } from '@/types';

const API_BASE_URL = '';

// Kept for use by non-overlapping functions below
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

// Not in new API — left unchanged
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
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch storage items: ${response.statusText}`);
  }

  return response.json() as Promise<StorageItemsResponse>;
}

// GET /storage-items/:constructionId/:materialId
export async function getStorageItem(
  constructionId: string,
  materialId: string
): Promise<StorageItem> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/${constructionId}/${materialId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch storage item: ${response.statusText}`);
  }

  return response.json() as Promise<StorageItem>;
}

// PUT /storage-items/:constructionId/:materialId
export async function updateStorageItem(
  constructionId: string,
  materialId: string,
  data: { quantityValue: number }
): Promise<StorageItem> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/${constructionId}/${materialId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update storage item: ${response.statusText}`);
  }

  return response.json() as Promise<StorageItem>;
}

// DELETE /storage-items/:constructionId/:materialId
export async function deleteStorageItem(
  constructionId: string,
  materialId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/${constructionId}/${materialId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
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

// Not in new API — left unchanged
export async function bulkCreateStorageItems(
  constructionId: string,
  items: BulkStorageItemInput[]
): Promise<StorageItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/storage-items/construction/${constructionId}/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to bulk create storage items: ${response.statusText}`);
  }

  return response.json() as Promise<StorageItem[]>;
}
