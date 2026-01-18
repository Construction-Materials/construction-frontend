'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Material, Construction, Order } from '@/types';

interface AppContextType {
  materials: Material[];
  constructions: Construction[];
  orders: Order[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  setConstructions: React.Dispatch<React.SetStateAction<Construction[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addConstruction: (construction: Omit<Construction, 'construction_id' | 'created_at'>) => void;
  updateConstruction: (id: string, updates: Partial<Construction>) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialMaterials: Material[] = [
  {
    material_id: '1',
    category_id: 'cat-1',
    name: 'Cement',
    unit: 'kg',
    description: 'Cement portlandzki CEM I 42,5R',
    created_at: new Date().toISOString()
  },
  {
    material_id: '2',
    category_id: 'cat-2',
    name: 'Cegła ceramiczna',
    unit: 'szt',
    description: 'Cegła pełna klasy 15',
    created_at: new Date().toISOString()
  },
  {
    material_id: '3',
    category_id: 'cat-3',
    name: 'Drewno konstrukcyjne',
    unit: 'm³',
    description: 'Drewno konstrukcyjne C24',
    created_at: new Date().toISOString()
  }
];

const initialConstructions: Construction[] = [
  {
    construction_id: '1',
    name: 'Budowa domu jednorodzinnego - ul. Słoneczna 15',
    description: 'Dom jednorodzinny, pow. 150m²',
    address: 'Warszawa, ul. Słoneczna 15',
    start_date: '2024-01-15',
    status: 'active',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    construction_id: '2',
    name: 'Remont kamienicy - Stare Miasto 8',
    description: 'Remont elewacji i modernizacja wnętrza',
    address: 'Kraków, Stare Miasto 8',
    start_date: '2024-02-01',
    status: 'active',
    created_at: '2024-01-15T00:00:00.000Z'
  }
];

const initialOrders: Order[] = [
  {
    id: '1',
    constructionId: '1',
    materialId: '1',
    quantity: 2000,
    status: 'delivered',
    orderDate: '2024-01-20',
    deliveryDate: '2024-01-25',
    supplier: 'Cemex Polska',
    notes: 'Dostawa w workach 25kg'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [constructions, setConstructions] = useState<Construction[]>(initialConstructions);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addMaterial = (material: Material) => {
    setMaterials(prev => [...prev, material]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.material_id === id ? { ...m, ...updates } : m));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.material_id !== id));
  };

  const addConstruction = (construction: Omit<Construction, 'construction_id' | 'created_at'>) => {
    const newConstruction: Construction = {
      ...construction,
      construction_id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setConstructions(prev => [...prev, newConstruction]);
  };

  const updateConstruction = (id: string, updates: Partial<Construction>) => {
    setConstructions(prev => prev.map(c => c.construction_id === id ? { ...c, ...updates } : c));
  };

  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString()
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  return (
    <AppContext.Provider
      value={{
        materials,
        constructions,
        orders,
        setMaterials,
        setConstructions,
        setOrders,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addConstruction,
        updateConstruction,
        addOrder,
        updateOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

