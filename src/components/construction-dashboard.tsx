'use client';

import { useState } from 'react';
import { Construction, Material, Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, ClipboardList, Upload } from 'lucide-react';
import { MaterialsInventory } from './materials-inventory';
import { OrdersManager } from './orders-manager';
import { DeliveryNoteImport } from './delivery-note-import';
import { useLanguage } from '../contexts/LanguageContext';
import { StatusBadge } from './shared/StatusBadge';
import { ConstructionInfo } from './shared/ConstructionInfo';

interface ConstructionDashboardProps {
  construction: Construction;
  materials: Material[];
  orders: Order[];
  onUpdateConstruction: (id: string, updates: Partial<Construction>) => void;
  onAddOrder: (order: Omit<Order, 'id'>) => void;
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
}

export function ConstructionDashboard({
  construction,
  materials,
  orders,
  onUpdateConstruction,
  onAddOrder,
  onUpdateOrder
}: ConstructionDashboardProps) {
  const [activeTab, setActiveTab] = useState('inventory');
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle>{construction.name}</CardTitle>
                <StatusBadge status={construction.status} type="construction" />
              </div>
              {construction.description && (
                <CardDescription>{construction.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ConstructionInfo construction={construction} />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mx-auto">
          <TabsTrigger value="inventory">
            <Package className="size-4 mr-2" />
            {t.warehouse}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ClipboardList className="size-4 mr-2" />
            {t.orders}
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="size-4 mr-2" />
            {t.importDeliveryNote}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <MaterialsInventory
            construction={construction}
            onGoToDeliveryNoteImport={() => setActiveTab('import')}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersManager
            constructionId={construction.construction_id}
            materials={materials}
            orders={orders}
            onAddOrder={onAddOrder}
            onUpdateOrder={onUpdateOrder}
            onGoToDeliveryNoteImport={() => setActiveTab('import')}
          />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <DeliveryNoteImport
            construction={construction}
            materials={materials}
            onUpdateConstruction={onUpdateConstruction}
            onComplete={() => setActiveTab('inventory')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}