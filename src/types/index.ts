export interface Material {
  id: string;
  name: string;
  unit: string;
  category: string;
  description?: string;
}

export interface ConstructionMaterial {
  materialId: string;
  quantity: number;
}

export interface Order {
  id: string;
  constructionId: string;
  materialId: string;
  quantity: number;
  status: 'pending' | 'ordered' | 'delivered';
  orderDate: string;
  deliveryDate?: string;
  supplier?: string;
  notes?: string;
}

export interface Construction {
  id: string;
  name: string;
  location: string;
  startDate: string;
  status: 'planned' | 'active' | 'completed';
  manager: string;
  description?: string;
  materials: ConstructionMaterial[];
}

