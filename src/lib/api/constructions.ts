import { Construction } from '@/types';

export interface CreateConstructionInput {
  name: string;
  description: string;
  address: string;
  status: string;
  startDate?: string;
  imgUrl?: string;
}

export async function getConstructions(): Promise<Construction[]> {
  const response = await fetch('/api/v1/constructions', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch constructions: ${response.statusText}`);
  }

  return response.json() as Promise<Construction[]>;
}

export async function getConstructionById(id: string): Promise<Construction> {
  const response = await fetch(`/api/v1/constructions/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch construction: ${response.statusText}`);
  }

  return response.json() as Promise<Construction>;
}

export async function createConstruction(data: CreateConstructionInput): Promise<Construction> {
  const response = await fetch('/api/v1/constructions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create construction: ${response.statusText}`);
  }

  return response.json() as Promise<Construction>;
}

export async function updateConstruction(
  id: string,
  data: Partial<CreateConstructionInput>
): Promise<Construction> {
  const response = await fetch(`/api/v1/constructions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update construction: ${response.statusText}`);
  }

  return response.json() as Promise<Construction>;
}

export async function deleteConstruction(id: string): Promise<void> {
  const response = await fetch(`/api/v1/constructions/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete construction: ${response.statusText}`);
  }
}
