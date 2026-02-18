export interface Unit {
  unitId: string;
  code: string;
  name: string;
}

export interface Material {
  materialId: string;
  categoryId: string;
  unitId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Construction {
  constructionId: string;
  name: string;
  description: string;
  address: string;
  startDate: string | null;
  status: string;
  imgUrl: string | null;
  createdAt: string;
}

export interface Category {
  categoryId: string;
  name: string;
  createdAt: string;
}

export interface StorageItem {
  constructionId: string;
  materialId: string;
  quantityValue: number;
  createdAt: string;
}
