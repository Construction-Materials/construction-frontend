'use client';

import { useParams, useRouter } from 'next/navigation';
import { ConstructionDashboard } from '@/components/construction-dashboard';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { constructions, materials, orders, updateConstruction, addMaterial, addOrder, updateOrder } = useApp();
  const { t } = useLanguage();

  const construction = constructions.find(c => c.id === id);
  const constructionOrders = orders.filter(o => o.constructionId === id);

  if (!construction) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p>Konstrukcja nie znaleziona</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="size-4 mr-2" />
            {t.back}
          </Button>
        </div>
        <ConstructionDashboard
          construction={construction}
          materials={materials}
          orders={constructionOrders}
          onUpdateConstruction={updateConstruction}
          onAddMaterial={addMaterial}
          onAddOrder={addOrder}
          onUpdateOrder={updateOrder}
        />
      </main>
    </div>
  );
}

