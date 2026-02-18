import { Unit } from '@/types';

export async function getUnits(): Promise<Unit[]> {
  const response = await fetch('/api/v1/units', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch units: ${response.statusText}`);
  }

  return response.json() as Promise<Unit[]>;
}

export async function getUnitById(id: string): Promise<Unit> {
  const response = await fetch(`/api/v1/units/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch unit: ${response.statusText}`);
  }

  return response.json() as Promise<Unit>;
}

export async function createUnit(data: { code: string; name: string }): Promise<Unit> {
  const response = await fetch('/api/v1/units', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create unit: ${response.statusText}`);
  }

  return response.json() as Promise<Unit>;
}

export async function updateUnit(
  id: string,
  data: { code?: string; name?: string }
): Promise<Unit> {
  const response = await fetch(`/api/v1/units/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update unit: ${response.statusText}`);
  }

  return response.json() as Promise<Unit>;
}

export async function deleteUnit(id: string): Promise<void> {
  const response = await fetch(`/api/v1/units/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete unit: ${response.statusText}`);
  }
}
