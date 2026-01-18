export interface Material {
  material_id: string;
  category_id: string;
  name: string;
  description: string;
  unit: string;
  created_at: string;
}

export interface Construction {
  construction_id: string;
  name: string;
  description: string;
  address: string;
  start_date: string;
  status: 'planned' | 'active' | 'completed';
  created_at: string;
}

export interface Category {
  category_id: string;
  name: string;
  created_at: string;
}

export interface StorageItem {
  construction_id: string;
  material_id: string;
  quantity_value: string;
  created_at: string;
}

