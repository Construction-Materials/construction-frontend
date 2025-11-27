import { Storage } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface StoragesResponse {
  storages: Storage[];
  total: number;
  page: number;
  size: number;
}

export interface CreateStorageRequest {
  construction_id: string;
  name: string;
}

export interface UpdateStorageRequest {
  name: string;
}

export async function getStoragesByConstruction(
  constructionId: string
): Promise<StoragesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storages/construction/${constructionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch storages: ${response.statusText}`);
  }

  const data = await response.json() as StoragesResponse;
  return data;
}

export async function createStorage(
  data: CreateStorageRequest
): Promise<Storage> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storages/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create storage: ${response.statusText}`);
  }

  const result = await response.json() as Storage;
  return result;
}

export async function updateStorage(
  storageId: string,
  data: UpdateStorageRequest
): Promise<Storage> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storages/${storageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update storage: ${response.statusText}`);
  }

  const result = await response.json() as Storage;
  return result;
}

export async function deleteStorage(storageId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storages/${storageId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete storage: ${response.statusText}`);
  }
}

