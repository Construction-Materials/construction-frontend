import { useState } from 'react';
import { ConstructionList } from './components/construction-list';
import { ConstructionDashboard } from './components/construction-dashboard';
import { MaterialsManager } from './components/materials-manager';
import { AddMaterialsForm } from './components/add-materials-form';
import { Button } from './components/ui/button';
import { ArrowLeft, Languages } from 'lucide-react';
import logo from 'figma:asset/4e6bec2710f675e854b79a90438ae95376220530.png';
import { appConfig } from './config/app-config';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './config/translations';
import { useCategories } from './hooks/use-categories';

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

export type ViewType = 'list' | 'dashboard' | 'materials' | 'add-material';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [view, setView] = useState<ViewType>('list');
  const [selectedConstructionId, setSelectedConstructionId] = useState<string | null>(null);
  
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      name: 'Cement',
      unit: 'kg',
      category: 'Materiały podstawowe',
      description: 'Cement portlandzki CEM I 42,5R'
    },
    {
      id: '2',
      name: 'Cegła ceramiczna',
      unit: 'szt',
      category: 'Materiały murowe',
      description: 'Cegła pełna klasy 15'
    },
    {
      id: '3',
      name: 'Drewno konstrukcyjne',
      unit: 'm³',
      category: 'Drewno',
      description: 'Drewno konstrukcyjne C24'
    }
  ]);

  const [constructions, setConstructions] = useState<Construction[]>([
    {
      id: '1',
      name: 'Budowa domu jednorodzinnego - ul. Słoneczna 15',
      location: 'Warszawa, ul. Słoneczna 15',
      startDate: '2024-01-15',
      status: 'active',
      manager: 'Jan Kowalski',
      description: 'Dom jednorodzinny, pow. 150m²',
      materials: [
        { materialId: '1', quantity: 5000 },
        { materialId: '2', quantity: 15000 }
      ]
    },
    {
      id: '2',
      name: 'Remont kamienicy - Stare Miasto 8',
      location: 'Kraków, Stare Miasto 8',
      startDate: '2024-02-01',
      status: 'active',
      manager: 'Anna Nowak',
      description: 'Remont elewacji i modernizacja wnętrza',
      materials: [
        { materialId: '3', quantity: 25 }
      ]
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
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
  ]);

  const handleSelectConstruction = (id: string) => {
    setSelectedConstructionId(id);
    setView('dashboard');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedConstructionId(null);
  };

  const handleGoToMaterials = () => {
    setView('materials');
  };

  const handleBackFromMaterials = () => {
    setView('list');
  };

  const handleGoToAddMaterial = () => {
    setView('add-material');
  };

  const handleBackFromAddMaterial = () => {
    setView('materials');
  };

  const handleAddMaterials = (newMaterials: Omit<Material, 'id'>[]) => {
    const materialsWithIds = newMaterials.map(material => ({
      ...material,
      id: Date.now().toString() + Math.random().toString()
    }));
    setMaterials([...materials, ...materialsWithIds]);
    setView('materials');
  };

  const handleAddConstruction = (construction: Omit<Construction, 'id'>) => {
    const newConstruction: Construction = {
      ...construction,
      id: Date.now().toString()
    };
    setConstructions([...constructions, newConstruction]);
  };

  const handleUpdateConstruction = (id: string, updates: Partial<Construction>) => {
    setConstructions(constructions.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const handleAddMaterialsFromDelivery = (newMaterials: Material[]) => {
    setMaterials([...materials, ...newMaterials]);
  };

  const handleAddMaterial = (material: Material) => {
    setMaterials([...materials, material]);
  };

  const handleUpdateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleAddOrder = (order: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString()
    };
    setOrders([...orders, newOrder]);
  };

  const handleUpdateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => 
      o.id === id ? { ...o, ...updates } : o
    ));
  };

  const uniqueCategories = Array.from(
    new Set([
      ...appConfig.defaultCategories,
      ...materials.map(m => m.category).filter(Boolean)
    ])
  );

  const toggleLanguage = () => {
    setLanguage(language === 'pl' ? 'en' : 'pl');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img src={logo.src} alt="ElectraM&E" className="h-10" />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="gap-2"
              >
                <Languages className="size-4" />
                <span className="hidden sm:inline">{language === 'pl' ? 'Polski' : 'English'}</span>
                <span className="sm:hidden">{language === 'pl' ? 'PL' : 'EN'}</span>
              </Button>
              {view === 'list' && (
                <Button onClick={handleGoToMaterials} variant="outline">
                  {t.manageMaterials}
                </Button>
              )}
              {view === 'list' && (
                <Button onClick={handleGoToMaterials} variant="outline">
                  {t.manageCategories}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {(view === 'dashboard' || view === 'materials' || view === 'add-material') && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={
                view === 'dashboard' 
                  ? handleBackToList 
                  : view === 'add-material'
                  ? handleBackFromAddMaterial
                  : handleBackFromMaterials
              }
            >
              <ArrowLeft className="size-4 mr-2" />
              {t.back}
            </Button>
          </div>
        )}

        {view === 'list' && (
          <ConstructionList
            constructions={constructions}
            onSelectConstruction={handleSelectConstruction}
            onAddConstruction={handleAddConstruction}
          />
        )}

        {view === 'dashboard' && selectedConstructionId && (
          <ConstructionDashboard
            construction={constructions.find(c => c.id === selectedConstructionId)!}
            materials={materials}
            orders={orders.filter(o => o.constructionId === selectedConstructionId)}
            onUpdateConstruction={handleUpdateConstruction}
            onAddMaterial={handleAddMaterial}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
          />
        )}

        {view === 'materials' && (
          <MaterialsManager
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onGoToAddMaterial={handleGoToAddMaterial}
          />
        )}

        {view === 'add-material' && (
          <AddMaterialsForm
            onAddMaterials={handleAddMaterials}
            existingCategories={uniqueCategories}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}